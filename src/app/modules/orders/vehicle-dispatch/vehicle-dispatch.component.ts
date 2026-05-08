import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzModalModule, NzModalService } from 'ng-zorro-antd/modal';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { apiUrls } from 'app/modules/shared/services/api-url';

@Component({
    selector: 'app-vehicle-dispatch',
    standalone: true,
    imports: [CommonModule, FormsModule, NzSelectModule, NzDatePickerModule, NzModalModule, DatePipe],
    templateUrl: './vehicle-dispatch.component.html',
})
export class VehicleDispatchComponent implements OnInit {
    private _http  = inject(HttpClient);
    private _ls    = inject(LocalStorageService);
    private _drp   = inject(DrpService);
    private _modal = inject(NzModalService);

    // ── List ──────────────────────────────────────────────────────────────────
    list: any[] = [];
    listTab = 'All';
    selected: any = null;
    isLoadingList   = false;
    isLoadingDetail = false;
    isConfirming    = false;

    get filteredList(): any[] {
        if (this.listTab === 'All') return this.list;
        return this.list.filter(v => v.Status === this.listTab);
    }

    tabCount(tab: string): number {
        if (tab === 'All') return this.list.length;
        return this.list.filter(v => v.Status === tab).length;
    }

    // ── Create form ───────────────────────────────────────────────────────────
    showForm = false;
    form = { DispatchDate: new Date() as any, DriverID: null as any, VehicleNo: '', BuiltyNo: '', FreightAmount: null as any, Notes: '' };
    isSaving    = false;
    isSharingDO = false;

    // ── Available items ───────────────────────────────────────────────────────
    availableItems: any[] = [];
    isLoadingAvail  = false;

    // ── Item selection state ──────────────────────────────────────────────────
    selCustomerId: number | null = null;
    selOrderId: number | null = null;
    selectionRows: any[] = [];

    // ── Items staged for this delivery ────────────────────────────────────────
    stagedItems: {
        PlanID: number; CustomerID: number; CustomerName: string;
        OrderID: number; OrderInvoiceNo: string; ProductName: string; Qty: number;
    }[] = [];

    drivers: any[] = [];

    get headers() {
        return new HttpHeaders({ uid: this._ls.uid, cid: this._ls.cid, eid: this._ls.eid });
    }
    get base() { return `${apiUrls.server}${apiUrls.vehicleDispatchController}`; }

    ngOnInit() {
        this.loadList();
        this._drp.getDriverDrp().subscribe({ next: (res: any) => this.drivers = res || [] });
    }

    loadList() {
        this.isLoadingList = true;
        this._http.get<any[]>(this.base, { headers: this.headers }).subscribe({
            next: (res) => { this.list = res || []; this.isLoadingList = false; },
            error: () => { this.isLoadingList = false; },
        });
    }

    select(item: any) {
        this.showForm = false;
        this.isLoadingDetail = true;
        this._http.get<any>(`${this.base}/${item.ID}`, { headers: this.headers }).subscribe({
            next: (res) => { this.selected = res; this.isLoadingDetail = false; },
            error: () => { this.isLoadingDetail = false; },
        });
    }

    openNewForm() {
        this.selected = null;
        this.showForm = true;
        this.form = { DispatchDate: new Date(), DriverID: null, VehicleNo: '', BuiltyNo: '', FreightAmount: null, Notes: '' };
        this.stagedItems = [];
        this.selCustomerId = null;
        this.selOrderId = null;
        this.selectionRows = [];
        this.isLoadingAvail = true;
        this._http.get<any[]>(`${this.base}/available-items`, { headers: this.headers }).subscribe({
            next: (res) => { this.availableItems = res || []; this.isLoadingAvail = false; },
            error: () => { this.isLoadingAvail = false; },
        });
    }

    get customersForForm(): { ID: number; Name: string }[] {
        const map = new Map<number, string>();
        for (const i of this.availableItems) {
            if (!this.stagedItems.find(s => s.PlanID === i.PlanID)) {
                map.set(i.CustomerID, i.CustomerName);
            }
        }
        return [...map.entries()].map(([ID, Name]) => ({ ID, Name }));
    }

    get ordersForSelCustomer(): { ID: number; Label: string }[] {
        if (!this.selCustomerId) return [];
        const map = new Map<number, string>();
        for (const i of this.availableItems) {
            if (i.CustomerID === this.selCustomerId && !this.stagedItems.find(s => s.PlanID === i.PlanID)) {
                map.set(i.OrderID, i.OrderInvoiceNo || ('#' + i.OrderID));
            }
        }
        return [...map.entries()].map(([ID, Label]) => ({ ID, Label }));
    }

    onCustomerChange() { this.selOrderId = null; this.selectionRows = []; }

    onOrderChange() {
        if (!this.selCustomerId || !this.selOrderId) { this.selectionRows = []; return; }
        this.selectionRows = this.availableItems
            .filter(i => i.CustomerID === this.selCustomerId
                      && i.OrderID === this.selOrderId
                      && !this.stagedItems.find(s => s.PlanID === i.PlanID))
            .map(i => ({ ...i, inputQty: +i.PlannedQty }));
    }

    addToDelivery() {
        for (const row of this.selectionRows) {
            if (+row.inputQty > 0) {
                this.stagedItems.push({
                    PlanID: row.PlanID, CustomerID: row.CustomerID, CustomerName: row.CustomerName,
                    OrderID: row.OrderID, OrderInvoiceNo: row.OrderInvoiceNo || ('#' + row.OrderID),
                    ProductName: row.ProductName, Qty: +row.inputQty,
                });
            }
        }
        this.selCustomerId = null; this.selOrderId = null; this.selectionRows = [];
    }

    removeStagedItem(planId: number) {
        this.stagedItems = this.stagedItems.filter(i => i.PlanID !== planId);
        this.onOrderChange();
    }

    get groupedStaged(): { customerName: string; orderLabel: string; items: any[] }[] {
        const map = new Map<number, any>();
        for (const item of this.stagedItems) {
            if (!map.has(item.CustomerID)) {
                map.set(item.CustomerID, { customerName: item.CustomerName, orderLabel: item.OrderInvoiceNo, items: [] });
            }
            map.get(item.CustomerID).items.push(item);
        }
        return [...map.values()];
    }

    saveDelivery() {
        if (!this.stagedItems.length || this.isSaving) return;
        this.isSaving = true;
        this._http.post<any>(this.base, this.form, { headers: this.headers }).subscribe({
            next: (vd) => {
                const planIds = this.stagedItems.map(i => i.PlanID);
                this._http.post<any>(`${this.base}/${vd.ID}/items`, { planIds }, { headers: this.headers }).subscribe({
                    next: () => { this.isSaving = false; this.showForm = false; this.loadList(); this.select({ ID: vd.ID }); },
                    error: () => { this.isSaving = false; },
                });
            },
            error: () => { this.isSaving = false; },
        });
    }

    confirm() {
        this._modal.confirm({
            nzTitle: 'Confirm Delivery?',
            nzContent: 'This will generate 1 DO + 1 Gatepass and create invoices for all items.',
            nzOkText: 'Confirm', nzOkType: 'primary',
            nzOnOk: () => {
                this.isConfirming = true;
                this._http.post<any>(`${this.base}/${this.selected.ID}/confirm`, {}, { headers: this.headers }).subscribe({
                    next: (res) => { this.selected = res; this.isConfirming = false; this.loadList(); },
                    error: () => { this.isConfirming = false; },
                });
            },
        });
    }

    deleteVD() {
        this._modal.confirm({
            nzTitle: 'Delete this delivery?', nzContent: 'Items will be returned to the available pool.',
            nzOkDanger: true, nzOkText: 'Delete',
            nzOnOk: () => {
                this._http.delete<any>(`${this.base}/${this.selected.ID}`, { headers: this.headers }).subscribe({
                    next: () => { this.selected = null; this.showForm = false; this.loadList(); },
                });
            },
        });
    }

    removeItem(planId: number) {
        this._http.delete<any>(`${this.base}/${this.selected.ID}/items/${planId}`, { headers: this.headers })
            .subscribe({ next: (res) => { this.selected = res; this.loadList(); } });
    }

    get uniqueCustomerCount(): number {
        if (!this.selected?.Items) return 0;
        return new Set(this.selected.Items.map((i: any) => i.CustomerID)).size;
    }

    get groupedByCustomer(): { customer: string; items: any[]; total: number }[] {
        if (!this.selected?.Items) return [];
        const map = new Map<number, any>();
        for (const item of this.selected.Items) {
            if (!map.has(item.CustomerID)) {
                map.set(item.CustomerID, { customer: item.CustomerName, items: [], total: 0 });
            }
            const g = map.get(item.CustomerID);
            g.items.push(item);
            g.total += +item.PlannedQty || 0;
        }
        return [...map.values()];
    }

    statusClass(status: string): string {
        switch (status) {
            case 'Confirmed': return 'bg-green-100 text-green-700';
            case 'Draft':     return 'bg-yellow-100 text-yellow-700';
            default:          return 'bg-gray-100 text-gray-600';
        }
    }

    // ── Print / Share ─────────────────────────────────────────────────────────

    private _printHtml(html: string) {
        const w = window.open('', '_blank', 'width=750,height=950');
        if (!w) return;
        w.document.write(html);
        w.document.close();
        w.focus();
        setTimeout(() => w.print(), 400);
    }

    private get _logoUrl(): string {
        return `${window.location.origin}/images/logo/trackcloud/kidswishlogo.png`;
    }

    private _header(docTitle: string): string {
        return `<div class="header">
            <img src="${this._logoUrl}" style="height:54px;object-fit:contain;margin-bottom:6px" crossorigin="anonymous">
            <div class="title">${docTitle}</div>
        </div>`;
    }

    private get _css(): string {
        return `body{font-family:Arial,sans-serif;margin:25px;font-size:12px;color:#111}
            .header{text-align:center;margin-bottom:16px;border-bottom:2px solid #222;padding-bottom:10px}
            .title{font-size:18px;font-weight:bold;letter-spacing:3px;margin-top:4px}
            .meta{display:flex;justify-content:space-between;margin-bottom:12px;font-size:11px;line-height:1.9}
            .dbox{background:#f7f7f7;border:1px solid #ddd;padding:7px 12px;margin-bottom:14px;border-radius:3px;font-size:11px}
            .cust{font-weight:bold;font-size:12px;border-bottom:1px solid #bbb;padding-bottom:3px;margin-bottom:5px}
            .oref{font-size:10px;color:#666;margin-bottom:8px}
            table{width:100%;border-collapse:collapse}
            th{background:#ececec;text-align:left;padding:5px 8px;border:1px solid #ccc;font-size:11px}
            td{padding:4px 8px;border:1px solid #ddd;font-size:11px}
            .tr{background:#f4f4f4;font-weight:bold}
            .sigs{display:flex;justify-content:space-between;margin-top:45px}
            .sig{text-align:center;width:140px}
            .sig-line{border-top:1px solid #333;padding-top:4px;font-size:10px;color:#555}
            .page{page-break-after:always}.page:last-child{page-break-after:avoid}
            @media print{@page{margin:12mm}body{margin:0}}`;
    }

    printDO() {
        const d = this.selected;
        const date = new Date(d.DispatchDate).toLocaleDateString('en-GB');
        const dbox = `<strong>Driver:</strong> ${d.DriverName || '—'} &nbsp;&nbsp;&nbsp; <strong>Vehicle No:</strong> ${d.VehicleNo || '—'}`;

        const pages = this.groupedByCustomer.map(g => {
            const rows = g.items.map((i: any) =>
                `<tr><td>${i.ProductName}</td><td style="text-align:right">${i.PlannedQty}</td></tr>`
            ).join('');
            const ml = `<strong>DO No:</strong> ${d.DONo || '—'}<br>
                        <strong>Gatepass:</strong> ${d.GatpassNo || '—'}
                        ${d.BuiltyNo ? '<br><strong>Builty No:</strong> ' + d.BuiltyNo : ''}`;
            return `<div class="page">
                ${this._header('DELIVERY ORDER')}
                <div class="meta"><div>${ml}</div><div style="text-align:right"><strong>Date:</strong> ${date}</div></div>
                <div class="dbox">${dbox}</div>
                <div class="cust">${g.customer}</div>
                <div class="oref">Order: ${g.items[0]?.OrderInvoiceNo || '—'}</div>
                <table>
                    <thead><tr><th>Product</th><th style="text-align:right">Qty (Ctns)</th></tr></thead>
                    <tbody>
                        ${rows}
                        <tr class="tr"><td><strong>Total</strong></td><td style="text-align:right"><strong>${g.total} ctns</strong></td></tr>
                    </tbody>
                </table>
                <div class="sigs">
                    <div class="sig"><div class="sig-line">Driver Signature</div></div>
                    <div class="sig"><div class="sig-line">Customer Signature</div></div>
                    <div class="sig"><div class="sig-line">Authorized By</div></div>
                </div>
            </div>`;
        }).join('');

        this._printHtml(`<!DOCTYPE html><html><head><title>DO-${d.DONo}</title><style>${this._css}</style></head><body>${pages}</body></html>`);
    }

    printGatepass() {
        const d = this.selected;
        const date = new Date(d.DispatchDate).toLocaleDateString('en-GB');
        const totalQty = this.groupedByCustomer.reduce((s, g) => s + g.total, 0);
        const rows = this.groupedByCustomer.flatMap(g =>
            g.items.map((i: any) => `<tr><td>${i.ProductName}</td><td style="text-align:right">${i.PlannedQty}</td></tr>`)
        ).join('');
        const ml = `<strong>GP No:</strong> ${d.GatpassNo || '—'}<br>
                    <strong>DO No:</strong> ${d.DONo || '—'}
                    ${d.BuiltyNo ? '<br><strong>Builty No:</strong> ' + d.BuiltyNo : ''}`;
        const html = `<!DOCTYPE html><html><head><title>GP-${d.GatpassNo}</title><style>${this._css}</style></head><body>
            ${this._header('GATE PASS')}
            <div class="meta"><div>${ml}</div><div style="text-align:right"><strong>Date:</strong> ${date}</div></div>
            <div class="dbox"><strong>Driver:</strong> ${d.DriverName || '—'} &nbsp;&nbsp;&nbsp; <strong>Vehicle No:</strong> ${d.VehicleNo || '—'}</div>
            <table>
                <thead><tr><th>Product</th><th style="text-align:right">Qty (Ctns)</th></tr></thead>
                <tbody>
                    ${rows}
                    <tr class="tr"><td><strong>Grand Total</strong></td><td style="text-align:right"><strong>${totalQty} ctns</strong></td></tr>
                </tbody>
            </table>
            <div class="sigs">
                <div class="sig"><div class="sig-line">Driver Signature</div></div>
                <div class="sig"><div class="sig-line">Security</div></div>
                <div class="sig"><div class="sig-line">Authorized By</div></div>
            </div>
        </body></html>`;
        this._printHtml(html);
    }

    async shareDoImage() {
        if (this.isSharingDO) return;
        this.isSharingDO = true;
        try {
            const h2c = (await import('html2canvas')).default;
            const d = this.selected;
            const date = new Date(d.DispatchDate).toLocaleDateString('en-GB');
            const files: File[] = [];

            for (const g of this.groupedByCustomer) {
                const rows = g.items.map((i: any) =>
                    `<tr>
                        <td style="padding:5px 8px;border:1px solid #ddd;font-size:11px">${i.ProductName}</td>
                        <td style="padding:5px 8px;border:1px solid #ddd;font-size:11px;text-align:right">${i.PlannedQty}</td>
                    </tr>`
                ).join('');

                const el = document.createElement('div');
                el.style.cssText = 'position:fixed;left:-9999px;top:0;width:680px;background:#fff;padding:30px;font-family:Arial,sans-serif;color:#111;box-sizing:border-box';
                el.innerHTML = `
                    <div style="text-align:center;border-bottom:2px solid #222;padding-bottom:10px;margin-bottom:16px">
                        <img src="${this._logoUrl}" style="height:54px;object-fit:contain;margin-bottom:6px" crossorigin="anonymous">
                        <div style="font-size:18px;font-weight:bold;letter-spacing:3px;margin-top:4px">DELIVERY ORDER</div>
                    </div>
                    <div style="display:flex;justify-content:space-between;margin-bottom:12px;font-size:11px;line-height:1.9">
                        <div>
                            <strong>DO No:</strong> ${d.DONo || '—'}<br>
                            <strong>Gatepass:</strong> ${d.GatpassNo || '—'}
                            ${d.BuiltyNo ? '<br><strong>Builty No:</strong> ' + d.BuiltyNo : ''}
                        </div>
                        <div style="text-align:right"><strong>Date:</strong> ${date}</div>
                    </div>
                    <div style="background:#f7f7f7;border:1px solid #ddd;padding:7px 12px;margin-bottom:16px;border-radius:3px;font-size:11px">
                        <strong>Driver:</strong> ${d.DriverName || '—'} &nbsp;&nbsp;&nbsp;
                        <strong>Vehicle No:</strong> ${d.VehicleNo || '—'}
                    </div>
                    <div style="font-weight:bold;font-size:13px;border-bottom:1px solid #bbb;padding-bottom:3px;margin-bottom:5px">${g.customer}</div>
                    <div style="font-size:10px;color:#666;margin-bottom:10px">Order: ${g.items[0]?.OrderInvoiceNo || '—'}</div>
                    <table style="width:100%;border-collapse:collapse">
                        <thead><tr>
                            <th style="background:#ececec;text-align:left;padding:5px 8px;border:1px solid #ccc;font-size:11px">Product</th>
                            <th style="background:#ececec;text-align:right;padding:5px 8px;border:1px solid #ccc;font-size:11px">Qty (Ctns)</th>
                        </tr></thead>
                        <tbody>
                            ${rows}
                            <tr style="background:#f4f4f4">
                                <td style="padding:5px 8px;border:1px solid #ddd;font-size:11px;font-weight:bold">Total</td>
                                <td style="padding:5px 8px;border:1px solid #ddd;font-size:11px;font-weight:bold;text-align:right">${g.total} ctns</td>
                            </tr>
                        </tbody>
                    </table>`;

                document.body.appendChild(el);
                try {
                    const canvas = await h2c(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
                    const blob = await new Promise<Blob>(res => canvas.toBlob(b => res(b!), 'image/png'));
                    files.push(new File([blob], `DO-${d.DONo || 'delivery'}-${g.customer}.png`, { type: 'image/png' }));
                } finally {
                    document.body.removeChild(el);
                }
            }

            if (!files.length) return;

            if ((navigator as any).share && (navigator as any).canShare?.({ files })) {
                await (navigator as any).share({ files, title: `Delivery Order ${d.DONo || ''}` });
            } else {
                // Desktop fallback: download images
                for (const file of files) {
                    const url = URL.createObjectURL(file);
                    const a = document.createElement('a');
                    a.href = url; a.download = file.name; a.click();
                    URL.revokeObjectURL(url);
                }
            }
        } catch (e: any) {
            if (e?.name !== 'AbortError') console.error(e);
        } finally {
            this.isSharingDO = false;
        }
    }
}
