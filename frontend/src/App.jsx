import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell.jsx';
import Home from './pages/Home.jsx';
import CreateListing from './pages/CreateListing.jsx';
import ListingDetails from './pages/ListingDetails.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/listings/new" element={<CreateListing />} />
          <Route path="/listings/:listingId" element={<ListingDetails />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
