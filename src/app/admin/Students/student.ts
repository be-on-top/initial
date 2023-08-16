import { QuizDetails } from "../quizzDetails";

export interface Student {
    id: string;
    // authId: string;
    lastName: string;
    firstName: string;
    email: string;
    studentPw: string;
    evaluations?:{};
    cp?: number;
    created: Date;
    status:boolean;
    roles:[];
    details:string;
    trainer: string;
    anpe?: boolean;
    tradesEvaluated?: string[];
     // Index signature
     [key: string]: any; // Index signature for dynamic properties
}
