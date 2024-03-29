(function(d) {
	d.Observe = {}
})(jQuery);
(function(d, q) {
	var r = function(e, f) {
		f || (f = e, e = window.document);
		var m = [];
		d(f).each(function() {
			for (var l = [], g = d(this), h = g.parent(); h.length && !g.is(e); h = h.parent()) {
				var f = g.get(0).tagName.toLowerCase();
				l.push(f + ":eq(" + h.children(f).index(g) + ")");
				g = h
			}(h.length || g.is(e)) && m.push("> " + l.reverse().join(" > "))
		});
		return m.join(", ")
	};
	q.path = {
		get: r,
		capture: function(e, f) {
			f || (f = e, e = window.document);
			var m = [];
			d(f).each(function() {
				var l = -1,
					g = this;
				if (this instanceof Text)
					for (var g = this.parentNode, h = g.childNodes,
							f = 0; f < h.length; f++)
						if (h[f] === this) {
							l = f;
							break
						} var k = r(e, g),
					n = d(e).is(g);
				m.push(function(e) {
					e = n ? e : d(e).find(k);
					return -1 === l ? e : e.contents()[l]
				})
			});
			return function(e) {
				e = e || window.document;
				return m.reduce(function(d, f) {
					return d.add(f(e))
				}, d([]))
			}
		}
	}
})(jQuery, jQuery.Observe);
(function(d, q) {
	var r = function(e) {
		this.original = d(e);
		this.root = this.original.clone(!1, !0)
	};
	r.prototype.find = function(d) {
		return q.path.capture(this.original, d)(this.root)
	};
	q.Branch = r
})(jQuery, jQuery.Observe);
(function(d, q) {
	var r = function(a, b) {
			var c = {};
			a.forEach(function(a) {
				(a = b(a)) && (c[a[0]] = a[1])
			});
			return c
		},
		e = r("childList attributes characterData subtree attributeOldValue characterDataOldValue attributeFilter".split(" "), function(a) {
			return [a.toLowerCase(), a]
		}),
		f = r(Object.keys(e), function(a) {
			if ("attributefilter" !== a) return [e[a], !0]
		}),
		m = r(["added", "removed"], function(a) {
			return [a.toLowerCase(), a]
		}),
		l = d([]),
		g = function(a) {
			if ("object" === typeof a) return a;
			a = a.split(/\s+/);
			var b = {};
			a.forEach(function(a) {
				a =
					a.toLowerCase();
				if (!e[a] && !m[a]) throw Error("Unknown option " + a);
				b[e[a] || m[a]] = !0
			});
			return b
		},
		h = function(a) {
			return "[" + Object.keys(a).sort().reduce(function(b, c) {
				var d = a[c] && "object" === typeof a[c] ? h(a[c]) : a[c];
				return b + "[" + JSON.stringify(c) + ":" + d + "]"
			}, "") + "]"
		},
		t = window.MutationObserver || window.WebKitMutationObserver,
		k = function(a, b, c, s) {
			this._originalOptions = d.extend({}, b);
			b = d.extend({}, b);
			this.attributeFilter = b.attributeFilter;
			delete b.attributeFilter;
			c && (b.subtree = !0);
			b.childList && (b.added = !0, b.removed = !0);
			if (b.added || b.removed) b.childList = !0;
			this.target = d(a);
			this.options = b;
			this.selector = c;
			this.handler = s
		};
	k.prototype.is = function(a, b, c) {
		return h(this._originalOptions) === h(a) && this.selector === b && this.handler === c
	};
	k.prototype.match = function(a) {
		var b = this.options,
			c = a.type;
		if (!this.options[c]) return l;
		if (this.selector) switch (c) {
			case "attributes":
				if (!this._matchAttributeFilter(a)) break;
			case "characterData":
				return this._matchAttributesAndCharacterData(a);
			case "childList":
				if (a.addedNodes && a.addedNodes.length &&
					b.added && (c = this._matchAddedNodes(a), c.length)) return c;
				if (a.removedNodes && a.removedNodes.length && b.removed) return this._matchRemovedNodes(a)
		} else {
			var s = a.target instanceof Text ? d(a.target).parent() : d(a.target);
			if (!b.subtree && s.get(0) !== this.target.get(0)) return l;
			switch (c) {
				case "attributes":
					if (!this._matchAttributeFilter(a)) break;
				case "characterData":
					return this.target;
				case "childList":
					if (a.addedNodes && a.addedNodes.length && b.added || a.removedNodes && a.removedNodes.length && b.removed) return this.target
			}
		}
		return l
	};
	k.prototype._matchAttributesAndCharacterData = function(a) {
		return this._matchSelector(this.target, [a.target])
	};
	k.prototype._matchAddedNodes = function(a) {
		return this._matchSelector(this.target, a.addedNodes)
	};
	k.prototype._matchRemovedNodes = function(a) {
		var b = new q.Branch(this.target),
			c = Array.prototype.slice.call(a.removedNodes).map(function(a) {
				return a.cloneNode(!0)
			});
		a.previousSibling ? b.find(a.previousSibling).after(c) : a.nextSibling ? b.find(a.nextSibling).before(c) : (this.target === a.target ? b.root : b.find(a.target)).empty().append(c);
		return this._matchSelector(b.root, c).length ? d(a.target) : l
	};
	k.prototype._matchSelector = function(a, b) {
		var c = a.find(this.selector);
		b = Array.prototype.slice.call(b);
		return c = c.filter(function() {
			var a = this;
			return b.some(function(b) {
				return b instanceof Text ? b.parentNode === a : b === a || d(b).has(a).length
			})
		})
	};
	k.prototype._matchAttributeFilter = function(a) {
		return this.attributeFilter && this.attributeFilter.length ? 0 <= this.attributeFilter.indexOf(a.attributeName) : !0
	};
	var n = function(a) {
		this.patterns = [];
		this._target =
			a;
		this._observer = null
	};
	n.prototype.observe = function(a, b, c) {
		var d = this;
		this._observer ? this._observer.disconnect() : this._observer = new t(function(a) {
			a.forEach(function(a) {
				d.patterns.forEach(function(b) {
					var c = b.match(a);
					c.length && c.each(function() {
						b.handler.call(this, a)
					})
				})
			})
		});
		this.patterns.push(new k(this._target, a, b, c));
		this._observer.observe(this._target, this._collapseOptions())
	};
	n.prototype.disconnect = function(a, b, c) {
		var d = this;
		this._observer && (this.patterns.filter(function(d) {
			return d.is(a, b, c)
		}).forEach(function(a) {
			a =
				d.patterns.indexOf(a);
			d.patterns.splice(a, 1)
		}), this.patterns.length || this._observer.disconnect())
	};
	n.prototype.disconnectAll = function() {
		this._observer && (this.patterns = [], this._observer.disconnect())
	};
	n.prototype.pause = function() {
		this._observer && this._observer.disconnect()
	};
	n.prototype.resume = function() {
		this._observer && this._observer.observe(this._target, this._collapseOptions())
	};
	n.prototype._collapseOptions = function() {
		var a = {};
		this.patterns.forEach(function(b) {
			var c = a.attributes && a.attributeFilter;
			if (!c && a.attributes || !b.attributeFilter) c && b.options.attributes && !b.attributeFilter && delete a.attributeFilter;
			else {
				var e = {},
					f = [];
				(a.attributeFilter || []).concat(b.attributeFilter).forEach(function(a) {
					e[a] || (f.push(a), e[a] = 1)
				});
				a.attributeFilter = f
			}
			d.extend(a, b.options)
		});
		Object.keys(m).forEach(function(b) {
			delete a[m[b]]
		});
		return a
	};
	var p = function(a) {
		this.patterns = [];
		this._paused = !1;
		this._target = a;
		this._events = {};
		this._handler = this._handler.bind(this)
	};
	p.prototype.NS = ".jQueryObserve";
	p.prototype.observe =
		function(a, b, c) {
			a = new k(this._target, a, b, c);
			d(this._target);
			a.options.childList && (this._addEvent("DOMNodeInserted"), this._addEvent("DOMNodeRemoved"));
			a.options.attributes && this._addEvent("DOMAttrModified");
			a.options.characterData && this._addEvent("DOMCharacerDataModified");
			this.patterns.push(a)
		};
	p.prototype.disconnect = function(a, b, c) {
		var e = d(this._target),
			f = this;
		this.patterns.filter(function(d) {
			return d.is(a, b, c)
		}).forEach(function(a) {
			a = f.patterns.indexOf(a);
			f.patterns.splice(a, 1)
		});
		var g = this.patterns.reduce(function(a,
			b) {
			b.options.childList && (a.DOMNodeInserted = !0, a.DOMNodeRemoved = !0);
			b.options.attributes && (a.DOMAttrModified = !0);
			b.options.characterData && (a.DOMCharacerDataModified = !0);
			return a
		}, {});
		Object.keys(this._events).forEach(function(a) {
			g[a] || (delete f._events[a], e.off(a + f.NS, f._handler))
		})
	};
	p.prototype.disconnectAll = function() {
		var a = d(this._target),
			b;
		for (b in this._events) a.off(b + this.NS, this._handler);
		this._events = {};
		this.patterns = []
	};
	p.prototype.pause = function() {
		this._paused = !0
	};
	p.prototype.resume = function() {
		this._paused = !1
	};
	p.prototype._handler = function(a) {
		if (!this._paused) {
			var b = {
				type: null,
				target: null,
				addedNodes: null,
				removedNodes: null,
				previousSibling: null,
				nextSibling: null,
				attributeName: null,
				attributeNamespace: null,
				oldValue: null
			};
			switch (a.type) {
				case "DOMAttrModified":
					b.type = "attributes";
					b.target = a.target;
					b.attributeName = a.attrName;
					b.oldValue = a.prevValue;
					break;
				case "DOMCharacerDataModified":
					b.type = "characterData";
					b.target = d(a.target).parent().get(0);
					b.attributeName = a.attrName;
					b.oldValue = a.prevValue;
					break;
				case "DOMNodeInserted":
					b.type =
						"childList";
					b.target = a.relatedNode;
					b.addedNodes = [a.target];
					b.removedNodes = [];
					break;
				case "DOMNodeRemoved":
					b.type = "childList", b.target = a.relatedNode, b.addedNodes = [], b.removedNodes = [a.target]
			}
			for (a = 0; a < this.patterns.length; a++) {
				var c = this.patterns[a],
					e = c.match(b);
				e.length && e.each(function() {
					c.handler.call(this, b)
				})
			}
		}
	};
	p.prototype._addEvent = function(a) {
		this._events[a] || (d(this._target).on(a + this.NS, this._handler), this._events[a] = !0)
	};
	q.Pattern = k;
	q.MutationObserver = n;
	q.DOMEventObserver = p;
	d.fn.observe =
		function(a, b, c) {
			b ? c || (c = b, b = null) : (c = a, a = f);
			return this.each(function() {
				var e = d(this),
					f = e.data("observer");
				f || (f = t ? new n(this) : new p(this), e.data("observer", f));
				a = g(a);
				f.observe(a, b, c)
			})
		};
	d.fn.disconnect = function(a, b, c) {
		a && (b ? c || (c = b, b = null) : (c = a, a = f));
		return this.each(function() {
			var e = d(this),
				f = e.data("observer");
			f && (a ? (a = g(a), f.disconnect(a, b, c)) : (f.disconnectAll(), e.removeData("observer")))
		})
	}
})(jQuery, jQuery.Observe);
jQuery.fn.domChange = jQuery.fn.observe;
