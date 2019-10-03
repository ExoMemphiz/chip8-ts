import Memory from "./Memory";
import Registers from "./Registers";
import Stack from "./Stack";

export default class CPU {
	memory: Memory;
	registers: Registers;
	stack: Stack;

	constructor(memory: Memory, registers: Registers, stack: Stack) {
		this.memory = memory;
		this.registers = registers;
		this.stack = stack;
	}

	executeNextInstruction() {
		const pc = this.registers.getProgramCounter();
		const instruction = (this.memory.getData(pc) << 8) | this.memory.getData(pc + 1);
		this.handleInstruction(instruction);
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
	}

	handleInstruction(instruction: number) {
		const masked = instruction & 0xF000;
		const nnn = instruction & 0x0FFF;
		const nn = instruction & 0x00FF;
		const n = instruction & 0x000F;
		const x = instruction & 0x0F00;
		const y = instruction & 0x00F0;

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
				return this.throwUnimplementedOpcode(instruction);

			case 0x3:
				// 3XNN
				// Skip instruction if vX == nn
				return this.throwUnimplementedOpcode(instruction);

			case 0x4:
				// 4XNN
				// Skip instruction if vX != nn
				return this.throwUnimplementedOpcode(instruction);

			case 0x5:
				// 5XY0
				// Skip instruction if vX == vY
				return this.throwUnimplementedOpcode(instruction);

			case 0x6:
				// 6XNN
				// vX = nn
				return this.throwUnimplementedOpcode(instruction);

			case 0x7:
				// 7XNN
				// vX += nn
				return this.throwUnimplementedOpcode(instruction);

			default:
				return this.throwUnimplementedOpcode(instruction);
		}
	}

	handleOpcode0(instruction: number) {
		const masked = instruction & 0xFF;
		switch (masked) {
			case 0xE0: {
				// Clear Display
				return this.throwUnimplementedOpcode(instruction);
			}

			case 0xEE: {
				// Return from subroutine
				return this.throwUnimplementedOpcode(instruction);
			}

			default:
				return this.throwUnimplementedOpcode(instruction);
		}
	}

	throwUnimplementedOpcode(instruction: number) {
		throw new Error(
			`Instruction 0x${instruction
				.toString(16)
				.padStart(4, "0")
				.toUpperCase()} not yet implemented.`
		);
	}
}
