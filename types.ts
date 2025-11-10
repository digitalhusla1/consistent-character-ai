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

export interface User {
  username: string;
  balance: number;
  role: 'user' | 'admin';
  status: 'pending' | 'approved' | 'blocked';
}

export interface DepositRequest {
    id: string;
    username: string;
    amount: number;
    timestamp: number;
    status: 'pending' | 'approved' | 'rejected';
}

export interface Transaction {
  id: string;
  username: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: number;
}
