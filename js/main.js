(function() {
	$('.document').ready(function() {
		chargeForm('#order-form', 'send.php',  ' .form-trigger ');

		chargeDowncounter();
		chargeUpCounter();
		$('[rel="lightbox"]').lightbox();
		
		$('.rs-carousel').carousel({
			itemsPerTransition: 1,
			pagination: false,
			touch: true,
			continuous: true,
			insertPrevAction: function () {
			    return $('<a href="#" class="rs-carousel-action rs-carousel-action-prev"></a>').appendTo(this);
			},
			insertNextAction: function () {
			    return $('<a href="#" class="rs-carousel-action rs-carousel-action-next"></a>').appendTo(this);
			},
		});
	});

	function chargeDowncounter() {
		var austDay = new Date();
		austDay = new Date(austDay.getFullYear(), austDay.getMonth(), austDay.getDate()+1);
		var clock = $('#countdown').FlipClock({ countdown: true, autoStart: true});
		clock.setTime((austDay.getTime() - (new Date()).getTime())/1000);
		clock.start();
	}

	function chargeUpCounter() {
		$('#upcounter').append(createNumber(3650));
	}

	function createDigit(x) {
		return $([
			'<ul class="flip play">',
				'<li class="flip-clock-active" data-digit="'+x+'">',
					'<a href="javascript:void(0)">',
						'<div class="up">',
							'<div class="shadow"></div>',
							'<div class="inn">'+x+'</div>',
						'</div>',
						'<div class="down">',
							'<div class="shadow"></div>',
							'<div class="inn">'+x+'</div>',
						'</div>',
					'</a>',
				'</li>',
			'</ul>'].join(''));
	}

	function createNumber(num) {
		var html = $('<div class="flip-clock-wrapper"/>');
		var digits = [];
		var mod;
		while(num > 10) {
			mod = num % 10;
			num = Math.floor(num / 10);
			digits.push(mod);
		}
		digits.push(num % 10);

		digits.reverse();
		for (var i = 0; i < digits.length; i++) {
			html.append(createDigit(digits[i]));
		};
		
		return html;		
	}

})();




