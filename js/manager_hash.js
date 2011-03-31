(function hashManager () {
	var self,
		isScrolling,
		duration = $('html').hasClass('no-touch') ? 1000 : 0;
	
	vsa.manager('hash', {
		init: function () {
			self = this;
			this._breakAnchorNames();
		},
		
		bind: function () {
			vsa.actionDelegate($(document.documentElement), 'a[href]', 'click', 'hash.forceHashchangeCheck');
			vsa.actionBind($(window), 'hashchange', 'hash.scrollToCurrentHash');
			
			if ($.fn.mousewheel) {
				vsa.actionBind($(window), 'mousewheel', 'hash.interruptAutoScroll');
			}
		}
	}, {
		// Private methods
		_scrollToEl: function (el, complete) {
			isScrolling = true;

			$(window).scrollTo(el, {
				'duration': duration,
				'onAfter': function () {
					if (complete) {
						complete();
					}

					isScrolling = false;
				}
			});
		},
		
		_breakAnchorNames: function () {
			$('.slide a[name]').each(function (index, el) {
				var name;

				el = $(el)
				name = el.attr('name').substr(1);
				el.remove();
			});
		}
	}, {
		// Public methods
		interruptAutoScroll: function interruptAutoScroll (ev, el, delta) {
			// If the window is animated (scrolling) and the user moves the mousewheel, cancel the animation.
			// This is done on document.body and document.documentElement to work cross-browser.
			// This is also only done in the case that the mousewheel wasn't "barely" touched - if the
			// the user accidentally moved the scrollwheel, the absolute value would be below .34 (in all browsers)
			// and the animation would not be stopped in that case.
			if (!delta || Math.abs(delta) > .34) {
				$(document.body).add(document.documentElement).stop(true, false);
				$(document.documentElement).unbind('mousewheel', this.stopAutoScroll);
			}
		},
		
		forceHashchangeCheck: function forceHashchangeCheck (ev, el) {
			// If the user clicks a link to the previously selected anchor, explicitly trigger 
			// the `hashchange` event to start the scrolling animation 
			// (because the hash would not be changing otherwise)
			if (el.attr('href').slice(0, 1) === '#' && el.attr('href') === window.location.hash) {
				self.scrollToCurrentHash();
			}
		},
		
		scrollToCurrentHash: function scrollToCurrentHash (ev, el) {
			// NOTE!  This is looking for an element by its class!
			// It should look for an ID, it's faster!
			var target = $('.' + [window.location.hash.substr(1)]).first();

			if (target) {
				self._scrollToEl(target);
			}
		}
	});
} ())