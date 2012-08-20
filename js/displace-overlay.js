(function(C, D) {
	D.Detector = D.Detector || {};
	D.Detector.hasCanvas = (function() {
		var b = document.createElement("canvas"),
			a = !! (b.getContext && b.getContext("2d"));
		return function() {
			return a
		}
	}());
	D.Detector.isIE6 = function(a) {
		var b = a || this.getAgent(),
			c = b.match(/msie\D*([\.\d]*)/i),
			d;
		if (c && c[1]) {
			d = c[1]
		}
		return (+d <= 6)
	};
	D.Detector.isIE9 = function(a) {
		var b = a || this.getAgent(),
			c = b.match(/msie\D*([\.\d]*)/i),
			d;
		if (c && c[1]) {
			d = c[1]
		}
		return (+d >= 9)
	};
	var H = (function() {
		if (D.Detector.isWebKit()) {
			return "-webkit-"
		} else {
			if (D.Detector.isFirefox()) {
				return "-moz-"
			} else {
				if (D.Detector.isIE()) {
					return ""
				}
			}
		}
	}()),
		v = {
			threshold: 0,
			timeInView: 0.5,
			scrollEndDelay: 0.5
		},
		y = {
			shouldAnimateContentChange: true,
			shouldAnimateFadeIn: true,
			addSectionIdAsClassName: true,
			manageZ: true,
			silentTriggers: true,
			useHTML5Tags: true
		},
		A = function() {
			var c, d, h = [],
				e = 0,
				i, b = new Date(),
				a = function(j) {
					var k = document.createElement("canvas");
					k.width = j.width;
					k.height = j.height;
					k.getContext("2d").drawImage(j, 0, 0);
					return k
				},
				f = function(j) {
					var k = 0;
					return {
						callbackOnZero: j,
						increment: function() {
							k += 1
						},
						decrement: function() {
							k -= 1;
							if (!k) {
								if (this.callbackOnZero) {
									this.callbackOnZero()
								}
							}
						}
					}
				},
				g = function(k, j) {
					if (!w.getController().getInteractionStatus() && ((new Date() - b) > 500)) {
						h[k] = a(this);
						b = new Date();
						j.decrement();
						return false
					} else {
						C.setTimeout(g.bind(this, k, j), 500)
					}
				};
			if (D.Detector.hasCanvas() && !D.Detector.isIE()) {
				d = document.createElement("canvas")
			}
			return {
				setImageData: function(j, k) {
					var l = function() {
							var m;
							if (d && typeof h[j] !== "object") {
								m = a(this)
							}
							if (d) {
								d = m || h[j];
								i = d.getContext("2d").getImageData(0, 0, d.width, d.height);
								i.pixelRatio = i.width / d.width;
								i.calculatedWidth = i.width / i.pixelRatio;
								i.calculatedHeight = i.height / i.pixelRatio
							}
							if (typeof j === "number" && typeof h[j] !== "object") {
								e = j;
								if (d) {
									h[j] = m
								} else {
									h[j] = this
								}
							}
							if (typeof k === "function") {
								k(i || c)
							}
						};
					if (typeof j === "number" && typeof h[j] === "object") {
						e = j;
						l.call(h[j])
					} else {
						c = new Image();
						c.onload = l;
						c.src = (typeof j !== "number") ? j : h[j]
					}
					return this
				},
				setSources: function(j) {
					h = h.concat(j);
					return this
				},
				getImageData: function(m, j, l, k) {
					if (!i) {
						return h[e]
					}
					if (m || j || l || k) {
						i = d.getContext("2d").getImageData(m || 0, j || 0, l || d.width, k || d.height)
					}
					return i
				},
				doPreload: function(l, j) {
					var k = f(j);
					C.setTimeout(function() {
						h.each(function(m, o) {
							var n = new Image();
							if (typeof m !== "string") {
								return
							}
							k.increment();
							n.onload = function() {
								if (d && !l) {
									g.call(this, o, k)
								} else {
									h[o] = this;
									k.decrement()
								}
								this.onload = null
							};
							n.src = !D.Detector.isIE() ? m.split("#")[0] : m.split("#")[0] + "?" + (Math.floor(Math.random() * 10000))
						})
					}, 50);
					return this
				}
			}
		},
		F = function() {
			var a, b;
			return {
				attachView: function(c) {
					a = c;
					return this
				},
				updateWith: function(c) {
					if (a && b !== c) {
						b = c;
						a.style.backgroundImage = "url(" + c + ")"
					}
					return this
				}
			}
		},
		N = function(a, c) {
			var d, e = A(),
				b = a.getAttribute("data-src");
			if (D.Detector.iOSVersion()) {
				b = b.replace(/.jpg/g, ".png")
			}
			b = b.replace(/https?:\/\/[^\/]+\//g, "/");
			e.setSources(b.split(",")).setImageData(0, function(g) {
				var f = a.children[0],
					h = g.src;
				if (D.Detector.hasCanvas() && !D.Detector.isIE()) {
					g = document.createElement("canvas")
				} else {
					g = document.createElement("div")
				}
				g.className += "canvas";
				if (D.Detector.isIE9()) {
					g.style.filter = ""
				}
				a.insertBefore(g, f.nextSibling);
				if (typeof c === "function") {
					c(g)
				}
			});
			return e
		},
		J = (function(b) {
			var d = b,
				f, g, c, a = new Image(),
				e = function() {
					g.style.opacity = "0";
					c.style.opacity = "0";
					C.setTimeout(function() {
						g.parentNode.removeChild(g);
						c.parentNode.removeChild(c);
						g = undefined;
						c = undefined
					}, D.Detector.isIE() ? 400 : 1000)
				};
			a.src = "http://images.apple.com/global/elements/zoom_view/zoom-view-image-loading.gif";
			return {
				getLoadStatus: function() {
					if (!d) {
						return true
					} else {
						return false
					}
				},
				registerLoadEvent: function() {
					d -= 1;
					if (!d) {
						if (f) {
							e();
							setTimeout(function() {
								f()
							}, 400)
						}
					}
					return this
				},
				showSpinners: function(h) {
					g = document.createElement("div");
					g.className = "spinner ";
					g.appendChild(a);
					c = g.cloneNode(true);
					c.className += "right";
					$$(".loupe-container .column.first")[0].appendChild(g);
					$$(".loupe-container .column.last")[0].appendChild(c);
					if (h) {
						f = h
					}
					return this
				}
			}
		}(3)),
		G = function() {
			var a = [],
				b = A();
			$$(".loupe-container .imageLink").each(function(c, d) {
				a.push(c.href)
			});
			b.setSources(a).doPreload(true, J.registerLoadEvent);
			G = b
		},
		B = function(g, f) {
			var j = g.calculatedHeight,
				c = g.calculatedWidth,
				i = g.data,
				e = f.data,
				d = 0,
				a = 1,
				k, h, b;
			for (null; c -= 1; a += 1) {
				for (k = j + 1; k -= 1; d += 4) {
					if (h = e[d]) {
						b = ((h + a) * j - k) * 4;
						i[d] = i[b];
						i[d + 1] = i[b + 1];
						i[d + 2] = i[b + 2]
					}
				}
			}
			return g
		},
		L = (function() {
			if (D.Detector.isFirefox()) {
				return function(b, c, a) {
					b.style.MozTransform = "translateX(" + c + "px) translateY(" + a + "px)"
				}
			} else {
				if (D.Detector.isWebKit()) {
					return function(b, c, a) {
						b.style.webkitTransform = "translateX(" + c + "px) translateY(" + a + "px) translateZ(0)"
					}
				} else {
					if (D.Detector.isIE9()) {
						return function(b, c, a) {
							b.style.msTransform = "translateX(" + c + "px) translateY(" + a + "px)"
						}
					} else {
						if (D.Detector.isIE()) {
							return function(b, c, a) {
								b.style.marginTop = a + "px";
								b.style.marginLeft = c + "px"
							}
						}
					}
				}
			}
		}()),
		I = (function() {
			if (D.Detector.hasCanvas() && !D.Detector.isIE()) {
				return function(b, c, a) {
					L(b.container, c + b.initplacementX, a + b.initplacementY);
					b.canvasImageViewCtx.putImageData(B(b.canvasView.getImageData(Math.round((c + b.offsetX + b.initplacementX) * b.speed), Math.round((a + b.offsetY + b.initplacementY) * b.speed), b.canvasImageView.width, b.canvasImageView.height), b.displacementMap.getImageData()), 0, 0)
				}
			} else {
				return function(b, c, a) {
					c = +c;
					a = +a;
					if (b && b.canvasView) {
						b.updateIEView.updateWith(b.canvasView.getImageData().src);
						L(b.container, c + b.initplacementX, a + b.initplacementY);
						b.canvasImageView.style.backgroundPosition = -Math.round((c + b.offsetX + b.initplacementX) * b.speed) + "px " + -Math.round((a + b.offsetY + b.initplacementY) * b.speed) + "px"
					}
				}
			}
		}()),
		M = (function() {
			var b, d, c, a = D.Detector.iOSVersion() ? ".tooltip.touch" : ".tooltip.click";
			return {
				create: function(e) {
					b = $$(a)[0];
					d = $$(a)[1];
					c = e;
					b.style.display = "block";
					d.style.display = "block";
					return this
				},
				show: function(e) {
					C.setTimeout(function() {
						b.style.opacity = "1";
						d.style.opacity = "1"
					}, 10);
					if (e) {
						C.setTimeout(this.hide, e)
					}
					return this
				},
				hide: function() {
					if (!b) {
						return
					}
					b.style.opacity = "0";
					d.style.opacity = "0";
					C.setTimeout(function() {
						if (!b) {
							return
						}
						b.parentNode.removeChild(b);
						d.parentNode.removeChild(d);
						b = undefined;
						d = undefined
					}, D.Detector.isIE() ? 0 : 1000);
					return this
				}
			}
		}()),
		x = function(a) {
			if (D.Detector.isWebKit()) {
				a.style.webkitAnimation = "touchBobble .4s";
				Event.observe(a, "webkitAnimationEnd", function() {
					a.style.webkitAnimation = "";
					$(a).stopObserving("webkitAnimationEnd")
				})
			}
		},
		E = function(b) {
			var a = function(e) {
					return (e === 1) ? 1 : -Math.pow(2, -10 * e) + 1
				},
				c = function() {
					M.create(b).show(2500);
					b[0].canvasView.doPreload(false, J.registerLoadEvent);
					b[1].canvasView.doPreload(false, J.registerLoadEvent)
				},
				d = new Effect.Tween(null, b[0].startAnimationX, 0, {
					duration: 0.5,
					transition: a,
					afterFinish: c
				}, function(e) {
					clearTimeout(b[0].animate);
					b[0].animate = C.setTimeout(function() {
						I(b[0], e, 0)
					}, 0);
					clearTimeout(b[1].animate);
					b[1].animate = C.setTimeout(function() {
						I(b[1], -e, 0)
					}, 0)
				})
		},
		K = function(d, a) {
			var b = document.createElement("canvas"),
				c = b.getContext("2d");
			b.width = d.width;
			b.height = d.height;
			c.drawImage(d, 0, 0);
			b.className += a || "";
			d.parentNode.appendChild(b);
			return b
		},
		z = function(p) {
			var e, f, c, b, s = false,
				l = 0,
				j = 0,
				t = true,
				h = true,
				n = false,
				S = false,
				a = function(O) {
					if (O.target === e.parentNode.children[0] && (!s || D.Detector.iOSVersion())) {
						x(O.target);
						x(e)
					} else {
						if (O.target === f.parentNode.children[0] && (!s || D.Detector.iOSVersion())) {
							x(O.target);
							x(f)
						}
					}
				},
				R = function(O) {
					if (O.target === e.parentNode.children[0] || O.target === f.parentNode.children[0]) {
						if (!D.Detector.isFirefox()) {
							O.target.parentNode.addClassName("grabbing")
						}
						O.preventDefault();
						O.stopPropagation();
						c = O.targetTouches ? O.targetTouches[0].pageY - l : O.pageY - l;
						b = O.targetTouches ? O.targetTouches[0].pageX - j : O.pageX - j;
						s = true
					}
				},
				T = function() {
					var O, P;
					e.parentNode.removeClassName("grabbing");
					f.parentNode.removeClassName("grabbing");
					s = false;
					if (h) {
						O = {};
						O.prop3 = D.Tracking.pageName() + " - loupe - interacted";
						D.Tracking.trackClick(O, {}, "o", O.prop3);
						h = false
					}
				},
				r = function(O) {
					if (l < O.boundY1) {
						l = O.boundY1
					} else {
						if (l > O.boundY2) {
							l = O.boundY2
						}
					}
					if (j < O.boundX1) {
						j = O.boundX1
					} else {
						if (j > O.boundX2) {
							j = O.boundX2
						}
					}
					return O
				},
				o = function() {
					if (t) {
						M.hide();
						t = false
					}
					C.clearTimeout(p[0].animate);
					p[0].animate = C.setTimeout(function() {
						I(r(p[0]), j, l)
					}, 0);
					C.clearTimeout(p[1].animate);
					p[1].animate = C.setTimeout(function() {
						I(r(p[1]), j, l)
					}, 0)
				},
				i = (function() {
					if (C.hasOwnProperty && C.hasOwnProperty("ontouchstart")) {
						return function(O) {
							if (s) {
								O.stopPropagation();
								j = O.targetTouches[0].pageX - b;
								l = O.targetTouches[0].pageY - c;
								o()
							}
						}
					} else {
						return function(O) {
							if (s) {
								O.stopPropagation();
								j = O.pageX - b;
								l = O.pageY - c;
								o()
							}
						}
					}
				}()),
				d = function() {
					var P, O, Q, V;
					if (D.Detector.iOSVersion() >= 4) {
						P = "touchstart";
						O = "touchend";
						Q = "touchmove";
						V = "touchstart"
					} else {
						if (!D.Detector.isMobile()) {
							P = "mousedown";
							O = "mouseup";
							Q = "mousemove";
							V = "mouseover";
							document.ondragstart = function() {
								return false
							}
						}
					}
					Event.observe(document, P, R);
					Event.observe(document, O, T);
					Event.observe(document, Q, i);
					Event.observe(document, V, a)
				},
				g = new D.ShowOnScroll($$(".loupe-container .leftview")[0], v),
				k = function() {
					if (!n) {
						S = true;
						return
					}
					d();
					g.stopObserving();
					g = null;
					E(p);
					k = function() {
						return false
					}
				},
				m = new D.ViewMaster.Viewer($$(".leftview.content"), "gallery-loupeViewLeft", "loupeViewLeft", y),
				q = new D.ViewMaster.Viewer($$(".rightview.content"), "gallery-loupeViewRight", "loupeViewRight", y).setDelegate({
					willAnimate: function(ac, aa, ae, af, O) {
						var ad = ae.id.replace(/\D/g, ""),
							P, Q, ag = function() {
								C.setTimeout(function() {
									if (!g) {
										p[0].canvasView.setImageData(ad - 1, function() {
											I(p[0], j, l);
											if (P) {
												P.style.opacity = "0";
												setTimeout(function() {
													P.parentNode.removeChild(P)
												}, 500)
											}
										});
										p[1].canvasView.setImageData(ad - 1, function() {
											I(p[1], j, l);
											if (Q) {
												Q.style.opacity = "0";
												setTimeout(function() {
													Q.parentNode.removeChild(Q)
												}, 500)
											}
										})
									} else {
										p[0].canvasView.setImageData(ad - 1);
										p[1].canvasView.setImageData(ad - 1)
									}
								}, 50)
							},
							ab = function() {
								m.show(m.sectionWithId("gallery-loupeViewLeft-section-" + ad));
								ac._animation(ac.view, aa, ae, af, O, 0.4);
								if (D.Detector.hasCanvas() && !D.Detector.isIE()) {
									P = K(e, "canvas-fade");
									Q = K(f, "canvas-fade")
								}
								ag()
							};
						if (!J.getLoadStatus()) {
							k();
							J.showSpinners(ab.bind(this))
						} else {
							ab()
						}
					}
				});
			g.setDelegate({
				visitorEngaged: k
			});
			return {
				getInteractionStatus: function() {
					return s
				},
				configure: function(O) {
					p = O;
					e = p[0].canvasImageView;
					f = p[1].canvasImageView;
					return this
				},
				isReady: function() {
					n = true;
					if (S) {
						k()
					}
					return this
				}
			}
		},
		w = (function() {
			var c = [],
				a = 0,
				b;
			return {
				configure: function(e, d) {
					a = e;
					b = d()
				},
				addInstance: function(d) {
					c.push(d);
					if (c.length === a) {
						b.configure(c).isReady()
					}
				},
				getController: function() {
					return b
				}
			}
		}()),
		u = function(b, a) {
			var c = {};
			c.displacementMap = A().setImageData(b.getAttribute("data-displacementmap").replace(/https?:\/\/[^\/]+\//g, "/"), function(d) {
				c.canvasView = N(b, function(e) {
					var h = b.getAttribute("data-initplacement") || "0,0",
						f = +b.getAttribute("data-scale-ratio"),
						j = b.getAttribute("data-boundingbox") || "0,0,0,0",
						g = d.calculatedWidth || d.width,
						i = d.calculatedHeight || d.height;
					h = h.split(",");
					j = j.split(",");
					if (D.Detector.hasCanvas() && !D.Detector.isIE()) {
						c.canvasImageViewCtx = e.getContext("2d")
					} else {
						c.updateIEView = F().attachView(e)
					}
					e.style.width = g + "px";
					e.style.height = i + "px";
					e.width = g;
					e.height = i;
					c.canvasImageView = e;
					c.startAnimationX = parseInt(b.getStyle(H + "transform").split(",")[4], 10);
					if (isNaN(c.startAnimationX)) {
						c.startAnimationX = b.getStyle(H + "transform").split(",")[0].replace(/[^0-9\-]/g, "")
					}
					c.speed = f;
					c.initplacementX = +h[0] || 0;
					c.initplacementY = +h[1] || 0;
					c.offsetX = 40;
					c.offsetY = 20;
					c.boundX1 = +j[0] || 0;
					c.boundY1 = +j[1] || 0;
					c.boundX2 = +j[2] || 0;
					c.boundY2 = +j[3] || 0;
					c.container = b;
					I(c, c.startAnimationX, 0);
					c.container.style.visibility = "visible";
					if (typeof a === "function") {
						a(c)
					}
				})
			})
		};
	Event.onDOMReady(function() {
		var b = false,
			a = function() {
				var d = $$(".loupe"),
					e = d.length,
					c;
				if (b) {
					Event.stopObserving(window, "deviceorientation", a);
					$$("section.retina")[0].removeClassName("degraded")
				}
				G();
				w.configure(e, z);
				for (c = 0; c < e; c += 1) {
					u(d[c], w.addInstance)
				}
			};
		if (D.Detector.isMobile() || D.Detector.isiPad()) {
			$$("section.retina")[0].addClassName("degraded");
			b = true;
			Event.observe(window, "deviceorientation", a);
			return
		}
		if (D.Detector.isIE() && D.Detector.isIE6()) {
			return
		}
		a()
	})
}(window, AC || {}));