import { Timestamp } from '@angular/fire/firestore'; // Si tu utilises AngularFire

export interface Trade {
  sigle: string;
  denomination: string;
  description?: string;
  status?: boolean;
  rncp?: string;
  isQualifying?: boolean;
  isCPF?: boolean;
  requirements?: string;
  totalCP: any;
  competences: string[];
  durations: { [key: string]: number[] };
  costs: { [key: string]: any };
  parentCategory?: string;
  createdAt?: Timestamp;  // Ajouter le champ createdAt de type Timestamp
}

