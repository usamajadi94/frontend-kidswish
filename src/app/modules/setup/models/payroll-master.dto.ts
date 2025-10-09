import { PayrollDetail} from './payroll-detail.dto';

export class PayrollMaster {
    ID: number = 0;
    Date: Date = new Date();
    PayrollMonth: Date = new Date();
    PayrollCycle: string = "";
    SalaryTypeID:number = null;
    FromDate:Date = null;
    ToDate:Date = null;
    Payroll_Detail: PayrollDetail[] = [];
}
