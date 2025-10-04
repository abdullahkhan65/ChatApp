# Modern Real-Time Chat Application

A secure, real-time chat application built with **React**, **NestJS**, **WebSockets**, and **SQLite**.

## Features

- **Real-time messaging** with Socket.IO
- **User authentication** with JWT tokens
- **Password hashing** with bcrypt
- **Input validation** for security
- **Modern, responsive UI** with gradient design
- **Online user tracking**
- **Message history persistence** with SQLite database
- **TypeScript** for type safety

## Tech Stack

### Backend
- **NestJS** - Progressive Node.js framework
- **TypeORM** - ORM for database management
- **SQLite** - Local database
- **Socket.IO** - Real-time WebSocket communication
- **Passport JWT** - Authentication middleware
- **bcrypt** - Password hashing
- **class-validator** - Input validation

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool
- **Socket.IO Client** - WebSocket client
- **Axios** - HTTP client
- **React Router** - Client-side routing
- **Context API** - State management

## Project Structure

```
ChatApp/
├── backend/                 # NestJS backend
│   ├── src/
│   │   ├── auth/           # Authentication module (JWT, Guards)
│   │   ├── users/          # User management module
│   │   ├── chat/           # Chat module (WebSocket gateway)
│   │   ├── app.module.ts   # Root module
│   │   └── main.ts         # Application entry point
│   ├── tsconfig.json
│   └── package.json
│
├── frontend/               # React frontend
│   ├── src/
│   │   ├── context/       # Auth context (state management)
│   │   ├── services/      # API & Socket services
│   │   ├── pages/         # Login & Chat pages
│   │   ├── App.tsx        # Main app component
│   │   └── main.tsx       # React entry point
│   └── package.json
│
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install
```

### Step 2: Install Frontend Dependencies

```bash
cd frontend
npm install
```

### Step 3: Start the Backend Server

```bash
cd backend
npm run dev
```

The backend server will start on `http://localhost:3000`

### Step 4: Start the Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

1. **Register a new account**:
   - Open `http://localhost:5173` in your browser
   - Click "Sign Up"
   - Enter a username (3-20 characters) and password (minimum 6 characters)

2. **Login**:
   - Use your credentials to sign in
   - You'll be redirected to the chat interface

3. **Start chatting**:
   - Type messages in the input field
   - See online users in the sidebar
   - View real-time messages from other users

4. **Test with multiple users**:
   - Open multiple browser windows/tabs
   - Register different users
   - Chat in real-time!

## How It Works

### Authentication Flow

1. **Registration/Login**:
   - User submits credentials
   - Backend validates input and hashes password with bcrypt
   - JWT token is generated and sent to client
   - Token is stored in localStorage

2. **Protected Routes**:
   - Frontend checks authentication status
   - Token is sent in Authorization header for API requests
   - JWT Strategy validates token on backend

### Real-Time Communication

1. **WebSocket Connection**:
   - Client connects to Socket.IO server with JWT token
   - Server validates token and stores user session
   - Client can send/receive messages in real-time

2. **Message Broadcasting**:
   - User sends message through WebSocket
   - Server saves message to SQLite database
   - Message is broadcast to all connected clients
   - UI updates automatically

### Database Schema

**Users Table**:
- `id` (UUID) - Primary key
- `username` (string) - Unique username
- `password` (string) - Hashed password
- `createdAt` (timestamp)

**Messages Table**:
- `id` (UUID) - Primary key
- `content` (string) - Message text
- `userId` (UUID) - Foreign key to Users
- `createdAt` (timestamp)

## Security Features

1. **Password Security**:
   - Passwords hashed with bcrypt (10 salt rounds)
   - Never stored in plain text

2. **JWT Authentication**:
   - Secure token-based authentication
   - 24-hour token expiration
   - Token validation on every WebSocket connection

3. **Input Validation**:
   - class-validator decorators on DTOs
   - Username: 3-20 characters
   - Password: minimum 6 characters
   - Whitelist validation prevents extra properties

4. **CORS Configuration**:
   - Configured for specific origin (localhost:5173)
   - Credentials enabled for secure cookie handling

5. **WebSocket Security**:
   - Token validation before connection
   - User session tracking
   - Unauthorized users automatically disconnected

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Chat
- `GET /chat/messages` - Get message history (protected)

### WebSocket Events
- `sendMessage` - Send a new message
- `getMessages` - Retrieve message history
- `newMessage` - Receive new messages (broadcast)
- `userJoined` - User connected notification
- `userLeft` - User disconnected notification

## Development Scripts

### Backend
```bash
npm run dev      # Start with hot reload
npm run start    # Start without hot reload
npm run build    # Build for production
npm run start:prod # Start production build
```

### Frontend
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Production Deployment

1. **Environment Variables**:
   - Set `JWT_SECRET` environment variable in production
   - Update CORS origin to your production domain

2. **Build Backend**:
   ```bash
   cd backend
   npm run build
   npm run start:prod
   ```

3. **Build Frontend**:
   ```bash
   cd frontend
   npm run build
   # Serve the 'dist' folder with nginx or any static server
   ```

4. **Database**:
   - SQLite is suitable for development
   - For production, consider PostgreSQL or MySQL
   - Update TypeORM configuration accordingly

## Future Enhancements

- Private/direct messaging
- Message reactions and emojis
- File/image sharing
- Typing indicators
- Read receipts
- User profiles with avatars
- Message search
- Dark mode toggle
- Mobile app (React Native)

## License

MIT

## Author

Built with modern web technologies for secure, real-time communication.
