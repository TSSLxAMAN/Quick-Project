import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './utils/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact'
import Analyze from './pages/Analyze'
import AdminDashboard from './pages/Admin/AdminDashboard'
import TeachersDashboard from './pages/Teachers/TeachersDashboard'
import StudentDashboard from './pages/Students/StudentDashboard'
import MyClassStudent from './pages/Students/MyClass'
import RecentSubmit from './pages/Students/RecentSubmit'
import UpcomingSubmit from './pages/Students/UpcomingSubmit'
import UserDashboard from './pages/Users/UserDashboard'
import TeacherStatus from './pages/Admin/TeacherStatus'
import StudentStatus from './pages/Admin/StudentStatus';
import ChangePassword from './pages/ChangePassword';
import ResetPassword from './pages/ResetPassword';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm';
import EmailVerificationPending from './pages/EmailVerificationPending';
import EmailVerified from './pages/EmailVerified';
import EmailConfirmationHandler from './pages/EmailConfirmationHandler';
import Unauthorized from './pages/Unauthorized';
import College from './pages/Admin/College';
import Course from './pages/Admin/Course';
import NotFound from './pages/NotFound';
import CreateClass from './pages/Teachers/CreateClass';
import MyClass from './pages/Teachers/MyClass';
import StudentRequest from './pages/Teachers/StudentRequest';
import Assignments from './pages/Teachers/Assignments';
import Submission from './pages/Teachers/Submission';
import CreateQuiz from './pages/Teachers/CreateQuiz';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-password-confirm/:uid/:token" element={<ResetPasswordConfirm />} />
            <Route path="/email-verified" element={<EmailVerified />} />
            <Route
              path="/email-verified/:key"
              element={<EmailConfirmationHandler />}
            />
            <Route path="/email-verification-pending" element={<EmailVerificationPending />} />
            <Route path="/dashboard/unauthorized" element={<Unauthorized />} />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/adminDashboard"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/adminDashboard/teachersStatus"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <TeacherStatus />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/adminDashboard/studentsStatus"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <StudentStatus />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/adminDashboard/colleges"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <College />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/adminDashboard/courses"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <Course />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/userDashboard"
              element={
                <ProtectedRoute allowedRoles={['USER']}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/teacherDashboard"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <TeachersDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/teacherDashboard/myClass"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <MyClass />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/teacherDashboard/createClass"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <CreateClass />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/teacherDashboard/studentsRequests"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <StudentRequest />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/teacherDashboard/assignment"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <Assignments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/teacherDashboard/submission"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <Submission />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/teacherDashboard/createQuiz"
              element={
                <ProtectedRoute allowedRoles={['TEACHER']}>
                  <CreateQuiz />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/studentDashboard"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/studentDashboard/myClass"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <MyClassStudent />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/studentDashboard/recentSubmit"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <RecentSubmit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/studentDashboard/upcomingSubmit"
              element={
                <ProtectedRoute allowedRoles={['STUDENT']}>
                  <UpcomingSubmit />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/change-password"
              element={
                <ProtectedRoute>
                  <ChangePassword />
                </ProtectedRoute>
              }
            />


            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;