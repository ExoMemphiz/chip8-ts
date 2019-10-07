import express from "express";
import http from "http";
import ioSocket from "socket.io";
import open from "open";
import Screen from "./src/components/Screen";
import Keyboard from "./src/components/Keyboard";

const app = express();
const server = http.createServer(app);
const io = ioSocket.listen(server);

app.get("/", (request, response) => {
	response.sendFile(__dirname + "/public/index.html");
});

let connected = false;

let keyboard = new Keyboard();
let screen = new Screen();

io.on("connection", (socket) => {
	console.log("User connected");
	setupSocket(socket);
	connected = true;
	socket.emit("draw", screen.getScreen());
	socket.emit("keys", keyboard.getPressed());
	socket.send([]);
});

function setupSocket(socket: ioSocket.Socket) {
	socket.on("keydown", (data) => {
		let mapped = keyboard.mapKeyToValue(data);
		if (typeof(mapped) === "number") {
			keyboard.onPress(mapped);
			socket.emit("keys", keyboard.getPressed());
		}
	});
	socket.on("keyup", (data) => {
		let mapped = keyboard.mapKeyToValue(data);
		if (typeof(mapped) === "number") {
			keyboard.onRelease(mapped);
			socket.emit("keys", keyboard.getPressed());
		}
	});
}

server.listen(3000, () => {
	console.log("Listening or something");
	setTimeout(() => {
		if (!connected) {
			open("http://localhost:3000");
		}
	}, 2000);
});

