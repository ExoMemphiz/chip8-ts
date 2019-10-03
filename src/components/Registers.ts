class Registers {
	private registers: Array<number> = [];
	private addressRegister: number;
	private programCounter: number;

	constructor(amount: number = 0xF) {
		for (let i = 0; i <= amount; i++) {
			this.registers.push(0x0);
		}
		this.addressRegister = 0;
		this.programCounter = 0;
	}

	setRegister(index: number, value: number) {
		this.registers[index] = value;
	}

	getRegister(index: number) {
		return this.registers[index];
	}

	getAll() {
		return this.registers;
	}

	setAddressRegister(value: number) {
		this.addressRegister = value;
	}

	getAddressRegister() {
		return this.addressRegister;
	}

	setProgramCounter(value: number) {
		this.programCounter = value;
	}

	incrementProgramCounter(amount: number = 1) {
		this.programCounter += amount;
	}

	getProgramCounter() {
		return this.programCounter;
	}
}

export default Registers;
