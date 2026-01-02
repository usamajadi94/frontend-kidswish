import { componentRegister } from "app/modules/shared/services/component-register";

export class SupplierItems{
    ID:number = 0;
    Description:string=null;
    Price:number=null;
    SCode:string = componentRegister.supplierItems.SCode;
}