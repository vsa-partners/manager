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
		// call this with `vsa.fire('article.toggle');`
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
		// vsa.fire('aside.activate')
		activate: function activate () {
			console.log('trying to fire a public method...')
			vsa.fire('article.toggle');
			
			console.log('trying to fire a private method...')
			vsa.fire('article._open');
		},
		
		sayHello: function sayHello (ev, el) {
			console.log(ev, el);
			alert('Hello!');
			vsa.unbindAction($('#test'), 'click', 'aside.sayHello');
			console.log('Unbinding "sayHello" from "#test"...');
		}
	});
	
	vsa.bindAction($('#test'), 'click', 'aside.sayHello');
});
