// import { rooms } from './data/roomData.js';
import { displayRooms, createRoomCard } from "./ui/roomDisplay.js";
import {
	openBookingModal,
	closeModal,
	handleBooking,
} from "./booking/bookingModal.js";
import { handleSearch } from "./search/searchHandler.js";

let currentBookingRoom = null;

document.addEventListener("DOMContentLoaded", async function () {
	try {
		fetch("/api/ai/reset", { method: "POST" });
		console.log("Chat session reset on page load.");
		const res = await fetch("/api/rooms");
		const rooms = await res.json();
		console.log("Fetched rooms:", rooms);

		// Set today's date in the booking form
		const today = new Date().toISOString().split("T")[0];
		document.getElementById("date").value = today;

		// Display all rooms initially
		await displayRooms(rooms);

		// Setup all event listeners, passing rooms to handlers
		await setupEventListeners(rooms);
	} catch (error) {
		console.error("Failed to load rooms:", error);
		console.error("Failed to reset chat session:", err);
	}
});

function setupEventListeners(rooms) {
	// Search form submit
	document
		.getElementById("searchForm")
		.addEventListener("submit", (e) => handleSearch(e, rooms));

	// Modal close button
	document.querySelector(".close-btn").addEventListener("click", closeModal);

	// Modal background click
	document
		.getElementById("bookingModal")
		.addEventListener("click", function (e) {
			if (e.target === this) closeModal();
		});

	// Booking form submit
	document
		.getElementById("bookingForm")
		.addEventListener("submit", (e) => handleBooking(e, rooms));

	// Room booking button click (event delegation)
	document
		.getElementById("roomsGrid")
		.addEventListener("click", function (e) {
			if (e.target.classList.contains("book-btn") && !e.target.disabled) {
				const roomId = parseInt(e.target.getAttribute("data-room-id"));
				openBookingModal(roomId, rooms);
			}
		});
}
