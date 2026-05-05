import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { apiUrls } from 'app/modules/shared/services/api-url';

@Component({
    selector: 'app-stock-master',
    standalone: true,
    imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule],
    templateUrl: './stock-master.component.html',
})
export class StockMasterComponent implements OnInit {
    private _localStorage = inject(LocalStorageService);
    private _http = inject(HttpClient);
    private _drp = inject(DrpService);

    stockList: any[] = [];
    productCards: any[] = [];
    transactions: any[] = [];
    productsDrp: any[] = [];
    isLoading = false;
    isSaving = false;
    showAddForm = false;
    showTxn = false;
    showEditForm = false;
    editingId: number | null = null;
    errorMsg = '';

    expandedRows = new Set<number>();
    productTxns = new Map<number, any[]>();
    loadingTxnRows = new Set<number>();

    // Daily add form
    addForm = { ProductID: null as any, Qty: null as any, Notes: '' };

    // Edit threshold form
    form = { ProductID: null as any, TotalStock: null as any, AvailableStock: null as any, LowStockThreshold: null as any, Notes: '' };

    get authHeaders() {
        return new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
    }

    ngOnInit() {
        this._drp.getProductsDrp().subscribe({ next: (res: any) => { this.productsDrp = res || []; } });
        this.loadAll();
    }

    loadAll() {
        this.isLoading = true;
        this.productTxns = new Map();
        this.expandedRows = new Set();
        Promise.all([
            this._http.get<any[]>(`${apiUrls.server}${apiUrls.stockMasterController}`, { headers: this.authHeaders }).toPromise(),
            this._http.get<any[]>(`${apiUrls.server}${apiUrls.stockMasterController}/product-cards`, { headers: this.authHeaders }).toPromise(),
        ]).then(([list, cards]) => {
            this.stockList = list || [];
            this.productCards = cards || [];
            this.isLoading = false;
        }).catch(() => { this.isLoading = false; });
    }

    openAdd() {
        this.addForm = { ProductID: null, Qty: 0, Notes: '' };
        this.errorMsg = '';
        this.showAddForm = true;
        this.showEditForm = false;
    }

    saveAdd() {
        if (!this.addForm.ProductID || this.addForm.Qty <= 0) {
            this.errorMsg = 'Product and Qty > 0 required'; return;
        }
        this.isSaving = true;
        this._http.post<any>(`${apiUrls.server}${apiUrls.stockMasterController}/add`, this.addForm, { headers: this.authHeaders }).subscribe({
            next: () => { this.isSaving = false; this.showAddForm = false; this.loadAll(); },
            error: (e) => { this.isSaving = false; this.errorMsg = e?.error?.message || 'Failed'; },
        });
    }

    openForm(row?: any) {
        this.editingId = row?.ID || null;
        this.form = {
            ProductID: row?.ProductID || null,
            TotalStock: row?.TotalStock ?? null,
            AvailableStock: row?.AvailableStock ?? null,
            LowStockThreshold: row?.LowStockThreshold ?? null,
            Notes: '',
        };
        this.errorMsg = '';
        this.showEditForm = true;
        this.showAddForm = false;
    }

    save() {
        if (!this.form.ProductID) { this.errorMsg = 'Product required'; return; }
        this.isSaving = true;
        this._http.post<any>(`${apiUrls.server}${apiUrls.stockMasterController}`, this.form, { headers: this.authHeaders }).subscribe({
            next: () => { this.isSaving = false; this.showEditForm = false; this.loadAll(); },
            error: (e) => { this.isSaving = false; this.errorMsg = e?.error?.message || 'Failed'; },
        });
    }

    openTxn(row?: any) {
        const productId = row?.ProductID;
        this._http.get<any[]>(
            `${apiUrls.server}${apiUrls.stockMasterController}/transactions${productId ? '?productId=' + productId : ''}`,
            { headers: this.authHeaders }
        ).subscribe({ next: (res) => { this.transactions = res || []; this.showTxn = true; } });
    }

    toggleExpand(row: any) {
        const pid = row.ProductID;
        if (this.expandedRows.has(pid)) {
            this.expandedRows = new Set([...this.expandedRows].filter(p => p !== pid));
            return;
        }
        this.expandedRows = new Set([...this.expandedRows, pid]);
        if (!this.productTxns.has(pid)) {
            this.loadingTxnRows = new Set([...this.loadingTxnRows, pid]);
            this._http.get<any[]>(
                `${apiUrls.server}${apiUrls.stockMasterController}/transactions?productId=${pid}`,
                { headers: this.authHeaders }
            ).subscribe({
                next: (res) => {
                    const m = new Map(this.productTxns);
                    m.set(pid, res || []);
                    this.productTxns = m;
                    this.loadingTxnRows = new Set([...this.loadingTxnRows].filter(p => p !== pid));
                },
                error: () => {
                    const m = new Map(this.productTxns);
                    m.set(pid, []);
                    this.productTxns = m;
                    this.loadingTxnRows = new Set([...this.loadingTxnRows].filter(p => p !== pid));
                },
            });
        }
    }

    stockColor(status: string) { return status === 'low' ? 'text-orange-500' : 'text-green-500'; }
    stockLabel(status: string) { return status === 'low' ? 'Low Stock' : 'In Stock'; }
}
