import { componentRegister } from "app/modules/shared/services/component-register";

export class PaymentCategory {
    ID: number = 0;
    Code: string = null;
    Description: string = null;
    SCode: string = componentRegister.paymentCategory.SCode;
}
