# 🎫 TicketFlow

**TicketFlow** is a high-performance, full-stack event management and ticketing solution. It empowers organizers to create events, manage attendees, and verify entries in real-time using secure, unique tokens and atomic check-in logic.



## 🌐 Live Demo
**Frontend:** [https://ticket-flow-rust.vercel.app](https://ticket-flow-rust.vercel.app)  
**Backend:** [https://ticketflow-ta7e.onrender.com](https://ticketflow-ta7e.onrender.com)

---

## 🚀 Key Features

* **Real-Time Analytics**: Instant insights into tickets sold, check-in rates, and revenue via a centralized dashboard.
* **Atomic Check-in Logic**: Prevents race conditions and duplicate entries using MongoDB's `$inc` and `$push` operators.
* **Batch Entry Support**: Handles "Group Tickets" seamlessly by tracking individual entries within a single purchase.
* **Advanced Data Export**: One-click Excel (`.xlsx`) export for attendee lists and ticket data.
* **Dynamic Image Management**: Support for event cover images and multi-image galleries.
* **Production-Ready Auth**: Secure JWT-based authentication using cross-site HTTP-only cookies (`SameSite: None`).

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React.js (Vite)
- **Styling**: Tailwind CSS + Shadcn UI
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Data Handling**: XLSX, Date-fns

### Backend
- **Environment**: Node.js + Express.js
- **Database**: MongoDB + Mongoose
- **Security**: JWT, Bcrypt, Helmet
- **Deployment**: Render (Backend), Vercel (Frontend)



---

## 📂 Project Structure

```text
├── backend/            # Express server, MongoDB models, & API routes
├── frontend/           # React SPA, Tailwind components, & state logic
└── vercel.json         # SPA routing configuration for Vercel

```

💻 Setup & Installation

1. Clone the repository
```Bash
git clone [https://github.com/DIPRO2000/TicketFlow.git](https://github.com/DIPRO2000/TicketFlow.git)
cd TicketFlow
```

2. Backend Configuration
Navigate to the backend folder and install dependencies:

```Bash
cd backend
npm install
```

Create a .env file:

```Code snippet
PORT=5000
MONGO_URL=your_mongodb_atlas_uri
ORGANIZER_JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

3. Frontend Configuration
Navigate to the frontend folder and install dependencies:

```Bash
cd ../frontend
npm install
```

Create a .env file:

```Code snippet
VITE_BACKEND_URL=http://localhost:5000
VITE_FRONTEND_URL=http://localhost:5173
```

🔒 Deployment Tips
To successfully deploy this project (Vercel + Render), ensure the following:

1. CORS: The FRONTEND_URL in your backend environment must exactly match your Vercel URL (with no trailing /).

2. Cookie Security: The authentication cookies must be set with secure: true and sameSite: "none" to allow cross-domain communication.

3. SPA Routing: Use the included vercel.json file to prevent 404 errors when refreshing the dashboard or visiting direct links.

---

🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

Developed with ❤️ by Diprajit Chakraborty
