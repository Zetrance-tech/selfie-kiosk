import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col justify-end items-center relative overflow-hidden">
      {/* Fullscreen Video Background */}
      <video
        autoPlay
        loop
        muted
        className="absolute top-0 left-0 w-full h-full object-cover"
      >
        <source src="/images/video.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Content Positioned 25% Above Bottom */}
      <div className="relative z-10 flex flex-col items-center w-full mb-[32%]">
        
        
        {/* <button
          onClick={() => navigate('/form')}
          className="w-full max-w-md px-12 py-6 bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg text-black text-3xl font-semibold hover:from-amber-500 hover:to-amber-300 transition-all duration-300 shadow-lg"
        >
          Take Your Photo
        </button> */}

        {/* new change */}
        <button
          onClick={() => navigate('/photo')}
          className="w-full max-w-md px-12 py-6 bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg text-black text-3xl font-semibold hover:from-amber-500 hover:to-amber-300 transition-all duration-300 shadow-lg"
        >
          Take Your Photo
        </button>
      </div>
    </div>
  );
};

export default HomePage;
