export default ( parent) => ( class extends parent {
	frameGet() {
		return {
			width: window.innerWidth,
			height: window.innerHeight
		};
	}
	onResize() {
		this.setState(this.frameGet());
	}
	UNSAFE_componentWillMount(...args) {
		super.UNSAFE_componentWillMount && super.UNSAFE_componentWillMount(...args);

		this.onResize();
	}
	componentDidMount(...args) {
		super.componentDidMount && super.componentDidMount(...args);

		window.addEventListener("resize", this._onResizeListener = this.onResize.bind(this));
	}
	componentWillUnmount(...args) {
		super.componentWillUnmount && super.componentWillUnmount(...args);

		window.removeEventListener("resize", this._onResizeListener);
	}
} );