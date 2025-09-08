# Meetly - Real-time Video Calling App

<br>

Meetly is a real-time video calling web application that enables users to connect with others via meeting rooms that are uniquely generated. Essentially, it uses **WebRTC** technology as it's backbone for peer-to-peer communication which means that you will get low latency video and audio streaming directly from your browsers.

The project is developed by using Node.js, Express, Socket.IO, React.js, Tailwind CSS and PeerJS to develop a user-friendly and engaging video chat experience.

---

## Live Demo
You can access the live version of the project here: [**Meetly Live Demo**](https://meetly-frontend-3qae.onrender.com)

---

## Features
-   **Real-time Video & Audio:** High-quality, low latency communication using WebRTC.
-   **Secure & Private Rooms:** Create unique room IDs for private conversations.
-   **Core Controls:** Easily mute/unmute your audio, start/stop your video stream and share/un-share your screen.
-   **Simple User Interface:** A clean and intuitive interface for better user experience.
-   **Peer-to-Peer Connection:** Direct connection between users for enhanced privacy and performance.

---

### Steps to Run Locally

1. After forking the repository, Clone the forked repository:

   ```bash
   git clone https://github.com/<your-username>/meetly.git
   cd meetly

2. Install dependencies:

   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up environment variables:

  - **for backend:**

     - Create a `.env` file in the `/backend` directory.
     - Add variables which are mentioned in [.env.example](./backend/.env.example) file to create a `.env` file for backend.
       
   - **for frontend:**

     - Create a `.env` file in the `/frontend` directory.
     - Add variables which are mentioned in [.env.example](./frontend/.env.example) file to create a `.env` file for frontend.
     
4. Start the development servers:

   ```bash
   # Start backend server
   cd backend
   npm run dev

   # Start frontend server
   cd ../frontend
   npm run dev
   ```

---

## Contributing
Contributions are welcome! If you'd like to contribute, please fork the repository and create a pull request.

---

## License
This project is licensed under the MIT License. Please see the [LICENSE](LICENSE) file for more information.

---
