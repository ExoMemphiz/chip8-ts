import express from "express";
import http from "http";
import ioSocket from "socket.io";
import open from "open";
import Chip8 from "./src/Chip8";
import FileReader from "./src/utils/FileReader";

const app = express();
const server = http.createServer(app);
const io = ioSocket.listen(server);

let TICKS_PR_SECOND = 60;

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

	let chip8 = new Chip8();
	chip8.loadRom(FileReader.readFile("/roms/tictac.ch8"));

	// @ts-ignore
	socket["emulator"] = chip8;
	// @ts-ignore
	socket["togglePause"] = true;
	socket.on("keydown", (data) => {
		let mapped = mapKey(socket, data);
		if (typeof(mapped) === "number") {
			pressKey(socket, mapped);
			emitEvent(socket, "keys");
		}
	});
	socket.on("keyup", (data) => {
		let mapped = mapKey(socket, data);
		if (typeof(mapped) === "number") {
			releaseKey(socket, mapped);
			emitEvent(socket, "keys");
		}
	});
	socket.on("step", () => {
		step(socket);
	});
    
	socket.on("debug", data => {
		// @ts-ignore
		// socket["emulator"].debug(data[0], parseInt(data[1]), parseInt(data[2]));
		// @ts-ignore
		const memorySlice = socket["emulator"].memory.getMemoryViewSlice(parseInt(data[1]), parseInt(data[2]));
		// @ts-ignore
		socket["memoryStart"] = parseInt(data[1]); socket["memoryEnd"] = parseInt(data[2]);
		emitEvent(socket, "memory", memorySlice);
		emitEvent(socket, "programCounter");
		emitEvent(socket, "addressRegister");
	});
    
	startSocketInterval(socket);
   
	socket.on("disconnect", () => {
		console.log("Client disconnected");
		// @ts-ignore
		clearInterval(socket["intervalID"]);
	});
    
	socket.on("togglePause", (fps) => {
		TICKS_PR_SECOND = parseInt(fps);
		clearSocketInterval(socket);
		startSocketInterval(socket);
		togglePause(socket);
	});

}

function togglePause(socket: ioSocket.Socket) {
	// @ts-ignore
	socket["togglePause"] = !socket["togglePause"];
}

function mapKey(socket: ioSocket.Socket, data: any) {
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
	// @ts-ignore
	return socket["emulator"].step();
}

function startSocketInterval(socket: ioSocket.Socket) {
	// @ts-ignore
	socket["intervalID"] = setInterval(() => {
		emitEvent(socket, "draw");
		emitEvent(socket, "registers");
		// @ts-ignore
		const memorySlice = socket["emulator"].memory.getMemoryViewSlice(socket["memoryStart"], socket["memoryEnd"]);
		emitEvent(socket, "memory", memorySlice);
		emitEvent(socket, "stack");
		emitEvent(socket, "instruction");
		emitEvent(socket, "programCounter");
		emitEvent(socket, "addressRegister");
		// @ts-ignore
		if (!socket["togglePause"]) {
			try {
				step(socket);
			} catch (error) {
				console.log(error);
				socket.disconnect();
			}
		}
	}, 1000 / TICKS_PR_SECOND);
}

function clearSocketInterval(socket: ioSocket.Socket) {
	// @ts-ignore
	clearInterval(socket["intervalID"]);
}

/*
function randomWriteScreen(socket: ioSocket.Socket) {
	// @ts-ignore
	const screen: Array<Array<boolean>> = socket["emulator"].getScreen();
	let x = Math.floor((Math.random() * screen.length));
	let y = Math.floor((Math.random() * screen[x].length));
	// @ts-ignore
	socket["emulator"].flipPixel(x, y);
}
*/

function emitEvent(socket: ioSocket.Socket, 
	event: "keys" | "draw" | "registers" | "memory" | "programCounter" | "addressRegister" | "instruction" | "stack", 
	data?: any) {

	switch (event) {

		case "keys":
			// @ts-ignore
			return socket.emit(event, socket["emulator"].getKeyboard().getPressed());
            
		case "draw":
			// @ts-ignore
			return socket.emit(event, socket["emulator"].getScreen());
            
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
                    

	}

}

server.listen(3000, () => {
	console.log("Listening on port 3000");
	setTimeout(() => {
		if (!connected) {
			open("http://localhost:3000");
		}
	}, 2000);
});

