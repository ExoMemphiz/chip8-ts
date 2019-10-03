import Memory from "../../src/components/Memory";

let memory: Memory;

beforeEach(() => {
	memory = new Memory(100);
	memory.storeData(1, 0);
});

describe("Testing Memory", () => {
	test("Can create a memory object", () => {
		expect(memory).toBeDefined();
	});

	test("Can get data in memory", () => {
		expect(memory.getData(0)).toBe(1);
	});

	test("Can store data in memory", () => {
		memory.storeData(9, 8);
		expect(memory.getData(8)).toBe(9);
	});

	test("Memory size must be greater than 0", () => {
		expect(() => {
			memory = new Memory(0);
		}).toThrowError("Memory size must be greater than 0");
	});
});
