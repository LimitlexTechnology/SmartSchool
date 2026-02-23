# SmartSchool 🎓

A comprehensive school management system built with React.js frontend and Node.js/Express backend, designed to streamline educational administration and enhance the learning experience.

## 🚀 Features

### 📱 Frontend (React.js + Vite)
- **Modern UI/UX**: Clean, responsive design with Tailwind CSS
- **Phone & Password Authentication**: Secure login system with password visibility toggle
- **Dashboard**: Comprehensive overview with analytics and quick access
- **Student Management**: Attendance tracking, performance monitoring, Smart ID system
- **Academic Tools**: AI-powered lesson notes, virtual classroom, assessments
- **Safety & Security**: Real-time monitoring, incident reporting, access control
- **Finance Management**: Fee tracking, payment processing, financial reports
- **Diary System**: Digital diary for students and teachers
- **Mobile Responsive**: Optimized for desktop and mobile devices

### 🔧 Backend (Node.js + Express)
- **RESTful API**: Clean API architecture
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: JWT-based authentication
- **Real-time Updates**: WebSocket support for live features
- **File Upload**: Support for documents and media

## 🛠️ Tech Stack

### Frontend
- **React.js 18** - UI Library
- **Vite** - Build Tool & Dev Server
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Router v6** - Navigation
- **Chart.js** - Data Visualization

### Backend
- **Node.js** - Runtime Environment
- **Express.js** - Web Framework
- **Prisma** - ORM & Database Toolkit
- **PostgreSQL** - Database
- **CORS** - Cross-Origin Resource Sharing
- **Dotenv** - Environment Variables

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database

### 1. Clone the Repository
```bash
git clone <repository-url>
cd SmartSchool
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the server directory:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/smartschool_db"
PORT=5000
JWT_SECRET=your_jwt_secret_here
```

Run database migrations:
```bash
npx prisma migrate dev
npx prisma generate
```

Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd web
npm install
```

Start the frontend development server:
```bash
npm run dev
```

## 🌐 Access Points

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Database**: PostgreSQL on port 5432

## 🔐 Authentication

The system uses phone number and password authentication with the following test credentials:

### Test Users
- **Admin**: Phone: `1234567890`, Password: `admin123`
- **Teacher**: Phone: `5551234567`, Password: `teacher123`
- **Student**: Phone: `9876543210`, Password: `student123`

### Authentication Flow
1. User clicks "Launch App" on landing page
2. User is redirected to `/login` page
3. User enters phone number (minimum 10 digits) and password (minimum 6 characters)
4. System validates credentials
5. On successful login, user is redirected to dashboard
6. User can logout from the dashboard navbar

### Security Features
- Phone number validation (removes non-numeric characters)
- Password visibility toggle
- Session management with localStorage
- Protected routes (dashboard requires authentication)
- Admin-managed user access (no signup required)

## 📁 Project Structure

```
SmartSchool/
├── server/                    # Backend (Node.js + Express)
│   ├── prisma/               # Database schema and migrations
│   ├── src/                  # Source code
│   │   └── app.js           # Main application file
│   └── package.json         # Backend dependencies
├── web/                     # Frontend (React.js + Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── layouts/        # Page layouts
│   │   ├── pages/          # Page components
│   │   └── App.jsx         # Main application component
│   └── package.json        # Frontend dependencies
└── README.md              # This file
```

## 🚀 Available Scripts

### Backend Scripts
```bash
cd server
npm run dev      # Start development server with nodemon
npm start        # Start production server
```

### Frontend Scripts
```bash
cd web
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 🎯 Key Pages

### Landing Page
- Hero section with school overview
- Feature highlights
- "Launch App" button (redirects to login)

### Login Page
- Phone number and password authentication
- Password visibility toggle
- Security messaging
- Admin-managed access information

### Dashboard
- Overview cards with key metrics
- Quick access to main features
- Recent activity feed
- Navigation sidebar

### Student Management
- **Attendance**: Track student attendance
- **Smart ID**: Digital student identification
- **Performance**: Academic progress monitoring
- **Safety**: Incident reporting and tracking

### Academic Tools
- **AI Lesson Notes**: AI-powered lesson planning
- **Virtual Classroom**: Online learning environment
- **Assessments**: Test and assignment management
- **Diary**: Digital diary system

### Administration
- **Finance**: Fee management and financial reports
- **Security**: Access control and user management
- **Settings**: System configuration

## 🔧 Development Notes

### Code Quality
- ESLint configuration for code consistency
- Tailwind CSS for responsive design
- Component-based architecture
- Proper error handling
- Loading states and user feedback

### Performance
- Vite for fast development and building
- Lazy loading for optimal performance
- Optimized images and assets
- Efficient state management

### Security
- Input validation and sanitization
- Protected routes
- Session management
- Admin-controlled access

## 🐛 Known Issues

1. **Backend Prisma Warning**: There's a minor Prisma client constructor validation warning that doesn't affect functionality
2. **ESLint Warnings**: Some unused imports in various components (non-critical)

## 📝 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, please open an issue in the repository or contact the development team.

---

**Built with ❤️ for educational excellence**