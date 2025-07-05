import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import ProtectedRoute from './components/auth/ProtectedRoute'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import About from './pages/About'
import AdminDashboard from './pages/AdminDashboard'
import AllDestinations from './pages/AllDestinations'
import Book from './pages/Book'
import Bookings from './pages/Bookings'
import Contact from './pages/Contact'
import DestinationDetail from './pages/DestinationDetail'
import FAQ from './pages/FAQ'
import Home from './pages/Home'
import Login from './pages/Login'
import Payment from './pages/Payment'
import PaymentProcess from './pages/PaymentProcess'
import PaymentSuccess from './pages/PaymentSuccess'
import Privacy from './pages/Privacy'
import Profile from './pages/Profile'
import Register from './pages/Register'
import SearchResults from './pages/SearchResults'
import Terms from './pages/Terms'
import TicketLookup from './pages/TicketLookup'

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/destination/:id" element={<DestinationDetail />} />
          <Route path="/destinations" element={<AllDestinations />} />
          <Route path="/search-results" element={<SearchResults />} />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

          {/* Protected routes - User */}
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/bookings" element={<ProtectedRoute><Bookings /></ProtectedRoute>} />
          <Route path="/book" element={<ProtectedRoute><Book /></ProtectedRoute>} />
          <Route path="/payment" element={<ProtectedRoute><Payment /></ProtectedRoute>} />
          <Route path="/payment-process" element={<ProtectedRoute><PaymentProcess /></ProtectedRoute>} />
          <Route path="/payment-success" element={<ProtectedRoute><PaymentSuccess /></ProtectedRoute>} />
          <Route path="/ticket-lookup" element={<ProtectedRoute><TicketLookup /></ProtectedRoute>} />

          {/* Fallback route */}
          {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
        </Routes>
      </main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#22c55e',
              color: '#fff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
