import { displayRooms } from '../ui/roomDisplay.js';

let currentBookingRoom = null;

export function openBookingModal(roomId, rooms) {
    currentBookingRoom = rooms.find(room => room.id === roomId);
    document.getElementById('modalRoomName').textContent = currentBookingRoom.name;
    document.getElementById('bookingModal').style.display = 'block';
    document.body.style.overflow = 'hidden';
}

export function closeModal() {
    document.getElementById('bookingModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    document.getElementById('bookingForm').reset();
    document.getElementById('successMessage').style.display = 'none';
}

export function handleBooking(e, rooms) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const bookingData = {
        room: currentBookingRoom.name,
        name: formData.get('userName'),
        email: formData.get('userEmail'),
        purpose: formData.get('purpose'),
        date: document.getElementById('date').value,
        time: document.getElementById('time').value
    };
    
    // Simulate booking process
    const submitBtn = document.querySelector('.confirm-btn');
    submitBtn.textContent = 'Booking...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        // Mark room as unavailable
        currentBookingRoom.available = false;
        
        // Show success message
        document.getElementById('successMessage').style.display = 'block';
        
        // Reset button
        submitBtn.textContent = 'Confirm Booking';
        submitBtn.disabled = false;
        
        // Update the display
        displayRooms(rooms);
        
        // Close modal after delay
        setTimeout(() => {
            closeModal();
        }, 2000);
        
    }, 1500);
}