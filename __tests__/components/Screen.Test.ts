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
		console.log(screen.getScreen());

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
});
