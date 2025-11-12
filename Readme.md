# DevConnect - Developer Community Platform

A modern, real-time developer community web application where developers can connect, share knowledge, collaborate on projects, and build meaningful professional relationships. Built with cutting-edge technologies including React, Node.js, PostgreSQL, and Socket.io for seamless real-time interactions.

## 🌟 Why DevConnect?

DevConnect is designed with developers in mind. It's not just another social platform – it's a vibrant community where:
- **Share Knowledge**: Post about your projects, learnings, and experiences
- **Get Feedback**: Engage with comments and discussions from the community
- **Build Connections**: Connect with developers across different skill levels and expertise
- **Real-time Chat**: Have instant conversations with other developers
- **Discover Talent**: Find and showcase your skills to the community

## ✨ Key Features

- 🔐 **Secure Authentication** - Register and login with secure JWT-based authentication
- 📝 **Rich Post Creation** - Share posts with titles, content, and tags for better discoverability
- 💬 **Comment System** - Engage in meaningful discussions by commenting on posts
- ❤️ **Like & Engagement** - Show appreciation for quality content with the like feature
- 🔍 **Smart Search & Filtering** - Find posts by keywords and filter using tags
- 👤 **User Profiles** - Create a professional profile with bio and skills showcase
- � **Real-time Messaging** - Chat with other developers instantly using Socket.io
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- 🎨 **Modern UI** - Beautiful, intuitive interface with smooth animations and transitions
- 🌐 **Community Driven** - Infinite scroll to discover endless content from developers

## 🛠️ Technology Stack

**Frontend:**
- React.js - Modern UI library
- Axios - Promise-based HTTP client
- Socket.io-client - Real-time communication
- CSS3 with CSS Variables - Styled with theme system
- Context API - State management

**Backend:**
- Node.js & Express.js - Server framework
- PostgreSQL - Relational database
- Prisma ORM - Database management
- Socket.io - Real-time bidirectional communication
- JWT - Secure authentication
- bcrypt - Password hashing

## 🏗️ Project Architecture

### Frontend Components
- **Authentication** - Login and registration system
- **Posts** - Create, read, update, and delete posts
- **Comments** - Discussion threads on posts
- **Profile** - User profile management
- **Messaging** - Real-time direct messaging
- **Navigation** - Responsive navbar with user menu

### Backend Services
- **Auth Controller** - User authentication and authorization
- **Post Controller** - Post management with likes and comments
- **User Controller** - User profile and search functionality
- **Message Controller** - Direct messaging and conversations

## 💾 Database Schema

The application uses a well-structured PostgreSQL database with the following key entities:

- **Users** - User accounts with profiles
- **Posts** - User-generated content with metadata
- **Comments** - Discussion threads on posts
- **Post Likes** - Track user engagement
- **Messages** - Direct messaging between users

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- PostgreSQL (v12+)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/HimanshuMNirmal/DevConnect.git
cd DevConnect
```

2. **Backend Setup**
```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/devconnect"
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

Start the server:
```bash
npm start
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

Create `.env` file:
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

Start the application:
```bash
npm start
```

The app will be available at `http://localhost:3000`

## 📚 API Endpoints

### Authentication
- `POST /auth/register` - Create a new account
- `POST /auth/login` - Login to your account

### Posts
- `GET /posts` - Fetch all posts with pagination
- `GET /posts/:id` - Get a specific post
- `POST /posts` - Create a new post
- `PUT /posts/:id` - Update your post
- `DELETE /posts/:id` - Delete your post
- `POST /posts/:id/like` - Like or unlike a post
- `GET /posts/:id/comments` - Get comments on a post
- `POST /posts/:id/comments` - Add a comment

### Users
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update profile
- `GET /users/search?query=` - Search users

### Messages
- `GET /messages/:userId` - Get conversation
- `POST /messages` - Send a message

## 🎯 Feature Highlights

### Post Discovery
- Infinite scroll for seamless browsing
- Search by keywords in title and content
- Filter posts using tags
- Sort by latest posts first

### Community Engagement
- Leave comments on posts for discussions
- Like posts to show appreciation
- View other developers' profiles
- See user skills and bio

### Real-time Communication
- Instant messaging with other users
- See who's online
- Typing indicators during conversations
- Message history persistence

### User Profiles
- Showcase your skills
- Add a professional bio
- View other developers' contributions
- See posts created by a user

## 🎨 Theme System

The application features a beautiful, consistent theme system with:
- Carefully chosen color palette
- Smooth transitions and animations
- Responsive spacing system
- Professional typography
- Theme-aware component styling

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Protected API endpoints
- CORS configuration
- Input validation and sanitization

## 📈 Future Roadmap

- **Follow System** - Follow developers and get updates
- **Notifications** - Real-time notifications for interactions
- **Image Uploads** - Share images in posts and profiles
- **Code Snippets** - Embed and highlight code in posts
- **User Recommendations** - Discover developers based on interests
- **Advanced Search** - Filter by skills, experience level, etc.
- **Email Verification** - Secure email verification system
- **Dark/Light Theme Toggle** - User preference settings

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Himanshu M Nirmal**
- GitHub: [@HimanshuMNirmal](https://github.com/HimanshuMNirmal)
- Feel free to reach out for collaboration or feedback!

## 🙏 Acknowledgments

- Built with passion for the developer community
- Inspired by modern social platforms
- Special thanks to the React, Node.js, and PostgreSQL communities
- Icons and design principles from industry standards