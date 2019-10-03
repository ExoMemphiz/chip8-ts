import CPU from "../../src/components/Cpu";
import Memory from "../../src/components/Memory";
import Registers from "../../src/components/Registers";

let cpu: CPU;

beforeEach(() => {
	cpu = new CPU(new Memory(4096), new Registers());
});

describe("Testing CPU", () => {
	test("CPU is not undefined", () => {
		expect(cpu).toBeDefined();
	});
});
