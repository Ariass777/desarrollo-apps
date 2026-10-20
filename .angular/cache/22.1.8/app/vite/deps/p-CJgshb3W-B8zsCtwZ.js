import { t as __exportAll } from "./rolldown-runtime-BP_521ii.js";
import { f as r$1, n as M } from "./p-CVVUo4J1-U-223Mmh.js";
//#region node_modules/@ionic/core/components/p-CJgshb3W.js
/*!
* (C) Ionic http://ionicframework.com - MIT License
*/
var p_CJgshb3W_exports = /* @__PURE__ */ __exportAll({ mdTransitionAnimation: () => r });
var r = (r, a) => {
	const i = "40px", n = "back" === a.direction, s = a.leavingEl, e = M(a.enteringEl), c = e.querySelector("ion-toolbar"), p = r$1();
	if (p.addElement(e).fill("both").beforeRemoveClass("ion-page-invisible"), n ? p.duration((a.duration ?? 0) || 200).easing("cubic-bezier(0.47,0,0.745,0.715)") : p.duration((a.duration ?? 0) || 280).easing("cubic-bezier(0.36,0.66,0.04,1)").fromTo("transform", `translateY(${i})`, "translateY(0px)").fromTo("opacity", .01, 1), c) {
		const o = r$1();
		o.addElement(c), p.addAnimation(o);
	}
	if (s && n) {
		p.duration((a.duration ?? 0) || 200).easing("cubic-bezier(0.47,0,0.745,0.715)");
		const r = r$1();
		r.addElement(M(s)).onFinish(((t) => {
			1 === t && r.elements.length > 0 && r.elements[0].style.setProperty("display", "none");
		})).fromTo("transform", "translateY(0px)", `translateY(${i})`).fromTo("opacity", 1, 0), p.addAnimation(r);
	}
	return p;
};
//#endregion
export { r as n, p_CJgshb3W_exports as t };
