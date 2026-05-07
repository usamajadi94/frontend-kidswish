export class componentRegister {
    // Setup
    static readonly department: IComponentRegister = { Title: 'Department', SCode: 'set_01' };
    static readonly distributor: IComponentRegister = { Title: 'Distributor', SCode: 'set_02' };
    static readonly customer: IComponentRegister = { Title: 'Customer', SCode: 'set_03' };
    static readonly vendor: IComponentRegister = { Title: 'Vendor', SCode: 'set_04' };
    static readonly vendorType: IComponentRegister = { Title: 'Vendor Type', SCode: 'set_05' };
    static readonly bankAccount: IComponentRegister = { Title: 'Bank Account', SCode: 'set_06' };
    static readonly legalEntity: IComponentRegister = { Title: 'Legal Entity', SCode: 'set_07' };
    static readonly pettyCash: IComponentRegister = { Title: 'Petty Cash', SCode: 'set_08' };
    static readonly paymentReceived: IComponentRegister = { Title: 'Payment Received', SCode: 'pay_01' };
    static readonly makePayment: IComponentRegister = { Title: 'Make Payment', SCode: 'pay_02' };
    static readonly ledger: IComponentRegister = { Title: 'Ledger', SCode: 'pay_03' };
    static readonly customerLedger: IComponentRegister = { Title: 'Customer Ledger', SCode: 'pay_04' };

    // Products
    static readonly product: IComponentRegister = { Title: 'Product', SCode: 'prod_01' };

    // Expense
    static readonly expense: IComponentRegister = { Title: 'Expense', SCode: 'exp_02' };
    static readonly expenseCategory: IComponentRegister = { Title: 'Expense Category', SCode: 'exp_03' };
    static readonly paymentCategory: IComponentRegister = { Title: 'Payment Category', SCode: 'set_09' };

    // Security
    static readonly user: IComponentRegister = { Title: 'Users', SCode: 'sec_01' };
    static readonly group: IComponentRegister = { Title: 'Group', SCode: 'sec_02' };
    static readonly groupPermission = 'Group Permission';

    // Main
    static readonly customerOrder: IComponentRegister = { Title: 'Customer Order', SCode: 'ord_01' };
    static readonly invoice: IComponentRegister = { Title: 'Invoice', SCode: 'inv_01' };

    static readonly saleInvoiceReport: IComponentRegister = { Title: 'Invoice', SCode: 'inv_02' };

    // Reports
    static readonly expenseByVendorReport: IComponentRegister = { Title: 'Expense by Vendor', SCode: 'rep_01' };
    static readonly paymentReceivedReport: IComponentRegister = { Title: 'Payment Received Report', SCode: 'rep_02' };
    static readonly paymentMadeReport: IComponentRegister = { Title: 'Payment Made Report', SCode: 'rep_03' };
}

export interface IComponentRegister {
    Title: string;
    SCode: string;
}
