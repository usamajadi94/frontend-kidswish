import { componentRegister } from "app/modules/shared/services/component-register";

export class OpeningStock {
    ID: number = 0;
    Date: Date = new Date();
    ItemID: number = 0;
    StockUpdate: number = 0;
    CurrentStock: number = 0;
    StockDiff: number = 0;
    SCode:string = componentRegister.openingStock.SCode;
}
