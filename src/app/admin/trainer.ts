export interface Trainer {
    id: string;
    lasName: string;
    firstName:string;
    sigle: string[]; // Les métiers ou domaines du formateur
    cp: string[]; // Les codes postaux associés (facultatif)
    students?: string[]; // Les codes postaux associés (facultatif)
    status:boolean; // vacataire ou pas
    comment?:string;
    tel?: string;
    class:string[];
  }