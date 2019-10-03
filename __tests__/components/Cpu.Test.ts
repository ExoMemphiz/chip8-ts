import CPU from "../../src/components/Cpu";
import Memory from "../../src/components/Memory";
import Registers from "../../src/components/Registers";
import Stack from "../../src/components/Stack";

let cpu: CPU;

beforeEach(() => {
	cpu = new CPU(new Memory(4096), new Registers(), new Stack());
});

describe("Testing CPU", () => {
	test("CPU is not undefined", () => {
		expect(cpu).toBeDefined();
	});
});
