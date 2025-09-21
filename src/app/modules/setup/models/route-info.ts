import { componentRegister } from "app/modules/shared/services/component-register";

export class RouteInformation {
    ID: number = 0;
    Code: string = '';
    Description: string = '';
    AreaID: number = null;
    SCode:string = componentRegister.route.SCode;
}