export interface News {
  id?: string;
  title: string;
  content: string; // HTML TinyMCE
  heroImage?: string;
  status: 'draft' | 'published'; // important pour la suite
  createdAt?: any;
  updatedAt?: any;
}