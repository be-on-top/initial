export interface QuizDetails {
    lastIndexQuestion: number;
    fullResults: { [key: string]: { duration: number; cost: number; notation:number } };
    scoreCounter:number;
    studentCompetences: { [key: string]: number }[];
    tradeEvaluated:string;
}


