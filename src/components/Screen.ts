export default class Screen {
	private width: number;
	private height: number;

	private screen: Array<Array<boolean>>;

	constructor(width: number = 64, height: number = 32) {
		this.width = width;
		this.height = height;

		this.screen = [];
		for (let i = 0; i < width; i++) {
			this.screen.push([]);
			for (let j = 0; j < height; j++) {
				this.screen[i].push(false);
			}
		}
	}

	getScreen() {
		return this.screen;
	}

	clearScreen() {
		for (let i = 0; i < this.screen.length; i++) {
			for (let j = 0; j < this.screen[i].length; j++) {
				this.screen[i][j] = false;
			}
		}
	}

	setPixel(x: number, y: number, set: boolean) {
		this.screen[x][y] = set;
	}

	flipPixel(x: number, y: number) {
		this.screen[x][y] = !this.screen[x][y];
	}

	getWidth() {
		return this.width;
	}

	getHeight() {
		return this.height;
	}

	getPixel(x: number, y: number) {
		return this.screen[x][y];
	}

	/**
	 * XOR's the value with the currently stored one.
	 * If a pixel is erased, it returns true.
	 * @param x
	 * @param y
	 * @param value
	 */
	xorPixel(x: number, y: number, value: boolean) {
		x = x % this.width;
		y = y % this.height;
		if (!this.screen) {
			throw new Error("Somehow this.screen is undefined....");
		}
		if (!this.screen[x]) {
			throw new Error(`Screen width incorrect, this.screen[${x}] is not defined...`);
		}
		if (this.screen[x].length !== 32) {
			throw new Error(`Screen height incorrect, this.screen[${x}].length === ${this.screen[x].length}...`);
		}
		let initial = this.screen[x][y];
		this.screen[x][y] = this.screen[x][y] !== value;
		return initial && !this.screen[x][y];
	}

	drawByte(x: number, y: number, byte: number): boolean {
		let erased = false;
		for (let i = 0; i < 8; i++) {
			const mask = byte & (0b10000000 >> i);
			const bit = mask >> (7 - i);
			if (this.xorPixel(x + i, y, bit === 1 ? true : false)) {
				erased = true;
			}
		}
		return erased;
	}
}
