import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';

@Component({
    selector: 'app-dispatch-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule],
    templateUrl: './dispatch-list.component.html',
})
export class DispatchListComponent implements OnInit {
    private _localStorage = inject(LocalStorageService);
    private _http = inject(HttpClient);

    groups: any[] = [];
    isLoading = false;
    selectedDate: string = new Date().toISOString().split('T')[0];
    busyId: number | null = null;
    busyInvoiceId: number | null = null;
    errorMsg = '';
    expandedGroups = new Set<number>(); // expanded OrderIDs

    get authHeaders() {
        return new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
    }

    ngOnInit() { this.load(); }

    load() {
        this.isLoading = true;
        this.errorMsg = '';
        this._http.get<any[]>(`${apiUrls.server}${apiUrls.dispatchController}/list?date=${this.selectedDate}`, { headers: this.authHeaders }).subscribe({
            next: (res: any) => {
                this.groups = res || [];
                // Auto-expand all groups on load
                this.expandedGroups = new Set(this.groups.map(g => g.OrderID));
                this.isLoading = false;
            },
            error: () => { this.isLoading = false; },
        });
    }

    toggleGroup(orderId: number) {
        if (this.expandedGroups.has(orderId)) {
            this.expandedGroups.delete(orderId);
        } else {
            this.expandedGroups.add(orderId);
        }
    }

    isExpanded(orderId: number): boolean {
        return this.expandedGroups.has(orderId);
    }

    confirm(item: any) {
        if (!confirm(`Confirm dispatch: ${item.PlannedQty} x ${item.ProductName} → ${item.CustomerName}?`)) return;
        this.busyId = item.ID;
        this._http.post<any>(`${apiUrls.server}${apiUrls.dispatchController}/confirm/${item.ID}`, {}, { headers: this.authHeaders }).subscribe({
            next: (res) => {
                this.busyId = null;
                item.Status = 'Confirmed';
                item.DONo = res.doNo;
                item.GatepassNo = res.gatepassNo;
                this.load(); // reload to pick up OrderStatus change
            },
            error: (e) => { this.busyId = null; this.errorMsg = e?.error?.message || 'Failed to confirm'; },
        });
    }

    revert(item: any) {
        if (!confirm(`Revert dispatch: ${item.PlannedQty} x ${item.ProductName}? Stock will be restored.`)) return;
        this.busyId = item.ID;
        this._http.post<any>(`${apiUrls.server}${apiUrls.dispatchController}/revert/${item.ID}`, {}, { headers: this.authHeaders }).subscribe({
            next: () => { this.busyId = null; this.load(); },
            error: (e) => { this.busyId = null; this.errorMsg = e?.error?.message || 'Failed to revert'; },
        });
    }

    delete(item: any) {
        if (!confirm('Delete this planned dispatch entry?')) return;
        this.busyId = item.ID;
        this._http.delete<any>(`${apiUrls.server}${apiUrls.dispatchController}/plan/${item.ID}`, { headers: this.authHeaders }).subscribe({
            next: () => { this.busyId = null; this.load(); },
            error: (e) => { this.busyId = null; this.errorMsg = e?.error?.message || 'Failed to delete'; },
        });
    }

    printDO(item: any) {
        this._http.get<any>(`${apiUrls.server}${apiUrls.dispatchController}/do/${item.ID}`, { headers: this.authHeaders }).subscribe({
            next: (data) => this.openDoWindow('DO', data),
        });
    }

    printGatepass(item: any) {
        this._http.get<any>(`${apiUrls.server}${apiUrls.dispatchController}/do/${item.ID}`, { headers: this.authHeaders }).subscribe({
            next: (data) => this.openDoWindow('GP', data),
        });
    }

    printInvoice(grp: any) {
        this.busyInvoiceId = grp.OrderID;
        this._http.get<any>(`${apiUrls.server}${apiUrls.dispatchController}/order-invoice/${grp.OrderID}`, { headers: this.authHeaders }).subscribe({
            next: (data) => { this.busyInvoiceId = null; this.openInvoiceWindow(data); },
            error: (e) => { this.busyInvoiceId = null; this.errorMsg = e?.error?.message || 'Failed to load invoice'; },
        });
    }

    private openDoWindow(type: 'DO' | 'GP', d: any) {
        const title = type === 'DO' ? `DELIVERY ORDER — ${d.DONo}` : `GATE PASS — ${d.GatepassNo}`;
        const refNo = type === 'DO' ? d.DONo : d.GatepassNo;
        const html = `<!DOCTYPE html><html><head><title>${title}</title>
        <style>
          body{font-family:Arial,sans-serif;padding:30px;font-size:13px}
          h2{text-align:center;margin-bottom:4px}
          .sub{text-align:center;color:#666;margin-bottom:20px;font-size:12px}
          table{width:100%;border-collapse:collapse;margin-top:16px}
          th,td{border:1px solid #ccc;padding:8px 10px;text-align:left}
          th{background:#f0f0f0;font-weight:600}
          .sig{display:flex;justify-content:space-between;margin-top:60px}
          .sig div{text-align:center;width:180px}
          .sig .line{border-top:1px solid #333;padding-top:6px;margin-top:30px}
        </style></head><body>
        <h2>${title}</h2>
        <p class="sub">Ref No: ${refNo} | Order: ${d.OrderInvoiceNo || '—'} | Date: ${new Date(d.Date).toLocaleDateString()}</p>
        <table>
          <tr><th>Customer</th><td>${d.CustomerName}</td><th>Address</th><td>${d.CustomerAddress || '—'}</td></tr>
          <tr><th>Product</th><td>${d.ProductName}</td><th>Qty (Cartons)</th><td>${d.Qty}</td></tr>
          ${d.CartonPrice ? `<tr><th>Price / Carton</th><td>PKR ${d.CartonPrice}</td><th>Total</th><td>PKR ${(d.Qty * d.CartonPrice).toLocaleString()}</td></tr>` : ''}
          ${d.Notes ? `<tr><th>Notes</th><td colspan="3">${d.Notes}</td></tr>` : ''}
        </table>
        <div class="sig">
          <div><div class="line">Prepared By</div></div>
          <div><div class="line">Store Keeper</div></div>
          <div><div class="line">Customer / Receiver</div></div>
        </div>
        </body></html>`;
        const w = window.open('', '_blank');
        w?.document.write(html);
        w?.document.close();
        w?.print();
    }

    private openInvoiceWindow(d: any) {
        const items: any[] = d.Items || [];
        const grandTotal = items.reduce((s: number, i: any) => s + (i.LineTotal || 0), 0);

        // Group by customer
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
                  <td style="text-align:right;padding:6px 10px">PKR ${item.CartonPrice?.toLocaleString() || 0}</td>
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
            <th>Product</th>
            <th style="text-align:right">Cartons</th>
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

    get totalPlanned(): number { return this.groups.flatMap(g => g.items).filter(i => i.Status === 'Planned').length; }
    get totalConfirmed(): number { return this.groups.flatMap(g => g.items).filter(i => i.Status === 'Confirmed').length; }

    today() { this.selectedDate = new Date().toISOString().split('T')[0]; this.load(); }
}
