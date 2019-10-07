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

	/*
	draw(sprite: Array<boolean>, x: number, y: number): boolean {
		let flipped = false;
        
		return flipped;
	}
    */
}
