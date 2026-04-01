import { componentRegister } from "app/modules/shared/services/component-register";

export class Vendor {
    ID: number = 0;
    Name: string = null;
    TypeID: number = null;
    ContactName: string = null;
    PhoneNo: string = null;
    IsActive: boolean = true;
    SCode: string = componentRegister.vendor.SCode;
}
