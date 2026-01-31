# SGRS Security Systems - Company Website

A complete full-stack MERN application for a security systems company website with admin dashboard for content management.

## 🚀 Tech Stack

### Frontend
- **React.js** - UI framework
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Routing
- **Framer Motion** - Animations
- **React Icons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Image storage

## 📁 Project Structure

```
sgrs/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── admin/         # Admin dashboard
│   │   │   ├── components/
│   │   │   │   ├── DashboardHome.js
│   │   │   │   ├── ServicesManagement.js
│   │   │   │   ├── ProjectsManagement.js
│   │   │   │   └── ContactsManagement.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminLogin.js
│   │   │   └── ProtectedRoute.js
│   │   ├── components/    # Shared components
│   │   │   ├── Navbar.js
│   │   │   └── Footer.js
│   │   ├── pages/         # Public pages
│   │   │   ├── Home.js
│   │   │   ├── About.js
│   │   │   ├── Services.js
│   │   │   ├── Projects.js
│   │   │   └── Contact.js
│   │   ├── services/      # API service
│   │   │   └── api.js
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
│
└── server/                # Express backend
    ├── controllers/
    │   ├── authController.js
    │   ├── serviceController.js
    │   ├── projectController.js
    │   └── contactController.js
    ├── middleware/
    │   ├── auth.js
    │   └── upload.js
    ├── models/
    │   ├── User.js
    │   ├── Service.js
    │   ├── Project.js
    │   └── Contact.js
    ├── routes/
    │   ├── auth.js
    │   ├── services.js
    │   ├── projects.js
    │   └── contact.js
    ├── server.js
    └── package.json
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (for image uploads)

### 1. Clone the repository
```bash
git clone <repository-url>
cd sgrs
```

### 2. Install Dependencies

**Option 1: Install all at once (from root)**
```bash
npm run install-all
```

**Option 2: Install separately**

Backend:
```bash
cd server
npm install
```

Frontend:
```bash
cd client
npm install
```

### 3. Environment Setup

**Backend:** Create a `.env` file in the `server` directory:
```env
MONGODB_URI=mongodb://localhost:27017/sgrs_security
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRE=7d
PORT=5000
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

**Frontend:** Create a `.env` file in the `client` directory:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Start the Application

**Option 1: Run both together (from root)**
```bash
npm run dev
```

**Option 2: Run separately**

Backend:
```bash
cd server
npm start
# or for development with auto-reload:
npm run dev
```

Frontend:
```bash
cd client
npm start
```

- Backend will run on `http://localhost:5000`
- Frontend will run on `http://localhost:3000`

## 📝 Initial Setup

### Seed Database (Recommended)

**This will create an admin user, sample services, projects, and contact messages:**

```bash
cd server
npm run seed
```

Or directly:
```bash
node scripts/seed.js
```

**What it creates:**
- ✅ Admin user: `admin@sgrs.com` / `admin123`
- ✅ 7 sample services (Security Cameras, Fire Protection, Access Control, etc.)
- ✅ 8 sample projects across different categories
- ✅ 3 sample contact messages

### Create Admin User Only (Alternative)

**Option 1: Using the script**

```bash
cd server
node scripts/createAdmin.js [username] [email] [password]
```

Example:
```bash
node scripts/createAdmin.js admin admin@example.com securepassword123
```

If no arguments are provided, it will use defaults:
- Username: `admin`
- Email: `admin@example.com`
- Password: `admin123`

**Option 2: Using API**

Make a POST request to `/api/auth/register`:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "your-secure-password"
  }'
```

Or use a tool like Postman to register the first admin user.

### Access Admin Dashboard

1. Navigate to `http://localhost:3000/admin/login`
2. Login with your admin credentials:
   - **If you used seed script**: `admin@sgrs.com` / `admin123`
   - **If you created custom admin**: Use your credentials
3. You'll be redirected to the admin dashboard

## 🎨 Features

### Public Website
- ✅ Modern, responsive design
- ✅ Home page with hero, services preview, about section, projects slider
- ✅ About page with company story and values
- ✅ Services page with dynamic content from API
- ✅ Projects/Gallery page with category filtering
- ✅ Contact page with form and Google Maps integration
- ✅ Smooth animations with Framer Motion

### Admin Dashboard
- ✅ Secure login with JWT authentication
- ✅ Protected routes
- ✅ Services CRUD (Create, Read, Update, Delete)
- ✅ Projects CRUD with multiple image uploads
- ✅ Contact messages management
- ✅ Image upload to Cloudinary
- ✅ Responsive sidebar layout

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token-based authentication
- Protected API routes
- Environment variables for sensitive data
- Input validation

## 📦 Deployment

### Backend (Render/Railway/Heroku)

1. Create a new web service
2. Connect your GitHub repository
3. Set environment variables:
   - `MONGODB_URI` (MongoDB Atlas connection string)
   - `JWT_SECRET`
   - `JWT_EXPIRE`
   - `PORT` (usually auto-set)
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`
4. Deploy!

### Frontend (Vercel/Netlify)

1. Create a new project
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set output directory: `build`
5. Set environment variable:
   - `REACT_APP_API_URL` (your deployed backend URL)
6. Deploy!

### MongoDB Atlas Setup

1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user
3. Whitelist your IP address (or use 0.0.0.0/0 for all IPs in development)
4. Get your connection string and add it to `.env`

### Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get your Cloud Name, API Key, and API Secret from the dashboard
3. Add them to your `.env` file

## 🧪 API Endpoints

### Auth
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Services
- `GET /api/services` - Get all services (public)
- `GET /api/services/:id` - Get single service (public)
- `POST /api/services` - Create service (protected)
- `PUT /api/services/:id` - Update service (protected)
- `DELETE /api/services/:id` - Delete service (protected)

### Projects
- `GET /api/projects` - Get all projects (public)
- `GET /api/projects/:id` - Get single project (public)
- `POST /api/projects` - Create project (protected)
- `PUT /api/projects/:id` - Update project (protected)
- `DELETE /api/projects/:id` - Delete project (protected)

### Contact
- `POST /api/contact` - Create contact message (public)
- `GET /api/contact` - Get all messages (protected)
- `GET /api/contact/:id` - Get single message (protected)
- `DELETE /api/contact/:id` - Delete message (protected)

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Development

### Running in Development Mode

**Backend:**
```bash
cd server
npm run dev  # Uses nodemon for auto-reload
```

**Frontend:**
```bash
cd client
npm start  # Runs on http://localhost:3000
```

### Building for Production

**Frontend:**
```bash
cd client
npm run build
```

The production build will be in the `client/build` directory.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, email info@sgrssecurity.com or create an issue in the repository.

---

Built with ❤️ using the MERN stack
