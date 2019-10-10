export default class Keyboard {
	KEYS = ["x", "1", "2", "3", "q", "w", "e", "a", "s", "d", "z", "c", "4", "r", "f", "v"];
	PRESSED: Array<boolean>;

	constructor() {
		this.PRESSED = [];
		for (let i = 0; i < this.KEYS.length; i++) {
			this.PRESSED.push(false);
		}
	}

	mapKeyToValue(input: string) {
		for (const [i, element] of this.KEYS.entries()) {
			if (input.toLowerCase() === element) {
				return i;
			}
		}
		// console.log(`${input.toLowerCase()} !== z`);
	}

	onPress(key: number) {
		this.PRESSED[key] = true;
	}

	onRelease(key: number) {
		this.PRESSED[key] = false;
	}

	getPressed() {
		return this.PRESSED;
	}
}
