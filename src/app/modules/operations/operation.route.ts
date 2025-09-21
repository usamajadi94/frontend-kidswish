import { Route } from "@angular/router";
import { PurchaseInvoiceListComponent } from "./components/purchase-invoice/purchase-invoice-list/purchase-invoice-list.component";
import { PurchaseInvoiceReturnListComponent } from "./components/purchase-invoice-return/purchase-invoice-return-list/purchase-invoice-return-list.component";
import { OpeningStockListComponent } from "./components/opening-stock/opening-stock-list/opening-stock-list.component";
import { SaleInvoiceListComponent } from "./components/sale-invoice/sale-invoice-list/sale-invoice-list.component";
import { OrderListComponent } from "./components/order/order-list/order-list.component";
import { BillCollectionListComponent } from "./components/bill-collection/bill-collection-list/bill-collection-list.component";
import { SaleInvoiceReturnListComponent } from "./components/sale-invoice-return/sale-invoice-return-list/sale-invoice-return-list.component";
import { permissionGuard } from "app/core/auth/guards/permission.guard";
import { componentRegister } from "../shared/services/component-register";

export default [
    {
        path: 'purhase-order-list',
        component: PurchaseInvoiceListComponent, 
        data:{SCode:componentRegister.purchaseInvoice.SCode},
        canActivate:[permissionGuard]
    },
    {
        path: 'purhase-return-list',
        component: PurchaseInvoiceReturnListComponent, 
        data:{SCode:componentRegister.purchaseReturnInvoice.SCode},
        canActivate:[permissionGuard]
    },
    {
        path: 'opening-stock-list',
        component: OpeningStockListComponent, 
        data:{SCode:componentRegister.openingStock.SCode},
        canActivate:[permissionGuard]
    },
    {
        path: 'sale-invoice-list',
        component: SaleInvoiceListComponent, 
        data:{SCode:componentRegister.saleInvoice.SCode},
        canActivate:[permissionGuard]
    },
    {
        path: 'order-list',
        component: OrderListComponent, 
        data:{SCode:componentRegister.order.SCode},
        canActivate:[permissionGuard]
    },
    {
        path: 'bill-collection-list',
        component: BillCollectionListComponent, 
        data:{SCode:componentRegister.billCollection.SCode},
        canActivate:[permissionGuard]
    },
    {
        path: 'sale-return-list',
        component: SaleInvoiceReturnListComponent, 
        data:{SCode:componentRegister.saleReturnInvoice.SCode},
        canActivate:[permissionGuard]
    },
] as Route[];