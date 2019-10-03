export default class Stack {
	stack: Array<number>;

	constructor() {
		this.stack = [];
	}

	push(address: number) {
		this.stack.push(address);
	}

	pop() {
		return this.stack.pop();
	}
}
