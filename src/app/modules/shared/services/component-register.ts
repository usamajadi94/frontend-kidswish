export class componentRegister {
    // Setup
    static readonly itemType: IComponentRegister = { Title: 'Product Categories', SCode: "prod_04" };
    static readonly supplier: IComponentRegister = { Title: 'Supplier Management', SCode: "supp_01" };
    static readonly supplierItems: IComponentRegister = { Title: 'Supplier Items', SCode: "supp_02" };
    static readonly customer:IComponentRegister = {Title:'Customer Management',SCode:"cus_01"};
    static readonly vehicle:IComponentRegister = {Title:'Vehicle',SCode:"set_12"};
    static readonly expense:IComponentRegister = {Title:'Expense US',SCode:"exp_02"};
    static readonly employee:IComponentRegister = {Title:'Employee Management',SCode:"emp_01"};
    static readonly payroll:IComponentRegister = {Title:'Payroll Management',SCode:"emp_02"};
    static readonly product:IComponentRegister = {Title:'Product Management',SCode:"prod_01"};
    static readonly packagingStock:IComponentRegister = {Title:'Packaging Stock Management',SCode:"prod_02"};
    static readonly expenseCategory:IComponentRegister = {Title:'Expense Category',SCode:"exp_03"};
    static readonly expenseDr:IComponentRegister = {Title:'Expense DR',SCode:"exp_01"};
    static readonly flavorOrder:IComponentRegister = {Title:'Flavor Order',SCode:""};
    static readonly flavorStock:IComponentRegister = {Title:'Product Flavor Stock',SCode:"prod_03"};
    static readonly employeeAttendance:IComponentRegister = {Title:'Employee Attendance',SCode:"emp_03"};

    // Operations


    static readonly user:IComponentRegister = {Title:'Users',SCode:"sec_01"};
    static readonly group:IComponentRegister = {Title:'Group',SCode:"sec_02"};
    static readonly groupPermission = 'Group Permission';

    // Main
    static readonly customerOrder:IComponentRegister = {Title:'Customer Order',SCode:"ord_01"};
    static readonly invoice:IComponentRegister = {Title:'Invoice',SCode:"inv_01"};

    // Factory
    static readonly pipelineOrders:IComponentRegister = {Title:'Factory Dashboard',SCode:"dash_01"};
    static readonly dashboard:IComponentRegister = {Title:'Dashboard',SCode:"dash_02"};
    
    static readonly saleInvoiceReport:IComponentRegister = {Title:'Invoice',SCode:"inv_02"};
    static readonly supplierOrder:IComponentRegister = {Title:'Supplier Order',SCode:"supp_03"};
    static readonly supplierLedger: IComponentRegister = { Title: 'Supplier Order Ledger', SCode: "supp_03" };
}

export interface IComponentRegister {
    Title: string,
    SCode: string;
}