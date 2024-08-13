export interface Users {
    id: string;
    firstname: string;
    lastname: number;
    password: string,
    cp?: string[];
    email: string;
    created: Date;
    status: boolean;
    tel?: string;
}