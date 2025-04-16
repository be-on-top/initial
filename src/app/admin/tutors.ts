export interface Tutor {
    id: string;
    lastName: string;
    firstName:string;
    sigle?: string[]; // Ne devrait pas être nécessaire pour le tuteur
    cp?: string; // Ne devrait pmas avoir à être pluriel ni nécessaire (facultatif)
    students?: string[]; // Les ids des étudiants associés (facultatif)
    status:boolean; 
    comment?:string;
    tel?: string;
  }