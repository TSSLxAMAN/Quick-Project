# Django React Authentication Boilerplate

A production-ready authentication boilerplate with Django (REST Framework) backend and React (Vite) frontend, featuring JWT authentication and role-based access control.

## 🚀 Features

- **JWT Authentication** - Secure token-based authentication with access & refresh tokens
- **User Registration & Login** - Complete authentication flow
- **Password Management** - Change password and reset password functionality
- **Role-Based Access Control** - Three user roles: Admin, Manager, User
- **Role-Based Dashboards** - Different dashboard views based on user role
- **Protected Routes** - Frontend route protection with role validation
- **Modern UI** - Beautiful Tailwind CSS design
- **Auto Token Refresh** - Automatic JWT token refresh on expiry
- **PostgreSQL Database** - Production-ready database setup

## 📁 Project Structure

```
django-react-auth-boilerplate/
├── backend/                 # Django REST API
│   ├── config/             # Django settings
│   ├── users/              # User app with custom model
│   ├── manage.py
│   ├── requirements.txt
│   └── .env                # Environment variables
├── frontend/               # React (Vite) application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── utils/         # Utilities and context
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env               # Environment variables
└── README.md
```

## 🛠️ Tech Stack

### Backend
- Django 5.x
- Django REST Framework
- dj-rest-auth
- djangorestframework-simplejwt
- PostgreSQL
- django-cors-headers

### Frontend
- React 18
- Vite
- React Router v6
- Axios
- Tailwind CSS
- jwt-decode

## 📋 Prerequisites

- Python 3.10+
- Node.js 16+
- PostgreSQL 12+

## ⚡ Quick Start

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd django-react-auth-boilerplate
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file and add:
SECRET_KEY=your-secret-key
DEBUG=True
DB_NAME=django_react_auth
DB_USER=django_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1

# Create PostgreSQL database
psql -U postgres
CREATE DATABASE django_react_auth;
CREATE USER django_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE django_react_auth TO django_user;
\q

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run server
python manage.py runserver
```

Backend will be available at: `http://127.0.0.1:8000`

### 3. Frontend Setup

```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/login/` - Login (returns JWT tokens)
- `POST /api/auth/logout/` - Logout
- `POST /api/auth/registration/` - Register new user
- `POST /api/auth/password/change/` - Change password (authenticated)
- `POST /api/auth/password/reset/` - Request password reset
- `POST /api/auth/password/reset/confirm/` - Confirm password reset
- `POST /api/auth/token/refresh/` - Refresh JWT token

### User
- `GET /api/users/profile/` - Get user profile (authenticated)
- `GET /api/users/dashboard/` - Get role-based dashboard data (authenticated)

## 👥 User Roles

### ADMIN
- Full system access
- Manage users
- View all reports
- System settings

### MANAGER
- View reports
- Manage team
- Limited administrative access

### USER
- View own profile
- Update own profile
- Basic user permissions

## 🎨 Frontend Routes

- `/` - Home page
- `/login` - Login page
- `/register` - Registration page
- `/dashboard` - Role-based dashboard (protected)
- `/profile` - User profile (protected)
- `/change-password` - Change password (protected)
- `/unauthorized` - Unauthorized access page
- `*` - 404 Not Found page

## 🔒 Role-Based Route Protection

Example of protecting routes by role:

```jsx
<Route
  path="/admin"
  element={
    <ProtectedRoute allowedRoles={['ADMIN']}>
      <AdminPage />
    </ProtectedRoute>
  }
/>
```

## 🧪 Testing

### Test User Registration
1. Go to `/register`
2. Fill in the form
3. Submit and verify email is sent (if email is configured)

### Test Login
1. Go to `/login`
2. Login with credentials
3. Verify JWT tokens are stored in localStorage
4. Verify redirect to dashboard

### Test Protected Routes
1. Try accessing `/dashboard` without login
2. Should redirect to `/login`
3. Login and verify access granted

### Test Role-Based Access
1. Login as different role users
2. Verify different dashboard content
3. Try accessing unauthorized routes

## 🚀 Production Deployment

### Backend
1. Set `DEBUG=False` in `.env`
2. Update `ALLOWED_HOSTS` with your domain
3. Configure email backend for password reset
4. Use production database credentials
5. Collect static files: `python manage.py collectstatic`
6. Use gunicorn/uwsgi for serving

### Frontend
1. Update API URL in `src/services/api.js`
2. Build production: `npm run build`
3. Serve the `dist` folder with nginx/apache

## 📝 Environment Variables

### Backend (.env)
```
SECRET_KEY=your-django-secret-key
DEBUG=False
DB_NAME=your_db_name
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=5432
ALLOWED_HOSTS=yourdomain.com
```

### Frontend (.env)
```
VITE_API_URL=https://your-api-domain.com/api
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Django REST Framework
- React
- Tailwind CSS
- dj-rest-auth

## 📧 Contact

Your Name - your.email@example.com

Project Link: [https://github.com/yourusername/django-react-auth-boilerplate](https://github.com/yourusername/django-react-auth-boilerplate)