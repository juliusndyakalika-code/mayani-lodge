import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AdminGuard } from './components/AdminGuard';
import { Home } from './pages/Home';
import { Rooms } from './pages/Rooms';
import { RoomDetail } from './pages/RoomDetail';
import { Booking } from './pages/Booking';
import { Confirmation } from './pages/Confirmation';
import { MyBookings } from './pages/MyBookings';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminLayout } from './pages/admin/AdminLayout';
import { Dashboard } from './pages/admin/Dashboard';
import { AdminBookings } from './pages/admin/AdminBookings';
import { AdminRooms } from './pages/admin/AdminRooms';

const NO_SHELL = ['/login', '/register', '/admin'];

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

function AppContent() {
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');
  const hideShell = NO_SHELL.some((p) => pathname.startsWith(p));

  return (
    <div className="flex flex-col min-h-screen">
      {!hideShell && <Navbar />}
      <main className="flex-1">
        <Routes>
          {/* Public */}
          <Route path="/"                  element={<Home />} />
          <Route path="/rooms"             element={<Rooms />} />
          <Route path="/rooms/:id"         element={<RoomDetail />} />
          <Route path="/booking"           element={<Booking />} />
          <Route path="/confirmation/:id"  element={<Confirmation />} />
          <Route path="/my-bookings"       element={<MyBookings />} />
          <Route path="/login"             element={<Login />} />
          <Route path="/register"          element={<Register />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminGuard><AdminLayout /></AdminGuard>}>
            <Route index              element={<Dashboard />} />
            <Route path="bookings"    element={<AdminBookings />} />
            <Route path="rooms"       element={<AdminRooms />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!hideShell && <Footer />}
    </div>
  );
}
