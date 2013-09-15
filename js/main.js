(function() {
	$('.feedbackslide').ready(function() {
		$('.rs-carousel').carousel({
			itemsPerTransition: 1,
			pagination: false,
			touch: true,
			continuous: true,
			insertPrevAction: function () {
			    return $('<a href="#" class="rs-carousel-action rs-carousel-action-prev"><</a>').appendTo(this);
			},
			insertNextAction: function () {
			    return $('<a href="#" class="rs-carousel-action rs-carousel-action-next">></a>').appendTo(this);
			},

		});
	});
})();