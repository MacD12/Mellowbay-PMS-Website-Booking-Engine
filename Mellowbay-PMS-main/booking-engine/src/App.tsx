import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Rooms } from './pages/Rooms';
import { EatAndWork } from './pages/EatAndWork';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { Book } from './pages/Book';
import { Register } from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Outside the Layout on purpose: the guest opens this by scanning a
            code at the desk, and a site header inviting them to browse rooms
            is the last thing that moment needs. */}
        <Route path="/register/:token" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/eat-and-work" element={<EatAndWork />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/book" element={<Book />} />
          {/* The two pages these replaced, kept so old links still resolve */}
          <Route path="/restaurant" element={<Navigate to="/eat-and-work#eat" replace />} />
          <Route path="/coworking" element={<Navigate to="/eat-and-work#work" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
