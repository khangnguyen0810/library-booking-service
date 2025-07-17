export function displayRooms(roomsToShow) {
    const grid = document.getElementById('roomsGrid');
    grid.innerHTML = '';
    
    roomsToShow.forEach(room => {
        const roomCard = createRoomCard(room);
        grid.appendChild(roomCard);
    });
}

export function createRoomCard(room) {
    const card = document.createElement('div');
    card.className = 'room-card';
    
    const featuresHTML = room.features.map(feature => 
        `<span class="feature-tag">${feature}</span>`
    ).join('');
    
    const statusClass = room.available ? 'available' : 'occupied';
    const statusText = room.available ? 'Available' : 'Occupied';
    const buttonHTML = room.available 
        ? `<button class="book-btn" data-room-id="${room.id}">Book Now</button>`
        : `<button class="book-btn" disabled>Unavailable</button>`;
    
    card.innerHTML = `
        <div class="room-header">
            <h3 class="room-name">${room.name}</h3>
            <span class="room-capacity">${room.capacity} seats</span>
        </div>
        <div class="room-features">
            ${featuresHTML}
        </div>
        <div class="room-status">
            <div class="status-indicator ${statusClass}">
                <span class="status-dot"></span>
                ${statusText}
            </div>
            ${buttonHTML}
        </div>
    `;
    
    return card;
}