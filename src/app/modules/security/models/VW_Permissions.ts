export class VW_Modules{
    ID:number = 0;
    IsAccess:boolean | null = null;
    ModuleName : string | null = null;
    ModuleIcon : string | null = null;
    Sections:VW_Sections[]=[];
    Rights:any[] = [];
}

export class VW_Sections{
    ID:number = 0;
    ModuleID:number | null = null;
    SectionName:string | null = null;
    SectionIcon:string | null = null;
    completed:boolean = false;
    allComplete:boolean =false;
    Rights:VW_Sections_Rights[]=[];
}

export class VW_Sections_Rights{
    ID:number = 0;
    SectionID:number | null = null;
    RightName:string | null = null;
    RightIcon:string | null = null;
    completed:boolean = false;
}