import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode.react';

const DownloadPage = () => {
  const { id } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [imageURL, setImageURL] = useState("");
  const navigate = useNavigate(); // used for navigation

  useEffect(() => {
    const publicImageURL = "https://selfiekiosk-1.onrender.com/image/my-image.png";
    setImageURL(publicImageURL);
    setIsLoading(false);
  }, []);

  if (!imageURL && !isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center" style={{ backgroundImage: `url('/images/background.jpg')` }}>
        <div className="relative z-10 text-amber-300">
          <h1 className="text-3xl font-bold mb-4">Photo Not Found</h1>
          <p className="text-lg">The link is invalid or the photo no longer exists.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {isLoading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-amber-500"></div>
        </div>
      ) : (
        <div className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center" style={{ backgroundImage: `url('/images/background.jpg')` }}>
          <div className="relative z-10 flex flex-col items-center text-center">
            <h1 className="text-3xl font-bold mb-8 text-amber-300">Scan QR to Download Your Photo</h1>
            <QRCode
              value={imageURL}
              size={256}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin={true}
            />
            <p className="mt-6 text-white text-lg">Scan this QR code to download your photo</p>

            <button
              onClick={() => navigate('/')} // navigate to home
              className="mt-8 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg text-black text-lg font-semibold hover:from-amber-500 hover:to-amber-300 transition-all duration-300"
            >
              Home
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DownloadPage;