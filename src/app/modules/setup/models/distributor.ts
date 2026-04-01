import { componentRegister } from "app/modules/shared/services/component-register";

export class Distributor {
    ID: number = 0;
    Name: string = null;
    PhoneNo: string = null;
    City: string = null;
    Address: string = null;
    IsActive: boolean = true;
    SCode: string = componentRegister.distributor.SCode;
}
