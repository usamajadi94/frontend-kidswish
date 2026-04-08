import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { apiUrls } from 'app/modules/shared/services/api-url';

@Component({
    selector: 'app-stock-master',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule],
    templateUrl: './stock-master.component.html',
})
export class StockMasterComponent implements OnInit {
    private _localStorage = inject(LocalStorageService);
    private _http = inject(HttpClient);
    private _drp = inject(DrpService);

    stockList: any[] = [];
    productsDrp: any[] = [];
    isLoading = false;
    isSaving = false;
    showForm = false;
    errorMsg = '';

    form = { ProductID: null as any, TotalStock: 0, AvailableStock: 0 };
    editingId: number | null = null;

    get authHeaders() {
        return new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
    }

    ngOnInit() {
        this.loadStock();
        this.loadProducts();
    }

    loadStock() {
        this.isLoading = true;
        this._http.get<any[]>(`${apiUrls.server}${apiUrls.stockMasterController}`, { headers: this.authHeaders }).subscribe({
            next: (res: any) => { this.stockList = res || []; this.isLoading = false; },
            error: () => { this.isLoading = false; },
        });
    }

    loadProducts() {
        this._drp.getProductsDrp().subscribe({
            next: (res: any) => { this.productsDrp = res || []; },
        });
    }

    openForm(row?: any) {
        this.errorMsg = '';
        if (row) {
            this.form = { ProductID: row.ProductID, TotalStock: row.TotalStock, AvailableStock: row.AvailableStock };
            this.editingId = row.ID;
        } else {
            this.form = { ProductID: null, TotalStock: 0, AvailableStock: 0 };
            this.editingId = null;
        }
        this.showForm = true;
    }

    save() {
        if (!this.form.ProductID) return;
        this.isSaving = true;
        this.errorMsg = '';
        this._http.post<any>(`${apiUrls.server}${apiUrls.stockMasterController}`, this.form, { headers: this.authHeaders }).subscribe({
            next: () => { this.isSaving = false; this.showForm = false; this.loadStock(); },
            error: (e) => { this.isSaving = false; this.errorMsg = e?.error?.message || 'Failed to save'; },
        });
    }
}
