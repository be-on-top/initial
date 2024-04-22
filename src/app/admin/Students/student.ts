import { QuizDetails } from "../quizzDetails";

export interface Student {
    id: string;
    // authId: string;
    lastName: string;
    firstName: string;
    email: string;
    studentPw: string;
    evaluations?:{};
    tutorials?:{};
    cp?: number;
    created: Date;
    status:boolean;
    roles:[];
    details:string;
    trainer: string;
    tutor?: string;
    anpe?: boolean;
    tradesEvaluated?: string[];
    subscriptions?:[];
    isSocialFormSent?:boolean;
    endedSubscriptions?:{"date":string; "sigle":string}
    elearning?:string
     // Index signature
     [key: string]: any; // Index signature for dynamic properties
}
