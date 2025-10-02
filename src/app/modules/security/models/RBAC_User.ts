import { componentRegister } from "app/modules/shared/services/component-register";

export class Rbac_User {
    FirstName: string | null = null;
    LastName: string | null = null;
    UserName: string | null = null;
    Email: string | null = null;
    PhoneNo: string | null = null;
    Address: string | null = null;
    Password: string | null = null;
    IsPasswordChange: boolean = false;
    RBAC_User_Entity_Groups: RBAC_User_Entity_Groups[] = [];
    SCode: string = componentRegister.user.SCode;
    IsCustomer:boolean = false;
}

export class RBAC_User_Entity_Groups {
    ID: number = 0;
    GroupID: number | null = null;
    UserID: number | null = null;
}
