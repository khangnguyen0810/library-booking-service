# AI-Powered Library Booking Service 📚🤖

A modern solution to replace manual library room reservations with an automated, AI-driven experience. 

## The Problem
Many libraries still rely on manual booking systems—filling out forms or sending emails. This project introduces **Gemini Function Calling** to allow users to book rooms through natural conversation, which the system then translates into database actions.

## Key Features
- **Natural Language Booking:** No more complex forms. Just tell the AI: *"Book a study room for me tomorrow at 2 PM."*
- **AI Function Calling:** Uses Google Gemini to intelligently decide when to trigger a booking or cancellation.
- **Real-time Database Updates:** Direct integration between AI logic and MongoDB storage.
- **RESTful API:** A robust Express backend to handle room availability and user requests.

---

## How It Works (The Workflow)
The project creates a seamless bridge between a user's intent and the physical database:

1.  **User Input:** The user sends a request (e.g., "Cancel my booking for Room A").
2.  **Gemini Intelligence:** The AI analyzes the text and identifies that it needs to execute the `cancelRoom` function.
3.  **API Execution:** Gemini triggers a specific **POST API request** defined in the Express backend.
4.  **Database Update:** The backend executes a **MongoDB operation** to update the room status.
5.  **Confirmation:** The AI confirms the successful action back to the user in natural language.

---

## Tech Stack
- **AI Engine:** Google Gemini (Function Calling API)
- **Database:** MongoDB (Data persistence)
- **Backend:** Node.js & Express (REST API)
- **Frontend:** Web interface for managing and viewing bookings

## Getting Started

### Prerequisites
- Node.js installed
- A MongoDB connection string (Atlas or local)
- A Google Gemini API Key

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/khangnguyen0810/library-booking-service.git
   cd library-booking-service
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Set up environment variables:**
   Create a `.env` file and add your credentials:
   ```env
   MONGO_URI=your_mongodb_uri
   GEMINI_API_KEY=your_api_key
   ```
4. **Run the server:**
   ```bash
   npm start
   ```

## API Implementation Note
The core of this project is the integration of **Function Declarations** within the Gemini prompt. This allows the model to output a JSON object representing the function call rather than just text, ensuring the database operations are precise and predictable.
