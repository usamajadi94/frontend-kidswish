import { componentRegister } from "app/modules/shared/services/component-register";

export class MemberTypeInformation {
    ID: number = 0;
    Description: string = null;
    Code:string = null;
    SCode:string = componentRegister.memberType.SCode;
}