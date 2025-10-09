import { inject, Injectable } from '@angular/core';
import { QueryService } from 'app/core/Base/services/query.service';
import { apiUrls } from './api-url';
import { OrderMaster } from 'app/modules/operations/model/order-master';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { ApiResponse } from 'app/core/Base/interface/IResponses';
import { SaleInvoiceMaster } from 'app/modules/operations/model/sale-invoice-master';
import { VW_Modules } from 'app/modules/security/models/VW_Permissions';
import { PurInvMaster } from 'app/modules/operations/model/pur-inv-master';

@Injectable({
    providedIn: 'root',
})
export class DrpService {
    private _QueryService = inject(QueryService);

    getSuppliersDrp() {
        return this._QueryService.getQuery('getSupplierInformationDrp');
    }

    getCategoriesDrp() {
        return this._QueryService.getQuery('getItemTypeDrp');
    }

    getCompaniesDrp() {
        return this._QueryService.getQuery('getCompanyInformationDrp');
    }
    getCityDrp() {
        return this._QueryService.getQuery('getCityInformationDrp');
    }
    getAreaDrp() {
        return this._QueryService.getQuery('getAreaInformationDrp');
    }
    getMemberTypeDrp() {
        return this._QueryService.getQuery('getMemberTypeInformationDrp');
    }
    getAreaByCityIDDrp(ID: number) {
        return this._QueryService.getQuery('getAreaInformationByCityIDDrp', {
            CityID: ID,
        });
    }
    getRouteByAreaIDDrp(ID: number) {
        return this._QueryService.getQuery('GetRouteInformationByAreaIDDrp', {
            AreaID: ID,
        });
    }
    getItemsDrp() {
        return this._QueryService.getQuery('getItemProfileDrp');
    }
    
    getInvoicebyInvoiceNumber(invoiceNumber: string): Observable<PurInvMaster> {
        return this._QueryService.get<PurInvMaster>(
            `${apiUrls.purchaseInvoiceGetController}${invoiceNumber}`
        ).pipe(
            map((res:ApiResponse<PurInvMaster>)=> res.Data),
            tap(() => console.log('Help data request sent')),
            catchError(this.handleError)
        );
    }

    getCustomerInformationDrp() {
        return this._QueryService.getQuery('getCustomerInformationDrp');
    }

    getOrderBookerInformationDrp() {
        return this._QueryService.getQuery('getOrderBookerInformationDrp');
    }

    getSalesmanInformationDrp() {
        return this._QueryService.getQuery('getSalesmanInformationDrp');
    }

    getVehicleInformationDrp() {
        return this._QueryService.getQuery('getVehicleInformationDrp');
    }

    getBillCollectionByCustomer(CustomerID: string) {
        return this._QueryService.getMultipleQuery('getBillCollection', { CustomerID });
    }

    /*
    getModulesAndSections() {
        return this._QueryService.getQuery('getModulesAndSections');
    }
    */

    getOrderbyOrderNumber(orderNumber: string): Observable<OrderMaster> {
        return this._QueryService.get<OrderMaster>(
            `${apiUrls.orderGetController}${orderNumber}`
        ).pipe(
            map((res:ApiResponse<OrderMaster>)=> res.Data),
            tap(() => console.log('Help data request sent')),
            catchError(this.handleError)
        );
    }


    getSaleInvicebyInvoiceNumber(invoiceNumber: string) :  Observable<SaleInvoiceMaster>{
        return this._QueryService.get<SaleInvoiceMaster>(
            `${apiUrls.saleInvoiceGetController}${invoiceNumber}`
        ).pipe(
            map((res:ApiResponse<SaleInvoiceMaster>)=> res.Data),
            tap(() => console.log('Help data request sent')),
            catchError(this.handleError)
        );
    }


    getModulesAndSections(): Observable<VW_Modules[]> {
        return this._QueryService.get<VW_Modules[]>(`${apiUrls.moduleGetController}`).pipe(
            map((res: ApiResponse<VW_Modules[]>) => res.Data),
            catchError(this.handleError)
        );
    }
    
    getItemCategories() {
        return this._QueryService.getQuery('getItemCategories');
    }
    
    getItemPrices() {
        return this._QueryService.getQuery('getItemPrices');
    }
    
    getRouteInformationDrp() {
        return this._QueryService.getQuery('getRouteInformationDrp');
    }

    getExpenseCategoryDrp() {
        return this._QueryService.getQuery('getExpenseCategoryDrp');
    }

    getPaymentMethodDrp() {
        return this._QueryService.getQuery('getPaymentMethodDrp');
    }
    
    getSalaryTypes() {
        return this._QueryService.getQuery('getSalaryTypes');
    }

    getEmployeeHistoyByEmployee(employeeID: number) {
        return this._QueryService.getQuery('getEmployeeHistoyByEmployee',{employeeid:employeeID});
    }

    private handleError(error: any) {
        console.error('API Error:', error);
        return throwError(() => error);
    }
}
