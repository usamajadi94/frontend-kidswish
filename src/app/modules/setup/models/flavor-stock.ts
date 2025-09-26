import { componentRegister } from "app/modules/shared/services/component-register";

export class FlavorStock {
    ID:number = 0;
    Date: Date = new Date();
    ProductID:number = null;
    FlavorID:number = null;
    CurrentStock:number = 0;
    Qty:number = 0;
    Cases: number = 0;
    UpdatedStock:number = 0;
    SCode:string = componentRegister.flavorStock.SCode;
}
