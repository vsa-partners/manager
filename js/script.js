$(function(){
	vsa.manager('article', { // Maintenance methods
		init : function () {
			console.log('calling init on:', this);
		}
	}, { // Private methods
		_open: function (ev) {
			console.log('Calling `_open` on the article manager.  This is a private method!', this);
			return "Hello!  I'm a return value!";
		}
	}, { // Public methods
		// call this with `vsa.trigger('article.toggle');`
		toggle: function toggle () {
			return this._open();
		}
	});
	
	
	vsa.manager('aside', {
		init : function () {
			console.log('init:', this);
		}
	}, {
		// Private vars
	}, {
		// vsa.trigger('aside.activate')
		activate: function toggle () {
			console.log('trying to trigger a public method...')
			vsa.trigger('article.toggle');
			
			console.log('trying to trigger a private method...')
			vsa.trigger('article._open');
		}
	});
});
