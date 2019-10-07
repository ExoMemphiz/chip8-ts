import Keyboard from "../../src/components/Keyboard";

let keyboard: Keyboard;

beforeEach(() => {
	keyboard = new Keyboard();
});

describe("Testing Keyboard", () => {
	test("Map key z to 0", () => {
		expect(keyboard.mapKeyToValue("z")).toBe(0);
	});
	test("Map key a to 4", () => {
		expect(keyboard.mapKeyToValue("a")).toBe(4);
	});
	test("Map key q to 8", () => {
		expect(keyboard.mapKeyToValue("q")).toBe(8);
	});
	test("Map key 3 to 14", () => {
		expect(keyboard.mapKeyToValue("3")).toBe(14);
	});
	test("Map key c to 2", () => {
		expect(keyboard.mapKeyToValue("c")).toBe(2);
	});
});
