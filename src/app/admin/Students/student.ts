export interface Student {
    id: string;
    authId: string;
    lastName: string;
    firstName: string;
    email: string;
    studentPw: string;
    evaluations:string;
    cp: number;
    created: Date;
    status:boolean;
    roles:[];
    details:string;
    trainer: string;
    anpe: boolean;
}
