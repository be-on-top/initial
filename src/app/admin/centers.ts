export interface Centers {
    id: string;
    name: string;
    cp: string;
    city: string;
    address: string;
    created: Date;
    status: boolean;
    sigles: string[];
    mainCity?:string;
    tel?:string;
    partner?: boolean;
    subsidiary?: boolean;
    member?: boolean;
    independent?: boolean;
    comment?:string;
    siret?:string
}