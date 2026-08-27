import { componentRegister } from "app/modules/shared/services/component-register";

export class Unit {
    ID: number = 0;
    Name: string = null;
    Symbol: string = null;
    SCode: string = componentRegister.unit.SCode;
}
