export interface Trade {

        sigle: string, denomination: string, description?: string, status?:boolean, rncp?:string, isQualifying?:boolean, requirements?:string, totalCP:any,  competences:string[], durations: { [key: string]: number[]}, costs:{[key: string]: any}

}
