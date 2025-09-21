import { componentRegister } from "app/modules/shared/services/component-register";

export class ItemType {
    ID: number = 0;
    Description: string = null;
    Code:string = null;
    IsActive: boolean = true;
    SCode:string = componentRegister.itemType.SCode;
}