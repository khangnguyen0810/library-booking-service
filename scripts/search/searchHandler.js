import { displayRooms } from '../ui/roomDisplay.js';

export function handleSearch(e, rooms) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const capacity = parseInt(formData.get('capacity')) || 0;
    
    // Filter rooms based on capacity
    const filteredRooms = rooms.filter(room => room.capacity >= capacity);
    
    displayRooms(filteredRooms);
    
    // Add some visual feedback
    const grid = document.getElementById('roomsGrid');
    grid.style.opacity = '0.5';
    setTimeout(() => {
        grid.style.opacity = '1';
    }, 200);
}