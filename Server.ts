import express from "express";
import http from "http";
import ioSocket from "socket.io";
import open from "open";
import Chip8 from "./src/Chip8";

const app = express();
const server = http.createServer(app);
const io = ioSocket.listen(server);

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
	// @ts-ignore
	socket["emulator"] = new Chip8();
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
    
	// @ts-ignore
	socket["intervalID"] = setInterval(() => {
		randomWriteScreen(socket);
		emitEvent(socket, "draw");
	}, 1000 / 24);
   
	socket.on("disconnect", () => {
		console.log("Client disconnected");
		// @ts-ignore
		clearInterval(socket["intervalID"]);
	});
    
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

function randomWriteScreen(socket: ioSocket.Socket) {
	// @ts-ignore
	const screen: Array<Array<boolean>> = socket["emulator"].getScreen();
	let x = Math.floor((Math.random() * screen.length));
	let y = Math.floor((Math.random() * screen[x].length));
	// @ts-ignore
	socket["emulator"].flipPixel(x, y);
}

function emitEvent(socket: ioSocket.Socket, event: "keys" | "draw") {

	switch (event) {

		case "keys":
			// @ts-ignore
			return socket.emit(event, socket["emulator"].getKeyboard().getPressed());
            
		case "draw":
			// @ts-ignore
			return socket.emit(event, socket["emulator"].getScreen());

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

