import Memory from "./Memory";
import Registers from "./Registers";
import Stack from "./Stack";
import Screen from "./Screen";

export default class CPU {
	memory: Memory;
	registers: Registers;
	stack: Stack;
	screen: Screen;

	constructor(memory: Memory, registers: Registers, stack: Stack, screen: Screen) {
		this.memory = memory;
		this.registers = registers;
		this.stack = stack;
		this.screen = screen;
	}

	executeNextInstruction() {
		const pc = this.registers.getProgramCounter();
		const instruction = (this.memory.getData(pc) << 8) | this.memory.getData(pc + 1);
		this.handleInstruction(instruction);
		this.registers.incrementProgramCounter();
	}

	debug() {
		console.log("-- Registers V0 to VF --");
		console.table(this.registers.getAll());

		console.log("-- Address Register --");
		console.table([this.registers.getAddressRegister()]);

		console.log("-- Program Counter --");
		console.table([this.registers.getProgramCounter()]);

		console.log("-- Memory --");
		console.table(this.memory.getMemoryView32(0x200));
		// console.table(this.memory.getMemoryView().buffer.slice(0, 16));

		console.log(" -- Screen --");
		console.table(this.screen.getScreen().map(array => array.map(value => (value ? 1 : 0))));
	}

	handleInstruction(instruction: number) {
		const masked = (instruction & 0xF000) >> (3 * 4);
		const nnn = instruction & 0x0FFF;
		const nn = instruction & 0x00FF;
		// const n = instruction & 0x000F;
		const x = (instruction & 0x0F00) >> (2 * 4);
		const y = (instruction & 0x00F0) >> (1 * 4);

		// console.log(`Switching on: ${masked.toString(16)}`);

		switch (masked) {
			case 0x0:
				return this.handleOpcode0(instruction);

			case 0x1:
				// 1NNN
				// Jump to address nnn
				return this.registers.setProgramCounter(nnn);

			case 0x2:
				// 2NNN
				// Call subroutine at nnn
				this.stack.push(this.registers.getProgramCounter() + 1);
				return this.registers.setProgramCounter(nnn);

			case 0x3:
				// 3XNN
				// Skip instruction if vX == nn
				return this.registers.getRegister(x) === nn && this.registers.incrementProgramCounter();

			case 0x4:
				// 4XNN
				// Skip instruction if vX != nn
				return this.registers.getRegister(x) !== nn && this.registers.incrementProgramCounter();

			case 0x5:
				// 5XY0
				// Skip instruction if vX == vY
				return (
					this.registers.getRegister(x) === this.registers.getRegister(y) &&
					this.registers.incrementProgramCounter()
				);

			case 0x6:
				// 6XNN
				// vX = nn
				return this.registers.setRegister(x, nn);

			case 0x7:
				// 7XNN
				// vX += nn
				return this.registers.setRegister(x, (this.registers.getRegister(x) + nn) % 0xFF);

			case 0x8:
				return this.handleOpcode8(instruction);

			case 0x9:
				// 9XY0
				// Skip instruction if vX != vY
				return (
					this.registers.getRegister(x) !== this.registers.getRegister(y) &&
					this.registers.incrementProgramCounter()
				);

			case 0xA:
				// ANNN
				// Sets I to the address NNN
				return this.registers.setAddressRegister(nnn);

			case 0xB:
				// BNNN
				// Jumps to the address NNN plus V0
				return this.registers.setProgramCounter(nnn + this.registers.getRegister(0));

			case 0xC:
				// CXNN
				// Set vX = bitwise &; Random(0, 255) & nn
				return this.registers.setRegister(x, (Math.random() * 256) & nn);

			default:
				return this.throwUnimplementedOpcode(instruction);
		}
	}

	handleOpcode0(instruction: number) {
		const masked = instruction & 0xFF;
		switch (masked) {
			case 0xE0: {
				// Clear Display
				return this.screen.clearScreen();
			}

			case 0xEE: {
				// Return from subroutine
				const nextLine = this.stack.pop();
				if (!nextLine) {
					throw new Error("Stack was empty, no subroutine to return from!");
				}
				return this.registers.setProgramCounter(nextLine);
			}

			default:
				return this.throwUnimplementedOpcode(instruction);
		}
	}

	handleOpcode8(instruction: number) {
		const x = (instruction & 0x0F00) >> (2 * 4);
		const y = (instruction & 0x00F0) >> (1 * 4);
		const n = instruction & 0x000F;

		switch (n) {
			case 0x0:
				// 8XY0
				// Sets VX to the value of VY
				return this.registers.setRegister(x, this.registers.getRegister(y));

			case 0x1:
				// 8XY1
				// Sets VX to VX bitwise or VY
				return this.registers.setRegister(x, this.registers.getRegister(x) | this.registers.getRegister(y));

			case 0x2:
				// 8XY2
				// Sets VX to VX bitwise and VY
				return this.registers.setRegister(x, this.registers.getRegister(x) & this.registers.getRegister(y));

			case 0x3:
				// 8XY3
				// Sets VX to VX xor VY
				return this.registers.setRegister(x, this.registers.getRegister(x) ^ this.registers.getRegister(y));

			case 0x4:
				// 8XY4
				// Adds VY to VX. VF is set to 1 when there's a carry, otherwise 0
				// eslint-disable-next-line no-case-declarations
				let result = this.registers.getRegister(x) + this.registers.getRegister(y);
				if (result > 0xFF) {
					this.registers.setRegister(0xF, 1);
				}
				return this.registers.setRegister(x, result & 0xFF);

			case 0x5:
				// 8XY5
				// VY is subtracted from VX. VF is set to 0 when there's a borrow, otherwise 1
				if (this.registers.getRegister(x) > this.registers.getRegister(y)) {
					this.registers.setRegister(0xF, 1);
				} else {
					this.registers.setRegister(0xF, 0);
				}
				// eslint-disable-next-line no-case-declarations
				result = this.registers.getRegister(x) - this.registers.getRegister(y);
				return this.registers.setRegister(x, result);

			case 0x6:
				// 8XY6
				// Stores the least significant bit of VX in VF and then shifts VX to the right by 1
				this.registers.setRegister(0xF, this.registers.getRegister(x) & 0b1);
				return this.registers.setRegister(x, this.registers.getRegister(x) >> 1);

			case 0x7:
				// 8XY7
				// Sets VX to VY minus VX. VF is set to 0 when there's a borrow, otherwise 1
				if (this.registers.getRegister(y) > this.registers.getRegister(x)) {
					this.registers.setRegister(0xF, 1);
				} else {
					this.registers.setRegister(0xF, 0);
				}
				return this.registers.setRegister(x, this.registers.getRegister(y) - this.registers.getRegister(x));

			case 0xE:
				// 8XYE
				// Stores the most significant bit of VX in VF and then shifts VX to the left by 1
				this.registers.setRegister(0xF, this.registers.getRegister(x) & 0b10000000);
				return this.registers.setRegister(x, this.registers.getRegister(x) << 1);
		}
	}

	throwUnimplementedOpcode(instruction: number) {
		throw new Error(
			`Instruction 0x${instruction
				.toString(16)
				.padStart(4, "0")
				.toUpperCase()} not yet implemented. Decimal: ${instruction}`
		);
	}
}
