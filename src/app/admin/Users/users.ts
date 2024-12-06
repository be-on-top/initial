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
    role?:string
}