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
  
  getShipmentInvoiceReport(invoiceNo?: string, fromDate?: Date, endDate?: Date) {
    return this._QueryService.getQuery('getShipmentInvoice', {
      invoiceno:invoiceNo || '' ,
      fromdate: fromDate || '',
      enddate: endDate || '',
    });
  }


}
