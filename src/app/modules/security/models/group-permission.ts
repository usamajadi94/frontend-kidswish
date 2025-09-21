export class EntityPermission {
  name: string = '';
  component: string = '';
  create: boolean = false;
  read: boolean = false;
  write: boolean = false;
  delete: boolean = false;
}

export class PermissionGroup {
  tabName: string = '';
  icon: string = '';
  permissions: EntityPermission[] = [];
}

export class GroupPermission {
  groups: PermissionGroup[] = [];

  constructor() {
    this.groups = [
      {
        tabName: 'Setup',
        icon: 'cog-6-tooth',
        permissions: [
          { name: 'Company Information', component: 'CompanyInformationComponent', create: false, read: false, write: false, delete: false },
          { name: 'Supplier Information', component: 'SupplierInformationComponent', create: false, read: false, write: false, delete: false },
          { name: 'Item Type Information', component: 'ItemTypeComponent', create: false, read: false, write: false, delete: false },
          { name: 'Item Profile', component: 'ItemProfileComponent', create: false, read: false, write: false, delete: false },
          { name: 'Member Type Information', component: 'MemberTypeInformationComponent', create: false, read: false, write: false, delete: false },
          { name: 'City Information', component: 'CityInformationComponent', create: false, read: false, write: false, delete: false },
          { name: 'Area Information', component: 'AreaInformationComponent', create: false, read: false, write: false, delete: false },
          { name: 'Route Information', component: 'RouteInformationComponent', create: false, read: false, write: false, delete: false },
          { name: 'Order Booker', component: 'OrderBookerInformationComponent', create: false, read: false, write: false, delete: false },
          { name: 'Customer Information', component: 'CustomerInformationComponent', create: false, read: false, write: false, delete: false },
          { name: 'Salesman Information', component: 'SalesmanInformationComponent', create: false, read: false, write: false, delete: false },
          { name: 'Vehicle Information', component: 'VehicleInformationComponent', create: false, read: false, write: false, delete: false },
        ]
      },

      {
        tabName: 'DMS',
        icon: 'cog-6-tooth',
        permissions: [
          { name: 'Sale Invoice', component: 'SaleInvoiceComponent', create: false, read: false, write: false, delete: false },
          { name: 'Sale Invoice Return', component: 'SaleInvoiceReturnComponent', create: false, read: false, write: false, delete: false },
          { name: 'Purchase Invoice', component: 'PurchaseInvoiceComponent', create: false, read: false, write: false, delete: false },
          { name: 'Purchase Return Invoice', component: 'PurchaseInvoiceReturnComponent', create: false, read: false, write: false, delete: false },
          { name: 'Bill Collection', component: 'BillCollectionComponent', create: false, read: false, write: false, delete: false },
          { name: 'Opening Stock', component: 'OpeningStockComponent', create: false, read: false, write: false, delete: false },
          { name: 'Order Information', component: 'OrderComponent', create: false, read: false, write: false, delete: false },
        ]
      },
      {
        tabName: 'Report',
        icon: 'cog-6-tooth',
        permissions: [
          { name: 'Sale Invoice Report', component: 'SaleInvoiceComponent', create: false, read: false, write: false, delete: false },
          { name: 'Purchase Invoice Report', component: 'PurInvoiceReportComponent', create: false, read: false, write: false, delete: false },
          { name: 'Bill Collection Report', component: 'BillCollectionComponent', create: false, read: false, write: false, delete: false },
        ]
      }
    ];
  }
}
