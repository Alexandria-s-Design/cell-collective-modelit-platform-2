export default class {
	constructor() {
		this.stack = [];
	}

	push(state) {
		if (this.index !== undefined) {
			this.stack = this.stack.slice(0, this.index);
			this.index = undefined;
		}
		this.stack.push(state);
	}

	undo(state) {
		return this.stack[this.index = (this.index === undefined ? this.stack.push(state) - 1 : this.index) - 1];
	}

	redo() {
		return [this.stack[this.index], this.stack[++this.index]];
	}

	get undoable() {
		return this.index === undefined ? this.stack.length : this.index;
	}

	get redoable() {
		return this.index === undefined ? false : this.index < this.stack.length - 1;
	}
}