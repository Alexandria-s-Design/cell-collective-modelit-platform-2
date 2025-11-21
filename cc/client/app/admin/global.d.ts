declare module '*.module.css' {
	const classes: { [key: string]: string };
	export default classes;
}
declare namespace JSX {	interface Element {
		[elementName: string]: any;
	}
}