/* Author: VSA Partners

*/
(function($){
	var _ns = 'VSA',
		_ua = navigator.userAgent,
		_browserVersion = parseInt($.browser.version,10),
		$html = $('html'),
		_flashVersionSupported = '9',
		/*assists in loading files from any directory level*/
		
		// THIS NEEDS TO BE CUSTOMIZED FOR YOUR PROJECT.
		_projectPath = '_projectname/',
		
		_swfObject = 'http://ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js',
		_ddBelated = _projectPath + 'js/dd_belatedpng.js',
		_flashPlayer = _projectPath + 'flash/video-player.swf',
		_pngFixElems = '.pngfix_',
		isOpacitySupported;
	function Util() {
		this.isIE = !$.support.htmlSerialize;
		this.isIE6 = this.isIE && _browserVersion === 6;
		this.isIPhone = _ua.match(/iPhone/i) || _ua.match(/iPod/i) ? true : false;
		this.isAndroid = _ua.match(/Android/i) ? true : false;
		this.isMobile = this.isAndroid || this.isIPhone;
		this.isIPad = _ua.match(/iPad/i) ? true : false;
		this.isStandalone = (function() {
			var _is = ("standalone" in window.navigator) && window.navigator.standalone;
			if(_is) { $html.addClass('standalone'); }
			return _is;
		})();
		this.hasFlash = (function() {
			var flashFound = false, flashPlug = 'application/x-shockwave-flash', flashActiveX = 'ShockwaveFlash.ShockwaveFlash';
			if (navigator && navigator.plugins && navigator.plugins.length) {
				flashFound = !!(navigator.mimeTypes && navigator.mimeTypes[flashPlug]);
			}
			if (!flashFound) {
				try {
					var obj = new ActiveXObject(flashActiveX);
					flashFound = true;
				} catch(err) { }
			}
		 	$html.addClass(flashFound ? 'flash':'no-flash');
			return flashFound;
		})();
		//paths
		this.projectPath = (function() {
			var path = $('link[href*=\''+_projectPath+'\']').eq(0).attr('href');
			return path.substring(0,path.indexOf('css'));
		})();
		this.basePath = this.projectPath.replace(_projectPath,'');	
		this.addBasePath = function(args) {
			if(!args) { return; }
			return !$.isArray(args) ? this.basePath + args : (function(files,base) {
				var arr = $.map(files, function(n,i) {
					return (base + n);
				});
				return arr;	
			})(args,this.basePath);
		};
		//dom
		this.wrap = function(id,type) {
				var isEl = typeof id !== 'string',
						$el = isEl ? $(id) : $('#' + id),
						id = isEl ? $el.attr('id') : id,
						newId = (!$el.attr('id') ? 'wrap':id) + '-' + Math.floor(Math.random() * 100000),
						$newEl = $(document.createElement('div')).addClass('content').append($(document.createElement('div')).attr('id',newId));
				$el
					.addClass('enhanced_')
					.wrapInner('<div class="altcontent visuallyhidden"></div>')
					.append($newEl);				
				return newId;	
		};
		//flash
		this.embedFlash = function(container,swf,width,height,flashvars) {
			if(this.isMobile || this.isIPad) { return; }
			var container = this.wrap(container),swf = swf,width = width,height = height;
			var flashvars = flashvars || {},
				params = { wmode: 'transparent', allowScriptAccess: 'always', allowFullScreen: 'true', menu: 'true' },
				attributes = {};
			var _embed = function() {
				swfobject.embedSWF(swf, container, width, height, _flashVersionSupported, null, flashvars, params, attributes);
			}
			if(typeof swfobject === 'undefined') {
				 $.getScript(_swfObject,_embed);
			} else {
				_embed();
			}
		};
		this.embedVideo = function(container,videoUrl,width,height,vars) {				
			//use flashplayer
			var player = this.basePath + _flashPlayer,
				vvars = vars || {};
				vvars.videoPath = vurl;
				vvars.videoWidth = width;
				vvars.videoHeight = height;
				vvars.autoPlay = 'true';
			//use system player
			if(Modernizr.video && Modernizr.video.h264) {
				var container = this.wrap(container);
				var $video = $(document.createElement('video')).attr({
					'src': vurl,
					'controls': 'controls'
				});
				if(vvars.posterPath) {
					$video.attr('poster',vvars.posterPath);
				}				
				$video.height(height).width(width).appendTo($('#'+container));
				if(vvars.autoPlay) {
					$video[0].play();
				}
				return;
			}
			this.embedFlash(container,player,width,height,vvars);
			return;
		};
		//IE6 transparency
		this.pngFix = (function(selectors,needsTransHelp,basePath) {
			if(!needsTransHelp) { return; }
			var _apply = function() {
				DD_belatedPNG.fix(selectors);
			}
			if(typeof DD_belatedPNG === 'undefined') {
				var url = basePath + _ddBelated;
				/* TODO: this RegEx only matchs the h of http */
				$.getScript(_ddBelated.match(/^[\/|http]/) ? _ddBelated : basePath + _ddBelated ,_apply);
			} else {
				_apply();
			}
		})(_pngFixElems,this.isIE6,this.basePath);
		//tracking
		this.trackPage = function (url) {
			//log('url = ' + url);
			try { _gaq.push(['_trackPageview',url]); } catch(err) { log(err) }
			return;
		};			
		this.trackEvent = function (category, action, label) {
			//log('category = ' + category + ' | action = ' + action +  ' | label = ' + label);
			try { _gaq.push(['_trackEvent',category,action,label]); } catch(err) { log(err) }	
			return;
		};
		//cookies
		this.setCookie = function(name,value,days) {
			var expires = '', date = new Date();
			if (days) {
				date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
				expires = '; expires=' + date.toGMTString();
			}
			document.cookie = name+'='+value+expires+'; path=/';
		};
		this.readCookie = function(name) {
			var nameEQ = name + '=',
				ca = document.cookie.split(';');
			for(var i=0;i < ca.length;i++) {
				var c = ca[i];
				while (c.charAt(0) == ' ') {
					c = c.substring(1, c.length)
				}
				if (c.indexOf(nameEQ) == 0) {
					return c.substring(nameEQ.length, c.length)
				}
			}
			return null;
		};
		this.eraseCookie = function(name) {
			this.setCookie(name,'',-1);
		};
		//forms		
		this.isValidEmail = function(str) {
			var regexEmail = /^([a-zA-Z0-9_\-])([a-zA-Z0-9_\-\.]*)@(\[((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}|((([a-zA-Z0-9\-]+)\.)+))([a-zA-Z]{2,}|(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\])$/;
			return regexEmail.test(str);
		}
		
		/**
		 * Returns whether or not the current browser supports the `opacity` CSS property.  (IE6, 7, and 8)
		 * {returns} Boolean.
		 */
		this.supportsOpacity = function supportsOpacity () {
			if (typeof isOpacitySupported === 'undefined') {
				isOpacitySupported = 'opacity' in document.createElement('span').style;
			}

			return isOpacitySupported;
		};
		
		this.pxToInt = function (str) {
			return (+ str.replace(/px$/i, '')) || 0;
		};
		
		/**
		*  Checks to see if an element has a given inline style set on it.
		*  @param{HTMLElement} el The element to inspect
		*  @param{String} style The inline style you would like to know about
		*  @returns{Boolean|null|undefined} Returns `true` is the string is present, `false` if it is not, `null` if there are no inline styles set on `el`, and `undefined` if `style` is not a string. 
		*/
		this.hasInlineStyle = function hasInlineStyle (el, style) {
			var inlineStyles = $(el).attr('style'),
				i;
			
			if (!inlineStyles) {
				// There are no inline styles at all, return null (this is handy!)
				return null;
			}
			
			if (typeof style === 'string') {
				
				inlineStyles = inlineStyles.toLowerCase().replace(/\s/g, '').split(';')
			
				for (i = 0; i < inlineStyles.length; i++) {
					if (inlineStyles[i].split(':')[0] === style.toLowerCase()) {
						return true;
					}
				}
			
				return false;
			}
			
			// `style` was not a string, just return `undefined` (this is implicit, anyways)
			return undefined;
		};
		
		
		/**
		*  Return the natural height of an element - the cimputed height that the element would have if
		*  it did not have any inline styles acting upon it (such as those applied with JavaScript)
		*  @param {HTMLElement} el The element to get the natural height of
		*  @returns {Number}
		*/
		this.getNaturalHeight = function getNaturalHeight (el) {
			var currCssHeight,
				naturalHeight;

			el = $(el);

			if (this.hasInlineStyle(el, 'height')) {
				currCssHeight = el.css('height');
				el.css({ 'height': 'auto' });
				naturalHeight = el.height();
				el.css({ 'height': currCssHeight });
			} else {
				el.css({ 'height': 'auto' });
				naturalHeight = el.height();
				el.css({ 'height': '' });
			}

			return naturalHeight;
		}
	}
	window[_ns] = new Util;
})(jQuery);