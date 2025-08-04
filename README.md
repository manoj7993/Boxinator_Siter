# Boxinator - Shipping Management System

A full-stack web application for managing shipping operations with user authentication, shipment tracking, and administrative controls.

## 🚀 Features

### User Features
- **User Registration & Authentication**: Secure signup/login with email verification
- **Shipment Management**: Create, track, and manage shipments
- **Real-time Cost Calculator**: Instant shipping cost estimation
- **Dashboard**: Personal overview of shipments and statistics
- **Shipment Tracking**: Track shipment status and history

### Admin Features
- **User Management**: View, activate/deactivate user accounts
- **Shipment Oversight**: Monitor and update all shipments
- **Country Management**: Add and configure shipping destinations
- **Analytics Dashboard**: System-wide statistics and reporting
- **Audit Logging**: Track administrative actions

## 🛠 Tech Stack

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **Sequelize**: ORM for database operations
- **PostgreSQL**: Primary database (via Railway)
- **Railway**: Database hosting and deployment platform
- **JWT**: Authentication tokens
- **bcrypt**: Password encryption
- **Nodemailer**: Email services

### Frontend
- **React 18**: Frontend framework
- **React Router**: Client-side routing
- **Axios**: HTTP client
- **CSS3**: Modern responsive styling
- **Local Storage**: Client-side session management

### Development Tools
- **VS Code**: IDE with configured tasks and debugging
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **Git**: Version control

## 📁 Project Structure

```
Boxinator_Siter/
├── Backend/                    # Node.js/Express backend
│   ├── config/
│   │   └── database.js         # Database configuration
│   ├── controllers/            # Route controllers
│   │   ├── authController.js
│   │   ├── shipmentController.js
│   │   ├── userController.js
│   │   └── adminController.js
│   ├── middleware/             # Custom middleware
│   │   ├── authMiddleware.js
│   │   ├── errorHandler.js
│   │   └── validateRequest.js
│   ├── models/                 # Sequelize models
│   │   ├── User.js
│   │   ├── Shipment.js
│   │   ├── Country.js
│   │   └── index.js
│   ├── routes/                 # API routes
│   │   ├── authRoutes.js
│   │   ├── shipmentRoutes.js
│   │   └── adminRoutes.js
│   ├── services/               # Business logic
│   │   ├── authService.js
│   │   ├── shipmentService.js
│   │   └── supabaseService.js
│   ├── utils/                  # Utilities
│   │   ├── logger.js
│   │   ├── validators.js
│   │   └── encryption.js
│   ├── .env                    # Environment variables
│   ├── package.json
│   └── server.js               # Entry point
├── Frontend/                   # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/         # React components
│   │   │   ├── Header.js
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── ShipmentForm.js
│   │   │   └── AdminDashboard.js
│   │   ├── services/
│   │   │   └── api.js          # API client
│   │   ├── App.js              # Main component
│   │   ├── App.css             # Styles
│   │   └── index.js            # Entry point
│   ├── .env                    # Environment variables
│   └── package.json
├── .vscode/
│   ├── tasks.json              # VS Code tasks
│   └── launch.json             # Debug configuration
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- PostgreSQL database (or Railway account)
- Git

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Boxinator_Siter
```

### 2. Backend Setup
```bash
cd Backend
npm install
```

Copy environment variables:
```bash
copy .env.example .env
```

Configure your `.env` file:
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/boxinator
# Railway provides DATABASE_URL automatically

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_REFRESH_SECRET=your_refresh_secret_key

# Email Configuration (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

Start the backend server:
```bash
npm start
```

The backend will run on `http://localhost:3000`

### 3. Frontend Setup
```bash
cd ../Frontend
npm install
```

Configure environment variables:
```bash
copy .env.example .env
```

Update `.env`:
```env
REACT_APP_API_URL=http://localhost:3000/api
REACT_APP_ENV=development
```

Start the frontend server:
```bash
npm start
```

The frontend will run on `http://localhost:3001`

### 4. Using VS Code Tasks

If using VS Code, you can use the configured tasks:

- **Ctrl+Shift+P** → "Tasks: Run Task"
- Select "Start Full Stack" to run both servers
- Or run individual tasks like "Start Backend Server"

## 🔧 Configuration

### Database Setup

#### Option 1: Railway (Recommended)
1. Create a new project at [railway.app](https://railway.app)
2. Add a PostgreSQL service to your project
3. Railway will automatically provide DATABASE_URL environment variable
4. Copy your Railway environment variables to your `.env` file
5. Run the application - Sequelize will create tables automatically

#### Option 2: Local PostgreSQL
1. Install PostgreSQL locally
2. Create a database named `boxinator`
3. Update `DATABASE_URL` in `.env`
4. Run the application - Sequelize will create tables automatically

### Email Configuration
For user registration emails, configure SMTP settings in `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password  # Use App Password for Gmail
```

## 🧪 Testing the Application

### 1. User Registration
- Go to `http://localhost:3001/register`
- Fill out the registration form
- Check your email for verification (if configured)

### 2. Create a Shipment
- Login to your account
- Navigate to "New Shipment"
- Fill out the shipment form
- See real-time cost calculation
- Submit the shipment

### 3. Admin Features
- Create an admin user in the database:
  ```sql
  UPDATE "Users" SET role = 'admin' WHERE email = 'your_email@example.com';
  ```
- Login and access `/admin`
- Manage users, shipments, and countries

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify-email/:token` - Email verification

### Shipments
- `GET /api/shipments` - Get user's shipments
- `POST /api/shipments` - Create new shipment
- `GET /api/shipments/:id` - Get specific shipment
- `PATCH /api/shipments/:id/status` - Update shipment status
- `POST /api/shipments/calculate-cost` - Calculate shipping cost

### Admin
- `GET /api/admin/overview` - Admin dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/shipments` - Get all shipments
- `POST /api/admin/countries` - Add new country
- `PATCH /api/admin/countries/:id` - Update country

### Countries
- `GET /api/countries` - Get available countries

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Password Encryption**: bcrypt hashing
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API request throttling
- **CORS Protection**: Cross-origin request security
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization

## 🚀 Deployment

### Backend Deployment
1. **Environment Variables**: Set production environment variables
2. **Database**: Ensure PostgreSQL/Railway is accessible
3. **Build**: No build step needed for Node.js
4. **Deploy**: Use services like Heroku, Railway, or DigitalOcean

### Frontend Deployment
1. **Build**: Run `npm run build` in Frontend directory
2. **Static Hosting**: Deploy to Netlify, Vercel, or similar
3. **Environment**: Update `REACT_APP_API_URL` for production

### Docker Deployment (Optional)
```bash
# Backend
cd Backend
docker build -t boxinator-backend .
docker run -p 3000:3000 boxinator-backend

# Frontend
cd Frontend
docker build -t boxinator-frontend .
docker run -p 3001:80 boxinator-frontend
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify connection string in `.env`
   - Check firewall settings

2. **CORS Errors**
   - Ensure backend CORS is configured for frontend URL
   - Check `FRONTEND_URL` in backend `.env`

3. **JWT Token Issues**
   - Clear browser localStorage
   - Check JWT_SECRET in `.env`
   - Verify token expiration settings

4. **Email Not Sending**
   - Check SMTP configuration
   - Verify email credentials
   - Check spam folder

### Debug Mode

Enable detailed logging:
```env
# Backend
LOG_LEVEL=debug
NODE_ENV=development

# Frontend
REACT_APP_DEBUG=true
```

## 📝 Development

### Adding New Features

1. **Backend**: Add routes in `routes/`, controllers in `controllers/`, and models in `models/`
2. **Frontend**: Add components in `components/` and update routing in `App.js`
3. **Database**: Create migrations for schema changes
4. **API**: Update API client in `Frontend/src/services/api.js`

### Code Style

- Follow existing code patterns
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Run tests: `npm test`
5. Commit changes: `git commit -am 'Add feature'`
6. Push to branch: `git push origin feature-name`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the troubleshooting section
- Review the API documentation

---

**Happy Shipping with Boxinator! 📦**
