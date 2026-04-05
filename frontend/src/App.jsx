import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from './lib/theme.jsx';
import AppShell from './components/AppShell.jsx';
import Home from './pages/Home.jsx';
import CreateListing from './pages/CreateListing.jsx';
import ListingDetails from './pages/ListingDetails.jsx';
import Login from './pages/Login.jsx';
import SignUp from './pages/SignUp.jsx';
import MyBookings from './pages/MyBookings.jsx';
import BecomeHost from './pages/BecomeHost.jsx';
import HostListings from './pages/HostListings.jsx';

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppShell />}>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/listings/new" element={<CreateListing />} />
            <Route path="/host/listings/:listingId/edit" element={<CreateListing />} />
            <Route path="/listings/:listingId" element={<ListingDetails />} />
            <Route path="/bookings" element={<MyBookings />} />
            <Route path="/become-host" element={<BecomeHost />} />
            <Route path="/host/listings" element={<HostListings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
