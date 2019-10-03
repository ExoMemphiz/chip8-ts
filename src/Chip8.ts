import Memory from "./components/Memory";
import CPU from "./components/Cpu";
import Registers from "./components/Registers";

class Chip8 {
	private memory: Memory;
	private registers: Registers;
	private cpu: CPU;

	constructor() {
		this.memory = new Memory(4096);
		this.registers = new Registers();
		this.cpu = new CPU(this.memory, this.registers);
	}

	debug() {
		this.cpu.debug();
	}

	loadRom(buffer: Buffer) {
		let memoryLocation = 0x200;
		for (const element of buffer) {
			this.memory.storeData(element, memoryLocation);
			memoryLocation++;
		}
	}
}

export default Chip8;
