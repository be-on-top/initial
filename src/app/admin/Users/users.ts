export interface Users {
    id: string;
    firstName: string;
    lastName: string;
    password: string,
    cp?: string[];
    email: string;
    created: Date;
    status: boolean;
    tel?: string;
    role?:string;
    centerId?:string[];
    isPrivate?:boolean;
    geographicScope?: 'regional' | 'departmental' | 'local';
    structure?:string;
    address?: number;
    referentUid?:string;
    students:string[];
    partner?:boolean;
    details?:string;
    comment?:string;
}