import { t as __exportAll } from "./rolldown-runtime-BP_521ii.js";
import { t as e } from "./p-BMPN55of-Bt4HbXz4.js";
//#region node_modules/@ionic/core/components/p-D7-vHX0A.js
/*!
* (C) Ionic http://ionicframework.com - MIT License
*/
var p_D7_vHX0A_exports = /* @__PURE__ */ __exportAll({
	KEYBOARD_DID_CLOSE: () => t,
	KEYBOARD_DID_OPEN: () => o,
	copyVisualViewport: () => l,
	keyboardDidClose: () => c,
	keyboardDidOpen: () => p,
	keyboardDidResize: () => b,
	setKeyboardClose: () => h,
	setKeyboardOpen: () => r,
	startKeyboardAssist: () => n,
	trackViewportChanges: () => g
});
var o = "ionKeyboardDidShow";
var t = "ionKeyboardDidHide";
var i = {};
var d = {};
var a = !1;
var n = (o) => {
	if (e.getEngine()) f(o);
	else {
		if (!o.visualViewport) return;
		d = l(o.visualViewport), o.visualViewport.onresize = () => {
			g(o), p() || b(o) ? r(o) : c(o) && h(o);
		};
	}
};
var f = (e) => {
	e.addEventListener("keyboardDidShow", ((o) => r(e, o))), e.addEventListener("keyboardDidHide", (() => h(e)));
};
var r = (e, o) => {
	w(e, o), a = !0;
};
var h = (e) => {
	y(e), a = !1;
};
var p = () => !a && i.width === d.width && (i.height - d.height) * d.scale > 150;
var b = (e) => a && !c(e);
var c = (e) => a && d.height === e.innerHeight;
var w = (e, t) => {
	const i = new CustomEvent(o, { detail: { keyboardHeight: t ? t.keyboardHeight : e.innerHeight - d.height } });
	e.dispatchEvent(i);
};
var y = (e) => {
	const o = new CustomEvent(t);
	e.dispatchEvent(o);
};
var g = (e) => {
	i = { ...d }, d = l(e.visualViewport);
};
var l = (e) => ({
	width: Math.round(e.width),
	height: Math.round(e.height),
	offsetTop: e.offsetTop,
	offsetLeft: e.offsetLeft,
	pageTop: e.pageTop,
	pageLeft: e.pageLeft,
	scale: e.scale
});
//#endregion
export { p_D7_vHX0A_exports as n, o as t };
