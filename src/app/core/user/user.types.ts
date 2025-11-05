export class CurrentUser {
    UserID: string | null = null;
    FirstName: string | null = null;
    LastName: string | null = null;
    FullName: string | null = null;
    Email: string | null = null;
    IsOwner: boolean | null = null;
    IsActive: boolean | null = null;
    ClientID:string | null = null;
    EntityID:string | null = null;
    EntityName:string | null = null;
    PhoneNo:string | null = null;
    Address:string | null = null;
    UserName:string | null = null;
}

export class ModuleAccess{
    ModuleName:string | null = null;
    MCode:string | null = null;
    IsAccess:boolean | null = null;
}

export class SectionAccess{
    SectionName:string | null = null;
    SCode:string | null = null;
    RightName:string | null = null;
    RightID:number | null = null;
    
}


export class LoginUser {
    public static User:CurrentUser  = new CurrentUser();
    public static ModuleAccess:ModuleAccess[]=[];
    public static SectionAccess:SectionAccess[]=[];
    public static ClientID:string | null = null;
    public static EntityID:string | null = null;
   
}
