'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, Upload } from 'lucide-react';
import { Button } from '@/components/Button';

// Live in-page camera capture using getUserMedia (activates the device camera
// with a preview + shutter). Requires a secure context (HTTPS / localhost) —
// works on the Vercel domain and iPhone Safari. Falls back to a file input if
// the camera is unavailable or permission is denied.

export function CameraCapture({
  facingMode,
  onCapture,
  captureLabel = 'Capture',
  startLabel = 'Open camera',
}: {
  facingMode: 'user' | 'environment';
  onCapture: (dataUrl: string) => void;
  captureLabel?: string;
  startLabel?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function stop() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setActive(false);
  }

  // Always release the camera when this component unmounts.
  useEffect(() => () => stop(), []);

  async function start() {
    setError(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('This browser can’t open the camera. Use “Upload instead”.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false,
      });
      streamRef.current = stream;
      setActive(true);
      // Attach after render so the <video> exists.
      requestAnimationFrame(async () => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          try {
            await videoRef.current.play();
          } catch {
            /* iOS resolves play() after the gesture; ignore */
          }
        }
      });
    } catch {
      setError('Camera access was blocked. Allow camera access or use “Upload instead”.');
    }
  }

  function capture() {
    const v = videoRef.current;
    if (!v || !v.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = v.videoWidth;
    canvas.height = v.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL('image/jpeg', 0.9);
    stop();
    onCapture(url);
  }

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const r = new FileReader();
    r.onload = () => onCapture(r.result as string);
    r.readAsDataURL(file);
  }

  return (
    <div className="space-y-3">
      {active && (
        <div className="overflow-hidden rounded-rac bg-black">
          {/* playsInline + muted are required for iOS to preview inline. */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-auto w-full"
            style={facingMode === 'user' ? { transform: 'scaleX(-1)' } : undefined}
          />
        </div>
      )}

      {!active ? (
        <Button variant="primary" fullWidth onClick={start} className="h-12">
          <span className="inline-flex items-center gap-2">
            <Camera className="h-5 w-5" /> {startLabel}
          </span>
        </Button>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={() => { stop(); start(); }} className="h-12">
            <span className="inline-flex items-center gap-2">
              <RefreshCw className="h-4 w-4" /> Restart
            </span>
          </Button>
          <Button variant="primary" onClick={capture} className="h-12">
            {captureLabel}
          </Button>
        </div>
      )}

      {error && <p className="text-xs text-rac-red">{error}</p>}

      <label className="flex cursor-pointer items-center justify-center gap-2 text-xs text-rac-blue hover:underline">
        <Upload className="h-3.5 w-3.5" />
        Upload instead
        <input
          type="file"
          accept="image/*"
          capture={facingMode}
          onChange={onFile}
          className="hidden"
        />
      </label>
    </div>
  );
}
