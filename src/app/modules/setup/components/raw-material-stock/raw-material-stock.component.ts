import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { componentRegister } from 'app/modules/shared/services/component-register';

@Component({
    selector: 'app-raw-material-stock',
    standalone: true,
    imports: [CommonModule, FormsModule, NzDatePickerModule, NzSelectModule, DatePipe],
    templateUrl: './raw-material-stock.component.html',
    styleUrl: './raw-material-stock.component.scss',
})
export class RawMaterialStockComponent extends BaseRoutedComponent implements OnInit {
    private _http         = inject(HttpClient);
    private _localStorage = inject(LocalStorageService);
    private _drpService   = inject(DrpService);

    title = componentRegister.rawMaterialStock.Title;

    summary: any[]      = [];
    products: any[]     = [];
    selected: any       = null;
    movements: any[]    = [];
    isLoadingSummary    = false;
    isLoadingMovements  = false;
    isSaving            = false;
    errorMsg            = '';

    form: { Date: Date; Type: 'IN' | 'OUT'; Qty: number | null; ProductID: number | null; Notes: string } =
        this.blankForm();

    get headers() {
        return new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
    }

    private base = `${apiUrls.server}${apiUrls.rawMaterialStockController}`;

    ngOnInit() {
        this._drpService.getProductDrp().subscribe({ next: (res: any) => { this.products = res || []; } });
        this.loadSummary();
    }

    blankForm() {
        return { Date: new Date(), Type: 'IN' as 'IN' | 'OUT', Qty: null, ProductID: null, Notes: '' };
    }

    loadSummary() {
        this.isLoadingSummary = true;
        this._http.get<any[]>(`${this.base}/summary`, { headers: this.headers }).subscribe({
            next: (res) => {
                this.summary = res || [];
                this.isLoadingSummary = false;
                if (this.selected) {
                    this.selected = this.summary.find(r => r.RawMaterialID === this.selected.RawMaterialID) || null;
                }
            },
            error: () => { this.isLoadingSummary = false; },
        });
    }

    selectMaterial(row: any) {
        this.selected = row;
        this.errorMsg = '';
        this.form = this.blankForm();
        this.loadMovements();
    }

    loadMovements() {
        this.isLoadingMovements = true;
        this._http.get<any[]>(`${this.base}/${this.selected.RawMaterialID}/movements`, { headers: this.headers }).subscribe({
            next: (res) => { this.movements = res || []; this.isLoadingMovements = false; },
            error: () => { this.isLoadingMovements = false; },
        });
    }

    // Send a plain local yyyy-MM-dd; a Date object would be shifted a day back by toISOString() for PKT users.
    private localDateString(d: Date): string {
        return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)}`;
    }

    save() {
        if (!this.selected) return;
        const qty = +(this.form.Qty || 0);
        if (qty <= 0) { this.errorMsg = 'Quantity must be greater than 0'; return; }
        this.errorMsg = '';
        this.isSaving = true;
        const payload = {
            RawMaterialID: this.selected.RawMaterialID,
            Date: this.localDateString(this.form.Date),
            Type: this.form.Type,
            Qty: qty,
            ProductID: this.form.Type === 'OUT' ? this.form.ProductID : null,
            Notes: this.form.Notes,
        };
        this._http.post<any>(this.base, payload, { headers: this.headers }).subscribe({
            next: () => {
                this.isSaving = false;
                this.form = this.blankForm();
                this.loadSummary();
                this.loadMovements();
            },
            error: (err) => { this.isSaving = false; this.errorMsg = err?.error?.message || 'Save failed'; },
        });
    }

    remove(row: any) {
        if (!confirm('Delete this stock entry?')) return;
        this._http.delete<any>(`${this.base}/${row.ID}`, { headers: this.headers }).subscribe({
            next: () => { this.errorMsg = ''; this.loadSummary(); this.loadMovements(); },
            error: (err) => { this.errorMsg = err?.error?.message || 'Delete failed'; },
        });
    }
}
