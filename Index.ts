import Chip8 from "./src/Chip8";
import FileReader from "./src/utils/FileReader";

if (!process.argv[2]) {
	throw new Error("You must specify a valid path to a rom (assume navigation from root folder of this project)");
}

const romBuffer = new FileReader().readFile(process.argv[2]);

const chip8 = new Chip8();

chip8.loadRom(romBuffer);

chip8.debug();

chip8.step();