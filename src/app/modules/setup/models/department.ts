import { componentRegister } from "app/modules/shared/services/component-register";

export class Department {
    ID: number = 0;
    Name: string = null;
    Description: string = null;
    IsActive: boolean = true;
    SCode: string = componentRegister.department.SCode;
}
