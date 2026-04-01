import { componentRegister } from "app/modules/shared/services/component-register";

export class Customer {
    ID: number = 0;
    Name: string = null;
    Code: string = null;
    Email: string = null;
    PhoneNo: string = null;
    Address: string = null;
    DistributorID: number = null;
    IsActive: boolean = true;
    SCode: string = componentRegister.customer.SCode;
}
