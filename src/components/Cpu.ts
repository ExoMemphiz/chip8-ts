import Memory from "./Memory";
import Registers from "./Registers";
import Stack from "./Stack";
import Screen from "./Screen";
import Keyboard from "./Keyboard";
import Timer from "./Timer";

export default class CPU {
	memory: Memory;
	registers: Registers;
	stack: Stack;
	screen: Screen;
	keyboard: Keyboard;
	delayTimer: Timer;
	soundTimer: Timer;

	constructor(
		memory: Memory,
		registers: Registers,
		stack: Stack,
		screen: Screen,
		keyboard: Keyboard,
		delayTimer: Timer,
		soundTimer: Timer
	) {
		this.memory = memory;
		this.registers = registers;
		this.stack = stack;
		this.screen = screen;
		this.keyboard = keyboard;
		this.delayTimer = delayTimer;
		this.soundTimer = soundTimer;
	}

	getInstruction() {
		const pc = this.registers.getProgramCounter();
		const instruction = (this.memory.getData(pc) << 8) | this.memory.getData(pc + 1);
		return instruction;
	}

	executeNextInstruction() {
		const instruction = this.getInstruction();
		this.handleInstruction(instruction);
		this.registers.incrementProgramCounter();
		this.soundTimer.tick();
		this.delayTimer.tick();
	}

	debug(screen: boolean = false, memoryStart: number = 0x200, memoryEnd = 0x220) {
		console.log("-- Registers V0 to VF --");
		console.table(this.registers.getAll());

		console.log("-- Address Register --");
		console.table([
			`0x${this.registers
				.getAddressRegister()
				.toString(16)
				.toUpperCase()} (${this.registers.getAddressRegister()})`,
		]);

		console.log("-- Program Counter --");
		console.table([
			`0x${this.registers
				.getProgramCounter()
				.toString(16)
				.toUpperCase()
				.padStart(4, "0")} (${this.registers.getProgramCounter()})`,
		]);

		console.log("-- Memory --");
		console.table(this.memory.getMemoryViewSlice(memoryStart, memoryEnd));
		// console.table(this.memory.getMemoryView().buffer.slice(0, 16));

		if (screen) {
			console.log(" -- Screen --");
			console.table(this.screen.getScreen().map(array => array.map(value => (value ? 1 : 0))));
		}
	}

	handleInstruction(instruction: number) {
		const masked = (instruction & 0xF000) >> (3 * 4);
		const nnn = instruction & 0x0FFF;
		const nn = instruction & 0x00FF;
		const n = instruction & 0x000F;
		const x = (instruction & 0x0F00) >> (2 * 4);
		const y = (instruction & 0x00F0) >> (1 * 4);

		// console.log(`Switching on: ${masked.toString(16)}`);

		switch (masked) {
			case 0x0:
				return this.handleOpcode0(instruction);

			case 0x1:
				// 1NNN
				// Jump to address nnn
				this.registers.setProgramCounter(nnn);
				return this.registers.decrementProgramCounter();

			case 0x2:
				// 2NNN
				// Call subroutine at nnn
				this.stack.push(this.registers.getProgramCounter() + 2);
				this.registers.setProgramCounter(nnn);
				return this.registers.decrementProgramCounter();

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
				this.registers.setProgramCounter(nnn + this.registers.getRegister(0));
				return this.registers.decrementProgramCounter();

			case 0xC:
				// CXNN
				// Set vX = bitwise &; Random(0, 255) & nn
				return this.registers.setRegister(x, (Math.random() * 256) & nn);

			case 0xD:
				// DXYN
				// Draws a sprite at coordinate (VX, VY).
				// Sprites always have a width of 8 pixels and a height of N pixels.
				// Each row of 8 pixels is read as bit-coded starting from memory location I.
				// I value doesn’t change after the execution of this instruction.
				//
				// As described above, VF is set to 1 if any screen pixels are flipped from set to unset
				// when the sprite is drawn, and to 0 if that doesn’t happen

				// eslint-disable-next-line no-case-declarations
				let erasedPixels = false;
				for (let i = 0; i < n; i++) {
					const byte = this.memory.getData(this.registers.getAddressRegister());
					const erased = this.screen.drawByte(
						this.registers.getRegister(x),
						this.registers.getRegister(y),
						byte
					);
					if (erased) {
						erasedPixels = true;
					}
					/*
                    let pointX = this.registers.getRegister(x) + i * 8;
                    let pointY = this.registers.getRegister(y) + i;
					for (let j = 0; j < 8; j++) {
						const bit = (bits & (0b1 << j)) >> j;
						
						if (this.screen.xorPixel(pointX, pointY, bit === 0 ? false : true)) {
							erasedPixels = true;
						}
                    }
                    */
				}
				return this.registers.setRegister(0xF, erasedPixels ? 1 : 0);

			case 0xE:
				return this.handleOpcodeE(instruction);

			case 0xF:
				return this.handleOpcodeF(instruction);

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
				this.registers.setProgramCounter(nextLine);
				return this.registers.decrementProgramCounter();
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

			default:
				return this.throwUnimplementedOpcode(instruction);
		}
	}

	handleOpcodeE(instruction: number) {
		const x = (instruction & 0x0F00) >> (2 * 4);

		switch (instruction & 0xFF) {
			case 0x9E:
				// EX9E
				// Skips the next instruction if the key stored in VX is pressed
				return (
					this.keyboard.getPressed()[this.registers.getRegister(x)] &&
					this.registers.incrementProgramCounter()
				);

			case 0xA1:
				// EXA1
				// Skips the next instruction if the key stored in VX isn't pressed
				return (
					!this.keyboard.getPressed()[this.registers.getRegister(x)] &&
					this.registers.incrementProgramCounter()
				);

			default:
				return this.throwUnimplementedOpcode(instruction);
		}
	}

	handleOpcodeF(instruction: number) {
		const x = (instruction & 0x0F00) >> (2 * 4);

		switch (instruction & 0xFF) {
			case 0x07:
				// FX07
				// Sets VX to the value of the delay timer.
				return this.registers.setRegister(x, this.delayTimer.getCurrentTime());

			case 0x0A:
				// FX0A
				// A key press is awaited, and then stored in VX. (Blocking)
				// eslint-disable-next-line no-case-declarations
				let breaking = -1;
				while (breaking < 0) {
					for (let i = 0; i < this.keyboard.PRESSED.length; i++) {
						if (this.keyboard.PRESSED[i]) {
							breaking = i;
						}
					}
				}
				return this.registers.setRegister(x, breaking);

			case 0x15:
				// FX15
				// Sets the delay timer to VX.
				return this.delayTimer.setTimer(this.registers.getRegister(x));

			case 0x18:
				// FX18
				// Sets the sound timer to VX.
				return this.soundTimer.setTimer(this.registers.getRegister(x));

			case 0x1E:
				// FX1E
				// Adds VX to I
				return this.registers.setAddressRegister(
					this.registers.getAddressRegister() + this.registers.getRegister(x)
				);

			case 0x29:
				// FX29
				// Sets I to the location of the sprite for the character in VX.
				// Characters 0-F (in hexadecimal) are represented by a 4x5 font.
				return this.registers.setAddressRegister(this.registers.getRegister(x) * 5);

			case 0x33:
				// FX33
				// Stores the binary-coded decimal representation of VX in address I.
				// Decimal hundres in I, decimal tens in I + 1, decimal ones at I + 2.

				// eslint-disable-next-line no-case-declarations
				let hundreds = Math.floor(this.registers.getRegister(x) / 100);
				// eslint-disable-next-line no-case-declarations
				let tens = Math.floor((this.registers.getRegister(x) / 10) % 10);
				// eslint-disable-next-line no-case-declarations
				let ones = Math.floor(this.registers.getRegister(x) % 10);

				console.log(
					`FX33: on value: ${this.registers.getRegister(
						x
					)} hundreds: ${hundreds}, tens: ${tens}, onex: ${ones}`
				);

				this.memory.storeData(hundreds, this.registers.getAddressRegister());
				this.memory.storeData(tens, this.registers.getAddressRegister() + 1);
				this.memory.storeData(ones, this.registers.getAddressRegister() + 2);
				return;

			case 0x55:
				// FX55
				// Stores V0 to VX (including VX) in memory starting at address I.
				// The offset from I is increased by 1 for each value written, but I itself is left unmodified.

				for (let i = 0; i <= this.registers.getRegister(x); i++) {
					this.memory.storeData(this.registers.getRegister(0), this.registers.getAddressRegister() + i);
				}
				return;

			case 0x65:
				// FX65
				// Fills V0 to VX (including VX) with values from memory starting at address I.
				// The offset from I is increased by 1 for each value written, but I itself is left unmodified.

				for (let i = 0; i <= this.registers.getRegister(x); i++) {
					this.registers.setRegister(i, this.memory.getData(this.registers.getAddressRegister() + i));
				}
				return;

			default:
				return this.throwUnimplementedOpcode(instruction);
		}
	}

	throwUnimplementedOpcode(instruction: number) {
		throw new Error(
			`Instruction 0x${instruction
				.toString(16)
				.padStart(4, "0")
				.toUpperCase()} not yet implemented. Decimal: ${instruction}.` +
				` Program Counter: 0x${this.registers.getProgramCounter().toString(16)}` +
				` (${this.registers.getProgramCounter()})`
		);
	}
}
