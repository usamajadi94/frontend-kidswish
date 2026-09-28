import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { SupplierFormComponent } from '../supplier/supplier-form.component';
import { RawMaterialFormComponent } from '../raw-material/raw-material-form.component';

@Component({
    selector: 'app-purchase-order',
    standalone: true,
    imports: [CommonModule, FormsModule, NzDatePickerModule, NzSelectModule, CurrencyPipe, DatePipe],
    templateUrl: './purchase-order.component.html',
    styleUrl: './purchase-order.component.scss',
})
export class PurchaseOrderComponent extends BaseRoutedComponent implements OnInit {
    private _http         = inject(HttpClient);
    private _localStorage = inject(LocalStorageService);
    private _drpService   = inject(DrpService);
    private _modalService = inject(ModalService);

    title = componentRegister.purchaseOrder.Title;

    suppliers: any[]     = [];
    rawMaterials: any[]  = [];
    orders: any[]        = [];
    selected: any        = null;
    isNew                = false;
    isLoading            = false;
    isLoadingDetail      = false;
    isSaving             = false;
    isConfirming         = false;
    isReceiving          = false;
    isDeleting           = false;
    errorMsg             = '';

    form: {
        SupplierID: number | null;
        PODate: Date | null;
        Items: { RawMaterialID: number | null; Qty: number; Rate: number; Amount: number }[];
    } = { SupplierID: null, PODate: new Date(), Items: [] };

    get headers() {
        return new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
    }

    get formTotal(): number {
        return this.form.Items.reduce((s, i) => s + (i.Amount || 0), 0);
    }

    unitSymbolFor(rawMaterialId: number | null): string {
        return this.rawMaterials.find(r => r.ID === rawMaterialId)?.UnitSymbol || '';
    }

    openNewSupplier(): void {
        this._modalService.openModal({ component: SupplierFormComponent, title: componentRegister.supplier?.Title || 'Supplier' })
            .afterClose.subscribe((saved: boolean) => {
                if (!saved) return;
                this._drpService.getSupplierDrp().subscribe({ next: (res: any) => { this.suppliers = res || []; } });
            });
    }

    openNewRawMaterial(): void {
        this._modalService.openModal({ component: RawMaterialFormComponent, title: componentRegister.rawMaterial?.Title || 'Raw Material' })
            .afterClose.subscribe((saved: boolean) => {
                if (!saved) return;
                this._drpService.getRawMaterialDrp().subscribe({ next: (res: any) => { this.rawMaterials = res || []; } });
            });
    }

    ngOnInit() {
        this._drpService.getSupplierDrp().subscribe({ next: (res: any) => { this.suppliers = res || []; } });
        this._drpService.getRawMaterialDrp().subscribe({ next: (res: any) => { this.rawMaterials = res || []; } });
        this.loadList();
    }

    loadList() {
        this.isLoading = true;
        this._http.get<any[]>(`${apiUrls.server}${apiUrls.purchaseOrderController}`, { headers: this.headers })
            .subscribe({
                next: (res) => { this.orders = res || []; this.isLoading = false; },
                error: () => { this.isLoading = false; },
            });
    }

    selectOrder(row: any) {
        this.isNew = false;
        this.errorMsg = '';
        this.isLoadingDetail = true;
        this._http.get<any>(`${apiUrls.server}${apiUrls.purchaseOrderController}/${row.ID}`, { headers: this.headers })
            .subscribe({
                next: (res) => { this.selected = res; this.isLoadingDetail = false; },
                error: () => { this.isLoadingDetail = false; },
            });
    }

    newOrder() {
        this.selected = null;
        this.isNew = true;
        this.errorMsg = '';
        this.form = { SupplierID: null, PODate: new Date(), Items: [] };
        this.addItem();
    }

    addItem() {
        this.form.Items.push({ RawMaterialID: null, Qty: 1, Rate: 0, Amount: 0 });
    }

    removeItem(i: number) {
        this.form.Items.splice(i, 1);
    }

    recalc(item: any) {
        item.Amount = Math.round((+item.Qty || 0) * (+item.Rate || 0) * 100) / 100;
    }

    editSelected() {
        this.form = {
            SupplierID: this.selected.SupplierID,
            PODate: this.selected.PODate ? new Date(this.selected.PODate) : new Date(),
            Items: (this.selected.Items || []).map((i: any) => ({
                RawMaterialID: i.RawMaterialID, Qty: +i.Qty, Rate: +i.Rate, Amount: +i.Amount,
            })),
        };
        this.isNew = true;
    }

    save() {
        if (!this.form.SupplierID) { this.errorMsg = 'Please select a supplier'; return; }
        if (!this.form.Items.length) { this.errorMsg = 'Add at least one item'; return; }
        if (this.form.Items.some(i => !i.RawMaterialID)) { this.errorMsg = 'All items need a raw material selected'; return; }
        this.errorMsg = '';
        this.isSaving = true;
        const payload = {
            SupplierID: this.form.SupplierID,
            PODate: this.form.PODate,
            Items: this.form.Items,
        };
        const req = this.selected
            ? this._http.patch<any>(`${apiUrls.server}${apiUrls.purchaseOrderController}/${this.selected.ID}`, payload, { headers: this.headers })
            : this._http.post<any>(`${apiUrls.server}${apiUrls.purchaseOrderController}`, payload, { headers: this.headers });
        req.subscribe({
            next: (res) => {
                this.isSaving = false;
                this.isNew = false;
                this.selected = res;
                this.loadList();
            },
            error: (err) => { this.isSaving = false; this.errorMsg = err?.error?.message || 'Save failed'; },
        });
    }

    confirm() {
        if (!confirm('Confirm this purchase order? It cannot be edited after confirmation.')) return;
        this.isConfirming = true;
        this._http.patch<any>(`${apiUrls.server}${apiUrls.purchaseOrderController}/${this.selected.ID}/confirm`, {}, { headers: this.headers })
            .subscribe({
                next: (res) => { this.isConfirming = false; this.selected = res; this.loadList(); },
                error: (err) => { this.isConfirming = false; this.errorMsg = err?.error?.message || 'Confirm failed'; },
            });
    }

    markReceived() {
        if (!confirm('Mark this purchase order as Received?')) return;
        this.isReceiving = true;
        this._http.patch<any>(`${apiUrls.server}${apiUrls.purchaseOrderController}/${this.selected.ID}/receive`, {}, { headers: this.headers })
            .subscribe({
                next: (res) => { this.isReceiving = false; this.selected = res; this.loadList(); },
                error: (err) => { this.isReceiving = false; this.errorMsg = err?.error?.message || 'Update failed'; },
            });
    }

    delete() {
        if (!confirm('Delete this purchase order?')) return;
        this.isDeleting = true;
        this._http.delete<any>(`${apiUrls.server}${apiUrls.purchaseOrderController}/${this.selected.ID}`, { headers: this.headers })
            .subscribe({
                next: () => { this.isDeleting = false; this.selected = null; this.isNew = false; this.loadList(); },
                error: (err) => { this.isDeleting = false; this.errorMsg = err?.error?.message || 'Delete failed'; },
            });
    }

    cancelEdit() {
        this.isNew = false;
        this.errorMsg = '';
        if (!this.selected) this.form = { SupplierID: null, PODate: new Date(), Items: [] };
    }
}
