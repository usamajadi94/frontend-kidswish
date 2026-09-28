import { componentRegister } from "app/modules/shared/services/component-register";

export class RawMaterial {
    ID: number = 0;
    Name: string = null;
    UnitID: number = null;
    IsActive: boolean = true;
    SCode: string = componentRegister.rawMaterial.SCode;
}
