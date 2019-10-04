export default class Screen {
	private width: number;
	private height: number;

	private screen: Array<Array<boolean>>;

	constructor(width: number = 64, height: number = 32) {
		this.width = width;
		this.height = height;

		// @ts-ignore
		this.screen = new Array<number>(width).fill(new Array<number>(height).fill(0));
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

	/*
	draw(sprite: Array<boolean>, x: number, y: number): boolean {
		let flipped = false;
        
		return flipped;
	}
    */
}
