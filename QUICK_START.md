# Quick Start Guide

## 🚀 How to Run Server and Client

### Prerequisites
- Node.js installed (v14 or higher)
- MongoDB running (local or MongoDB Atlas)
- Cloudinary account (for image uploads)

### Step 1: Install Dependencies

From the root directory (`sgrs`):
```bash
npm run install-all
```

Or install separately:
```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Step 2: Set Up Environment Variables

**Backend** - Create `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/sgrs_security
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRE=7d
PORT=5000
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
```

**Frontend** - Create `client/.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

### Step 3: Run Both Server and Client

**Option A: Run both together (Easiest)**
```bash
# From root directory
npm run dev
```

This will start:
- Backend server on: `http://localhost:5000`
- Frontend app on: `http://localhost:3000`

**Option B: Run separately (in separate terminals)**

Terminal 1 - Backend:
```bash
cd server
npm start
# or for development with auto-reload:
npm run dev
```

Terminal 2 - Frontend:
```bash
cd client
npm start
```

### Step 4: Seed the Database (Recommended)

This will create an admin user, sample services, projects, and contact messages:

```bash
cd server
npm run seed
```

Or directly:
```bash
cd server
node scripts/seed.js
```

**This creates:**
- Admin user: `admin@sgrs.com` / `admin123`
- 7 sample services
- 8 sample projects
- 3 sample contact messages

**Alternative: Create Admin Only**

If you only want to create an admin user:
```bash
cd server
node scripts/createAdmin.js admin admin@example.com yourpassword
```

Or use the API:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@example.com","password":"yourpassword"}'
```

### Step 5: Access the Application

- **Website**: http://localhost:3000
- **Admin Login**: http://localhost:3000/admin/login
- **API**: http://localhost:5000/api

---

## 📝 Common Issues

### MongoDB Connection Error
- Make sure MongoDB is running locally, OR
- Update `MONGODB_URI` in `server/.env` with your MongoDB Atlas connection string

### Port Already in Use
- Change `PORT` in `server/.env` to a different port (e.g., 5001)
- Update `REACT_APP_API_URL` in `client/.env` accordingly

### Cloudinary Upload Error
- Make sure you've added your Cloudinary credentials to `server/.env`
- Images won't upload without valid Cloudinary configuration

---

## 🛠️ Development Commands

```bash
# Install all dependencies
npm run install-all

# Run both server and client
npm run dev

# Run server only
npm run server

# Run client only
npm run client
```
