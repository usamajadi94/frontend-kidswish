import { componentRegister } from "app/modules/shared/services/component-register";

export class Supplier {
    ID: number = 0;
    Name: string = null;
    ContactName: string = null;
    PhoneNo: string = null;
    Address: string = null;
    IsActive: boolean = true;
    OpeningBalance: number = 0;
    SCode: string = componentRegister.supplier.SCode;
}
