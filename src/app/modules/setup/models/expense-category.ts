import { componentRegister } from "app/modules/shared/services/component-register";

export class ExpenseCategory {
    ID:number = 0;
    Code:string = null;
    Description:string = null;
    SCode:string = componentRegister.expenseCategory.SCode;
}
