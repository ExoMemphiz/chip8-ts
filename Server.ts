import express from "express";
import http from "http";
import ioSocket from "socket.io";
import open from "open";
import Chip8 from "./src/Chip8";
import FileReader from "./src/utils/FileReader";
import fileReader from "./src/utils/FileReader";

const app = express();
const server = http.createServer(app);
const io = ioSocket.listen(server);

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
	console.log("Found games:", files);
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
    
	socket.on("changeGame", (game) => {
		console.log("Changing game to:", game);
		// @ts-ignore
		socket["emulator"].loadRom(FileReader.readFile(`/roms/${game}`));
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
    console.log(`Starting socket interval`);
    emitEvent(socket, "draw");
	// @ts-ignore
	socket["intervalID"] = setInterval(() => {
        //emitEvent(socket, "draw");
        /*
        emitEvent(socket, "registers");
		// @ts-ignore
		const memorySlice = socket["emulator"].memory.getMemoryViewSlice(socket["memoryStart"], socket["memoryEnd"]);
		emitEvent(socket, "memory", memorySlice);
		emitEvent(socket, "stack");
		emitEvent(socket, "instruction");
		emitEvent(socket, "programCounter");
        emitEvent(socket, "addressRegister");
        */
		// @ts-ignore
		if (!socket["togglePause"]) {
			try {
                let draw = false;
                // @ts-ignore
                if (socket["emulator"].willDraw()) {
                    draw = true;
                }
                step(socket);
                if (draw) {
                    emitEvent(socket, "draw");
                }
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

function emitEvent(socket: ioSocket.Socket, 
	event: "keys" | "draw" | "registers" | "memory" | "programCounter" | 
           "addressRegister" | "instruction" | "stack" | "games" | "beep", 
	data?: any) {

	switch (event) {

		case "keys":
			// @ts-ignore
			return socket.emit(event, socket["emulator"].getKeyboard().getPressed());
            
		case "draw":
            // @ts-ignore
            const newScreen = socket["emulator"].getScreen();

            return socket.emit(event, newScreen);

            // @ts-ignore
            const oldScreen = socket["oldScreen"];
            if (!oldScreen) {
                // @ts-ignore
                socket["oldScreen"] = newScreen;
                return socket.emit(event, newScreen);
            } else {
                for (let i = 0; i < newScreen.length; i++) {
                    for (let j = 0; j < newScreen[i].length; j++) {
                        if (oldScreen[i][j] !== newScreen[i][j]) {
                            console.log(`Found new screen. Emitting!`);
                            return socket.emit(event, newScreen);
                        }
                    }
                }
            }
            // console.log(`Nothing changed, skipping emit...`);
			return;
            
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
	}, 2000);
});

