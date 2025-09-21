import { componentRegister } from "app/modules/shared/services/component-register";

export class CityInformation {
    ID: number = 0;
    Description: string = null;
    Code:string = null;
    SCode:string = componentRegister.city.SCode;
}