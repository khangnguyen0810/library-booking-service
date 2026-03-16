require("dotenv").config();

const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const path = require("path");
const connectDB = require("./server/db.js");
const Room = require("./server/models/Room");

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;
let cachedRooms = [];

const tools = [
	{
		functionDeclarations: [
			{
				name: "book_a_room",
				description: "Books a study or meeting room in the library.",
				parameters: {
					type: "object",
					properties: {
						room_name: {
							type: "string",
							description:
								"The name or ID of the room to book (e.g., 'Room A1')",
						},
					},
					required: ["room_name"],
				},
			},
			{
				name: "cancel_a_room",
				description:
					"Cancels a previously booked study or meeting room in the library.",
				parameters: {
					type: "object",
					properties: {
						room_name: {
							type: "string",
							description:
								"The name or ID of the room to cancel (e.g., 'Room A1')",
						},
					},
					required: ["room_name"],
				},
			},
		],
	},
];

const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

let chatSession = model.startChat({
	history: [],
	tools: tools,
	toolConfig: {
		functionCallingConfig: {
			mode: "AUTO",
		},
	},
});

// Load cached rooms from database
connectDB().then((rooms) => {
	cachedRooms = rooms;
});

app.use(express.static(path.join(__dirname, "..")));

app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.get("/api/rooms", async (req, res) => {
	try {
		const rooms = await Room.find();
		res.json(rooms);
	} catch (error) {
		console.error("Failed to fetch rooms:", error);
		res.status(500).json({
			success: false,
			error: "Failed to fetch rooms.",
		});
	}
});

app.put("/api/rooms/:id/available", async (req, res) => {
	try {
		const roomId = parseInt(req.params.id);
		const { available } = req.body;

		if (typeof available !== "boolean") {
			return res.status(400).json({
				success: false,
				message: "`available` must be true or false.",
			});
		}

		const result = await Room.updateOne(
			{ id: roomId },
			{ $set: { available: available } },
		);

		res.json({
			success: true,
			message: `Room ${roomId} availability updated to ${available}.`,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({
			success: false,
			error: "Failed to update availability.",
		});
	}
});

function normalizeName(str) {
	return str
		.toLowerCase()
		.replace(/\s+/g, "")
		.replace(/[^a-z0-9]/gi, "");
}
app.post("/api/ai", async (req, res) => {
	try {
		const { message } = req.body;
		if (!message)
			return res
				.status(400)
				.json({ success: false, error: "Message is required." });

		const result = await chatSession.sendMessage(message);
		const response = result.response;

		const functionCall =
			response?.candidates?.[0]?.content?.parts?.[0]?.functionCall;

		if (functionCall) {
			const { name, args } = functionCall;
			console.log("Function call detected:", name, args);

			if (name === "book_a_room") {
				const roomName = args.room_name?.toLowerCase();

				// Match room name to ID from cached DB
				const normalizedInput = normalizeName(roomName);
				const matchedRoom = cachedRooms.find(
					(room) => room.name.toLowerCase() === roomName,
				);

				if (!matchedRoom) {
					return res.json({
						success: false,
						error: `Room "${roomName}" not found in the database.`,
					});
				}

				const roomId = matchedRoom.id;

				const putRes = await fetch(
					`http://localhost:${PORT}/api/rooms/${roomId}/available`,
					{
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ available: false }),
					},
				);

				const putResult = await putRes.json();

				return res.json({
					success: true,
					functionCall: name,
					arguments: args,
					roomId: roomId,
					apiResult: putResult,
					response: `Room "${matchedRoom.name}" has been booked successfully.`,
				});
			}
			if (name === "cancel_a_room") {
				const roomName = args.room_name?.toLowerCase();

				// Match room name to ID from cached DB
				const matchedRoom = cachedRooms.find(
					(room) => room.name.toLowerCase() === roomName,
				);

				if (!matchedRoom) {
					return res.json({
						success: false,
						error: `Room "${roomName}" not found in the database.`,
					});
				}

				const roomId = matchedRoom.id;

				// Make PUT request to mark room as available (cancel booking)
				const putRes = await fetch(
					`http://localhost:${PORT}/api/rooms/${roomId}/available`,
					{
						method: "PUT",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ available: true }),
					},
				);

				const putResult = await putRes.json();

				return res.json({
					success: true,
					functionCall: name,
					arguments: args,
					roomId: roomId,
					apiResult: putResult,
					response: `Room "${matchedRoom.name}" has been cancelled successfully.`,
				});
			}

			// Add other function handling if needed
		}
		// No function call? Return normal text response
		return res.json({ success: true, response: response.text() });
	} catch (error) {
		console.error("Gemini API Error:", error);
		return res
			.status(500)
			.json({ success: false, error: "Failed to get AI response." });
	}
});

app.post("/api/ai/reset", (req, res) => {
	try {
		chatSession = model.startChat({
			history: [],
			tools: tools,
			toolConfig: {
				functionCallingConfig: {
					mode: "AUTO",
				},
			},
		});

		res.json({ success: true, message: "Chat session has been reset." });
	} catch (error) {
		console.error("Failed to reset chat session:", error);
		res.status(500).json({
			success: false,
			error: "Failed to reset chat session.",
		});
	}
});

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
