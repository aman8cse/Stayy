import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './lib/theme.jsx';
import AppShell from './components/AppShell.jsx';
import Home from './pages/Home.jsx';
import CreateListing from './pages/CreateListing.jsx';
import ListingDetails from './pages/ListingDetails.jsx';
import Login from './pages/Login.jsx';
import SignUp from './pages/SignUp.jsx';
import VerifyOTP from './pages/VerifyOTP.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import MyBookings from './pages/MyBookings.jsx';
import BecomeHost from './pages/BecomeHost.jsx';
import HostListings from './pages/HostListings.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Bookings from './pages/Bookings.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/listings/new" element={<CreateListing />} />
            <Route path="/host/listings/:listingId/edit" element={<CreateListing />} />
            <Route path="/listings/:listingId" element={<ListingDetails />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/bookings/host" element={<Bookings />} />
            <Route path="/become-host" element={<BecomeHost />} />
            <Route path="/host/listings" element={<HostListings />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
