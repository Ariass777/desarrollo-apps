import { t as __exportAll } from "./rolldown-runtime-BP_521ii.js";
import { f as d, h as n } from "./p-BriaEJK8-Ct-bkoym.js";
import { t as d$1 } from "./p-ZjP4CjeZ-BnW-oeAv.js";
//#region node_modules/@ionic/core/components/p-q2WJ5Igc.js
/*!
* (C) Ionic http://ionicframework.com - MIT License
*/
var p_q2WJ5Igc_exports = /* @__PURE__ */ __exportAll({
	MENU_BACK_BUTTON_PRIORITY: () => 99,
	OVERLAY_BACK_BUTTON_PRIORITY: () => 100,
	blockHardwareBackButton: () => r,
	shouldUseCloseWatcher: () => o,
	startHardwareBackButton: () => i
});
var o = () => n.get("experimentalCloseWatcher", !1) && void 0 !== d$1 && "CloseWatcher" in d$1;
var r = () => {
	document.addEventListener("backbutton", (() => {}));
};
var i = () => {
	const e = document;
	let r = !1;
	const i = () => {
		if (r) return;
		let t = 0, o = [];
		const i = new CustomEvent("ionBackButton", {
			bubbles: !1,
			detail: { register(e, n) {
				o.push({
					priority: e,
					handler: n,
					id: t++
				});
			} }
		});
		e.dispatchEvent(i);
		const a = () => {
			if (o.length > 0) {
				let t = {
					priority: Number.MIN_SAFE_INTEGER,
					handler: () => {},
					id: -1
				};
				o.forEach(((e) => {
					e.priority >= t.priority && (t = e);
				})), r = !0, o = o.filter(((e) => e.id !== t.id)), (async (t) => {
					try {
						if (t?.handler) {
							const e = t.handler(a);
							null != e && await e;
						}
					} catch (t) {
						d("[ion-app] - Exception in startHardwareBackButton:", t);
					}
				})(t).then((() => r = !1));
			}
		};
		a();
	};
	if (o()) {
		let e;
		const n = () => {
			e?.destroy(), e = new d$1.CloseWatcher(), e.onclose = () => {
				i(), n();
			};
		};
		n();
	} else e.addEventListener("backbutton", i);
};
//#endregion
export { p_q2WJ5Igc_exports as n, o as t };
