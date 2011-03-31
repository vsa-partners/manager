/*global $:true, vsa:true, console:true */

// Simple binding and sequencing demo.
$(function (){	
	
	(function boxManager () {
		var box,
			btn,
			TRANSITION_DURATION = 750;
		
		vsa.manager('box', {
			init: function () {
				box = $('#box');
				btn = $('button');
			},

			bind: function () {
				vsa.actionBind(btn, 'click', 'box.move');
			}
		}, {
			_logX: function () {
				console.log(box.css('left'));
			}
		}, {
			move: function (ev, el) {
				var boxManager = this;
				
				vsa.sequenceStart('box.move', function (sequenceName) {
					box
						.animate({
							'left': '+=200'
						}, {
							'duration': TRANSITION_DURATION,
							'step': boxManager._logX
						})
						.animate({
							'left': 0
						}, {
							'duration': TRANSITION_DURATION,
							'step': boxManager._logX,
							'complete': function () {
								vsa.sequenceEnd(sequenceName);
							}
						});
				});
			}
		});
	} ());
	
});
