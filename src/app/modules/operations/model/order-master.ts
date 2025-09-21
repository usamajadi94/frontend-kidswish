import { componentRegister } from 'app/modules/shared/services/component-register';
import { OrderDetail } from './order-detail';

export class OrderMaster {
    ID: number = 0;
    OrderDate: Date = new Date();
    OrderNo: string = '';
    CustomerID: number | null = null;
    OrderBookerID: number | null = null;
    CompanyID: number = 0;
    Remarks: string = '';
    ItemCategoryID: number | null = null;

    Order_Detail: OrderDetail[] = [];
    SCode:string = componentRegister.order.SCode;
}
