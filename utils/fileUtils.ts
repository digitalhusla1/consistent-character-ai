
import { ImageData } from '../types';

/**
 * Converts a File object to a base64 string (without the data URL prefix).
 */
const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('FileReader did not return a string.'));
      }
      // result is a data URL (e.g., "data:image/jpeg;base64,LzlqLzRBQ..."),
      // we only want the part after the comma.
      const parts = reader.result.split(',');
      if (parts.length !== 2 || !parts[1]) {
        return reject(new Error('Malformed data URL from FileReader.'));
      }
      resolve(parts[1]);
    };
    reader.onerror = (error) => reject(error);
  });

/**
 * Converts a File object into an ImageData object suitable for the Gemini API.
 */
export const fileToImageData = async (file: File): Promise<ImageData> => {
  const data = await toBase64(file);
  return {
    data,
    mimeType: file.type,
  };
};

/**
 * Converts a File object to a full base64 data URL.
 */
export const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error('FileReader did not return a string.'));
      }
      resolve(reader.result);
    };
    reader.onerror = (error) => reject(error);
  });