import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';

@Component({
    selector: 'app-order-detail',
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule],
    templateUrl: './order-detail.component.html',
})
export class OrderDetailComponent implements OnInit {
    private _route = inject(ActivatedRoute);
    private _router = inject(Router);
    private _localStorage = inject(LocalStorageService);
    private _http = inject(HttpClient);

    order: any = null;
    isLoading = true;
    isUpdatingStatus = false;
    isGeneratingInvoice = false;
    statusError = '';
    invoiceMsg = '';

    get isAdmin(): boolean { return this._localStorage.isDistributor !== 'true'; }

    get customerGroups(): { customerName: string; invoiceNo: string; items: any[] }[] {
        if (!this.order?.Items) return [];
        const map = new Map<string, { invoiceNo: string; items: any[] }>();
        for (const item of this.order.Items) {
            const key = item.CustomerName || '(No Customer)';
            if (!map.has(key)) map.set(key, { invoiceNo: item.InvoiceNo || '', items: [] });
            map.get(key)!.items.push(item);
        }
        return Array.from(map.entries()).map(([customerName, v]) => ({ customerName, invoiceNo: v.invoiceNo, items: v.items }));
    }

    get hasInsufficientStock(): boolean {
        return this.order?.Items?.some((i: any) => i.StockStatus === 'Insufficient') ?? false;
    }

    ngOnInit() {
        const id = this._route.snapshot.params['id'];
        this.loadOrder(id);
    }

    loadOrder(id: number) {
        const h = this.authHeaders;
        this._http.get(`${apiUrls.server}${apiUrls.distributorOrderController}/${id}`, { headers: h }).subscribe({
            next: (res: any) => { this.order = res; this.isLoading = false; },
            error: () => { this.isLoading = false; },
        });
    }

    markInProcess() {
        this.isUpdatingStatus = true;
        this.statusError = '';
        this._http.patch(
            `${apiUrls.server}${apiUrls.distributorOrderController}/${this.order.ID}/status`,
            { Status: 'In Process' },
            { headers: this.authHeaders }
        ).subscribe({
            next: (res: any) => { this.order = res; this.isUpdatingStatus = false; },
            error: (e) => { this.isUpdatingStatus = false; this.statusError = e?.error?.message || e?.message || `Error ${e?.status}`; },
        });
    }

    completeOrder() {
        if (!confirm('Mark this order as Completed?')) return;
        this.isUpdatingStatus = true;
        this.statusError = '';
        this._http.patch(
            `${apiUrls.server}${apiUrls.distributorOrderController}/${this.order.ID}/status`,
            { Status: 'Completed' },
            { headers: this.authHeaders }
        ).subscribe({
            next: (res: any) => { this.order = res; this.isUpdatingStatus = false; },
            error: (e) => { this.isUpdatingStatus = false; this.statusError = e?.error?.message || 'Failed'; },
        });
    }

    generateInvoice() {
        if (!confirm('Generate invoice? This will create receivable entries per customer based on carton price.')) return;
        this.isGeneratingInvoice = true;
        this.invoiceMsg = '';
        this._http.post<any>(
            `${apiUrls.server}${apiUrls.distributorOrderController}/${this.order.ID}/invoice`,
            {},
            { headers: this.authHeaders }
        ).subscribe({
            next: () => {
                this.isGeneratingInvoice = false;
                this.invoiceMsg = 'Invoice generated!';
                this.loadOrder(this.order.ID);
            },
            error: (e) => { this.isGeneratingInvoice = false; this.invoiceMsg = e?.error?.message || 'Failed'; },
        });
    }

    printInvoice() {
        this._http.get<any>(
            `${apiUrls.server}${apiUrls.dispatchController}/order-invoice/${this.order.ID}`,
            { headers: this.authHeaders }
        ).subscribe({
            next: (d) => this.openInvoiceWindow(d),
            error: () => alert('No invoice data available yet'),
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

    private get authHeaders() {
        return new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
    }

    goBack() {
        this._router.navigate([window.history.length > 1 ? '..' : '/orders/order-list'], { relativeTo: this._route });
    }
}
