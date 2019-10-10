import Screen from "../../src/components/Screen";

let screen: Screen;

beforeEach(() => {
	screen = new Screen();
});

describe("Testing Screen", () => {
	test("Screen is initialized to false", () => {
		expect(screen).toBeDefined();
		for (let i = 0; i < screen.getWidth(); i++) {
			for (let j = 0; j < screen.getHeight(); j++) {
				expect(screen.getPixel(i, j)).toBe(false);
			}
		}
	});

	test("Screen dimensions are correct", () => {
		expect(screen.getScreen().length).toBe(64);
		expect(screen.getScreen()[0].length).toBe(32);
	});

	test("Screen pixel can be set", () => {
		screen.setPixel(0, 1, true);
		expect(screen.getScreen()[0][1]).toBe(true);
	});

	test("Screen can be cleared", () => {
		screen.setPixel(0, 1, true);
		expect(screen.getScreen()[0][1]).toBe(true);
		screen.clearScreen();
		expect(screen.getScreen()[0][1]).toBe(false);
	});

	test("Screen pixel can be flipped", () => {
		let x = 10;
		let y = 10;
		screen.flipPixel(x, y);
		/*
        for (let i = 0; i < screen.getWidth(); i++) {
			for (let j = 0; j < screen.getHeight(); j++) {
				if (screen.getPixel(i, j) && (i !== x || y !== y)) {
					return fail(`Screen pixel flipped at: screen[${i}][${j}]`);
				}
			}
        }*/
		expect(screen.getPixel(0, 10)).toBe(false);
		expect(screen.getPixel(x, y)).toBe(true);
	});

	test("Screen can xor false and false", () => {
		screen.xorPixel(0, 0, false);
		expect(screen.getPixel(0, 0)).toBe(false);
	});

	test("Screen can xor false and true", () => {
		screen.xorPixel(0, 0, true);
		expect(screen.getPixel(0, 0)).toBe(true);
	});

	test("Screen can xor true and false", () => {
		screen.setPixel(0, 0, true);
		screen.xorPixel(0, 0, false);
		expect(screen.getPixel(0, 0)).toBe(true);
	});

	test("Screen can xor true and true", () => {
		screen.setPixel(0, 0, true);
		screen.xorPixel(0, 0, true);
		expect(screen.getPixel(0, 0)).toBe(false);
	});

	test("Screen can draw byte at (0, 0)", () => {
		screen.drawByte(0, 0, 0b11001101);
		expect(screen.getPixel(0, 0)).toBe(true);
		expect(screen.getPixel(1, 0)).toBe(true);
		expect(screen.getPixel(2, 0)).toBe(false);
		expect(screen.getPixel(3, 0)).toBe(false);
		expect(screen.getPixel(4, 0)).toBe(true);
		expect(screen.getPixel(5, 0)).toBe(true);
		expect(screen.getPixel(6, 0)).toBe(false);
		expect(screen.getPixel(7, 0)).toBe(true);
		expect(screen.getPixel(8, 0)).toBe(false);
	});
});
