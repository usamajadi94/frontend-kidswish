import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';

@Component({
    selector: 'app-order-list',
    standalone: true,
    imports: [CommonModule, FormsModule, BftButtonComponent, MatButtonModule, MatIconModule],
    templateUrl: './order-list.component.html',
})
export class OrderListComponent implements OnInit {
    private _localStorage = inject(LocalStorageService);
    private _http = inject(HttpClient);
    private _router = inject(Router);

    orders: any[] = [];
    filtered: any[] = [];
    isLoading = false;
    title = 'Orders';
    showSubmitBtn = false;
    searchText = '';
    filterStatus = '';
    filterFrom = '';
    filterTo = '';

    private _route = inject(ActivatedRoute);
    router = inject(Router);

    get authHeaders() {
        return new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
    }

    get isAdmin(): boolean { return this._localStorage.isDistributor !== 'true'; }

    ngOnInit() {
        const data = this._route.snapshot.data;
        if (data['title']) this.title = data['title'];
        if (data['showSubmitBtn']) this.showSubmitBtn = true;
        this.loadOrders();
    }

    loadOrders() {
        this.isLoading = true;
        this._http.get<any[]>(`${apiUrls.server}${apiUrls.distributorOrderController}`, { headers: this.authHeaders }).subscribe({
            next: (res: any) => { this.orders = res || []; this.applyFilters(); this.isLoading = false; },
            error: () => { this.isLoading = false; },
        });
    }

    applyFilters() {
        let list = [...this.orders];
        if (this.searchText) {
            const q = this.searchText.toLowerCase();
            list = list.filter(o => (o.InvoiceNo || '').toLowerCase().includes(q) || (o.SubmittedBy || '').toLowerCase().includes(q));
        }
        if (this.filterStatus) list = list.filter(o => o.Status === this.filterStatus);
        if (this.filterFrom) list = list.filter(o => o.OrderDate && o.OrderDate.substring(0,10) >= this.filterFrom);
        if (this.filterTo)   list = list.filter(o => o.OrderDate && o.OrderDate.substring(0,10) <= this.filterTo);
        this.filtered = list;
    }

    clearFilters() {
        this.searchText = '';
        this.filterStatus = '';
        this.filterFrom = '';
        this.filterTo = '';
        this.applyFilters();
    }

    viewOrder(row: any) {
        this._router.navigate(['/orders/order-detail', row.ID]);
    }

    printInvoice(row: any, event: Event) {
        event.stopPropagation();
        this._http.get<any>(`${apiUrls.server}${apiUrls.dispatchController}/order-invoice/${row.ID}`, { headers: this.authHeaders }).subscribe({
            next: (d) => this.openInvoiceWindow(d),
            error: () => alert('No invoice data available'),
        });
    }

    private openInvoiceWindow(d: any) {
        const items: any[] = d.Items || [];
        const grandTotal = items.reduce((s: number, i: any) => s + (i.LineTotal || 0), 0);

        const customerMap = new Map<string, any[]>();
        for (const item of items) {
            const key = item.CustomerName || '—';
            if (!customerMap.has(key)) customerMap.set(key, []);
            customerMap.get(key)!.push(item);
        }

        let customerRows = '';
        customerMap.forEach((citems, cname) => {
            const cTotal = citems.reduce((s: number, i: any) => s + (i.LineTotal || 0), 0);
            customerRows += `
              <tr style="background:#f0f4ff">
                <td colspan="4" style="font-weight:600;padding:6px 10px">${cname}
                  <span style="font-size:11px;color:#666;margin-left:8px">Invoice: ${citems[0]?.InvoiceNo || '—'}</span>
                </td>
                <td style="text-align:right;font-weight:600;padding:6px 10px">PKR ${cTotal.toLocaleString()}</td>
              </tr>`;
            citems.forEach((item: any) => {
                customerRows += `<tr>
                  <td style="padding:6px 10px 6px 20px;color:#555">${item.ProductName}</td>
                  <td style="text-align:right;padding:6px 10px">${item.Carton}</td>
                  <td style="text-align:right;padding:6px 10px">PKR ${(item.CartonPrice || 0).toLocaleString()}</td>
                  <td colspan="2" style="text-align:right;padding:6px 10px">PKR ${(item.LineTotal || 0).toLocaleString()}</td>
                </tr>`;
            });
        });

        const html = `<!DOCTYPE html><html><head><title>Invoice — ${d.OrderInvoiceNo}</title>
        <style>
          body{font-family:Arial,sans-serif;padding:30px;font-size:13px}
          h2{text-align:center;margin-bottom:4px}
          .sub{text-align:center;color:#666;margin-bottom:20px;font-size:12px}
          table{width:100%;border-collapse:collapse;margin-top:16px}
          th,td{border:1px solid #ddd;padding:8px 10px}
          th{background:#f0f0f0;font-weight:600;text-align:left}
          .total{background:#e8f5e9;font-weight:700;font-size:14px}
          .sig{display:flex;justify-content:space-between;margin-top:60px}
          .sig div{text-align:center;width:180px}
          .sig .line{border-top:1px solid #333;padding-top:6px;margin-top:30px}
        </style></head><body>
        <h2>INVOICE — ${d.OrderInvoiceNo}</h2>
        <p class="sub">Order Date: ${new Date(d.OrderDate).toLocaleDateString()} | Submitted By: ${d.SubmittedBy || '—'}</p>
        <table>
          <thead><tr>
            <th>Product</th><th style="text-align:right">Cartons</th>
            <th style="text-align:right">Price/Carton</th>
            <th colspan="2" style="text-align:right">Amount</th>
          </tr></thead>
          <tbody>${customerRows}</tbody>
          <tfoot>
            <tr class="total">
              <td colspan="4" style="text-align:right;padding:10px">Grand Total</td>
              <td style="text-align:right;padding:10px">PKR ${grandTotal.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
        <div class="sig">
          <div><div class="line">Prepared By</div></div>
          <div><div class="line">Authorized By</div></div>
          <div><div class="line">Received By</div></div>
        </div>
        </body></html>`;
        const w = window.open('', '_blank');
        w?.document.write(html);
        w?.document.close();
        w?.print();
    }
}
