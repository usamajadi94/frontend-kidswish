import { PayrollDetail} from './payroll-detail.dto';

export class PayrollMaster {
    ID: number = 0;
    Date: Date = new Date();
    PayrollMonth: Date = new Date();
    PayrollCycle: string = "";
    Payroll_Detail: PayrollDetail[] = [];
}
