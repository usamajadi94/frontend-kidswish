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
    static readonly vendorLedger: IComponentRegister  = { Title: 'Vendor Ledger',   SCode: 'pay_06' };

    // Products
    static readonly product: IComponentRegister = { Title: 'Product', SCode: 'prod_01' };

    // Expense
    static readonly expense: IComponentRegister = { Title: 'Expense', SCode: 'exp_02' };
    static readonly expenseCategory: IComponentRegister = { Title: 'Expense Category', SCode: 'exp_03' };
    static readonly paymentCategory: IComponentRegister = { Title: 'Payment Category', SCode: 'set_09' };
    static readonly cashInHand: IComponentRegister = { Title: 'Cash In Hand', SCode: 'pay_05' };

    // Security
    static readonly user: IComponentRegister = { Title: 'Users', SCode: 'sec_01' };
    static readonly group: IComponentRegister = { Title: 'Group', SCode: 'sec_02' };
    static readonly groupPermission = 'Group Permission';

    // Orders
    static readonly customerOrder: IComponentRegister = { Title: 'Customer Order', SCode: 'ord_01' };
    static readonly orderDashboard: IComponentRegister = { Title: 'Order Dashboard', SCode: 'ord_02' };
    static readonly orderList: IComponentRegister = { Title: 'Order List', SCode: 'ord_03' };
    static readonly stockMaster: IComponentRegister = { Title: 'Stock Master', SCode: 'ord_04' };
    static readonly dispatchPlanning: IComponentRegister = { Title: 'Dispatch Planning', SCode: 'ord_05' };
    static readonly dispatchList: IComponentRegister = { Title: 'Dispatch List', SCode: 'ord_06' };
    static readonly delivery: IComponentRegister = { Title: 'Delivery', SCode: 'ord_07' };

    static readonly invoice: IComponentRegister = { Title: 'Invoice', SCode: 'inv_01' };

    static readonly saleInvoiceReport: IComponentRegister = { Title: 'Invoice', SCode: 'inv_02' };
}

export interface IComponentRegister {
    Title: string;
    SCode: string;
}
