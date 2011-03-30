/*global console:true, window:true, jQuery:true */

(function (window, $) {

	// Private vars
	var managers = {},
		vsa = function () {},
		_vsa,
		prop;

	if (!$) {
		throw 'jQuery is not defined.';
	}

	function isFunc(fn) {
		return (typeof fn === 'function');
	}
	
	/*function newMe () {
		
	}*/

	_vsa = {
		/**
		 * Sets up a code manager.	All a manager really does is help you organize your code and separate your components.
		 * Managers define Public and Private methods.	You can access public methods, globally, by using the `vsa.trigger()`
		 * method.	All methods of a manager can access private and public methods of itself.
		 * 
		 * @param {String} managerName The name that the manager will be accessed by.
		 * @param {Object} maintentanceMethods Object containing methods that help create a manager. (`init` only, currently)
		 * @param {Object} privateMethods Object containing methods that all methods of the manager can access, but cannot be accessed by any other code.
		 * @param {Object} publicMethods Object containing methods that all methods of the manager can access, but can also be accessed globally with `vsa.trigger()`
		 * 
		 * @codestart
		 * vsa.manager('article', { // Maintenance methods
		 *	 init : function () {
		 *	   console.log('calling init on:', this);
		 *	 }
		 * }, { // Private methods
		 *	 _open: function (ev) {
		 *	   console.log('Calling `_open` on the article manager.	 This is a private method!', this);
		 *	   return "Hello!  I'm a return value!";
		 *	 }
		 * }, { // Public methods
		 *	 // call this with `vsa.trigger('article.toggle');`
		 *	 toggle: function toggle () {
		 *	   return this._open();
		 *	 }
		 * });
		 * 
		 * @codeend
		 */
		manager: function manager(managerName, maintentanceMethods, privateMethods, publicMethods) {
			var _manager, method;

			/*function fn () {
				console.log(this);
			};
			fn.prototype = this;
			var temp = new fn();*/
			
			if (managers[managerName]) {
				throw 'Manager "' + managerName + '" has already been defined.';
			}

			_manager = managers[managerName] = {};

			$.extend(_manager, privateMethods, publicMethods);
			_manager.__public = publicMethods;
			_manager.__private = privateMethods;

			for (method in publicMethods) {
				if (publicMethods.hasOwnProperty(method)) {
					this.bind((managerName + '.' + method), publicMethods[method]);
				}
			}

			if (isFunc(maintentanceMethods.init)) {
				maintentanceMethods.init.call(_manager);
			}
		},

		destroyManager: function destroyManager(managerName) {
			var manager = managers[managerName];
			delete managers[managerName];

			return manager;
		},

		bind: function bind(eventName, eventHandler) {
			var eventNameParts = eventName.split('.'),
				managerName = eventNameParts[0],
				memberName = eventNameParts[1];

			if (isFunc(eventHandler)) {
				managers[managerName][memberName] = eventHandler;
			}
		},

		unbind: function unbind(eventName, eventHandler) {
			var eventNameParts = eventName.split('.'),
				managerName = eventNameParts[0],
				memberName = eventNameParts[1];

			if (managers[managerName]) {
				managers[managerName][memberName] = undefined;
			}
		},

		trigger: function trigger(eventName) {
			var eventNameParts = eventName.split('.'),
				managerName = eventNameParts[0],
				memberName = eventNameParts[1],
				handler = managers[managerName][memberName];

			if (managers[managerName].__public[memberName] && typeof handler === 'function') {
				return handler.apply(managers[managerName], [$.makeArray(arguments).slice(1)]);
			} else {
				if (console && console.error) {
					console.error(managerName + ' does not have a public function called ' + memberName);
				}
			}
		},

		lock: {
			'createLock': function createLock(lockName, lockToStart) {
				if (!lockName) {
					throw 'You need to name this lock!';
				} else if (this[lockName]) {
					throw 'Lock "' + lockName + '" already exists!';
				} else {
					this[lockName] = lockToStart ? true : false;
				}

				return this.isLocked(lockName);
			},

			'lock': function lock(component) {
				if (typeof this[component] !== 'boolean') {
					throw component + ' is not a lockable _intro component';
				}

				return (this[component] = true);
			},

			'unlock': function unlock(component) {
				if (typeof this[component] !== 'boolean') {
					throw component + ' is not an unlockable _intro component';
				}

				return (this[component] = false);
			},

			'isLocked': function isLocked(component) {
				if (typeof this[component] !== 'boolean') {
					throw component + ' is not an _intro component';
				}

				return this[component];
			},

			'lockExists': function thereIsALock() {
				var prop;

				for (prop in this) {
					if (this.hasOwnProperty(prop)) {
						if (typeof this[prop] === 'boolean' && this[prop] === true) {
							return true;
						}
					}
				}

				return false;
			}
		}
	};
	
	// Inherit from jQuery!  LOL!
	//vsa.prototype = $;
	window.vsa = new vsa();
	
	for (prop in _vsa) {
		if (_vsa.hasOwnProperty(prop)) {
			window.vsa[prop] = _vsa[prop]
		}
	}
	

}(window, jQuery));