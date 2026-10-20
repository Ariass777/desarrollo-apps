import { t as __exportAll } from "./rolldown-runtime-BP_521ii.js";
import { f as r$1, n as M } from "./p-CVVUo4J1-U-223Mmh.js";
//#region node_modules/@ionic/core/components/p-BKxLivx4.js
/*!
* (C) Ionic http://ionicframework.com - MIT License
*/
var p_BKxLivx4_exports = /* @__PURE__ */ __exportAll({
	iosTransitionAnimation: () => l,
	shadow: () => a
});
var n = (t) => document.querySelector(`${t}.ion-cloned-element`);
var a = (t) => t.shadowRoot || t;
var s = (t) => {
	const o = "ION-TABS" === t.tagName ? t : t.querySelector("ion-tabs"), n = "ion-content ion-header:not(.header-collapse-condense-inactive) ion-title.title-large";
	if (null != o) {
		const t = o.querySelector("ion-tab:not(.tab-hidden), .ion-page:not(.ion-page-hidden)");
		return null != t ? t.querySelector(n) : null;
	}
	return t.querySelector(n);
};
var e = (t, o) => {
	const n = "ION-TABS" === t.tagName ? t : t.querySelector("ion-tabs");
	let a = [];
	if (null != n) {
		const t = n.querySelector("ion-tab:not(.tab-hidden), .ion-page:not(.ion-page-hidden)");
		null != t && (a = t.querySelectorAll("ion-buttons"));
	} else a = t.querySelectorAll("ion-buttons");
	for (const t of a) {
		const n = t.closest("ion-header"), a = n && !n.classList.contains("header-collapse-condense-inactive"), s = t.querySelector("ion-back-button"), e = t.classList.contains("buttons-collapse");
		if (null !== s && ("start" === t.slot || "" === t.slot) && (e && a && o || !e)) return s;
	}
	return null;
};
var r = (o, s, e, r, i, l, f, p, $) => {
	const d = s ? `calc(100% - ${i.right + 4}px)` : i.left - 4 + "px", b = s ? "right" : "left", m = s ? "left" : "right", u = s ? "right" : "left";
	let y = 1, X = 1, x = `scale(${X})`;
	const h = "scale(1)";
	if (l && f) {
		const t = l.textContent?.trim() === p.textContent?.trim();
		y = $.width / f.width, X = ($.height - c) / f.height, x = t ? `scale(${y}, ${X})` : `scale(${X})`;
	}
	const g = a(r).querySelector("ion-icon").getBoundingClientRect(), w = s ? g.width / 2 - (g.right - i.right) + "px" : i.left - g.width / 2 + "px", k = s ? `-${window.innerWidth - i.right}px` : `${i.left}px`, v = `${$.top}px`, T = `${i.top}px`, A = e ? [{
		offset: 0,
		transform: `translate3d(${k}, ${T}, 0)`
	}, {
		offset: 1,
		transform: `translate3d(${w}, ${v}, 0)`
	}] : [{
		offset: 0,
		transform: `translate3d(${w}, ${v}, 0)`
	}, {
		offset: 1,
		transform: `translate3d(${k}, ${T}, 0)`
	}], I = e ? [{
		offset: 0,
		opacity: 1,
		transform: h
	}, {
		offset: 1,
		opacity: 0,
		transform: x
	}] : [{
		offset: 0,
		opacity: 0,
		transform: x
	}, {
		offset: 1,
		opacity: 1,
		transform: h
	}], j = e ? [
		{
			offset: 0,
			opacity: 1,
			transform: "scale(1)"
		},
		{
			offset: .2,
			opacity: 0,
			transform: "scale(0.6)"
		},
		{
			offset: 1,
			opacity: 0,
			transform: "scale(0.6)"
		}
	] : [
		{
			offset: 0,
			opacity: 0,
			transform: "scale(0.6)"
		},
		{
			offset: .6,
			opacity: 0,
			transform: "scale(0.6)"
		},
		{
			offset: 1,
			opacity: 1,
			transform: "scale(1)"
		}
	], B = r$1(), N = r$1(), O = r$1(), S = n("ion-back-button"), V = a(S).querySelector(".button-text"), z = a(S).querySelector("ion-icon");
	S.text = r.text, S.mode = r.mode, S.icon = r.icon, S.color = r.color, S.disabled = r.disabled, S.style.setProperty("display", "block"), S.style.setProperty("position", "fixed"), N.addElement(z), B.addElement(V), O.addElement(S), O.beforeStyles({
		position: "absolute",
		top: "0px",
		[u]: "0px"
	}).beforeAddWrite((() => {
		r.style.setProperty("display", "none"), S.style.setProperty(b, d);
	})).afterAddWrite((() => {
		r.style.setProperty("display", ""), S.style.setProperty("display", "none"), S.style.removeProperty(b);
	})).keyframes(A), B.beforeStyles({ "transform-origin": `${b} top` }).keyframes(I), N.beforeStyles({ "transform-origin": `${m} center` }).keyframes(j), o.addAnimation([
		B,
		N,
		O
	]);
};
var i = (o, a, s, e, r, i, l, f, p) => {
	const $ = a ? "right" : "left", d = a ? `calc(100% - ${r.right}px)` : `${r.left}px`, b = `${r.top}px`;
	let m = a ? `-${window.innerWidth - l.right - 8}px` : `${l.x + 8}px`, u = .5;
	const y = "scale(1)";
	let X = `scale(${u})`;
	if (f && p) {
		m = a ? `-${window.innerWidth - p.right - 8}px` : p.x - 8 + "px";
		const t = f.textContent?.trim() === e.textContent?.trim();
		u = p.height / (i.height - c), X = t ? `scale(${p.width / i.width}, ${u})` : `scale(${u})`;
	}
	const x = l.top + l.height / 2 - r.height * u / 2 + "px", h = s ? [
		{
			offset: 0,
			opacity: 0,
			transform: `translate3d(${m}, ${x}, 0) ${X}`
		},
		{
			offset: .1,
			opacity: 0
		},
		{
			offset: 1,
			opacity: 1,
			transform: `translate3d(0px, ${b}, 0) ${y}`
		}
	] : [
		{
			offset: 0,
			opacity: .99,
			transform: `translate3d(0px, ${b}, 0) ${y}`
		},
		{
			offset: .6,
			opacity: 0
		},
		{
			offset: 1,
			opacity: 0,
			transform: `translate3d(${m}, ${x}, 0) ${X}`
		}
	], g = n("ion-title"), w = r$1();
	g.innerText = e.innerText, g.size = e.size, g.color = e.color, w.addElement(g), w.beforeStyles({
		"transform-origin": `${$} top`,
		height: `${r.height}px`,
		display: "",
		position: "relative",
		[$]: d
	}).beforeAddWrite((() => {
		e.style.setProperty("opacity", "0");
	})).afterAddWrite((() => {
		e.style.setProperty("opacity", ""), g.style.setProperty("display", "none");
	})).keyframes(h), o.addAnimation(w);
};
var l = (n, l) => {
	try {
		const c = "cubic-bezier(0.32,0.72,0,1)", f = "opacity", p = "transform", $ = "0%", d = .8, b = "rtl" === n.ownerDocument.dir, m = b ? "-99.5%" : "99.5%", u = b ? "33%" : "-33%", y = l.enteringEl, X = l.leavingEl, x = "back" === l.direction, h = y.querySelector(":scope > ion-content"), g = y.querySelectorAll(":scope > ion-header > *:not(ion-toolbar), :scope > ion-footer > *"), w = y.querySelectorAll(":scope > ion-header > ion-toolbar"), k = r$1(), v = r$1();
		if (k.addElement(y).duration((l.duration ?? 0) || 540).easing(l.easing || c).fill("both").beforeRemoveClass("ion-page-invisible"), X && null != n) {
			const o = r$1();
			o.addElement(n), k.addAnimation(o);
		}
		if (h || 0 !== w.length || 0 !== g.length ? (v.addElement(h), v.addElement(g)) : v.addElement(y.querySelector(":scope > .ion-page, :scope > ion-nav, :scope > ion-tabs")), k.addAnimation(v), x ? v.beforeClearStyles([f]).fromTo("transform", `translateX(${u})`, `translateX(${$})`).fromTo(f, d, 1) : v.beforeClearStyles([f]).fromTo("transform", `translateX(${m})`, `translateX(${$})`), h) {
			const o = a(h).querySelector(".transition-effect");
			if (o) {
				const n = o.querySelector(".transition-cover"), a = o.querySelector(".transition-shadow"), s = r$1(), e = r$1(), r = r$1();
				s.addElement(o).beforeStyles({
					opacity: "1",
					display: "block"
				}).afterStyles({
					opacity: "",
					display: ""
				}), e.addElement(n).beforeClearStyles([f]).fromTo(f, 0, .1), r.addElement(a).beforeClearStyles([f]).fromTo(f, .03, .7), s.addAnimation([e, r]), v.addAnimation([s]);
			}
		}
		const T = y.querySelector("ion-header.header-collapse-condense"), { forward: A, backward: I } = ((t, o, n, l, c) => {
			const f = e(l, n), p = s(c), $ = s(l), d = e(c, n), b = null !== f && null !== p && !n, m = null !== $ && null !== d && n;
			if (b) {
				const s = p.getBoundingClientRect(), e = f.getBoundingClientRect(), l = a(f).querySelector(".button-text"), c = l?.getBoundingClientRect(), $ = a(p).querySelector(".toolbar-title").getBoundingClientRect();
				i(t, o, n, p, s, $, e, l, c), r(t, o, n, f, e, l, c, p, $);
			} else if (m) {
				const s = $.getBoundingClientRect(), e = d.getBoundingClientRect(), l = a(d).querySelector(".button-text"), c = l?.getBoundingClientRect(), f = a($).querySelector(".toolbar-title").getBoundingClientRect();
				i(t, o, n, $, s, f, e, l, c), r(t, o, n, d, e, l, c, $, f);
			}
			return {
				forward: b,
				backward: m
			};
		})(k, b, x, y, X);
		if (w.forEach(((o) => {
			const n = r$1();
			n.addElement(o), k.addAnimation(n);
			const s = r$1();
			s.addElement(o.querySelector("ion-title"));
			const e = r$1(), r = Array.from(o.querySelectorAll("ion-buttons,[menuToggle]")), i = o.closest("ion-header"), l = i?.classList.contains("header-collapse-condense-inactive");
			let c;
			c = r.filter(x ? (t) => {
				const o = t.classList.contains("buttons-collapse");
				return o && !l || !o;
			} : (t) => !t.classList.contains("buttons-collapse")), e.addElement(c);
			const p = r$1();
			p.addElement(o.querySelectorAll(":scope > *:not(ion-title):not(ion-buttons):not([menuToggle])"));
			const d = r$1();
			d.addElement(a(o).querySelector(".toolbar-background"));
			const y = r$1(), X = o.querySelector("ion-back-button");
			if (X && y.addElement(X), n.addAnimation([
				s,
				e,
				p,
				d,
				y
			]), e.fromTo(f, .01, 1), p.fromTo(f, .01, 1), x) l || s.fromTo("transform", `translateX(${u})`, `translateX(${$})`).fromTo(f, .01, 1), p.fromTo("transform", `translateX(${u})`, `translateX(${$})`), y.fromTo(f, .01, 1);
			else {
				T || s.fromTo("transform", `translateX(${m})`, `translateX(${$})`).fromTo(f, .01, 1), p.fromTo("transform", `translateX(${m})`, `translateX(${$})`), d.beforeClearStyles([f, "transform"]);
				if (i?.translucent ? d.fromTo("transform", b ? "translateX(-100%)" : "translateX(100%)", "translateX(0px)") : d.fromTo(f, .01, "var(--opacity)"), A || y.fromTo(f, .01, 1), X && !A) {
					const o = r$1();
					o.addElement(a(X).querySelector(".button-text")).fromTo("transform", b ? "translateX(-100px)" : "translateX(100px)", "translateX(0px)"), n.addAnimation(o);
				}
			}
		})), X) {
			const n = r$1(), s = X.querySelector(":scope > ion-content"), e = X.querySelectorAll(":scope > ion-header > ion-toolbar"), r = X.querySelectorAll(":scope > ion-header > *:not(ion-toolbar), :scope > ion-footer > *");
			if (s || 0 !== e.length || 0 !== r.length ? (n.addElement(s), n.addElement(r)) : n.addElement(X.querySelector(":scope > .ion-page, :scope > ion-nav, :scope > ion-tabs")), k.addAnimation(n), x) {
				n.beforeClearStyles([f]).fromTo("transform", `translateX(${$})`, b ? "translateX(-100%)" : "translateX(100%)");
				const t = M(X);
				k.afterAddWrite((() => {
					"normal" === k.getDirection() && t.style.setProperty("display", "none");
				}));
			} else n.fromTo("transform", `translateX(${$})`, `translateX(${u})`).fromTo(f, 1, d);
			if (s) {
				const o = a(s).querySelector(".transition-effect");
				if (o) {
					const a = o.querySelector(".transition-cover"), s = o.querySelector(".transition-shadow"), e = r$1(), r = r$1(), i = r$1();
					e.addElement(o).beforeStyles({
						opacity: "1",
						display: "block"
					}).afterStyles({
						opacity: "",
						display: ""
					}), r.addElement(a).beforeClearStyles([f]).fromTo(f, .1, 0), i.addElement(s).beforeClearStyles([f]).fromTo(f, .7, .03), e.addAnimation([r, i]), n.addAnimation([e]);
				}
			}
			e.forEach(((o) => {
				const n = r$1();
				n.addElement(o);
				const s = r$1();
				s.addElement(o.querySelector("ion-title"));
				const e = r$1(), r = o.querySelectorAll("ion-buttons,[menuToggle]"), i = o.closest("ion-header"), l = i?.classList.contains("header-collapse-condense-inactive"), c = Array.from(r).filter(((t) => {
					const o = t.classList.contains("buttons-collapse");
					return o && !l || !o;
				}));
				e.addElement(c);
				const d = r$1(), m = o.querySelectorAll(":scope > *:not(ion-title):not(ion-buttons):not([menuToggle])");
				m.length > 0 && d.addElement(m);
				const y = r$1();
				y.addElement(a(o).querySelector(".toolbar-background"));
				const X = r$1(), h = o.querySelector("ion-back-button");
				if (h && X.addElement(h), n.addAnimation([
					s,
					e,
					d,
					X,
					y
				]), k.addAnimation(n), X.fromTo(f, .99, 0), e.fromTo(f, .99, 0), d.fromTo(f, .99, 0), x) {
					l || s.fromTo("transform", `translateX(${$})`, b ? "translateX(-100%)" : "translateX(100%)").fromTo(f, .99, 0), d.fromTo("transform", `translateX(${$})`, b ? "translateX(-100%)" : "translateX(100%)"), y.beforeClearStyles([f, "transform"]);
					if (i?.translucent ? y.fromTo("transform", "translateX(0px)", b ? "translateX(-100%)" : "translateX(100%)") : y.fromTo(f, "var(--opacity)", 0), h && !I) {
						const o = r$1();
						o.addElement(a(h).querySelector(".button-text")).fromTo("transform", `translateX(${$})`, `translateX(${(b ? -124 : 124) + "px"})`), n.addAnimation(o);
					}
				} else l || s.fromTo("transform", `translateX(${$})`, `translateX(${u})`).fromTo(f, .99, 0).afterClearStyles([p, f]), d.fromTo("transform", `translateX(${$})`, `translateX(${u})`).afterClearStyles([p, f]), X.afterClearStyles([f]), s.afterClearStyles([f]), e.afterClearStyles([f]);
			}));
		}
		return k;
	} catch (t) {
		throw t;
	}
};
var c = 10;
//#endregion
export { p_BKxLivx4_exports as n, l as t };
