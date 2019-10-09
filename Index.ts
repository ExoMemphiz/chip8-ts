import Chip8 from "./src/Chip8";
import FileReader from "./src/utils/FileReader";

if (!process.argv[2]) {
	throw new Error("You must specify a valid path to a rom (assume navigation from root folder of this project)");
}

const romBuffer = FileReader.readFile(process.argv[2]);

const chip8 = new Chip8();

chip8.loadRom(romBuffer);

try {
	for (let i = 0; i < 10000; i++) {
		chip8.step();
	}
} catch (error) {
	chip8.debug();
	console.log(error);
}

