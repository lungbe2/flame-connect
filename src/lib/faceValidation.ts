declare global {
  interface Window {
    FaceDetector?: {
      createFromOptions: (resolver: unknown, options: Record<string, unknown>) => Promise<any>;
    };
    FilesetResolver?: {
      forVisionTasks: (wasmPath: string) => Promise<unknown>;
    };
    vision?: {
      FaceDetector?: {
        createFromOptions: (resolver: unknown, options: Record<string, unknown>) => Promise<any>;
      };
      FilesetResolver?: {
        forVisionTasks: (wasmPath: string) => Promise<unknown>;
      };
    };
  }
}

let detectorPromise: Promise<any> | null = null;

const resolveVisionApi = () => {
  const source = window.vision || window;
  const FilesetResolver = source.FilesetResolver;
  const FaceDetector = source.FaceDetector;

  if (!FilesetResolver || !FaceDetector) {
    throw new Error('Face detection is still loading. Please try again in a moment.');
  }

  return { FilesetResolver, FaceDetector };
};

const loadFaceDetector = async () => {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      const { FilesetResolver, FaceDetector } = resolveVisionApi();
      const resolver = await FilesetResolver.forVisionTasks('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm');

      return FaceDetector.createFromOptions(resolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite'
        },
        runningMode: 'IMAGE'
      });
    })();
  }

  return detectorPromise;
};

const fileToImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('We could not read that image. Please try another photo.'));
    };

    image.src = objectUrl;
  });

export async function validateProfilePhotoFace(file: File) {
  const detector = await loadFaceDetector();
  const image = await fileToImage(file);
  const detectionResult = detector.detect(image);
  const detections = Array.isArray(detectionResult?.detections) ? detectionResult.detections : [];
  const primaryDetection = detections[0];
  const confidence = typeof primaryDetection?.categories?.[0]?.score === 'number' ? primaryDetection.categories[0].score : null;

  return {
    hasFace: detections.length > 0,
    faceCount: detections.length,
    confidence
  };
}
