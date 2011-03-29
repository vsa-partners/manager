(function (window, $) {
	var managers = {};
	
	if (!$) {
		throw 'jQuery is not defined.';
	}
	
	window.vsa = {
		manager: function manager (managerName, maintentanceMethods, privateMethods, publicMethods) {
			var manager,
				method;
			
			if (managers[managerName]) {
				throw 'Manager "' + managerName + '" has already been defined.';
			}
			
			manager = managers[managerName] = {};
			
			$.extend(manager, privateMethods, publicMethods);
			manager.public = publicMethods;
			manager.private = privateMethods;
			
			for (method in publicMethods) {
				if (publicMethods.hasOwnProperty(method)) {
					this.bind((managerName + '.' + method), publicMethods[method]);
				}
			}
			
			if (typeof maintentanceMethods.init === 'function') {
				maintentanceMethods.init();
			}
		},
		
		bind: function (eventName, eventHandler) {
			var eventNameParts = eventName.split('.'),
				managerName = eventNameParts[0],
				memberName = eventNameParts[1];
				
			managers[managerName][memberName] = eventHandler;
		},
		
		unbind: function (eventName, eventHandler) {
			var eventNameParts = eventName.split('.'),
				managerName = eventNameParts[0],
				memberName = eventNameParts[1];
			
			if (managers[managerName]) {
				managers[managerName][memberName] = undefined;
			}
		},
		
		trigger: function (eventName) {
			var eventNameParts = eventName.split('.'),
				managerName = eventNameParts[0],
				memberName = eventNameParts[1],
				handler = managers[managerName][memberName];
				
			if (managers[managerName].public[memberName] && typeof handler === 'function') {
				return handler.apply(managers[managerName], [$.makeArray(arguments).slice(1)]);
			} else {
				if (console && console.error) {
					console.error(managerName + ' does not have a public function called ' + memberName);
				}
			}
		},
		
		lock: {
			'createLock': function createLock (lockName, lockToStart) {
				if (!lockName) {
					throw 'You need to name this lock!';
				} else if (this[lockName]) {
					throw 'Lock "' + lockName + '" already exists!';
				} else {
					this[lockName] = lockToStart ? true : false;
				}
			},
			
			'unlock': function unlock (component) {
				if (typeof this[component] !== 'boolean') {
					throw component + ' is not an unlockable _intro component'
				}

				this[component] = false;
			},

			'isLocked': function isLocked (component) {
				if (typeof this[component] !== 'boolean') {
					throw component + ' is not an _intro component'
				}

				return this[component];
			},

			'thereIsALock': function thereIsALock () {
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
	
})(window, jQuery)