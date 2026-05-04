import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { ModalService } from 'app/modules/shared/services/modal.service';

@Component({
    selector: 'app-dispatch-list',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule],
    templateUrl: './dispatch-list.component.html',
})
export class DispatchListComponent implements OnInit {
    private _localStorage = inject(LocalStorageService);
    private _http = inject(HttpClient);
    private _modal = inject(ModalService);

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
        this._modal.confirmModal({
            title: 'Confirm Dispatch',
            message: `Confirm dispatch of <b>${item.PlannedQty} carton(s)</b> of <b>${item.ProductName}</b> to <b>${item.CustomerName}</b>?`,
            icon: 'heroicons_outline:check-circle',
        }).afterClosed().subscribe((result) => {
            if (!result) return;
            this.busyId = item.ID;
            this._http.post<any>(`${apiUrls.server}${apiUrls.dispatchController}/confirm/${item.ID}`, {}, { headers: this.authHeaders }).subscribe({
                next: (res) => {
                    this.busyId = null;
                    item.Status = 'Confirmed';
                    item.DONo = res.doNo;
                    item.GatepassNo = res.gatepassNo;
                    this.load();
                },
                error: (e) => { this.busyId = null; this.errorMsg = e?.error?.message || 'Failed to confirm'; },
            });
        });
    }

    revert(item: any) {
        this._modal.confirmModal({
            title: 'Revert Dispatch',
            message: `Revert dispatch of <b>${item.PlannedQty} carton(s)</b> of <b>${item.ProductName}</b>? Stock will be restored.`,
            icon: 'heroicons_outline:arrow-uturn-left',
        }).afterClosed().subscribe((result) => {
            if (!result) return;
            this.busyId = item.ID;
            this._http.post<any>(`${apiUrls.server}${apiUrls.dispatchController}/revert/${item.ID}`, {}, { headers: this.authHeaders }).subscribe({
                next: () => { this.busyId = null; this.load(); },
                error: (e) => { this.busyId = null; this.errorMsg = e?.error?.message || 'Failed to revert'; },
            });
        });
    }

    delete(item: any) {
        this._modal.confirmModal({
            title: 'Delete Dispatch Entry',
            message: `Delete this planned dispatch entry for <b>${item.ProductName}</b>?`,
            icon: 'heroicons_outline:trash',
        }).afterClosed().subscribe((result) => {
            if (!result) return;
            this.busyId = item.ID;
            this._http.delete<any>(`${apiUrls.server}${apiUrls.dispatchController}/plan/${item.ID}`, { headers: this.authHeaders }).subscribe({
                next: () => { this.busyId = null; this.load(); },
                error: (e) => { this.busyId = null; this.errorMsg = e?.error?.message || 'Failed to delete'; },
            });
        });
    }

    printOrderDO(grp: any) {
        this._http.get<any>(`${apiUrls.server}${apiUrls.dispatchController}/order-do/${grp.OrderID}`, { headers: this.authHeaders }).subscribe({
            next: (data) => this.openOrderDoWindow('DO', data),
            error: (e) => { this.errorMsg = e?.error?.message || 'Failed to load DO data'; },
        });
    }

    printOrderGP(grp: any) {
        this._http.get<any>(`${apiUrls.server}${apiUrls.dispatchController}/order-do/${grp.OrderID}`, { headers: this.authHeaders }).subscribe({
            next: (data) => this.openOrderDoWindow('GP', data),
            error: (e) => { this.errorMsg = e?.error?.message || 'Failed to load GP data'; },
        });
    }

    printInvoice(grp: any) {
        this.busyInvoiceId = grp.OrderID;
        this._http.get<any>(`${apiUrls.server}${apiUrls.dispatchController}/order-invoice/${grp.OrderID}`, { headers: this.authHeaders }).subscribe({
            next: (data) => { this.busyInvoiceId = null; this.openInvoiceWindow(data); },
            error: (e) => { this.busyInvoiceId = null; this.errorMsg = e?.error?.message || 'Failed to load invoice'; },
        });
    }

    private openOrderDoWindow(type: 'DO' | 'GP', d: any) {
        const items: any[] = d.Items || [];
        const docLabel = type === 'DO' ? 'DELIVERY ORDER' : 'GATE PASS';
        const dateStr = items[0]?.Date ? new Date(items[0].Date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

        // Group items by customer
        const customerMap = new Map<string, any[]>();
        for (const item of items) {
            const key = item.CustomerName || '—';
            if (!customerMap.has(key)) customerMap.set(key, []);
            customerMap.get(key)!.push(item);
        }

        let customerSections = '';
        customerMap.forEach((citems, cname) => {
            const addr = citems[0]?.CustomerAddress || '';
            const refLabel = type === 'DO' ? 'DO No.' : 'GP No.';
            const itemRows = citems.map((i: any) => {
                const ref = type === 'DO' ? i.DONo : i.GatepassNo;
                return `<tr>
                  <td style="padding:8px 12px">${i.ProductName}</td>
                  <td style="padding:8px 12px;text-align:right;font-weight:600">${i.Qty}</td>
                  <td style="padding:8px 12px"><span style="background:#dbeafe;color:#1d4ed8;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;font-family:monospace">${ref || '—'}</span></td>
                </tr>`;
            }).join('');
            customerSections += `
              <div style="margin-bottom:16px">
                <div style="background:#eff6ff;border-left:3px solid #1a56db;padding:8px 12px;font-weight:600;font-size:13px;color:#1e40af">
                  ${cname}${addr ? `<span style="font-size:11px;color:#64748b;margin-left:10px;font-weight:400">${addr}</span>` : ''}
                </div>
                <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0">
                  <thead><tr style="background:#f8fafc">
                    <th style="text-align:left;padding:8px 12px;font-size:11px;font-weight:600;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0">Product</th>
                    <th style="text-align:right;padding:8px 12px;font-size:11px;font-weight:600;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0">Qty (Cartons)</th>
                    <th style="padding:8px 12px;font-size:11px;font-weight:600;text-transform:uppercase;color:#64748b;border-bottom:1px solid #e2e8f0">${refLabel}</th>
                  </tr></thead>
                  <tbody>${itemRows}</tbody>
                </table>
              </div>`;
        });

        const html = `<!DOCTYPE html><html><head><title>${docLabel} — ${d.OrderInvoiceNo}</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:'Segoe UI',Arial,sans-serif;padding:32px;font-size:13px;color:#1a1a1a}
          @media print{body{padding:16px}}
        </style></head><body>
        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:16px;border-bottom:3px solid #1a56db">
          <div>
            <div style="font-size:24px;font-weight:800;color:#1a56db;letter-spacing:-0.5px">Kids<span style="color:#f59e0b">Wish</span></div>
            <div style="font-size:11px;color:#94a3b8;margin-top:2px">Quality Products · Trusted Delivery</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:20px;font-weight:700;text-transform:uppercase;letter-spacing:1px">${docLabel}</div>
            <div style="font-size:13px;color:#6b7280;margin-top:2px">Order: <strong>${d.OrderInvoiceNo}</strong></div>
          </div>
        </div>
        <!-- Meta -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px 24px;background:#f8fafc;border-radius:8px;padding:12px 16px;border:1px solid #e2e8f0;margin-bottom:20px">
          <div><div style="font-size:10px;font-weight:600;text-transform:uppercase;color:#94a3b8">Date</div><div style="font-size:13px;font-weight:500">${dateStr}</div></div>
          <div><div style="font-size:10px;font-weight:600;text-transform:uppercase;color:#94a3b8">Prepared By</div><div style="font-size:13px;font-weight:500">${d.SubmittedBy || '—'}</div></div>
          <div><div style="font-size:10px;font-weight:600;text-transform:uppercase;color:#94a3b8">Total Items</div><div style="font-size:13px;font-weight:500">${items.length} line(s)</div></div>
        </div>
        <!-- Customer Sections -->
        ${customerSections}
        <!-- Signatures -->
        <div style="display:flex;justify-content:space-between;margin-top:56px">
          <div style="text-align:center;width:160px"><div style="border-top:1px solid #94a3b8;padding-top:6px;margin-top:36px;font-size:12px;color:#64748b">Prepared By</div></div>
          <div style="text-align:center;width:160px"><div style="border-top:1px solid #94a3b8;padding-top:6px;margin-top:36px;font-size:12px;color:#64748b">Store Keeper</div></div>
          <div style="text-align:center;width:160px"><div style="border-top:1px solid #94a3b8;padding-top:6px;margin-top:36px;font-size:12px;color:#64748b">Authorized By</div></div>
          <div style="text-align:center;width:160px"><div style="border-top:1px solid #94a3b8;padding-top:6px;margin-top:36px;font-size:12px;color:#64748b">Customer / Receiver</div></div>
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
        const orderDateStr = d.OrderDate ? new Date(d.OrderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

        // Group by customer
        const customerMap = new Map<string, any[]>();
        for (const item of items) {
            const key = item.CustomerName || '—';
            if (!customerMap.has(key)) customerMap.set(key, []);
            customerMap.get(key)!.push(item);
        }

        let customerSections = '';
        customerMap.forEach((citems, cname) => {
            const cTotal = citems.reduce((s: number, i: any) => s + (i.LineTotal || 0), 0);
            const itemRows = citems.map((item: any) => `
              <tr>
                <td style="padding:8px 12px 8px 24px;color:#374151">${item.ProductName}</td>
                <td style="padding:8px 12px;text-align:right;font-weight:600">${item.Carton}</td>
                <td style="padding:8px 12px;text-align:right;color:#6b7280">PKR ${(item.CartonPrice || 0).toLocaleString()}</td>
                <td style="padding:8px 12px;text-align:right;font-weight:600">PKR ${(item.LineTotal || 0).toLocaleString()}</td>
              </tr>`).join('');
            customerSections += `
              <div style="margin-bottom:16px">
                <div style="background:#f0fdf4;border-left:3px solid #16a34a;padding:8px 12px;font-weight:600;font-size:13px;color:#15803d;display:flex;justify-content:space-between">
                  <span>${cname} <span style="font-size:11px;color:#6b7280;font-weight:400;margin-left:8px">Invoice: ${citems[0]?.InvoiceNo || '—'}</span></span>
                  <span>PKR ${cTotal.toLocaleString()}</span>
                </div>
                <table style="width:100%;border-collapse:collapse;border:1px solid #e2e8f0;border-top:none">
                  <thead><tr style="background:#f8fafc">
                    <th style="text-align:left;padding:7px 12px 7px 24px;font-size:11px;font-weight:600;text-transform:uppercase;color:#9ca3af;border-bottom:1px solid #e2e8f0">Product</th>
                    <th style="text-align:right;padding:7px 12px;font-size:11px;font-weight:600;text-transform:uppercase;color:#9ca3af;border-bottom:1px solid #e2e8f0">Cartons</th>
                    <th style="text-align:right;padding:7px 12px;font-size:11px;font-weight:600;text-transform:uppercase;color:#9ca3af;border-bottom:1px solid #e2e8f0">Price/Carton</th>
                    <th style="text-align:right;padding:7px 12px;font-size:11px;font-weight:600;text-transform:uppercase;color:#9ca3af;border-bottom:1px solid #e2e8f0">Amount</th>
                  </tr></thead>
                  <tbody>${itemRows}</tbody>
                </table>
              </div>`;
        });

        const html = `<!DOCTYPE html><html><head><title>Invoice — ${d.OrderInvoiceNo}</title>
        <style>
          *{margin:0;padding:0;box-sizing:border-box}
          body{font-family:'Segoe UI',Arial,sans-serif;padding:32px;font-size:13px;color:#1a1a1a}
          @media print{body{padding:16px}}
        </style></head><body>
        <!-- Header -->
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding-bottom:16px;border-bottom:3px solid #16a34a">
          <div>
            <div style="font-size:26px;font-weight:800;color:#15803d;letter-spacing:-0.5px">Kids<span style="color:#f59e0b">Wish</span></div>
            <div style="font-size:11px;color:#94a3b8;margin-top:2px">Quality Products · Trusted Delivery</div>
          </div>
          <div style="text-align:right">
            <div style="font-size:22px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#111827">INVOICE</div>
            <div style="font-size:16px;font-weight:600;color:#15803d;margin-top:2px">${d.OrderInvoiceNo}</div>
          </div>
        </div>
        <!-- Meta Info -->
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px 24px;background:#f8fafc;border-radius:8px;padding:12px 16px;border:1px solid #e2e8f0;margin-bottom:20px">
          <div><div style="font-size:10px;font-weight:600;text-transform:uppercase;color:#94a3b8;margin-bottom:2px">Order Date</div><div style="font-size:13px;font-weight:500">${orderDateStr}</div></div>
          <div><div style="font-size:10px;font-weight:600;text-transform:uppercase;color:#94a3b8;margin-bottom:2px">Submitted By</div><div style="font-size:13px;font-weight:500">${d.SubmittedBy || '—'}</div></div>
          <div><div style="font-size:10px;font-weight:600;text-transform:uppercase;color:#94a3b8;margin-bottom:2px">Total Customers</div><div style="font-size:13px;font-weight:500">${customerMap.size}</div></div>
        </div>
        <!-- Items by Customer -->
        ${customerSections}
        <!-- Grand Total -->
        <div style="display:flex;justify-content:flex-end;margin-top:8px">
          <div style="background:#15803d;color:#fff;padding:12px 24px;border-radius:8px;text-align:right;min-width:220px">
            <div style="font-size:11px;text-transform:uppercase;opacity:0.8;margin-bottom:2px">Grand Total</div>
            <div style="font-size:22px;font-weight:800">PKR ${grandTotal.toLocaleString()}</div>
          </div>
        </div>
        <!-- Signatures -->
        <div style="display:flex;justify-content:space-between;margin-top:56px">
          <div style="text-align:center;width:160px"><div style="border-top:1px solid #94a3b8;padding-top:6px;margin-top:36px;font-size:12px;color:#64748b">Prepared By</div></div>
          <div style="text-align:center;width:160px"><div style="border-top:1px solid #94a3b8;padding-top:6px;margin-top:36px;font-size:12px;color:#64748b">Authorized By</div></div>
          <div style="text-align:center;width:160px"><div style="border-top:1px solid #94a3b8;padding-top:6px;margin-top:36px;font-size:12px;color:#64748b">Received By</div></div>
        </div>
        </body></html>`;
        const w = window.open('', '_blank');
        w?.document.write(html);
        w?.document.close();
        w?.print();
    }

    hasConfirmed(items: any[]): boolean { return items.some(i => i.Status === 'Confirmed'); }

    get totalPlanned(): number { return this.groups.flatMap(g => g.items).filter(i => i.Status === 'Planned').length; }
    get totalConfirmed(): number { return this.groups.flatMap(g => g.items).filter(i => i.Status === 'Confirmed').length; }

    today() { this.selectedDate = new Date().toISOString().split('T')[0]; this.load(); }
}
