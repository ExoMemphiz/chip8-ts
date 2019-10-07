export default class Keyboard {
	KEYS = ["1", "2", "3", "4", "q", "w", "e", "r", "a", "s", "d", "f", "z", "x", "c", "v"];
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
		console.log(`${input.toLowerCase()} !== z`);
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
