export interface ImageData {
  data: string;
  mimeType: string;
}

export interface HistoryItem {
  id: string;
  originalImage: string;
  prompt: string;
  generatedImage: string;
  timestamp: number;
  aspectRatio?: string;
}
