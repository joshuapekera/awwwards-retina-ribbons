AC.Retina = AC.Class();
AC.Retina.prototype = {
	__defaultOptions: {
		filenameRegex: /(.*)(\.[a-z]{3}($|#.*|\?.*))/i,
		filenameInsert: "_☃x",
		ignoreCheck: /(^http:\/\/movies\.apple\.com\/|\/105\/|\/global(\/ac_media_player)?\/elements\/quicktime\/|_(([2-9]|[1-9][0-9]+)x|nohires)(\.[a-z]{3})($|#.*|\?.*))/i,
		attribute: "data-hires",
		recursive: true,
		preload: false,
		checkExists: true,
		checkAsRootRelative: true,
		queueSize: 8,
		disableOniOSHandheld: true,
		debug: false,
		lowestPriority: 2,
		replacedAttribute: "data-hires-status"
	},
	initialize: function ac_initialize(b) {
		if (typeof b !== "object") {
			b = {}
		}
		this.options = AC.Object.extend(AC.Object.clone(this.__defaultOptions), b);
		if ((this.options.debug !== true) && !this.shouldReplace()) {
			this.replace = AC.Function.emptyFunction;
			return false
		}
		if (this.options.debug === true) {
			AC.Retina._devicePixelRatio = 2
		}
		this._replacedElements = [];
		AC.Object.synthesize(this);
		if (AC.windowHasLoaded) {
			this.__setup()
		} else {
			var a = this.__setup.bind(this);
			AC.Element.addEventListener(window, "load", a)
		}
	},
	shouldReplace: function ac_shouldReplace() {
		return !((AC.Retina.iOSHandheld() && this.options.disableOniOSHandheld === true) || (AC.Retina.devicePixelRatio() <= 1))
	},
	__setup: function ac___setup() {
		this.replace(document.body)
	},
	__addToQueue: function ac___addToQueue(a) {
		if (typeof this.__queues === "undefined") {
			this.__queues = []
		}
		if (this.__queues.length === 0) {
			this.__queues.push([])
		}
		this.__queues[this.__queues.length - 1].push(a)
	},
	__potentialElements: function ac___potentialElements(g, f) {
		if (typeof g === "undefined") {
			g = document.body
		} else {
			g = AC.Element.getElementById(g)
		}
		var b = AC.Array.toArray(g.querySelectorAll("[" + this.options.attribute + "]"));
		var a;
		var c = function(h) {
				if (typeof f === "undefined") {
					return !!AC.Retina.__nearestAncestorHasAttribute(g, h)
				} else {
					return f.getAttribute(h) !== null || typeof f.up("[" + h + "]") !== "undefined"
				}
			};
		if (this.options.recursive === true) {
			if (g !== document.body && c(this.options.attribute)) {
				b = b.concat(g)
			}
			a = [];
			var e = this.__isReplaceable.bind(this);
			var d = function(h) {
					if (e(h)) {
						a.push(h)
					}
					a = a.concat(this.__replaceableElementsWithinElement(h))
				}.bind(this);
			b.forEach(d)
		} else {
			a = b
		}
		return a
	},
	__isReplaceable: function ac___isReplaceable(c) {
		if ((c.getAttribute(this.options.attribute) === "false") || ( !! AC.Retina.__nearestAncestorHasAttribute(c, this.options.attribute, "false") && this.options.recursive === true)) {
			return false
		}
		var a = (typeof c.responsiveImageObject === "undefined");
		if (c.tagName.toLowerCase() === "img") {
			return a
		} else {
			if (AC.Element.hasClassName(c, "imageLink") && c.tagName.toLowerCase() === "a") {
				return true
			} else {
				var b = AC.Retina.Image.removeCSSURLSyntax(AC.Element.getStyle(c, "background-image"));
				return (((b.match(AC.Retina.rasterImageFormatRegex()) !== null) && a))
			}
		}
	},
	__replaceableElementsWithinElement: function ac___replaceableElementsWithinElement(e) {
		e = AC.Element.getElementById(e);
		var a = this;
		var c = e.getElementsByTagName("*");
		var b = [];
		var d;
		for (d = 0; d < c.length; d++) {
			if (this.__isReplaceable(c[d])) {
				b.push(c[d])
			}
		}
		return b
	},
	__prioritize: function ac___prioritize(a) {
		var c = [];
		var d = function(f) {
				if (typeof f.responsiveImageObject !== "undefined") {
					return
				}
				var e = new AC.Retina.Image(f, this.options);
				if (e.hiResSrc() !== null && !e.isHiRes()) {
					if (typeof c[e.priority()] === "undefined") {
						c[e.priority()] = []
					}
					c[e.priority()].push(e);
					f.responsiveImageObject = e
				} else {
					if (e.hiResSrc() && e.isHiRes()) {
						e.setStatus("already-hires")
					} else {
						e.setStatus("not-replaceable")
					}
				}
			}.bind(this);
		a.forEach(d);
		var b;
		for (b = this.options.lowestPriority; b >= 0; b--) {
			if (typeof c[b] === "undefined") {
				c[b] = []
			}
		}
		return AC.Array.flatten(c)
	},
	__replaceQueues: function ac___replaceQueues() {
		if (typeof this.__queues === "undefined") {
			this.__queues = []
		}
		if (this.__queues.length > 0 && this.__queues[0].length > 0) {
			this.__queues.push([]);
			var a = this.__replaceQueues.bind(this);
			this.__replaceNextQueue(a)
		}
	},
	__replaceNextQueue: function ac___replaceNextQueue(e) {
		var b = this;
		var a = b.__queues[0].reverse();
		var c = function() {
				if (b.options.debug === true) {
					AC.log(arguments)
				}
			};
		b.__queues.splice(0, 1);
		var d = function() {
				c("Found " + a.length + " elements to replace.");
				var f = function() {
						var h = a.pop();
						b._replacedElements.push(h);
						if (!h) {
							c("No more images to start replacing.");
							if (typeof e === "function") {
								e()
							}
							e = AC.Function.emptyFunction;
							return
						}
						h.replace(function(i) {
							c("Replaced image.", h.hiResSrc(), "status: " + h.status());
							f()
						})
					};
				for (var g = 0; g < b.options.queueSize; g++) {
					f()
				}
			};
		window.setTimeout(d, 10)
	},
	replace: function ac_replace(c, a) {
		var b = this.__addToQueue.bind(this);
		this.__prioritize(this.__potentialElements(c, a)).forEach(b);
		this.__replaceQueues()
	}
};
AC.Retina.iOSHandheld = function() {
	return ( !! navigator.userAgent.match(/AppleWebKit/i) && ( !! navigator.userAgent.match(/Mobile/i) && !navigator.userAgent.match(/ipad/i)))
};
AC.Retina._rasterImageFormatRegex = /(\.jpg($|#.*|\?.*)|\.png($|#.*|\?.*)|\.gif($|#.*|\?.*))/;
AC.Retina.rasterImageFormatRegex = function() {
	return AC.Retina._rasterImageFormatRegex
};
AC.Retina.devicePixelRatio = function() {
	if (typeof AC.Retina._devicePixelRatio !== "undefined") {
		return AC.Retina._devicePixelRatio
	}
	if ("devicePixelRatio" in window && window.devicePixelRatio > 1) {
		return AC.Retina._devicePixelRatio = 2
	} else {
		return AC.Retina._devicePixelRatio = 1
	}
};
AC.Retina.__nearestAncestorHasAttribute = function(c, a, e) {
	var d = AC.Retina.__ancestors(c);
	var b;
	for (b = 0; b < d.length; b++) {
		if (d[b].hasAttribute(a)) {
			if (typeof e === "undefined" || d[b].getAttribute(a) === e) {
				return d[b]
			} else {
				return null
			}
		}
	}
	return null
};
AC.Retina.__ancestors = function(a) {
	a = AC.Element.getElementById(a);
	var b = [];
	if (AC.Element.isElement(a.parentNode)) {
		while (a = a.parentNode) {
			if (AC.Element.isElement(a)) {
				b.push(a)
			}
		}
	}
	return b
};
AC.Retina.sharedInstance();
AC.Retina.Image = AC.Class();
AC.Retina.Image.prototype = {
	initialize: function ac_initialize(b, a) {
		this._el = b;
		this._tagName = this._el.tagName.toLowerCase();
		this.options = AC.Object.extend(AC.Object.clone(a), AC.Retina.Image.convertParametersToOptions(this.src()));
		this.setStatus("considered");
		AC.Object.synthesize(this)
	},
	setStatus: function ac_setStatus(a) {
		if (typeof a === "string") {
			this._status = a;
			this._el.setAttribute(this.options.replacedAttribute, a)
		}
	},
	status: function ac_status() {
		return this._el.getAttribute(this.options.replacedAttribute)
	},
	src: function ac_src() {
		if (typeof this._src !== "undefined") {
			return this._src
		}
		if (this.isImageLink()) {
			this._src = this._el.getAttribute("href")
		} else {
			if (this._tagName === "img") {
				this._src = this._el.getAttribute("src")
			} else {
				this._src = AC.Retina.Image.removeCSSURLSyntax(AC.Element.getStyle(this._el, "background-image"));
				if (this._src === "none") {
					return this._src = ""
				}
			}
		}
		return this._src
	},
	isImageLink: function ac_isImageLink() {
		if (typeof this._isImageLink !== "undefined") {
			return this._isImageLink
		}
		return this._isImageLink = (AC.Element.hasClassName(this._el, "imageLink") && this._tagName === "a")
	},
	hiResSrc: function ac_hiResSrc() {
		if (typeof this._hiResSrc !== "undefined") {
			return this._hiResSrc
		}
		var a;
		if (typeof this.options.hiresFormat === "string") {
			a = this.src().match(/^(.*)((\.[a-z]{3})($|#.*|\?.*))/i);
			if (a !== null && a.length > 1) {
				return this._hiResSrc = a[1] + "." + this.options.hiresFormat + (a[4] || "")
			}
		}
		a = this.src().match(this.options.filenameRegex);
		if (a === null) {
			return this._hiResSrc = null
		} else {
			return this._hiResSrc = a[1] + this.options.filenameInsert.replace("☃", AC.Retina.devicePixelRatio()) + a[2]
		}
	},
	isHiRes: function ac_isHiRes() {
		if (this._isHiRes === true) {
			return this._isHiRes
		}
		if (this.status() === "replaced") {
			return this._isHiRes = true
		}
		var a = this.src();
		if (a.match(AC.Retina.rasterImageFormatRegex()) === null) {
			return this._isHiRes = true
		}
		if (a.match(this.options.ignoreCheck) !== null) {
			return this._isHiRes = true
		}
		return this._isHiRes = false
	},
	priority: function ac_priority() {
		if (typeof this._priority !== "undefined") {
			return this._priority
		}
		if (this.options.recursive && this._el.hasAttribute(this.options.attribute) === false) {
			var a = AC.Retina.__nearestAncestorHasAttribute(this._el, this.options.attribute);
			if ( !! a) {
				this._priority = parseInt(a.getAttribute(this.options.attribute))
			} else {
				this._priority = this.options.lowestPriority
			}
		} else {
			this._priority = parseInt(this._el.getAttribute(this.options.attribute))
		}
		if (isNaN(this._priority) || this._priority > this.options.lowestPriority) {
			this._priority = this.options.lowestPriority
		} else {
			if (this._priority < 0) {
				this._priority = 0
			}
		}
		return this._priority
	},
	replace: function ac_replace(e) {
		var c = this;
		var b = c.replace.bind(c, e);
		var a = c.hiResSrc();
		var d;
		if (c._exists === false) {
			c.setStatus("404");
			if (typeof e === "function") {
				e(false)
			}
			return
		}
		if (c.options.checkExists === true && typeof c._exists === "undefined") {
			if (c.options.checkAsRootRelative === true || (a.indexOf(window.location.origin) === 0 || a.indexOf("/") === 0)) {
				d = (c.options.checkAsRootRelative === true) ? a.replace(/^https?:\/\/[^\/]*\//, "/") : a;
				c._exists = false;
				return AC.Ajax.checkURL(d, function(f) {
					c._exists = f;
					b()
				})
			}
		}
		if (c.isImageLink()) {
			c._el.setAttribute("href", a);
			c.setStatus("replaced");
			if (typeof e === "function") {
				e(true)
			}
		} else {
			if ((c.options.preload === true || c._tagName !== "img") && c._isPreloaded !== true) {
				return c.preload(b)
			}
			if (c._tagName === "img") {
				c._el.setAttribute("src", a);
				if ((c.options.preload !== true)) {
					c.setStatus("loading");
					AC.Element.addEventListener(c._el, "load", function(f) {
						c.setStatus("replaced");
						if (typeof e === "function") {
							e(true)
						}
					});
					AC.Element.addEventListener(c._el, "error", function(f) {
						c.setStatus("404");
						c._el.setAttribute("src", c.src());
						if (typeof e === "function") {
							e(false)
						}
					})
				}
			} else {
				c._el.setStyle("background-image:url(" + a + ");");
				c._el.setStyle("background-size:" + (c.width / AC.Retina.devicePixelRatio()) + "px " + (c.height / AC.Retina.devicePixelRatio()) + "px;");
				if (typeof e === "function") {
					e(true)
				}
			}
		}
		c.synthesize()
	},
	preload: function ac_preload(b) {
		if (this._isPreloaded) {
			return true
		}
		this.setStatus("loading");
		var a = new Element("img");
		AC.Element.addEventListener(a, "load", function() {
			this._isPreloaded = true;
			this.width = a.width;
			this.height = a.height;
			this.setStatus("replaced");
			if (typeof b === "function") {
				b()
			}
		}.bind(this));
		AC.Element.addEventListener(a, "error", function() {
			this.setStatus("404");
			this._exists = false;
			if (typeof b === "function") {
				b()
			}
		}.bind(this));
		a.src = this.hiResSrc()
	}
};
AC.Retina.Image.removeCSSURLSyntax = function(a) {
	if (typeof a === "string" && typeof a.replace === "function") {
		return a.replace(/^url\(/, "").replace(/\)$/, "")
	}
	return ""
};
AC.Retina.Image.convertParametersToOptions = function(b) {
	if (typeof b === "string" && typeof b.toQueryParams === "function") {
		var a = b.toQueryParams(),
			c;
		for (c in a) {
			if (a.hasOwnProperty(c)) {
				a[c.camelize()] = a[c]
			}
		}
		return a
	}
	return {}
};