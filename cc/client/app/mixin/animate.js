import React from "react";
import { Tweenable } from "shifty";

export default class Animate extends React.Component {
	animate(options, id) {
		options.duration = options.duration || 600;
		options.easing = options.easing || "easeOutCirc";
		options.finish = options.finish || options.step;
		this.tweens = this.tweens || {};
		const tween = this.tweens[id] = this.tweens[id] || new Tweenable();

		if (tween.isPlaying()) {
			tween._originalState = tween.get();
			tween._targetState = options.to;
			tween._timestamp = Date.now();
		}
		else {
			const cbk = options.done || (() => {});
			tween.tween(options).then(cbk).catch(() => {}); // TODO - allow for interruption callbacks?
		}
	}
	stop(id) {
		this.tweens && this.tweens[id] && this.tweens[id].stop(true);
	}
	componentWillUnmount() {
		if (this.tweens) {
			for (const id in this.tweens) {
				this.tweens[id].stop();
				this.tweens[id].dispose();
			}
			delete this.tweens;
		}
	}
	render() {
		return React.Children.only(this.props.children);
	}
}