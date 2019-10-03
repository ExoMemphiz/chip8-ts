import Memory from "./Memory";
import Registers from "./Registers";

export default class CPU {
	memory: Memory;
	registers: Registers;

	constructor(memory: Memory, registers: Registers) {
		this.memory = memory;
		this.registers = registers;
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
		//console.table(this.memory.getMemoryView().buffer.slice(0, 16));
	}

	getInstruction(instruction: number) {
		const masked = instruction & 0xF000;
		switch (masked) {
			case 0x0:
				return this.handleOpcode0(instruction);

			default:
				throw new Error(`Unknown Opcode: ${instruction.toString(16)}`);
		}
	}

	handleOpcode0(instruction: number) {
		const masked = instruction & 0xFF;
		switch (masked) {
			case 0xE0: {
				// Clear Display
				throw new Error(
					`Instruction ${instruction.toString(
						16
					)} not yet implemented.`
				);
			}

			case 0xEE: {
				// Return from subroutine
				throw new Error(
					`Instruction ${instruction.toString(
						16
					)} not yet implemented.`
				);
			}

			default:
				throw new Error(`Unknown Opcode: ${instruction.toString(16)}`);
		}
	}
}
