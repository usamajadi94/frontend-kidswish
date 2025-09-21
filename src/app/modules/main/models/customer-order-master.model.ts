import { componentRegister } from "app/modules/shared/services/component-register";
import { CustomerOrderDetail } from "./customer-order-detail.model";

export class CustomerOrderMaster {
    ID: number = 0 ;
    CustomerID: number = null; 
    OrderDate: Date = null;    
    Code: string = null;
    Description: string = null;
    CustomerOrderStatusID:number = null;
    SCode: string = componentRegister.customerOrder.SCode;
    Customer_Order_Detail: CustomerOrderDetail[] = [];
}
