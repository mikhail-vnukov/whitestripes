(function($) {
	
	window.chargeForm = function(formId, action, trigger) {

		var $form = $(formId);
		var $errorPanel = $form.find(".error-panel");

		function closeForm() {
			$errorPanel.hide();
			$form.removeClass('md-show' );
		}

		function showForm() {
			$form.addClass("md-show");
		};

		function showErrorMessage() {
			$errorPanel.show();
		}

		$(trigger).click(function() {
			showForm();
		});

		$('.md-close').click(function() {
			closeForm();
		});

		$('.md-overlay').click(function() {
			closeForm();
		});



		$form.find("#submit-button").click(function() {
			$(formId + ' form').parsley('validate');

			$.ajax({
					type: "POST",
					url: action,
					data: $form.find('form').serialize(),
					success: function(data) {
						closeForm();
					}, 
					error: function(jqXHR, textStatus, errorThrown) {
						showErrorMessage();
					}

				});
			return false;
		});

	}
	
})(jQuery);