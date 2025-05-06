import React from 'react';
    import { BrowserRouter, Routes, Route } from 'react-router-dom';
    import { Toaster } from 'react-hot-toast';
    import HomePage from './pages/HomePage';
    import FormPage from './pages/FormPage';
    import PhotoPage from './pages/PhotoPage';
    import DownloadPage from './pages/DownloadPage';

    function App() {
      return (
        <BrowserRouter>
          <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
            <Toaster position="top-center" />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/photo" element={<PhotoPage />} />
              <Route path="/form" element={<FormPage />} />
              <Route path="/download/:id" element={<DownloadPage />} />
            </Routes>
          </div>
        </BrowserRouter>
      );
    }

    export default App;
