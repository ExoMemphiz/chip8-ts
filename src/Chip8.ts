import Memory from "./components/Memory";
import CPU from "./components/Cpu";
import Registers from "./components/Registers";
import Stack from "./components/Stack";
import Screen from "./components/Screen";

class Chip8 {
	private memory: Memory;
	private registers: Registers;
	private stack: Stack;
	private screen: Screen;
	private cpu: CPU;

	constructor() {
		this.memory = new Memory(4096);
		this.registers = new Registers();
		this.stack = new Stack();
		this.screen = new Screen();
		this.cpu = new CPU(this.memory, this.registers, this.stack, this.screen);
	}

	step() {
		this.cpu.executeNextInstruction();
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
