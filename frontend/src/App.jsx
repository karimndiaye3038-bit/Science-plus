import { useEffect } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import PublicLayout from './layouts/PublicLayout'
import DashboardLayout from './layouts/DashboardLayout'

import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Courses from './pages/Courses'
import CourseDetail from './pages/CourseDetail'
import Learn from './pages/Learn'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'

import StudentDashboard from './pages/student/StudentDashboard'
import StudentPayments from './pages/student/StudentPayments'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminCourses from './pages/admin/AdminCourses'
import CourseForm from './pages/admin/CourseForm'
import AdminStudents from './pages/admin/AdminStudents'
import AdminPayments from './pages/admin/AdminPayments'
import AdminReports from './pages/admin/AdminReports'

// Remonte en haut à chaque changement de page (ou va vers #ancre)
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 50)
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname, hash])
  return null
}

export default function App() {
  return (
    <>
      <ScrollManager />
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/cours" element={<Courses />} />
          <Route path="/cours/:id" element={<CourseDetail />} />
          <Route path="/cours/:id/apprendre" element={<ProtectedRoute><Learn /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Route>
{/* route coneexion et inscription======= */}
 <Route path="/connexion" element={<Login />} />
  <Route path="/inscription" element={<Register />} />
        <Route path="/admin" element={<ProtectedRoute role="admin"><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="cours" element={<AdminCourses />} />
          <Route path="cours/nouveau" element={<CourseForm />} />
          <Route path="cours/:id" element={<CourseForm />} />
          <Route path="eleves" element={<AdminStudents />} />
          <Route path="paiements" element={<AdminPayments />} />
          <Route path="rapports" element={<AdminReports />} />
          <Route path="parametres" element={<Profile />} />
        </Route>

        <Route path="/eleve" element={<ProtectedRoute role="eleve"><DashboardLayout /></ProtectedRoute>}>
          <Route index element={<StudentDashboard />} />
          <Route path="paiements" element={<StudentPayments />} />
          <Route path="profil" element={<Profile />} />
        </Route>
      </Routes>
    </>
  )
}
