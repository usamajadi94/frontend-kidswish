import { formatDate } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { QueryService } from 'app/core/Base/services/query.service';
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private _QueryService = inject(QueryService);

  getSaleInvoiceReport(invoiceNo?: string, customerID?: number, fromDate?: Date, endDate?: Date) {
    return this._QueryService.getQuery('getSaleInvoiceReport', {
      invoiceno:invoiceNo || '' ,
      customerid:customerID || '',
      fromdate: fromDate || '',
      enddate: endDate || '',
    });
  }

  getCustomerRecovery(fromDate?: Date, endDate?: Date){
     return this._QueryService.getQuery('getCustomerRecoveryReport', {
      fromdate: fromDate || '',
      enddate: endDate || '',});
  }
  getInvoiceByCustomer(fromDate?: Date, endDate?: Date){
     return this._QueryService.getQuery('getInvoiceByCustomerReport', {
      fromdate: fromDate || '',
      enddate: endDate || '',});
  }
  getCompanySale(fromDate?: Date, endDate?: Date){
     return this._QueryService.getQuery('getCompanySaleReport', {
      fromdate: fromDate || '',
      enddate: endDate || '',});
  }

  getProductSaleReport(fromDate?: Date, endDate?: Date){
     return this._QueryService.getQuery('getProductSaleReport', {
      fromdate: fromDate || '',
      enddate: endDate || '',});
  }

  getSalesmanRouteSaleReport(fromDate?: Date, endDate?: Date, salesmanID?: number, routeID?: number) {
     return this._QueryService.getQuery('getSalesmanRouteSaleReport', {
      fromdate: fromDate || '',
      enddate: endDate || '',
      salesmanid: salesmanID || '',
      routeid: routeID || ''});
  }

  getBillCollectionReport(customerID: number, fromDate?: Date | string, endDate?: Date | string, ) {

    if (!customerID) {
      throw new Error('Customer ID is required for Bill Collection Report');
    }

    if(fromDate && fromDate != null && fromDate != undefined ) {
      fromDate = formatDate(fromDate, 'yyyy-MM-dd', 'en-US');
    }
    
    if(endDate && endDate != null && endDate != undefined ) {
      endDate = formatDate(endDate, 'yyyy-MM-dd', 'en-US');
    }
    return this._QueryService.getQuery('getBillCollectionReport', {
      customerid:customerID ,
      fromdate: fromDate || '',
      enddate: endDate || '',
     
    });
  }

  getPurchaseInvoiceReport(invoiceNo?: string, supplierID?: number, fromDate?: Date, endDate?: Date, ) {
    return this._QueryService.getQuery('getPurchaseInvoiceReport', {
      invoiceno:invoiceNo || '' ,
      supplierid:supplierID || '',
      fromdate: fromDate || '',
      enddate: endDate || ''
    });
  }
  getPurchaseInvoiceReturnReport(invoiceNo?: string, supplierID?: number, fromDate?: Date, endDate?: Date, ) {
    return this._QueryService.getQuery('getPurchaseInvoiceReturnReport', {
      invoiceno:invoiceNo || '' ,
      supplierid:supplierID || '',
      fromdate: fromDate || '',
      enddate: endDate || ''
    });
  }

}
