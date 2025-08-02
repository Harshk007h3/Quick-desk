# QuickDesk - Helpdesk Ticketing System

A lightweight helpdesk ticketing system built with Node.js, Express, and MongoDB.

## Features

- ✅ User authentication and authorization
- ✅ Ticket creation and management
- ✅ Dark/light theme toggle
- ✅ Password visibility toggle
- ✅ File upload support
- ✅ Real-time notifications
- ✅ Responsive design

## Quick Start

### Prerequisites

1. **Node.js** (v14 or higher)
2. **MongoDB** (running locally or MongoDB Atlas)
3. **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd quickdesk
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/quickdesk
   JWT_SECRET=your-secret-key-here-change-in-production
   NODE_ENV=development
   ```

4. **Set up test data**
   ```bash
   node test-setup.js
   ```
   This creates a test user and categories.

5. **Start the server**
   ```bash
   npm start
   ```
   or for development:
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open your browser and go to: `http://localhost:3000`

### Test Credentials

After running the setup script, you can login with:
- **Email**: `test@example.com`
- **Password**: `password123`

## Troubleshooting

### Ticket Creation Issues

If you're having trouble creating tickets:

1. **Check if the server is running**
   - Make sure MongoDB is running
   - Ensure the server is started with `npm start`

2. **Check authentication**
   - Make sure you're logged in
   - Check browser console for authentication errors

3. **Check network requests**
   - Open browser developer tools
   - Check the Network tab for failed requests
   - Look for any CORS or authentication errors

### Common Issues

1. **"Please login to create a ticket"**
   - You need to login first
   - Use the test credentials above

2. **"Failed to load categories"**
   - The backend server might not be running
   - Check if MongoDB is connected
   - Run the test setup script again

3. **"Server responded with status 500"**
   - Check server logs for detailed error messages
   - Ensure all dependencies are installed
   - Verify MongoDB connection

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/categories` - Get all categories
- `POST /api/tickets` - Create new ticket
- `GET /api/tickets` - Get all tickets

## File Structure

```
quickdesk/
├── server.js              # Main server file
├── package.json           # Dependencies
├── test-setup.js          # Test data setup
├── models/                # Database models
├── routes/                # API routes
├── middleware/            # Express middleware
├── js/                    # Frontend JavaScript
├── css/                   # Stylesheets
└── *.html                 # HTML pages
```

## Development

### Adding New Features

1. Create the backend route in `routes/`
2. Add the frontend JavaScript in `js/`
3. Update the HTML if needed
4. Test thoroughly

### Database Models

- **User**: Authentication and user management
- **Ticket**: Ticket creation and tracking
- **Category**: Ticket categories
- **Comment**: Ticket comments and updates

## Support

If you encounter any issues:

1. Check the browser console for errors
2. Check the server logs for backend errors
3. Ensure all prerequisites are installed
4. Verify MongoDB is running

## License

This project is licensed under the MIT License.
