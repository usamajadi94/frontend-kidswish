import { componentRegister } from 'app/modules/shared/services/component-register';
import { PurInvDetailReturn } from './pur-inv-detail-ret';

export class PurInvMasterReturn {
    ID: number = 0;
    InvoiceNo: string = '';
    PurchaseInvoiceNo: string = '';
    SupplierID: number = 0;
    CategoryID: number = 0;
    Remarks: string = '';
    InvoiceDate: any = null;
    CompanyID: number = 0;
    DcNo: string = '';
    DcDt: any = null;
    Pur_Inv_Detail_Ret: PurInvDetailReturn[] = [];
    SCode:string = componentRegister.purchaseReturnInvoice.SCode;
}
