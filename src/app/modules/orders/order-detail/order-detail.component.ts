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

    get allDispatched(): boolean {
        if (!this.order?.Items?.length) return false;
        return this.order.Items.every((i: any) => parseFloat(i.RemainingQty) === 0);
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

    editOrder() {
        this._router.navigate(['/orders/order-edit', this.order.ID]);
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
        const totalCartons = items.reduce((s: number, i: any) => s + (Number(i.Carton) || 0), 0);

        const customerMap = new Map<string, any[]>();
        for (const item of items) {
            const key = item.CustomerName || '—';
            if (!customerMap.has(key)) customerMap.set(key, []);
            customerMap.get(key)!.push(item);
        }

        const fmt = (n: number) => 'PKR ' + n.toLocaleString('en-PK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const orderDate = d.OrderDate ? new Date(d.OrderDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

        let customerSections = '';
        let rowIndex = 0;
        customerMap.forEach((citems, cname) => {
            const cTotal = citems.reduce((s: number, i: any) => s + (i.LineTotal || 0), 0);
            const cCartons = citems.reduce((s: number, i: any) => s + (Number(i.Carton) || 0), 0);
            const invNo = citems[0]?.InvoiceNo || '';
            customerSections += `
              <tr class="customer-row">
                <td colspan="2" class="customer-name">${cname}${invNo ? `<span class="inv-badge">${invNo}</span>` : ''}</td>
                <td class="num">${cCartons.toLocaleString()}</td>
                <td class="num" colspan="2">${fmt(cTotal)}</td>
              </tr>`;
            citems.forEach((item: any) => {
                rowIndex++;
                customerSections += `
              <tr class="${rowIndex % 2 === 0 ? 'row-even' : 'row-odd'}">
                <td class="row-num">${rowIndex}</td>
                <td class="product-cell">${item.ProductName || '—'}</td>
                <td class="num">${Number(item.Carton).toLocaleString()}</td>
                <td class="num">${fmt(item.CartonPrice || 0)}</td>
                <td class="num amount-cell">${fmt(item.LineTotal || 0)}</td>
              </tr>`;
            });
        });

        const html = `<!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>Invoice — ${d.OrderInvoiceNo}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',Arial,sans-serif;background:#f5f6fa;color:#1a1a2e;font-size:13px}
  .page{background:#fff;max-width:900px;margin:0 auto;padding:40px 44px;min-height:100vh}

  /* Header */
  .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:24px;border-bottom:3px solid #1e3a8a;margin-bottom:28px}
  .brand{display:flex;flex-direction:column}
  .brand-name{font-size:26px;font-weight:800;color:#1e3a8a;letter-spacing:-0.5px}
  .brand-sub{font-size:11px;color:#64748b;margin-top:2px;text-transform:uppercase;letter-spacing:1px}
  .inv-box{text-align:right}
  .inv-label{font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:1px}
  .inv-no{font-size:22px;font-weight:800;color:#1e3a8a;margin-top:2px}

  /* Meta grid */
  .meta{display:grid;grid-template-columns:repeat(3,1fr);gap:0;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:28px}
  .meta-cell{padding:14px 18px;border-right:1px solid #e2e8f0}
  .meta-cell:last-child{border-right:none}
  .meta-label{font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}
  .meta-value{font-size:14px;font-weight:600;color:#1e293b}

  /* Table */
  table{width:100%;border-collapse:collapse;font-size:12.5px}
  .table-header tr th{background:#1e3a8a;color:#fff;padding:10px 12px;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:0.5px}
  .table-header tr th.num{text-align:right}
  .table-header tr th.row-num{width:36px;text-align:center}

  .customer-row td{background:#dbeafe;padding:9px 12px;font-weight:700;font-size:12.5px;color:#1e3a8a;border-bottom:1px solid #bfdbfe}
  .customer-name{font-size:13px}
  .inv-badge{display:inline-block;margin-left:10px;font-size:10px;font-weight:600;background:#1e3a8a;color:#fff;border-radius:4px;padding:2px 7px;vertical-align:middle}
  .customer-row .num{text-align:right;font-size:12px;color:#1e40af}

  .row-odd td,.row-even td{padding:8px 12px;border-bottom:1px solid #f1f5f9}
  .row-even td{background:#f8fafc}
  .row-odd td{background:#ffffff}
  .row-num{text-align:center;color:#94a3b8;font-size:11px;width:36px}
  .product-cell{color:#334155;font-weight:500}
  .num{text-align:right;color:#475569}
  .amount-cell{font-weight:600;color:#1e293b}

  /* Totals */
  .total-section{margin-top:0;border-top:2px solid #1e3a8a}
  .total-row td{padding:12px 12px;font-weight:700;font-size:13px;background:#1e3a8a;color:#fff}
  .total-row .num{text-align:right;font-size:14px}
  .subtotal-row td{padding:9px 12px;background:#eff6ff;border-bottom:1px solid #dbeafe;font-size:12.5px;color:#1e40af;font-weight:600}
  .subtotal-row .num{text-align:right}

  /* Signatures */
  .signatures{display:flex;justify-content:space-between;margin-top:56px;gap:24px}
  .sig-block{flex:1;text-align:center}
  .sig-line{border-top:1.5px solid #cbd5e1;padding-top:8px;margin-top:40px;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px}

  /* Footer */
  .footer{margin-top:32px;padding-top:16px;border-top:1px solid #e2e8f0;text-align:center;font-size:10.5px;color:#94a3b8}

  @media print{
    body{background:#fff}
    .page{padding:20px;max-width:100%}
  }
</style>
</head>
<body>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="brand">
      <div class="brand-name">Kids Wish</div>
      <div class="brand-sub">Distributor Order Invoice</div>
    </div>
    <div class="inv-box">
      <div class="inv-label">Invoice No</div>
      <div class="inv-no">${d.OrderInvoiceNo}</div>
    </div>
  </div>

  <!-- Meta info -->
  <div class="meta">
    <div class="meta-cell">
      <div class="meta-label">Order Date</div>
      <div class="meta-value">${orderDate}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Submitted By</div>
      <div class="meta-value">${d.SubmittedBy || '—'}</div>
    </div>
    <div class="meta-cell">
      <div class="meta-label">Total Customers</div>
      <div class="meta-value">${customerMap.size}</div>
    </div>
  </div>

  <!-- Table -->
  <table>
    <thead class="table-header">
      <tr>
        <th class="row-num">#</th>
        <th>Product</th>
        <th class="num">Cartons</th>
        <th class="num">Price/Carton</th>
        <th class="num">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${customerSections}
    </tbody>
  </table>

  <!-- Grand Total -->
  <table class="total-section">
    <tbody>
      <tr class="subtotal-row">
        <td style="width:36px"></td>
        <td>Total Cartons</td>
        <td class="num" style="width:110px">${totalCartons.toLocaleString()}</td>
        <td class="num" style="width:140px"></td>
        <td class="num" style="width:150px"></td>
      </tr>
      <tr class="total-row">
        <td colspan="4" style="text-align:right;padding-right:16px;letter-spacing:0.5px">GRAND TOTAL</td>
        <td class="num">${fmt(grandTotal)}</td>
      </tr>
    </tbody>
  </table>

  <!-- Signatures -->
  <div class="signatures">
    <div class="sig-block"><div class="sig-line">Prepared By</div></div>
    <div class="sig-block"><div class="sig-line">Authorized By</div></div>
    <div class="sig-block"><div class="sig-line">Received By</div></div>
  </div>

  <!-- Footer -->
  <div class="footer">Printed on ${new Date().toLocaleString('en-GB')} &nbsp;·&nbsp; Kids Wish — Distributor Management System</div>

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
        const dest = this._localStorage.isDistributor === 'true' ? '/orders/my-orders' : '/orders/order-list';
        this._router.navigate([dest]);
    }
}
