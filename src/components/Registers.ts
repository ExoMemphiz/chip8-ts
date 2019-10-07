class Registers {
	private registers: Array<number> = [];
	private addressRegister: number;
	private programCounter: number;

	constructor(amount: number = 0xF, pcInit: number = 0x200) {
		for (let i = 0; i <= amount; i++) {
			this.registers.push(0x0);
		}
		this.addressRegister = 0;
		this.programCounter = pcInit;
	}

	setRegister(index: number, value: number) {
		if (index > 0xF) {
			throw new Error(`Register index: ${index} is out of range`);
		}
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

	incrementProgramCounter(amount: number = 2) {
		this.programCounter += amount;
	}

	getProgramCounter() {
		return this.programCounter;
	}
}

export default Registers;
