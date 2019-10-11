import express from "express";
import http from "http";
import ioSocket from "socket.io";
import open from "open";
import Chip8 from "./src/Chip8";
import FileReader from "./src/utils/FileReader";
import fileReader from "./src/utils/FileReader";

const app = express();
app.use("/public", express.static("./public/"));
const server = http.createServer(app);
const io = ioSocket.listen(server);

let DEBUG = false;

let TICKS_PR_SECOND = 500;

app.get("/", (request, response) => {
	response.sendFile(__dirname + "/public/index.html");
});

let connected = false;

io.on("connection", (socket) => {
	console.log("User connected");
	setupSocket(socket);
	connected = true;
});

function setupSocket(socket: ioSocket.Socket) {

	// / Setup Games
	const files = fileReader.getChip8FilesInDirectory("/roms");
	emitEvent(socket, "games", files);

	// / Setup Emulator
	let chip8 = new Chip8();
	chip8.loadRom(FileReader.readFile(`/roms/${files[0]}`));

	// / Setup Sound timer callbacks
	chip8.setSoundCallback(() => {
		emitEvent(socket, "beep");
	});

	// / Setup socket with emulator attached
	// @ts-ignore
	socket["emulator"] = chip8;
    
	// / Event handles for the socket
	// @ts-ignore
	socket["togglePause"] = true;
    
	socket.on("keydown", (data: string) => {
		let mapped = mapKey(socket, data);
		if (typeof(mapped) === "number") {
			pressKey(socket, mapped);
			emitEvent(socket, "keys");
		}
	});
    
	socket.on("keyup", (data: string) => {
		let mapped = mapKey(socket, data);
		if (typeof(mapped) === "number") {
			releaseKey(socket, mapped);
			emitEvent(socket, "keys");
		}
	});
    
	socket.on("step", () => {
		step(socket);
	});
    
	socket.on("debug", () => {
		DEBUG = !DEBUG;
	});
    
	socket.on("getMemory", (data: Array<string>) => {
		// @ts-ignore
		// socket["emulator"].debug(data[0], parseInt(data[1]), parseInt(data[2]));
		// @ts-ignore
		const memorySlice = socket["emulator"].memory.getMemoryViewSlice(parseInt(data[1]), parseInt(data[2]));
		// @ts-ignore
		socket["memoryStart"] = parseInt(data[1]); socket["memoryEnd"] = parseInt(data[2]);
		emitEvent(socket, "memory", memorySlice);
		// emitEvent(socket, "programCounter");
		// emitEvent(socket, "addressRegister");
	});
    
	startSocketInterval(socket);
   
	socket.on("disconnect", () => {
		console.log("Client disconnected");
		// @ts-ignore
		clearInterval(socket["intervalID"]);
	});
    
	socket.on("togglePause", (fps: string) => {
		TICKS_PR_SECOND = parseInt(fps);
		clearSocketInterval(socket);
		startSocketInterval(socket);
		togglePause(socket);
	});
    
	socket.on("changeGame", (game: string) => {
		console.log("Changing game to:", game);
		// @ts-ignore
		socket["emulator"].loadRom(FileReader.readFile(`/roms/${game}`));
	});
    
	socket.on("reset", (game: string) => {
		// @ts-ignore
		socket["emulator"].reset();
		// @ts-ignore
		socket["emulator"].loadRom(FileReader.readFile(`/roms/${game}`));
		emitEvent(socket, "draw");
	});

}

function togglePause(socket: ioSocket.Socket) {
	// @ts-ignore
	socket["togglePause"] = !socket["togglePause"];
}

function mapKey(socket: ioSocket.Socket, data: string) {
	// @ts-ignore
	return socket["emulator"].getKeyboard().mapKeyToValue(data);
}

function pressKey(socket: ioSocket.Socket, key: number) {
	// @ts-ignore
	return socket["emulator"].getKeyboard().onPress(key);
}

function releaseKey(socket: ioSocket.Socket, key: number) {
	// @ts-ignore
	return socket["emulator"].getKeyboard().onRelease(key);
}

function step(socket: ioSocket.Socket) {
	stepAndDraw(socket);
}

function startSocketInterval(socket: ioSocket.Socket) {
	emitEvent(socket, "draw");
	// @ts-ignore
	socket["intervalID"] = setInterval(() => {
		if (DEBUG) {
			emitEvent(socket, "registers");
			// @ts-ignore
			const memStart = socket["memoryStart"];
			// @ts-ignore
			const memEnd = socket["memoryEnd"];
			// @ts-ignore
			const memorySlice = socket["emulator"].memory.getMemoryViewSlice(memStart, memEnd);
			emitEvent(socket, "memory", memorySlice);
			emitEvent(socket, "stack");
			emitEvent(socket, "instruction");
			emitEvent(socket, "programCounter");
			emitEvent(socket, "addressRegister");
		}
        
		// @ts-ignore
		if (!socket["togglePause"]) {
			try {
				stepAndDraw(socket);
			} catch (error) {
				console.log(error);
				socket.disconnect();
			}
		}
	}, Math.ceil(1000 / TICKS_PR_SECOND));
}

function stepAndDraw(socket: ioSocket.Socket) {
	let draw = false;
	// @ts-ignore
	if (socket["emulator"].willDraw()) {
		draw = true;
	}
	// @ts-ignore
	socket["emulator"].step();
	if (draw) {
		emitEvent(socket, "drawDiff");
	}
}

function clearSocketInterval(socket: ioSocket.Socket) {
	// @ts-ignore
	clearInterval(socket["intervalID"]);
}

function emitEvent(socket: ioSocket.Socket, 
	event: "keys" | "draw" | "registers" | "memory" | "programCounter" | 
           "addressRegister" | "instruction" | "stack" | "games" | "beep" | "drawDiff", 
	data?: Array<string>): any {

	switch (event) {

		case "keys":
			// @ts-ignore
			return socket.emit(event, socket["emulator"].getKeyboard().getPressed());
            
		case "draw": {
			// @ts-ignore
			const newScreen = socket["emulator"].getScreen();
			return socket.emit(event, newScreen);
		}
        
		case "drawDiff": {
			// @ts-ignore
			const oldScreen = socket["oldScreen"];
			// @ts-ignore
			const newScreen = socket["emulator"].getScreen();
			const diffArray = [];
			if (oldScreen) {
				// eslint-disable-next-line unicorn/no-for-loop
				for (let x = 0; x < oldScreen.length; x++) {
					// eslint-disable-next-line unicorn/no-for-loop
					for (let y = 0; y < oldScreen[x].length; y++) {
						if (oldScreen[x][y] !== newScreen[x][y]) {
							diffArray.push({
								x,
								y,
								// eslint-disable-next-line unicorn/prevent-abbreviations
								val: newScreen[x][y]
							});
						}
					}
				}
			} else {
				console.log("Oldscreen does not exist...");
			}
			// @ts-ignore
			socket["oldScreen"] = JSON.parse(JSON.stringify(newScreen));
			if (diffArray.length > 0) {
				console.log(`Sending diff array of size: ${diffArray.length}`);
				return socket.emit(event, diffArray);
			}
			return emitEvent(socket, "draw");
		}
            
		case "registers":
			// @ts-ignore
			return socket.emit(event, socket["emulator"].registers.registers);
            
		case "memory":
			return socket.emit(event, data ? data : []);
              
		case "programCounter":
			// @ts-ignore
			return socket.emit(event, socket["emulator"].registers.programCounter);
                
		case "instruction":
			// @ts-ignore
			return socket.emit(event, socket["emulator"].cpu.getInstruction());
            
		case "addressRegister":
			// @ts-ignore
			return socket.emit(event, socket["emulator"].registers.addressRegister);
            
		case "stack":
			// @ts-ignore
			return socket.emit(event, socket["emulator"].stack.stack);
                    
		case "games":
			return socket.emit(event, data ? data : []);
            
		case "beep":
			return socket.emit(event);

	}

}

server.listen(3000, () => {
	console.log("Listening on port 3000");
	setTimeout(() => {
		if (!connected) {
			open("http://localhost:3000");
		}
	}, 800);
});

