import { Seq, Map } from "immutable";
import React from "react";

export default class Utils {
    static debounce(func, wait, immediate) {
        let timeout, args, context, timestamp, result;

        const later = function() {
            const last = Date.now() - timestamp;

            if (last < wait && last > 0) {
                timeout = setTimeout(later, wait - last);
            } else {
                timeout = null;
                if (!immediate) {
                    result = func.apply(context, args);
                    if (!timeout) context = args = null;
                }
            }
        };

        return function() {
            context = this;
            args = arguments;
            timestamp = Date.now();
            const callNow = immediate && !timeout;
            if (!timeout) timeout = setTimeout(later, wait);
            if (callNow) {
                result = func.apply(context, args);
                context = args = null;
            }
            return result;
        };
		}

    static downloadFile(url) {
        const id = "downloader";
        let e = document.getElementById(id);
        if (!e) {
            e = document.createElement('iframe');
            e.id = id;
            document.body.appendChild(e);
        }
        e.src = url;
		}

		static dataURItoBlob (dataURI) {
				// convert base64 to raw binary data held in a string
				// doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
				const byteString = atob(dataURI.split(',')[1]);

				const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

				const ab = new ArrayBuffer(byteString.length);
				const ia = new Uint8Array(ab);
				for (let i = 0; i < byteString.length; i++) {
						ia[i] = byteString.charCodeAt(i);
				}

				return new Blob([ab], {type: mimeString});
		}

    static downloadBinary(name, data) {
        const blob = data instanceof Blob;

        if (blob && window.navigator.msSaveOrOpenBlob) {
            window.navigator.msSaveBlob(data, name);
        }
        else {
            const e = document.createElement("a");
            e.setAttribute("href", blob ? URL.createObjectURL(data) : data);
            e.setAttribute("download", name);
            e.style.visibility = "hidden";
            document.body.appendChild(e);
            e.click();
            document.body.removeChild(e);
        }
    }

    static downloadSVG(name, e) {
        e = e.cloneNode(true);

        const f = e => {
            if (e.className.baseVal === "domain") {
                e.setAttribute("fill", "none");
                e.setAttribute("stroke", "black");
            }
            if (e.className.baseVal === "line") {
                e.setAttribute("fill", "none");
            }
            const children = e.children;
            for (let i = 0; i < children.length; i++) f(children[i]);
        };
        f(e);
        Utils.downloadBinary(name + ".svg", new Blob([e.innerHTML], { type: "application/svg+xml" }));
    }

    static getScroll(e) {
        return (e.deltaMode ? 33 : 1) * e.deltaY;
    }

    static drag(action, complete, cursor) {
        cursor = cursor || "move";
        document.body.classList.add(cursor);

        const move = e => {
            action(e);
            e.preventDefault();
        };

        const up = e => {
            window.removeEventListener('pointerup', up);
            window.removeEventListener('pointermove', move);
            document.body.classList.remove(cursor);
            complete && complete(e);
        };

        window.addEventListener('pointerup', up);
        window.addEventListener('pointermove', move);
        return up;
    }

    static css() {
        let result;
        for (let i = 0; i < arguments.length; i++) {
            const e = arguments[i];
            e && (result = result ? result + " " + e : e);
        }
        return result;
    }

    static enabled(e) {
        return e ? "" : "disabled";
    }

    static checked(e) {
        return Utils.css("checkbox", e && "checked");
    }

    static isParent(p, e) {
        for (; e && e !== p; e = e.parentElement);
        return e === p;
    }

    static map(from) {
        const to = {};
        for (const p in from) to[from[p]] = p;
        return { from: from, to: to };
    }

    static ext(p, e) {
        if (!e || e[p] === undefined) {
            const o = {};
            o[p] = e;
            return o;
        }
        return e;
    }

	static extend(from){

		for(let i = 1; i < arguments.length; i++){
			for(const k in arguments[i]){
				from[k] = arguments[i][k];
			}
		}
		return from;
	}

	static count(e) {
		return e && Seq(e).count();
	}

	static range(e, min, max) {
		return Math.max(min, Math.min(max, e));
	}

	static toPercent(v) {
		return 100 * v + "%";
	}

	static equals(a, b) {
		const toObj = e => ((e instanceof Map || e instanceof Seq) ? e.map(toObj).toObject() : e);
		return JSON.stringify(toObj(a)) === JSON.stringify(toObj(b));
	}

	static toFloat(s) {
		return 0.01 * parseFloat(s);
	}

	static toRatioDecimal(v) {
		let floatv = parseFloat(v) * 0.1;
		return parseFloat(floatv.toFixed(1));
	}

	static toFixed1Float(v){
		return parseFloat(parseFloat(v).toFixed(1))
	}

	static toLower(s) {
		return s ? s.toLowerCase() : null;
	}

	static capitalize(s) {
		return s.charAt(0).toUpperCase() + s.slice(1);
	}

	static newGuid() {
		return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, e => {
			const v = crypto.getRandomValues(new Uint8Array(1))[0]%16|0;
			return (e == "x" ? v : (v&0x3|0x8)).toString(16);
		});
	}

	static isGuid(e) {
		return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(e);
	}

	static isEmail(e) {
		return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(e);
	}

	static pick (object, value) {
		if ( !Array.isArray(value) ) {
			value = [value];
		}

		Object.keys(object).forEach((key) => {
			if ( value.includes(object[key]) ) {
				delete object[key];
			}
		});

		return object;
	}
}

Utils.MyComponent = class MyComponent extends React.Component {
	constructor(...args) {
		super(...args);
		this.getInitState && (this.state = this.getInitState());
	}
};

Utils.transitionEnd = (function() {
	try {
	const s = document.createElement("div").style;

	return Seq({
		"transition":"transitionend",
		"OTransition":"oTransitionEnd",
		"MozTransition":"transitionend",
		"WebkitTransition":"webkitTransitionEnd"
	}).find((_, k) => k in s);
	} catch(err) {}
})();

Utils.directions = {
	n:  { x:  0, y: -1 },
	e:  { x:  1, y:  0 },
	s:  { x:  0, y:  1 },
	w:  { x: -1, y:  0 },
	se: { x:  1, y:  1 },
	sw: { x: -1, y:  1 },
	ne: { x:  1, y: -1 },
	nw: { x: -1, y: -1 }
};

Utils.colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#c49c94", "#f7b6d2", "#c7c7c7", "#dbdb8d", "#9edae5",
	"#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];

Utils.and = "\u2227";
Utils.or = "\u2228";
Utils.not = "\xAC";

Utils.base64Encode = (str) => window.btoa(str);
Utils.base64Decode = (base64) => window.atob(base64);
