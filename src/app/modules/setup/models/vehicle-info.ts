import { componentRegister } from "app/modules/shared/services/component-register";

export class VehicleInformation {
    ID: number = 0;
    Code: string = null;
    Description: string = null;
    SCode:string = componentRegister.vehicle.SCode;
}