import { componentRegister } from "app/modules/shared/services/component-register";

export class CompanyInformation {
    ID:number = 0;
    Code:string = null;
    Description:string = null;
    PhoneNo:string = "";
    Address:string = "";
    PhoneNo2:string = "";
    Email:string ="";
    ContactPersonName:string = null;
    ContactPersonEmail:string = null;
    ContactPersonPhone:string = null;
    IsActive:boolean = true;
    SCode:string = componentRegister.company.SCode;
}
