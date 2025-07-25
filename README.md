# 🛸 Black Market Alien Store

A full-stack MERN application for trading alien collectibles from across the galaxy!

## 🌐 Live Demo

**🚀 [Visit the Live Site](https://black-market-frontend.onrender.com)**

![Project Status](https://img.shields.io/badge/status-active-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![Live Demo](https://img.shields.io/badge/demo-live-success)

## 🌟 Features

- 🔐 **User Authentication** - Secure JWT-based authentication system
- 👽 **Alien Collectibles** - Browse and filter unique alien characters
- 🛒 **Shopping Cart** - Add aliens to cart and manage purchases
- 💳 **Order Management** - Complete checkout and order tracking
- ❤️ **Wishlist** - Save favorite aliens for later
- 👨‍💼 **Admin Panel** - Comprehensive admin dashboard for managing aliens, users, and orders
- 📱 **Responsive Design** - Beautiful UI with Tailwind CSS
- 🖼️ **Image Upload** - Upload and manage alien images
- 🔍 **Search & Filter** - Find aliens by faction, planet, rarity, and more
- ⚡ **Redis Caching** - High-performance caching for faster API responses

## 🚀 Tech Stack

### Frontend

- **React 18** with Vite for fast development
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Context API** for state management
- **Axios** for API calls

### Backend

- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **Redis** for caching and session management
- **JWT** for authentication
- **Multer** for file uploads
- **Helmet** for security
- **Rate limiting** and CORS protection

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/neeleshgadi/black-market.git
cd black-market
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup

**Server (.env)**

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/black-market-aliens
JWT_SECRET=your-super-secret-jwt-key
SESSION_SECRET=your-session-secret
CLIENT_URL=http://localhost:3000
```

**Client (.env)**

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Black Market Alien Store
```

### 4. Database Setup

```bash
# Seed the database with sample data
cd server
npm run seed:data
```

### 5. Start Development Servers

```bash
# Terminal 1 - Start backend server
cd server
npm run dev

# Terminal 2 - Start frontend client
cd client
npm run dev
```

Visit `http://localhost:3000` to see the application!

## 📁 Project Structure

```
black-market/
├── client/                     # React frontend
│   ├── src/
│   │   ├── components/         # Reusable components
│   │   │   ├── admin/          # Admin panel components
│   │   │   ├── alien/          # Alien-related components
│   │   │   ├── auth/           # Authentication components
│   │   │   ├── cart/           # Shopping cart components
│   │   │   ├── common/         # Shared components
│   │   │   └── user/           # User profile components
│   │   ├── pages/              # Page components
│   │   ├── context/            # React context providers
│   │   ├── services/           # API service functions
│   │   ├── utils/              # Utility functions
│   │   └── styles/             # CSS files
│   └── public/                 # Static assets
├── server/                     # Express backend
│   ├── controllers/            # Route controllers
│   ├── models/                 # MongoDB schemas
│   ├── routes/                 # API routes
│   ├── middleware/             # Custom middleware
│   ├── utils/                  # Utility functions
│   ├── scripts/                # Database scripts
│   └── uploads/                # Uploaded images
└── README.md
```

## 🔗 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Aliens

- `GET /api/aliens` - Get all aliens (with filtering)
- `GET /api/aliens/featured` - Get featured aliens
- `GET /api/aliens/:id` - Get alien by ID
- `POST /api/aliens` - Create new alien (Admin only)
- `PUT /api/aliens/:id` - Update alien (Admin only)
- `DELETE /api/aliens/:id` - Delete alien (Admin only)

### Cart & Orders

- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/update` - Update cart item
- `DELETE /api/cart/remove` - Remove item from cart
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders

### Wishlist

- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist/add` - Add alien to wishlist
- `DELETE /api/wishlist/remove` - Remove alien from wishlist

## 👨‍💼 Admin Features

Access the admin panel at `/admin` with admin credentials (contact repository owner for access).

Admin capabilities:

- Manage alien inventory
- View and process orders
- User management
- Upload alien images
- View analytics dashboard

## 🧪 Testing

```bash
# Run server tests
cd server
npm test

# Run client tests
cd client
npm test
```

## 🚀 Deployment

The application is ready for deployment on platforms like:

- **Frontend**: Vercel, Netlify
- **Backend**: Render, Heroku, Railway
- **Database**: MongoDB Atlas

### Quick Deploy Commands

```bash
# Build client for production
cd client
npm run build

# Start server in production mode
cd server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Neelesh Gadi**

- GitHub: [@neeleshgadi](https://github.com/neeleshgadi)
- Project Link: [https://github.com/neeleshgadi/black-market](https://github.com/neeleshgadi/black-market)

## 🙏 Acknowledgments

- Alien character designs and concepts
- React and Node.js communities
- MongoDB for database solutions
- Tailwind CSS for styling framework

---

⭐ **Star this repository if you found it helpful!**
