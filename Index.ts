import Chip8 from "./src/Chip8";
import FileReader from "./src/utils/FileReader";

const romBuffer = new FileReader().readFile("./roms/BC_test.ch8");

const chip8 = new Chip8();

chip8.loadRom(romBuffer);

chip8.debug();