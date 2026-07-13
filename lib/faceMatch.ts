'use client';

// face-api.js face match between the ID-document photo and a live selfie.
// Loaded from CDN at runtime (script injection) rather than bundled, because
// face-api.js references node-only modules (fs/node-fetch) that Turbopack
// won't bundle for the browser. If load/detection fails we degrade gracefully
// to a simulated score so the demo never dead-ends.

const FACEAPI_CDN = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.14/dist/face-api.js';
const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.14/model';
export const MATCH_THRESHOLD = 0.55; // 1 - distance; higher = more similar

interface FaceApiLike {
  nets: {
    ssdMobilenetv1: { loadFromUri: (u: string) => Promise<void> };
    faceLandmark68Net: { loadFromUri: (u: string) => Promise<void> };
    faceRecognitionNet: { loadFromUri: (u: string) => Promise<void> };
  };
  detectSingleFace: (el: HTMLImageElement) => {
    withFaceLandmarks: () => { withFaceDescriptor: () => Promise<{ descriptor: Float32Array } | undefined> };
  };
  euclideanDistance: (a: Float32Array, b: Float32Array) => number;
}

declare global {
  interface Window { faceapi?: FaceApiLike }
}

let modelsLoaded = false;

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.faceapi) return resolve();
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('face-api CDN load failed'));
    document.head.appendChild(s);
  });
}

async function ensureModels(): Promise<FaceApiLike> {
  await loadScript(FACEAPI_CDN);
  const faceapi = window.faceapi!;
  if (!modelsLoaded) {
    await Promise.all([
      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    modelsLoaded = true;
  }
  return faceapi;
}

function toImageEl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

export interface MatchResult {
  score: number;
  matched: boolean;
  simulated: boolean;
  noFace?: boolean;
  error?: string;
}

export async function matchFaces(idPhotoDataUrl: string, selfieDataUrl: string): Promise<MatchResult> {
  try {
    const faceapi = await ensureModels();
    const [idImg, selfieImg] = await Promise.all([toImageEl(idPhotoDataUrl), toImageEl(selfieDataUrl)]);
    const d1 = await faceapi.detectSingleFace(idImg).withFaceLandmarks().withFaceDescriptor();
    const d2 = await faceapi.detectSingleFace(selfieImg).withFaceLandmarks().withFaceDescriptor();
    if (!d1 || !d2) return { score: 0, matched: false, simulated: false, noFace: true };
    const distance = faceapi.euclideanDistance(d1.descriptor, d2.descriptor);
    const score = Math.max(0, 1 - distance);
    return { score, matched: score >= MATCH_THRESHOLD, simulated: false };
  } catch (err) {
    const score = 0.72 + Math.random() * 0.15;
    return { score, matched: true, simulated: true, error: String((err as Error)?.message || err) };
  }
}
