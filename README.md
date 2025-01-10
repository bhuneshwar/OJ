# Online Judge Platform

A modern online judge platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that allows users to solve programming problems and get instant feedback on their solutions.

## Features

- 🔐 **User Authentication**
  - Register with username, email, and password
  - Secure login with JWT tokens
  - Protected routes for authenticated users

- 💻 **Problem Solving**
  - Browse problems with difficulty indicators
  - Write code in multiple languages (Python, JavaScript, C++, Java)
  - Real-time code execution
  - Instant feedback on solution correctness
  - View execution time and memory usage

- 📊 **Progress Tracking**
  - Track solved problems
  - View submission history
  - Save successful solutions for future reference
  - View problem-solving statistics

- 🎯 **Problem Management**
  - Categorized problems by difficulty
  - Detailed problem descriptions with examples
  - Test cases for validation
  - Acceptance rate tracking

## Tech Stack

### Frontend
- React.js
- Material-UI for styling
- CodeMirror for code editing
- Axios for API requests
- React Router for navigation

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing
- Child Process for code execution

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd online-judge
   ```

2. Install dependencies:
   ```bash
   # Install server dependencies
   cd server
   npm install

   # Install client dependencies
   cd ../client
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the server directory with:
   ```
   MONGODB_URI=your_mongodb_uri
   SECRET_KEY=your_jwt_secret_key
   PORT=5000
   ```

4. Start the development servers:
   ```bash
   # Start backend server (from server directory)
   npm run dev

   # Start frontend server (from client directory)
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Problems
- `GET /api/problems` - Get all problems
- `GET /api/problems/:id` - Get specific problem
- `POST /api/problems/:id/run` - Run code for a problem
- `POST /api/problems/:id/submit` - Submit solution for a problem

### Solutions
- `GET /api/problems/:id/solutions` - Get top solutions for a problem
- `GET /api/problems/solutions/user` - Get current user's solutions
- `GET /api/problems/:id/solutions/user` - Get user's solution for a specific problem

## Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Protected API endpoints
- Input validation
- Safe code execution environment
- Rate limiting for API requests

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.