
// jQuery.XDomainRequest.js
// Jason Moon - @JSONMOON
if (!jQuery.support.cors && jQuery.ajaxTransport && window.XDomainRequest) {
  var httpRegEx = /^https?:\/\//i;
  var getOrPostRegEx = /^get|post$/i;
  var sameSchemeRegEx = new RegExp('^'+location.protocol, 'i');
  var htmlRegEx = /text\/html/i;
  var jsonRegEx = /\/json/i;
  var xmlRegEx = /\/xml/i;
  
  // ajaxTransport exists in jQuery 1.5+
  jQuery.ajaxTransport('text html xml json', function(options, userOptions, jqXHR){
    // XDomainRequests must be: asynchronous, GET or POST methods, HTTP or HTTPS protocol, and same scheme as calling page
    if (options.crossDomain && options.async && getOrPostRegEx.test(options.type) && httpRegEx.test(options.url) && sameSchemeRegEx.test(options.url)) {
      var xdr = null;
      var userType = (userOptions.dataType||'').toLowerCase();
      return {
        send: function(headers, complete){
          xdr = new XDomainRequest();
          if (/^\d+$/.test(userOptions.timeout)) {
            xdr.timeout = userOptions.timeout;
          }
          xdr.ontimeout = function(){
            complete(500, 'timeout');
          };
          xdr.onload = function(){
            var allResponseHeaders = 'Content-Length: ' + xdr.responseText.length + '\r\nContent-Type: ' + xdr.contentType;
            var status = {
              code: 200,
              message: 'success'
            };
            var responses = {
              text: xdr.responseText
            };
            try {
              if (userType === 'html' || htmlRegEx.test(xdr.contentType)) {
                responses.html = xdr.responseText;
              } else if (userType === 'json' || (userType !== 'text' && jsonRegEx.test(xdr.contentType))) {
                try {
                  responses.json = jQuery.parseJSON(xdr.responseText);
                } catch(e) {
                  status.code = 500;
                  status.message = 'parseerror';
                  //throw 'Invalid JSON: ' + xdr.responseText;
                }
              } else if (userType === 'xml' || (userType !== 'text' && xmlRegEx.test(xdr.contentType))) {
                var doc = new ActiveXObject('Microsoft.XMLDOM');
                doc.async = false;
                try {
                  doc.loadXML(xdr.responseText);
                } catch(e) {
                  doc = undefined;
                }
                if (!doc || !doc.documentElement || doc.getElementsByTagName('parsererror').length) {
                  status.code = 500;
                  status.message = 'parseerror';
                  throw 'Invalid XML: ' + xdr.responseText;
                }
                responses.xml = doc;
              }
            } catch(parseMessage) {
              throw parseMessage;
            } finally {
              complete(status.code, status.message, responses, allResponseHeaders);
            }
          };
          // set an empty handler for 'onprogress' so requests don't get aborted
          xdr.onprogress = function(){};
          xdr.onerror = function(){
            complete(500, 'error', {
              text: xdr.responseText
            });
          };
          var postData = '';
          if (userOptions.data) {
            postData = (jQuery.type(userOptions.data) === 'string') ? userOptions.data : jQuery.param(userOptions.data);
          }
          xdr.open(options.type, options.url);
          xdr.send(postData);
        },
        abort: function(){
          if (xdr) {
            xdr.abort();
          }
        }
      };
    }
  });
}

/**
 * Webflow.js - v0.0.3
 */
var _w = (function(){
  'use strict';

  var doc = document,
    w = window,
    loc = w.location,
    retro = window.XDomainRequest && !window.atob;

  function retina() {
    var win = window,
      mq = win.matchMedia ? win.matchMedia('only screen and (-moz-min-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)') : {};

    return mq && mq.matches;
  }

  function init() {
    // Smooth scroll during page load
    if (loc.hash) {
      _scroll(loc.hash.substring(1));
    }

    // Smooth scroll to page sections
    $(doc).on('click', 'a', function(e) {
      if (_dzn()) {
        return;
      }

      var lnk = this,
        hash = lnk.hash ? lnk.hash.substring(1) : null;

      if (hash) {
        _scroll(hash, e);
      }
    });

    // Handle form submission for Webflow forms
    $(doc).on('submit', 'div.w-form form', function(e) {
      _submitForm($(this), e);
    });

    // Alert for disconnected forms
    if ($('div.w-form form').length > 0 && !$('html').data('wf-site')) {
      w.setTimeout(function() {
        alert('Oops! This page has a form that is powered by Webflow, but important code was removed that is required to make the form work. Please contact support@webflow.com to fix this issue.');
      });
    }
  }

  // Submit form to Webflow
  function _submitForm(form, e) {
    var btn = form.find(':input[type="submit"]'),
      wait = btn.data('wait') || 0,
      test = _wf(),
      data = {
        name: form.data('name') || form.attr('name') || 'Untitled Form',
        source: loc.href,
        test: test,
        fields: {}
      };

    if ($.trim(form.attr('action')) != '') {
      return;
    }

    e.preventDefault();

    // Find all form fields
    form.find(':input:not([type="submit"])').each(function(i) {
      var fld = $(this),
        name = fld.data('name') || fld.attr('name') || ('Field ' + (i + 1));

      data.fields[name] = fld.val();
    });

    // Disable the submit button
    btn.prop('disabled', true);
    if (wait) {
      btn.data('w-txt', btn.val()).val(wait);
    }

    // Read site ID
    // NOTE: If this site is exported, the HTML tag must retain the data-wf-site attribute for forms to work
    var siteId = $('html').data('wf-site');

    if (siteId) {
      var url = 'https://webflow.com/api/v1/form/' + siteId;

      // Work around same-protocol IE XDR limitation
      if (retro && url.indexOf('https://webflow.com') >= 0) {
        url = url.replace('https://webflow.com/', 'http://data.webflow.com/');
      }

      $.ajax({
        url: url,
        type: 'POST',
        data: data,
        dataType: 'json',
        crossDomain: true
      }).done(function(data) {
        _afterSubmit(form, btn, wait);
      }).fail(function(xhr, status, err) {
        _afterSubmit(form, btn, wait, 1);
      });
    } else {
      _afterSubmit(form, btn, wait, 1);
    }
  }

  // Runs after the AJAX request completes
  function _afterSubmit(form, btn, wait, err) {
    var wrap = form.closest('div.w-form'),
      stat = ['fail', 'done'][err ? 0 : 1];

    if (!err) {
      form.addClass('w-hidden');
    }

    btn.prop('disabled', false);
    if (wait) {
      btn.val(btn.data('w-txt')).removeData('w-txt');
    }

    wrap.find('> div.w-form-' + stat).addClass('w-form-' + stat + '-show');
  }

  function _ease(t) {
    return t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1;
  }

  function _pos(start, end, elapsed, duration) {
    if (elapsed > duration) {
      return end;
    }

    return start + (end - start) * _ease(elapsed / duration); 
  }

  function _scroll(hash, e) {
    var n = $('#' + hash);
    if (!n || n.length == 0) {
      return;
    }

    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Push new history state
    if (loc.hash !== hash && w.history && w.history.pushState) {
      w.history.pushState(null, null, '#' + hash);
    }

    // Adjust for fixed header
    var header = $('header'),
      header = header.length ? header : $(doc.body).children(':first'),
      h = header.length ? header.get(0) : null,
      styles = null;

    if (h) {
      if (w.getComputedStyle) {
        styles = w.getComputedStyle(h, null);
      } else if (h.currentStyle) {
        styles = h.currentStyle; // IE8
      }
    }

    var fixed = styles && styles['position'] == 'fixed',
      offset = fixed ? header.outerHeight() : 0;

    // Smooth scroll
    if (e) {
      _smooth(n, offset);
    } else {
      w.setTimeout(function() {
        _smooth(n, offset);
      }, 300);
    }
  }

  function _smooth(n, offset, cb){
    var w = window,
      start = $(w).scrollTop(),
      end = n.offset().top - offset,
      clock = Date.now(),
      animate = w.requestAnimationFrame || w.mozRequestAnimationFrame || w.webkitRequestAnimationFrame || function(fn) { window.setTimeout(fn, 15); },
      duration = 472.143 * Math.log(Math.abs(start - end) +125) - 2000,
      step = function() {
        var elapsed = Date.now() - clock;

        w.scroll(0, _pos(start, end, elapsed, duration));

        if (elapsed > duration) {
          if (cb) {
            cb(n);
          }
        } else {
          animate(step);
        }
      };

    step();
  }

  function _dzn() {
    return _wf() && __wf_design;
  }

  function _wf() {
    return typeof __wf_design != 'undefined';
  }

  // API
  return {
    init: init,
    retina: retina
  };
})();

// Init
$(function() {
 _w.init();
});