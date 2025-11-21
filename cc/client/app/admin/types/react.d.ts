
declare module 'react' {
	interface ReactNode {
	}

	type RefObject<T> = any;
	type FC<T> = any;

	function useState<T>(initialState: T | (() => T)): [T, any];
  function useEffect(effect: any, deps?: any): void;
	function useRef<T>(ref: any): any;

	type ChangeEvent<T> = any;
	type KeyboardEvent<T> = any;

}