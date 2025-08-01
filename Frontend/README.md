# Boxinator Frontend

A React-based frontend application for the Boxinator shipping management system.

## Features

- **User Authentication**: Login, registration, and user management
- **Shipment Management**: Create, track, and manage shipments
- **Cost Calculator**: Real-time shipping cost calculation
- **Admin Dashboard**: Administrative controls for users, shipments, and countries
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Dynamic status updates and notifications

## Tech Stack

- **React 18**: Frontend framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API requests
- **CSS3**: Modern styling with flexbox and grid
- **Local Storage**: Client-side session management

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Running backend server (see Backend README)

### Installation

1. Clone the repository and navigate to the frontend directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy the environment variables:
   ```bash
   copy .env.example .env
   ```

4. Update the `.env` file with your configuration:
   ```env
   REACT_APP_API_URL=http://localhost:3000/api
   REACT_APP_ENV=development
   REACT_APP_DEBUG=true
   ```

5. Start the development server:
   ```bash
   npm start
   ```

The application will open at `http://localhost:3001` (or the next available port).

## Project Structure

```
Frontend/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/         # React components
│   │   ├── Header.js       # Navigation header
│   │   ├── Login.js        # Login form
│   │   ├── Register.js     # Registration form
│   │   ├── Dashboard.js    # User dashboard
│   │   ├── ShipmentForm.js # Create shipment
│   │   ├── ShipmentList.js # List shipments
│   │   └── AdminDashboard.js # Admin interface
│   ├── services/
│   │   └── api.js          # API client and endpoints
│   ├── App.js              # Main application component
│   ├── App.css             # Application styles
│   └── index.js            # Application entry point
├── .env                    # Environment variables
├── .env.example            # Environment template
├── package.json            # Dependencies and scripts
└── README.md               # This file
```

## Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App

## API Integration

The frontend communicates with the backend through RESTful APIs:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Shipments
- `GET /api/shipments` - Get user shipments
- `POST /api/shipments` - Create new shipment
- `PATCH /api/shipments/:id/status` - Update shipment status
- `POST /api/shipments/calculate-cost` - Calculate shipping cost

### Admin
- `GET /api/admin/overview` - Get admin statistics
- `GET /api/admin/users` - Get all users
- `GET /api/admin/shipments` - Get all shipments
- `POST /api/admin/countries` - Add new country

## Features Overview

### User Features
- **Registration & Login**: Secure user authentication
- **Dashboard**: Overview of shipments and statistics
- **Create Shipment**: Form with real-time cost calculation
- **Track Shipments**: View shipment status and history
- **Profile Management**: Update user information

### Admin Features
- **User Management**: View, activate/deactivate users
- **Shipment Management**: View and update all shipments
- **Country Management**: Add and update shipping countries
- **Analytics**: Overview statistics and reporting

## Styling

The application uses modern CSS with:
- **CSS Grid & Flexbox**: Responsive layouts
- **CSS Variables**: Consistent theming
- **Animations**: Smooth transitions and loading states
- **Mobile-First Design**: Responsive across all devices

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_API_URL` | Backend API URL | `http://localhost:3000/api` |
| `REACT_APP_ENV` | Environment | `development` |
| `REACT_APP_DEBUG` | Debug mode | `true` |

## Deployment

### Build for Production

```bash
npm run build
```

This creates a `build` folder with optimized production files.

### Deploy to Hosting Service

The built files can be deployed to any static hosting service:
- **Netlify**: Drag and drop the `build` folder
- **Vercel**: Connect your Git repository
- **Firebase Hosting**: Use Firebase CLI
- **AWS S3**: Upload to S3 bucket with static hosting

### Environment Configuration

For production deployment, update your `.env` file:

```env
REACT_APP_API_URL=https://yourdomain.com/api
REACT_APP_ENV=production
REACT_APP_DEBUG=false
```

## Troubleshooting

### Common Issues

1. **API Connection Errors**
   - Ensure backend server is running
   - Check `REACT_APP_API_URL` in `.env`
   - Verify CORS settings in backend

2. **Login/Authentication Issues**
   - Clear browser local storage
   - Check token expiration
   - Verify backend authentication endpoints

3. **Build Errors**
   - Delete `node_modules` and run `npm install`
   - Check for missing dependencies
   - Ensure all imports are correct

### Debug Mode

Enable debug mode in `.env`:
```env
REACT_APP_DEBUG=true
```

This will show additional console logging for API requests and responses.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.
