$(function(){
	vsa.manager('article', { // Maintenance methods
		init: function () {
			console.log('calling init on:', this);
		},
		
		bind: function () {
			vsa.actionBind($('#test'), 'click', 'article.toggle');
		}
	}, { // Private methods
		_open: function (ev) {
			console.log('Calling `_open` on the article manager.  This is a private method!', this);
			return "Hello!  I'm a return value!";
		}
	}, { // Public methods
		// call this with `vsa.actionFire('article.toggle');`
		toggle: function toggle () {
			return this._open();
		}
	});
	
	
	vsa.manager('aside', {
		init : function () {
			console.log('init:', this);
		},
		
		bind: function () {
			vsa.actionBind($('#test'), 'click', 'aside.sayHello');
		}
	}, { // Private methods
		
	}, { // Public methods
		// call this with vsa.actionFire('aside.activate')
		activate: function activate () {
			console.log('trying to fire a public method...')
			vsa.actionFire('article.toggle');
			
			console.log('trying to fire a private method...')
			vsa.actionFire('article._open');
		},
		
		sayHello: function sayHello (ev, el) {
			console.log(ev, el);
			alert('Hello!');
			vsa.actionUnbind($('#test'), 'click', 'aside.sayHello');
			console.log('Unbinding "sayHello" from "#test"...');
		}
	});
	
	
});
