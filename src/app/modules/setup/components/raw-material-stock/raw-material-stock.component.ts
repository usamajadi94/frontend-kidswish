import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { componentRegister } from 'app/modules/shared/services/component-register';

@Component({
    selector: 'app-raw-material-stock',
    standalone: true,
    imports: [CommonModule, FormsModule, NzDatePickerModule, DatePipe, DecimalPipe],
    templateUrl: './raw-material-stock.component.html',
    styleUrl: './raw-material-stock.component.scss',
})
export class RawMaterialStockComponent extends BaseRoutedComponent implements OnInit {
    private _http         = inject(HttpClient);
    private _localStorage = inject(LocalStorageService);
    private _drpService   = inject(DrpService);

    title = componentRegister.rawMaterialStock.Title;
    private base = `${apiUrls.server}${apiUrls.rawMaterialStockController}`;

    summary: any[]        = [];
    transactions: any[]   = [];
    rawMaterials: any[]   = [];
    products: any[]       = [];
    isLoading             = false;
    isSaving              = false;
    showAddForm           = false;
    showTxn               = true;
    errorMsg              = '';

    txnFrom: string = '';
    txnTo: string   = '';
    txnRawMaterial: number | null = null;

    addForm: { Date: Date; RawMaterialID: number | null; Type: 'IN' | 'OUT'; Qty: number | null; ProductID: number | null; Notes: string } =
        this.blankForm();

    get headers() {
        return new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
    }

    blankForm() {
        return { Date: new Date(), RawMaterialID: null, Type: 'IN' as 'IN' | 'OUT', Qty: null, ProductID: null, Notes: '' };
    }

    ngOnInit() {
        this._drpService.getRawMaterialDrp().subscribe({ next: (res: any) => { this.rawMaterials = res || []; } });
        this._drpService.getProductDrp().subscribe({ next: (res: any) => { this.products = res || []; } });
        this.loadAll();
    }

    loadAll() {
        this.isLoading = true;
        this._http.get<any[]>(`${this.base}/summary`, { headers: this.headers }).subscribe({
            next: (res) => { this.summary = res || []; this.isLoading = false; },
            error: () => { this.isLoading = false; },
        });
        this._http.get<any[]>(`${this.base}/transactions`, { headers: this.headers }).subscribe({
            next: (res) => { this.transactions = res || []; },
        });
    }

    get productCards(): any[] {
        return this.summary.map(r => ({ ...r, Low: +r.Remaining <= 0 }));
    }

    get filteredTransactions(): any[] {
        return this.transactions.filter(t => {
            const d = String(t.Date).slice(0, 10);
            if (this.txnFrom && d < this.txnFrom) return false;
            if (this.txnTo && d > this.txnTo) return false;
            if (this.txnRawMaterial && t.RawMaterialID !== this.txnRawMaterial) return false;
            return true;
        });
    }

    get txnTotalIn(): number {
        return this.filteredTransactions.filter(t => !t.IsDeleted && t.Type === 'IN').reduce((s, t) => s + (+t.Qty || 0), 0);
    }

    get txnTotalOut(): number {
        return this.filteredTransactions.filter(t => !t.IsDeleted && t.Type === 'OUT').reduce((s, t) => s + (+t.Qty || 0), 0);
    }

    clearTxnFilter() {
        this.txnFrom = '';
        this.txnTo = '';
        this.txnRawMaterial = null;
    }

    // A Date object would be shifted a day back by toISOString() for PKT users, so send a plain yyyy-MM-dd.
    private localDateString(d: Date): string {
        return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
    }

    openAdd(type: 'IN' | 'OUT' = 'IN', rawMaterialId: number | null = null) {
        this.addForm = { ...this.blankForm(), Type: type, RawMaterialID: rawMaterialId };
        this.errorMsg = '';
        this.showAddForm = true;
    }

    save() {
        const qty = +(this.addForm.Qty || 0);
        if (!this.addForm.RawMaterialID) { this.errorMsg = 'Please select a raw material'; return; }
        if (qty <= 0) { this.errorMsg = 'Quantity must be greater than 0'; return; }
        this.errorMsg = '';
        this.isSaving = true;
        const payload = {
            RawMaterialID: this.addForm.RawMaterialID,
            Date: this.localDateString(this.addForm.Date),
            Type: this.addForm.Type,
            Qty: qty,
            ProductID: this.addForm.Type === 'OUT' ? this.addForm.ProductID : null,
            Notes: this.addForm.Notes,
        };
        this._http.post<any>(this.base, payload, { headers: this.headers }).subscribe({
            next: () => {
                this.isSaving = false;
                this.showAddForm = false;
                this.loadAll();
            },
            error: (err) => { this.isSaving = false; this.errorMsg = err?.error?.message || 'Save failed'; },
        });
    }

    remove(row: any) {
        if (!confirm('Delete this stock entry?')) return;
        this._http.delete(`${this.base}/${row.ID}`, { headers: this.headers }).subscribe({
            next: () => { this.loadAll(); },
            error: (err) => { this.errorMsg = err?.error?.message || 'Delete failed'; },
        });
    }
}
