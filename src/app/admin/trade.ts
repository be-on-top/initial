export interface Trade {

        sigle: string, denomination: string, description?: string, status?:boolean, rncp?:string, totalCP:any,  competences:string[], durations: { [key: string]: number[]}, costs:{[key: string]: any}

}
