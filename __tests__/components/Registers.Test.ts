import Registers from "../../src/components/Registers";

let registersTest: Registers;

beforeEach(() => {
	registersTest = new Registers();
});

describe("Testing registers", () => {
	test("They are all initialized to 0", () => {
		for (const [i, element] of registersTest.getAll().entries()) {
			if (element !== 0) {
				fail(`Register ${i.toString(16)} is not initialized to 0`);
			}
		}
		expect(registersTest.getAll().length).toBe(16);
	});

	test("Can change a registers value by index", () => {
		registersTest.setRegister(2, 200);
		expect(registersTest.getRegister(2)).toBe(200);
	});
});
