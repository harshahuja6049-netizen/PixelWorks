import { useRef, useState, useEffect } from 'react';

const CLOUD_NAME = 'dfjenftih'; // Replace with your Cloudinary cloud name
const UPLOAD_PRESET = 'pixelworks_orders'; // The unsigned preset you created

export default function Camera({ onPhotoCaptured }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    async function startCamera() {
      let mediaStream;
      try {
        // Prefer the back camera on phones.
        // Some browsers reject `exact`, so we fall back to `ideal`, then finally to any camera.
        try {
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: { exact: 'environment' } },
            audio: false,
          });
        } catch {
          try {
            mediaStream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: { ideal: 'environment' } },
              audio: false,
            });
          } catch {
            mediaStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          }
        }

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setError('');
      } catch (err) {
        setError('Could not access camera. Please allow camera permissions.');
      }

      return () => {
        if (mediaStream) {
          mediaStream.getTracks().forEach((track) => track.stop());
        }
      };
    }
    let cleanup = null;
    startCamera().then((fn) => {
      cleanup = fn;
    });

    return () => {
      if (cleanup) cleanup();
    };
  }, []);

  const capturePhoto = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', blob, 'photo.jpg');
      formData.append('upload_preset', UPLOAD_PRESET);

      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data.secure_url) {
          onPhotoCaptured(data.secure_url);
        } else {
          alert('Upload failed');
        }
      } catch (err) {
        alert('Upload error');
      } finally {
        setUploading(false);
      }
    }, 'image/jpeg', 0.8);
  };

  return (
    <div className="my-4">
      <label className="block font-semibold mb-2">Take Photos (max 7)</label>
      <div className="relative bg-black rounded overflow-hidden">
        <video ref={videoRef} autoPlay playsInline className="w-full h-auto max-h-[300px] object-cover" />
      </div>
      <canvas ref={canvasRef} className="hidden" />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      <button
        type="button"
        onClick={capturePhoto}
        disabled={uploading}
        className="mt-2 bg-green-500 text-white px-4 py-2 rounded w-full disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Capture Photo'}
      </button>
    </div>
  );
}