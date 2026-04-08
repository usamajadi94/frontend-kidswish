import { componentRegister } from "app/modules/shared/services/component-register";

export class Vendor {
    ID: number = 0;
    Name: string = null;
    TypeIDs: number[] = [];
    ContactName: string = null;
    PhoneNo: string = null;
    IsActive: boolean = true;
    SCode: string = componentRegister.vendor.SCode;
}
