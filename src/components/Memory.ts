export default class Memory {
	private memory: ArrayBuffer;
	private memoryView: DataView;

	constructor(size: number) {
		if (size <= 0) {
			throw new Error("Memory size must be greater than 0");
		}
		this.memory = new ArrayBuffer(size);
		this.memoryView = new DataView(this.memory);
	}

	storeData(data: number, index: number) {
		this.memoryView.setUint8(index, data);
	}

	getData(index: number) {
		return this.memoryView.getUint8(index);
	}

	getMemoryView32(index: number) {
		return [...new Uint8Array(this.memoryView.buffer).slice(index, index + 32)].map(
			value => `hex: 0x${value.toString(16).padStart(2, "0")}  dec: ${value.toString().padStart(3, "0")}`
		);
	}
}
