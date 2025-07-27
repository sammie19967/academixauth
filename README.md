# AcademixAuth - Authentication & User Management System

A modern authentication and user management system built with Next.js, Firebase, and MongoDB. Features include role-based access control, user management, and secure authentication flows.

## 🚀 Features

- 🔐 Firebase Authentication (Email/Password, Phone, Google)
- 👥 Role-based access control (Admin/User)
- 📱 Responsive design with Tailwind CSS
- 🔄 Real-time data updates
- 📊 Admin dashboard for user management
- 🔄 Automatic session management
- 🔄 Secure API routes with JWT verification

## 🛠 Tech Stack

- **Frontend**: Next.js 13+ (App Router)
- **Authentication**: Firebase Authentication
- **Database**: MongoDB with Mongoose
- **Styling**: Tailwind CSS
- **UI Components**: React Icons
- **Form Handling**: React Hook Form
- **State Management**: React Context API

## 📂 Project Structure

```
.
├── app/                    # Next.js app directory
│   ├── api/                # API routes
│   ├── auth/               # Authentication pages
│   │   ├── admin/          # Admin dashboard
│   │   └── login/          # Login pages
│   └── dashboard/          # User dashboard
├── lib/                    # Utility functions
├── middleware/             # Authentication middleware
├── models/                 # Database models
└── public/                 # Static files
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16.14.0 or later
- MongoDB Atlas account
- Firebase project
- Git

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/academixauth.git
   cd academixauth
   ```

2. Install dependencies
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables
   Create a `.env.local` file in the root directory and add:
   ```env
   # Firebase
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   
   # MongoDB
   MONGODB_URI=your_mongodb_uri
   
   # Firebase Admin
   FIREBASE_ADMIN_CLIENT_EMAIL=your_admin_email
   FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
   ```

4. Run the development server
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🔒 Authentication Flows

### User Registration
1. Navigate to `/auth/register`
2. Fill in the registration form
3. Verify email (if enabled)
4. Redirect to dashboard

### Admin Login
1. Navigate to `/auth/admin/login`
2. Enter admin credentials
3. Access admin dashboard

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/session` - Get current session

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users?uid={uid}` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users` - Update user
- `DELETE /api/users?uid={uid}` - Delete user (soft delete)

### Admin
- `GET /api/users/verify-admin` - Verify admin status
- `GET /api/users/all` - Get all users with details (Admin only)

## 🛡️ Security

- JWT token-based authentication
- Role-based access control
- Input validation on all forms
- Secure password hashing
- CSRF protection
- Rate limiting on auth endpoints

## 📦 Dependencies

### Main Dependencies
- `next`: 13.4.0+
- `react`: 18.2.0
- `firebase`: ^10.0.0
- `mongodb`: ^5.0.0
- `mongoose`: ^7.0.0
- `tailwindcss`: ^3.0.0
- `react-icons`: ^4.0.0

### Dev Dependencies
- `eslint`: ^8.0.0
- `prettier`: ^3.0.0
- `typescript`: ^5.0.0

## 🚀 Deployment

### Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyourusername%2Facademixauth&env=NEXT_PUBLIC_FIREBASE_API_KEY,NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,NEXT_PUBLIC_FIREBASE_PROJECT_ID,NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,NEXT_PUBLIC_FIREBASE_APP_ID,MONGODB_URI,FIREBASE_ADMIN_CLIENT_EMAIL,FIREBASE_ADMIN_PRIVATE_KEY&project-name=academixauth&repository-name=academixauth)

### Manual Deployment
1. Build the application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js Documentation](https://nextjs.org/docs)
- [Firebase Documentation](https://firebase.google.com/docs)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
