import CPU from "../../src/components/Cpu";
import Memory from "../../src/components/Memory";
import Registers from "../../src/components/Registers";
import Stack from "../../src/components/Stack";
import Screen from "../../src/components/Screen";
import Keyboard from "../../src/components/Keyboard";
import Timer from "../../src/components/Timer";
import numberSprites from "../../src/utils/NumberSprites";

let memory: Memory;
let registers: Registers;
let stack: Stack;
let screen: Screen;
let keyboard: Keyboard;
let delayTimer: Timer;
let soundTimer: Timer;
let cpu: CPU;

beforeEach(() => {
	memory = new Memory(4096);
	numberSprites.loadIntoMemory(memory);
	registers = new Registers();
	stack = new Stack();
	screen = new Screen();
	keyboard = new Keyboard();
	delayTimer = new Timer();
	soundTimer = new Timer();
	cpu = new CPU(memory, registers, stack, screen, keyboard, delayTimer, soundTimer);
});

describe("Testing CPU", () => {
	test("CPU is not undefined", () => {
		expect(cpu).toBeDefined();
	});
});
