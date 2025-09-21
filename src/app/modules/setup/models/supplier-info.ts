import { componentRegister } from "app/modules/shared/services/component-register";

export class SupplierInformation {
    ID:number = 0;
    Code:string = null;
    Description:string = null;
    Address:string = "";
    PhoneNo:string = "";
    FaxNo:string = "";
    MobileNo:string = "";
    Email:string = "";
    Notes:string = "";
    IsActive:boolean = true;
    SCode:string = componentRegister.supplier.SCode;
    
}
