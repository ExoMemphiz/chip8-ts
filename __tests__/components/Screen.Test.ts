import Screen from "../../src/components/Screen";

let screen: Screen;

beforeEach(() => {
	screen = new Screen();
});

describe("Testing Screen", () => {
	test("Screen is initialized to Zeroes", () => {
		expect(screen).toBeDefined();
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
});
