import { componentRegister } from 'app/modules/shared/services/component-register';
import { PurInvDetail } from './pur-inv-detail';

export class PurInvMaster {
    ID: number = 0;
    InvoiceNo: string = '';
    SupplierID: number = 0;
    CategoryID: number = null;
    Remarks: string = '';
    InvoiceDate: Date = new Date();
    CompanyID: number = 0;
    DcNo: string = '';
    DcDt: Date = new Date();
    Pur_Inv_Detail: PurInvDetail[] = [];
    SCode:string = componentRegister.purchaseInvoice.SCode;
}
