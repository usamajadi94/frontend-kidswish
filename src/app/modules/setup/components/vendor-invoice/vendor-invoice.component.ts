import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { BaseRoutedComponent } from 'app/core/Base/base-routed/base-routed.component';
import { componentRegister } from 'app/modules/shared/services/component-register';

@Component({
    selector: 'app-vendor-invoice',
    standalone: true,
    imports: [CommonModule, FormsModule, NzDatePickerModule, NzSelectModule, CurrencyPipe, DatePipe],
    templateUrl: './vendor-invoice.component.html',
    styleUrl: './vendor-invoice.component.scss',
})
export class VendorInvoiceComponent extends BaseRoutedComponent implements OnInit {
    private _http         = inject(HttpClient);
    private _localStorage = inject(LocalStorageService);
    private _drpService   = inject(DrpService);

    title = componentRegister.vendorInvoice.Title;

    vendors: any[]   = [];
    invoices: any[]  = [];
    selected: any    = null;
    isNew            = false;
    isLoading        = false;
    isLoadingDetail  = false;
    isSaving         = false;
    isConfirming     = false;
    isDeleting       = false;
    errorMsg         = '';

    form: {
        VendorID: number | null;
        InvoiceDate: Date | null;
        Notes: string;
        Items: { Description: string; Qty: number; Rate: number; Amount: number }[];
    } = { VendorID: null, InvoiceDate: new Date(), Notes: '', Items: [] };

    get headers() {
        return new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
    }

    get formTotal(): number {
        return this.form.Items.reduce((s, i) => s + (i.Amount || 0), 0);
    }

    ngOnInit() {
        this._drpService.getVendorDrp().subscribe({ next: (res: any) => { this.vendors = res || []; } });
        this.loadList();
    }

    loadList() {
        this.isLoading = true;
        this._http.get<any[]>(`${apiUrls.server}${apiUrls.vendorInvoiceController}`, { headers: this.headers })
            .subscribe({
                next: (res) => { this.invoices = res || []; this.isLoading = false; },
                error: () => { this.isLoading = false; },
            });
    }

    selectInvoice(row: any) {
        this.isNew = false;
        this.errorMsg = '';
        this.isLoadingDetail = true;
        this._http.get<any>(`${apiUrls.server}${apiUrls.vendorInvoiceController}/${row.ID}`, { headers: this.headers })
            .subscribe({
                next: (res) => { this.selected = res; this.isLoadingDetail = false; },
                error: () => { this.isLoadingDetail = false; },
            });
    }

    newInvoice() {
        this.selected = null;
        this.isNew = true;
        this.errorMsg = '';
        this.form = { VendorID: null, InvoiceDate: new Date(), Notes: '', Items: [] };
        this.addItem();
    }

    addItem() {
        this.form.Items.push({ Description: '', Qty: 1, Rate: 0, Amount: 0 });
    }

    removeItem(i: number) {
        this.form.Items.splice(i, 1);
    }

    recalc(item: any) {
        item.Amount = Math.round((+item.Qty || 0) * (+item.Rate || 0) * 100) / 100;
    }

    editSelected() {
        this.form = {
            VendorID: this.selected.VendorID,
            InvoiceDate: this.selected.InvoiceDate ? new Date(this.selected.InvoiceDate) : new Date(),
            Notes: this.selected.Notes || '',
            Items: (this.selected.Items || []).map((i: any) => ({
                Description: i.Description, Qty: +i.Qty, Rate: +i.Rate, Amount: +i.Amount,
            })),
        };
        this.isNew = true;
    }

    save() {
        if (!this.form.VendorID) { this.errorMsg = 'Please select a vendor'; return; }
        if (!this.form.Items.length) { this.errorMsg = 'Add at least one item'; return; }
        if (this.form.Items.some(i => !i.Description.trim())) { this.errorMsg = 'All items need a description'; return; }
        this.errorMsg = '';
        this.isSaving = true;
        const payload = {
            VendorID: this.form.VendorID,
            InvoiceDate: this.form.InvoiceDate,
            Notes: this.form.Notes,
            Items: this.form.Items,
        };
        const req = this.selected
            ? this._http.patch<any>(`${apiUrls.server}${apiUrls.vendorInvoiceController}/${this.selected.ID}`, payload, { headers: this.headers })
            : this._http.post<any>(`${apiUrls.server}${apiUrls.vendorInvoiceController}`, payload, { headers: this.headers });
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
        if (!confirm('Confirm this invoice? It cannot be edited after confirmation.')) return;
        this.isConfirming = true;
        this._http.patch<any>(`${apiUrls.server}${apiUrls.vendorInvoiceController}/${this.selected.ID}/confirm`, {}, { headers: this.headers })
            .subscribe({
                next: (res) => { this.isConfirming = false; this.selected = res; this.loadList(); },
                error: (err) => { this.isConfirming = false; this.errorMsg = err?.error?.message || 'Confirm failed'; },
            });
    }

    delete() {
        if (!confirm('Delete this invoice?')) return;
        this.isDeleting = true;
        this._http.delete<any>(`${apiUrls.server}${apiUrls.vendorInvoiceController}/${this.selected.ID}`, { headers: this.headers })
            .subscribe({
                next: () => { this.isDeleting = false; this.selected = null; this.isNew = false; this.loadList(); },
                error: (err) => { this.isDeleting = false; this.errorMsg = err?.error?.message || 'Delete failed'; },
            });
    }

    cancelEdit() {
        this.isNew = false;
        this.errorMsg = '';
        if (!this.selected) this.form = { VendorID: null, InvoiceDate: new Date(), Notes: '', Items: [] };
    }
}
