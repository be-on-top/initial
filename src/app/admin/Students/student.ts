export interface Student {
    id: string;
    authId: string;
    lastname: string;
    firstname: string;
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
