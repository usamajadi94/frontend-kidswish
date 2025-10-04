export class componentRegister {
    // Setup
    static readonly company: IComponentRegister = { Title: 'Company Setup', SCode: "set_01" };
    static readonly itemProfile: IComponentRegister = { Title: 'Item Profile', SCode: "set_04" };
    static readonly itemType: IComponentRegister = { Title: 'Item Categories', SCode: "set_03" };
    static readonly supplier: IComponentRegister = { Title: 'Supplier Management', SCode: "set_18" };
    static readonly city: IComponentRegister = { Title: 'City', SCode: "set_05" };
    static readonly area:IComponentRegister = {Title: 'Area',SCode:"set_06"};
    static readonly route:IComponentRegister = {Title:'Route Management',SCode:"set_08"};
    static readonly customer:IComponentRegister = {Title:'Customer Management',SCode:"set_15"};
    static readonly memberType:IComponentRegister = {Title:'Member Categories',SCode:"set_07"};
    static readonly orderBooker:IComponentRegister = {Title:'Order Booker',SCode:"set_09"};
    static readonly salesman:IComponentRegister = {Title:'Salesman',SCode:"set_11"};
    static readonly vehicle:IComponentRegister = {Title:'Vehicle',SCode:"set_12"};
    static readonly expense:IComponentRegister = {Title:'Expense US',SCode:"set_14"};
    static readonly employee:IComponentRegister = {Title:'Employee Management',SCode:"set_13"};
    static readonly payroll:IComponentRegister = {Title:'Payroll Management',SCode:"set_22"};
    static readonly product:IComponentRegister = {Title:'Product Management',SCode:"set_16"};
    static readonly packagingStock:IComponentRegister = {Title:'Packaging Stock Management',SCode:"set_17"};
    static readonly expenseCategory:IComponentRegister = {Title:'Expense Category',SCode:"set_19"};
    static readonly expenseDr:IComponentRegister = {Title:'Expense DR',SCode:"set_20"};
    static readonly flavorOrder:IComponentRegister = {Title:'Flavor Order',SCode:""};
    static readonly flavorStock:IComponentRegister = {Title:'Product Flavor Stock',SCode:"set_21"};

    // Operations
    static readonly purchaseInvoice:IComponentRegister = {Title:'Purchase Invoice',SCode:"dms_01"};
    static readonly purchaseReturnInvoice:IComponentRegister = {Title:'Purchase Return',SCode:"dms_02"};

    static readonly MultipleitemProfile:IComponentRegister = {Title:'Item Profile Price',SCode:this.itemProfile.SCode};
    static readonly openingStock:IComponentRegister = {Title:'Stock Opening',SCode:"dms_03"};
    static readonly order:IComponentRegister = {Title:'Order Management',SCode:"dms_04"};
    static readonly saleInvoice:IComponentRegister = {Title:'Sale Invoice',SCode:"dms_05"};
    static readonly billCollection:IComponentRegister = {Title:'Bill Collection',SCode:"dms_06"};
    static readonly saleReturnInvoice:IComponentRegister = {Title:'Sale Return',SCode:"dms_07"};

    static readonly user:IComponentRegister = {Title:'Users',SCode:"sec_01"};
    static readonly group:IComponentRegister = {Title:'Group',SCode:"sec_02"};
    static readonly groupPermission = 'Group Permission';

    // Main
    static readonly customerOrder:IComponentRegister = {Title:'Customer Order',SCode:"main_01"};
    static readonly invoice:IComponentRegister = {Title:'Invoice',SCode:"inv_01"};

    // Factory
    static readonly pipelineOrders:IComponentRegister = {Title:'Factory Dashboard',SCode:"fac_01"};

}

export interface IComponentRegister {
    Title: string,
    SCode: string;
}