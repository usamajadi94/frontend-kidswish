import { componentRegister } from "app/modules/shared/services/component-register";

export class VendorType {
    ID: number = 0;
    Name: string = null;
    IsActive: boolean = true;
    SCode: string = componentRegister.vendorType.SCode;
}
