import FileReader from "../../src/utils/FileReader";

const fileName = "BC_test.ch8";

let fileReader: FileReader;

beforeEach(() => {
	fileReader = new FileReader();
});

describe("Testing FileReader", () => {
	test("Can read a file as a buffer", () => {
		const file = fileReader.readFile(`/roms/${fileName}`);
		expect(file.length).toBe(470);
		expect(file.readUInt8(1)).toBe(224);
		expect(file.readInt8(1)).toBe(-32);
	});
});
