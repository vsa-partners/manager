$(function(){
	vsa.manager('article', {
		init : function () {
			console.log('init:', this);
		}
	}, {
		_open: function (ev) {
			console.log('opening...', this);
			return 5000;
		}
	}, {
		// vsa.trigger('article.toggle')
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
