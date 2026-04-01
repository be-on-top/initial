export interface MarketDoc {
  id?: string;           // Id Firestore
  title: string;         // Titre du document
  comment?: string;      // Commentaire / description
  fileUrl?: string;      // URL du fichier dans Storage
  createdAt?: any;       // Firestore Timestamp
  updatedAt?: any;       // Firestore Timestamp
}