/*global console:true, window:true, jQuery:true, Modernizr:true */

/*******************************************************
VSA Partners JavaScript Framework
 - Jeremy Kahn    jkahn@vsapartners.com

Dependencies: jQuery, Modernizr
*******************************************************/

(function (window, $, Modernizr) {

	// Private vars
	var managers = {},
		locks = {},
		vsa = function () {},
		_public,
		prop;

	if (!$) {
		throw 'jQuery is not defined.';
	}
	
	if (!Modernizr) {
		throw 'Modernizr is not defined.';
	}
	
	/* Private methods ********************************/
	function isFunc (fn) {
		return (typeof fn === 'function');
	}
	
	function logError (msg) {
		if (console && console.error) {
			console.error(msg);
		}
	}
	/******************************** Private methods */
	
	/* Public methods *********************************/
	_public = {
		/**
		 * Sets up a code manager.	All a manager really does is help you organize your code and separate your components.  Managers define Public and Private methods.	You can access public methods, globally, by using the `vsa.fire()` method.	All methods of a manager can access private and public methods of itself.  This method also makes locks for each method you provide in the `privateMethods` and `publicMethods` objects, accessible with the naming convention: `managerName.actionName`.
		 * 
		 * @param {String} managerName The name that the manager will be accessed by.
		 * @param {Object} maintentanceMethods Object containing methods that help create a manager. (`init` only, currently)
		 * @param {Object} privateMethods Object containing methods that all methods of the manager can access, but cannot be accessed by any other code.
		 * @param {Object} publicMethods Object containing methods that all methods of the manager can access, but can also be accessed globally with `vsa.fire()`
		 * @return {Any} The return value of the invoke `init` method, if it was supplied in `maintenanceMethods`
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
		 *	 // call this with `vsa.fire('article.toggle');`
		 *	 toggle: function toggle () {
		 *	   return this._open();
		 *	 }
		 * });
		 * 
		 * @codeend
		 */
		manager: function manager (managerName, maintentanceMethods, privateMethods, publicMethods) {
			var _manager, method;

			if (managers[managerName]) {
				throw 'Manager "' + managerName + '" has already been defined.';
			}

			_manager = managers[managerName] = {};

			$.extend(_manager, privateMethods, publicMethods);
			
			for (method in _manager) {
				if (_manager.hasOwnProperty(method)) {
					window.vsa.lock.createLock(managerName + '.' + method);
				}
			}
			
			_manager.__public = publicMethods;
			_manager.__private = privateMethods;

			for (method in publicMethods) {
				if (publicMethods.hasOwnProperty(method)) {
					this.attach((managerName + '.' + method), publicMethods[method]);
				}
			}

			if (isFunc(maintentanceMethods.init)) {
				return maintentanceMethods.init.call(_manager);
			}
		},

		/**
		 * Removes a manager from the VSA instance
		 * @param {String} managerName The name of the manager to remove
		 * @returns {Object} The manager that was removed.
		 */
		destroyManager: function destroyManager (managerName) {
			var manager = managers[managerName];
			delete managers[managerName];

			return manager;
		},

		/**
		 * Attach an action handler to an action.  This action can be accessed globally with `vsa.fire()`.
		 * @param {String} actionName The action to attach to, given in `managerName.action` format
		 * @returns {Object} The global `vsa` object for chaining
		 */
		attach: function attach (actionName, actionHandler) {
			var actionNameParts = actionName.split('.'),
				managerName = actionNameParts[0],
				memberName = actionNameParts[1];

			if (isFunc(actionHandler) && managers[managerName]) {
				managers[managerName][memberName] = actionHandler;
				return this;
			} else {
				if (!isFunc(actionHandler)) {
					throw 'vsa.attach: Valid action handler not provided.';
				}
				if (!managers[managerName]) {
					throw 'vsa.attach: ' + managerName + ' is not a valid manager';
				}
			}
		},
		
		/**
		 * Remove an action handler from the `vsa` object
		 * @param {String} actionName The action to attach to, given in `managerName.action` format
		 */
		unattach: function unattach (actionName) {
			var actionNameParts = actionName.split('.'),
				managerName = actionNameParts[0],
				memberName = actionNameParts[1];

			if (managers[managerName]) {
				managers[managerName][memberName] = undefined;
			}
		},
		
		/**
		 * Calls a method that is `attach`ed to the global `vsa` object.
		 * @param {String} actionName The action to attach to, given in `managerName.action` format
		 * @returns {Any} The return value of the action handler that is being invoked.
		 */
		fire: function fire (actionName) {
			var actionNameParts = actionName.split('.'),
				managerName = actionNameParts[0],
				memberName = actionNameParts[1],
				handler = managers[managerName][memberName];

			if (managers[managerName].__public[memberName] && typeof handler === 'function') {
				return handler.apply(managers[managerName], [$.makeArray(arguments).slice(1)]);
			} else {
				if (console && console.error) {
					console.error(managerName + ' does not have a public function called ' + memberName);
				}
			}
		},
		
		/**
		 * Wraps `vsa.lock` (see below!) to start an asynchronous sequence.  If there is a lock for the sequence, then this function blocks the sequence from beginning.  Blocked sequences are not queued - the method just returns.  This is beneficial because certain logical sequences (animations) must not be started again before being ended completely.
		 * @param {String} sequenceName The name of the sequence.  This usually should, but does not have to, have the same name as the action that it represents.
		 * @param {Function} sequence The sequence function to invoke.  It will NOT be invoked if the lock has not been lifted (either by calling `vsa.lock.unlock()` or `vsa.endSequence()`).  You should have a call to `vsa.endSequence()` when the function is done.  `sequenceName` is passed as the first parameter to this function as a convenience.
		 * @param {Boolean} ignoreLock Set this to `true` to start the squence regardless of any locks.
		 * @returns {Boolean} Whether or not the sequence was started. (`true` if it was, `false` if it was not).
		 */
		startSequence: function startSequence (sequenceName, sequence, ignoreLock) {
			if (!sequenceName) {
				throw 'vsa.startSequence: "sequenceName" not provided!';
			}
			
			if (!window.vsa.lock.lockExists(sequenceName)) {
				logError('vsa.startSequence: Lock "' + sequenceName + '" does not exist, making it for you...');
				
				window.vsa.lock.createLock(sequenceName);
			}
			
			if (!window.vsa.lock.isLocked(sequenceName) || ignoreLock === true) {
				window.vsa.lock.lock(sequenceName);
				
				if (isFunc(sequence)) {
					sequence(sequenceName);
				}
				
				return true;
			} else {
				//console.log("There is a lock!  And it's not being overridden!");
				return false;
			}
		},
		
		/**
		 * Ends a sequence.  Calling this removes the corresponding lock and allows the sequence to be run again.
		 * @param {String} sequenceName The name of the sequence.  This must correspond to the sequenceName provided to `vsa.startSequence()`.
		 */
		endSequence: function endSequence (sequenceName) {
			if (!window.vsa.lock.lockExists(sequenceName)) {
				throw 'vsa.endSequence: "' + sequenceName + '" does not exist!';
			}
			
			window.vsa.lock.unlock(sequenceName);
		},

		/**
		A locking mechanism that can be used to prevent asynchronous actions from starting before the previous sequence has completed.  This is handy for complex animations.  First, create a lock with `vsa.lock.createLock()`.  Then lock and unlock it with `vsa.lock.lock()` and `vsa.lock.unlock()`.  'vsa.lock.isLocked()' will tell you if something is locked or not.  You can check if a lock has been made with `vsa.lock.lockExists()`.  The use case is to `return` out of the beginning of a function if you want the sequence to be NOT be executed asynchronously.
		*/
		lock: {
			/** 
			 * Adds a lock to the internal `locks` collection.
			 * @param {String} lockName Name of the lock.
			 * @param {Boolean} lockedToStart Whether the lock should be locked to begin with.  Defaults to `false`.
			 * @returns {Boolean} Whether or not the newly created lock is locked.
			 */
			'createLock': function createLock (lockName, lockedToStart) {
				if (!lockName) {
					throw 'You need to name this lock!';
				} else if (locks[lockName]) {
					throw 'Lock "' + lockName + '" already exists!';
				} else {
					locks[lockName] = lockedToStart ? true : false;
				}

				return this.isLocked(lockName);
			},
			
			/**
			 * Deletes a lock from the internal `locks` collection.
			 * @param {String} lockName Name of the lock.
			 */
			'destroyLock': function destroyLock (lockName) {
				return delete locks[lockName];
			},

			/**
			 * Activates a lock.
			 * @param {String} lockName Name of the lock.
			 */
			'lock': function lock (lockName) {
				if (typeof locks[lockName] !== 'boolean') {
					throw 'lock ' + lockName + ' does not exist';
				}

				return (locks[lockName] = true);
			},

			/**
			 * Deactivates a lock.
			 * @param {String} lockName Name of the lock.
			 */
			'unlock': function unlock (lockName) {
				if (typeof locks[lockName] !== 'boolean') {
					throw 'lock ' + lockName + ' does not exist';
				}

				return (locks[lockName] = false);
			},

			/**
			 * Returns whether or not a lock is locked.
			 * @param {String} lockName Name of the lock.
			 */
			'isLocked': function isLocked (lockName) {
				if (typeof locks[lockName] !== 'boolean') {
					throw 'lock ' + lockName + ' does not exist';
				}

				return locks[lockName];
			},

			/**
			 * Returns whether or not a lock has been created with `vsa.lock.createLock()`.
			 * @param {String} lockName Name of the lock.
			 */
			'lockExists': function lockExists (lockName) {
				return (typeof locks[lockName] !== 'undefined');
			},
			
			'_debug': function () {
				return locks;
			}
		}
	};
	/********************************* Public methods */
	
	// Create the global instance of `vsa`...
	
	// Inherit from jQuery!  No, let's not do that...
	//vsa.prototype = $;
	window.vsa = new vsa();
	
	// ...and attach all the public methods.
	for (prop in _public) {
		if (_public.hasOwnProperty(prop)) {
			window.vsa[prop] = _public[prop];
		}
	}
	
}(window, jQuery, Modernizr));