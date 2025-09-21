import { componentRegister } from "app/modules/shared/services/component-register";

export class AreaInformation{
    ID:number = 0;
    Description:string = null;
    Code:string = null;
    AreaCode:string = null;
    CityID:number = null; 
    SCode:string = componentRegister.area.SCode;
}