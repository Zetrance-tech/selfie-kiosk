import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Camera, Home, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode.react';

// In-memory storage for temporary photo data (FRONTEND ONLY)
const photoStorage = new Map<string, string>();

// Exported functions to interact with photoStorage (FRONTEND ONLY)
export function getPhoto(id: string): string | undefined {
  return photoStorage.get(id);
}

export function setPhoto(id: string, data: string) {
  photoStorage.set(id, data);
}

export function deletePhoto(id: string) {
  photoStorage.delete(id);
}

const PhotoPage = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [photoId, setPhotoId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showQRCode, setShowQRCode] = useState<boolean>(false); // State for QR code modal
  const navigate = useNavigate();

  // Request access to the webcam
  useEffect(() => {
    const startVideoStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1080 },
            height: { ideal: 1920 },
            facingMode: 'user',
            aspectRatio: 9 / 16,
          },
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
        toast.error('Failed to access webcam');
      }
    };

    startVideoStream();

    // Cleanup stream on component unmount
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const startCountdown = () => {
    setCountdown(10);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          capture();
          return null;
        }
        return prev ? prev - 1 : null;
      });
    }, 1000);
  };

  const uploadImage = async () => {
    const base64String = localStorage.getItem('image');
    const filename = 'my-image.png';
    try {
      const response = await fetch('https://selfiekiosk-1.onrender.com/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64String, filename }),
      });
      const data = await response.json();
      console.log('Image uploaded:', data);
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('Failed to upload image');
    }
  };

  const capture = useCallback(() => {
    if (canvasRef.current && videoRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        const isPortrait = window.innerHeight > window.innerWidth;

        // Set canvas dimensions to match video feed
        if (isPortrait) {
          canvas.width = video.videoHeight;
          canvas.height = video.videoWidth;
        } else {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        // Save the context state
        context.save();

        // Apply transformations to match video feed orientation
        if (isPortrait) {
          context.translate(canvas.width, 0);
          context.rotate(90 * Math.PI / 180);
          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        } else {
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
        }

        // Restore context to remove rotation for watermark
        context.restore();

        // Load and draw the watermark
        const watermark = new Image();
        watermark.src = '/images/udb.png';

        watermark.onload = () => {
          // Scale watermark to fit canvas while preserving aspect ratio
          let watermarkWidth = canvas.width;
          let watermarkHeight = (watermark.height / watermark.width) * watermarkWidth;

          if (watermarkHeight > canvas.height) {
            watermarkHeight = canvas.height;
            watermarkWidth = (watermark.width / watermark.height) * watermarkHeight;
          }

          // Position watermark to cover the entire canvas
          const watermarkX = (canvas.width - watermarkWidth) / 2;
          const watermarkY = (canvas.height - watermarkHeight) / 2;

          context.save();
          context.translate(canvas.width / 2, canvas.height / 2);
          context.rotate(180 * Math.PI / 180);
          context.translate(-canvas.width / 2, -canvas.height / 2);

          context.translate(watermarkX + watermarkWidth / 2, watermarkY + watermarkHeight / 2);
          context.rotate(-90 * Math.PI / 180);
          context.translate(-watermarkWidth / 2, -watermarkHeight / 2);

          context.globalAlpha = 0.7;
          context.drawImage(watermark, 0, 0, watermarkWidth, watermarkHeight);
          context.globalAlpha = 1.0;
          context.restore();

          // Generate the image data URL
          const imageSrc = canvas.toDataURL('image/jpeg');
          const id = uuidv4();
          localStorage.setItem('image', imageSrc);
          uploadImage();
          setPhoto(id, imageSrc);
          setPhotoId(id);
        };

        watermark.onerror = () => {
          console.error('Failed to load watermark at:', watermark.src);
          toast.error('Failed to load watermark. Using fallback.');

          context.save();
          context.translate(canvas.width / 2, canvas.height / 2);
          context.rotate(180 * Math.PI / 180);
          context.translate(-canvas.width / 2, -canvas.height / 2);

          const text = 'Selfie Kiosk';
          context.font = '40px Arial';
          context.fillStyle = 'rgba(255, 255, 255, 0.7)';
          context.textAlign = 'center';

          const textX = canvas.width / 2;
          const textY = canvas.height / 2;
          context.translate(textX, textY);
          context.rotate(-90 * Math.PI / 180);
          context.fillText(text, 0, 0);

          context.restore();

          const imageSrc = canvas.toDataURL('image/jpeg');
          const id = uuidv4();
          localStorage.setItem('image', imageSrc);
          uploadImage();
          setPhoto(id, imageSrc);
          setPhotoId(id);
        };
      }
    }
  }, []);

  // Generate a downloadable URL for the QR code
  const getDownloadUrl = () => {
    if (photoId) {
      const imageSrc = getPhoto(photoId);
      if (imageSrc) {
        // Using data URL for simplicity; ideally, use a backend-provided URL
        return imageSrc;
      }
    }
    return '';
  };

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center bg-cover bg-center"
      style={{ backgroundImage: `url('/images/background.jpg')` }}
    >
      <div className="relative z-10 container mx-auto px-4 w-full h-full flex flex-col justify-center items-center">
        <Link to="/" className="flex items-center justify-center gap-2 py-8">
          <img src="/images/logob.png" className="w-auto h-auto" alt="Logo" />
        </Link>

        <div className="max-w-3xl w-full">
          {!photoId ? (
            <div className="space-y-6 flex flex-col items-center justify-center">
              {!countdown && (
                <p className="text-amber-300 text-3xl font-semibold animate-pulse mb-4">
                  Look into the camera and smile!
                </p>
              )}
              <div className="w-full h-[70vh] flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full rounded-lg absolute"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '90vh',
                    objectFit: 'cover',
                    transform: 'scaleX(1) rotate(-90deg)',
                    transformOrigin: 'center',
                  }}
                />
                {countdown && (
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-32 h-32 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center">
                      <div className="text-6xl text-amber-300 font-bold animate-pulse">
                        {countdown}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-center w-full">
                {!countdown && (
                  <button
                    onClick={startCountdown}
                    className="flex items-center gap-4 px-12 py-6 bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg text-black text-2xl font-semibold hover:from-amber-500 hover:to-amber-300 transition-all duration-300"
                  >
                    <Camera className="w-auto h-auto" />
                    Take Photo
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="w-full space-y-6 flex flex-col items-center justify-center">
              <div className="w-full overflow-hidden rounded-lg shadow-xl border-4 border-amber-400 border-dashed">
                <img
                  src={getPhoto(photoId)}
                  alt="Captured Thumbnail"
                  className="w-full rounded-lg cursor-pointer"
                  style={{
                    maxHeight: '60vh',
                    objectFit: 'contain',
                    transform: 'rotate(180deg)',
                    width: '100%',
                    height: 'auto',
                  }}
                  onClick={() => setShowQRCode(true)} // Show QR code on click
                />
              </div>

              <div className="flex justify-center gap-8 mt-4">
                <button
                  onClick={() => navigate('/')}
                  className="flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg text-black text-xl font-semibold hover:from-amber-500 hover:to-amber-300 transition-all duration-300"
                >
                  <Home className="w-6 h-6" />
                </button>
                <button
                  onClick={() => {
                    if (photoId) {
                      deletePhoto(photoId);
                    }
                    setPhotoId(null);
                    window.location.reload();
                  }}
                  className="flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg text-black text-xl font-semibold hover:from-amber-500 hover:to-amber-300 transition-all duration-300"
                >
                  <RefreshCcw className="w-6 h-6" />
                  Retake
                </button>
                <button
                  onClick={() => {
                    navigate('/form');
                  }}
                  className="flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-400 rounded-lg text-black text-xl font-semibold hover:from-amber-500 hover:to-amber-300 transition-all duration-300"
                >
                  Download
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* QR Code Modal */}
      {showQRCode && photoId && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg flex flex-col items-center relative">
            <h2 className="text-2xl font-semibold mb-4 text-black">Scan to Download</h2>
            <QRCode
              value={getDownloadUrl()}
              size={256}
              level="H"
              includeMargin={true}
            />
            <p className="mt-4 text-gray-600">Scan the QR code to download your photo.</p>
            <button
              onClick={() => setShowQRCode(false)}
              className="mt-6 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-all duration-300"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoPage;