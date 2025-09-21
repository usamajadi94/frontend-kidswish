import { componentRegister } from "app/modules/shared/services/component-register";

export class Expense{
    ID:number = 0;
    Date:Date = new Date();
    Code:string = null;
    Description:string = null;
    Notes:string = null;
    PaymentMethodID:number = null; 
    Amount:number = null; 
    ExpenseCategoryID:number = null; 
    SCode:string = componentRegister.expense.SCode;
}