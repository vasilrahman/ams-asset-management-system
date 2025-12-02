
export type Role = 'ADMIN' | 'STAFF';

export type AssetCategory = 'Laptop' | 'Camera' | 'Mobile' | 'Tablet' | 'Other';

export type AssetStatus = 'Active' | 'Maintenance' | 'Retired' | 'Lost';

export type Theme = 'light' | 'dark';

export interface User {
  id: string;
  name: string;
  username: string;
  password: string; // In real app, never store plain text
  role: Role;
  designation: string;
  phone: string;
  email: string;
  isActive: boolean;
  avatarUrl: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface Asset {
  id: string;
  name: string;
  category: AssetCategory;
  serialNumber: string;
  status: AssetStatus;
  imageUrl: string;
  
  // Dates
  purchaseDate: string;
  createdDate: string; // Editable creation date
  createdAt: string; // System timestamp
  updatedAt: string;
  
  // Ownership
  addedBy: string; // User Name
  
  // Verification
  lastVerifiedDate?: string;
  verifiedBy?: string; // User Name
  location: string;
  
  // QR & Files
  isQrGenerated: boolean;
  qrData?: string; // The JSON string encoded in the QR
  attachments: Attachment[];
}

export interface Complaint {
  id: string;
  assetId: string;
  assetName: string;
  reportedBy: string;
  date: string;
  description: string;
  status: 'Pending' | 'Resolved';
}

export interface VerificationLog {
  id: string;
  assetId: string;
  assetName: string;
  verifiedBy: string;
  timestamp: string;
}
