import Memory from "./components/Memory";
import CPU from "./components/Cpu";
import Registers from "./components/Registers";
import Stack from "./components/Stack";
import Screen from "./components/Screen";
import Keyboard from "./components/Keyboard";
import Timer from "./components/Timer";
import numberSprites from "./utils/NumberSprites";

class Chip8 {
	private memory: Memory;
	private registers: Registers;
	private stack: Stack;
	private screen: Screen;
	private keyboard: Keyboard;
	private delayTimer: Timer;
	private soundTimer: Timer;
	private cpu: CPU;

	constructor() {
		this.memory = new Memory(4096);
		numberSprites.loadIntoMemory(this.memory);
		this.registers = new Registers();
		this.stack = new Stack();
		this.screen = new Screen();
		this.keyboard = new Keyboard();
		this.delayTimer = new Timer();
		this.soundTimer = new Timer();
		this.cpu = new CPU(
			this.memory,
			this.registers,
			this.stack,
			this.screen,
			this.keyboard,
			this.delayTimer,
			this.soundTimer
		);
	}

	step() {
		this.cpu.executeNextInstruction();
	}

	debug(screen: boolean = false, memoryStart: number = 0x200, memoryEnd = 0x220) {
		this.cpu.debug(screen, memoryStart, memoryEnd);
	}

	loadRom(buffer: Buffer) {
		this.screen.clearScreen();
		let memoryLocation = 0x200;
		for (const element of buffer) {
			this.memory.storeData(element, memoryLocation);
			memoryLocation++;
		}
		this.registers.resetProgramCounter();
	}

	getKeyboard() {
		return this.keyboard;
	}

	getScreen() {
		return this.screen.getScreen();
	}

	flipPixel(x: number, y: number) {
		this.screen.flipPixel(x, y);
	}

	setSoundCallback(callback: () => void) {
		this.soundTimer.onEnd(callback);
	}

	setDelayCallback(callback: () => void) {
		this.delayTimer.onEnd(callback);
	}
}

export default Chip8;
