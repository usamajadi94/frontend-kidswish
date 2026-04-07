import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { MatIconModule } from '@angular/material/icon';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';

interface ProductRow {
    ProductID: number | null;
    Qty: number;
    Carton: number;
    Notes: string;
}

interface CustomerGroup {
    CustomerID: number | null;
    InvoiceNo: string;
    products: ProductRow[];
}

@Component({
    selector: 'app-order-submit',
    standalone: true,
    imports: [CommonModule, FormsModule, NzSelectModule, NzMessageModule, MatIconModule, BftButtonComponent],
    templateUrl: './order-submit.component.html',
})
export class OrderSubmitComponent implements OnInit {
    private _drp = inject(DrpService);
    private _localStorage = inject(LocalStorageService);
    private _http = inject(HttpClient);
    private _msg = inject(NzMessageService);
    private _router = inject(Router);

    invoiceNo = '';
    orderDate: string = new Date().toISOString().split('T')[0];
    notes = '';
    groups: CustomerGroup[] = [];
    products: any[] = [];
    customers: any[] = [];
    isSaving = false;

    ngOnInit() {
        this._drp.getProductsDrp().subscribe({ next: (res: any) => { this.products = res || []; } });
        this._drp.getCustomerInformationDrp().subscribe({ next: (res: any) => { this.customers = res || []; } });
        this.addCustomer();
    }

    addCustomer() {
        this.groups.push({ CustomerID: null, InvoiceNo: '', products: [this.emptyProduct()] });
    }

    removeCustomer(gi: number) {
        if (this.groups.length > 1) this.groups.splice(gi, 1);
    }

    addProduct(gi: number) {
        this.groups[gi].products.push(this.emptyProduct());
    }

    removeProduct(gi: number, pi: number) {
        if (this.groups[gi].products.length > 1) this.groups[gi].products.splice(pi, 1);
    }

    private emptyProduct(): ProductRow {
        return { ProductID: null, Qty: 1, Carton: 0, Notes: '' };
    }

    customerName(id: number): string {
        return this.customers.find(c => c.ID === id)?.Name || '';
    }

    get totalProductLines(): number {
        return this.groups.reduce((s, g) => s + g.products.length, 0);
    }

    get isValid(): boolean {
        if (!this.invoiceNo.trim()) return false;
        return this.groups.every(g =>
            g.CustomerID &&
            g.InvoiceNo.trim() &&
            g.products.length > 0 &&
            g.products.every(p => p.ProductID && p.Qty > 0)
        );
    }

    submit() {
        if (!this.isValid) {
            this._msg.warning('Order No, Customer, Invoice No, Product, and Qty are required.');
            return;
        }
        this.isSaving = true;

        // Flatten groups → items
        const items = this.groups.flatMap(g =>
            g.products.map(p => ({
                CustomerID: g.CustomerID,
                InvoiceNo: g.InvoiceNo,
                ProductID: p.ProductID,
                Qty: p.Qty,
                Carton: p.Carton,
                Notes: p.Notes,
            }))
        );

        const headers = new HttpHeaders({
            uid: this._localStorage.uid,
            cid: this._localStorage.cid,
            eid: this._localStorage.eid,
        });

        this._http.post(`${apiUrls.server}${apiUrls.distributorOrderController}`, {
            InvoiceNo: this.invoiceNo,
            OrderDate: this.orderDate,
            Notes: this.notes,
            Items: items,
        }, { headers }).subscribe({
            next: () => {
                this._msg.success('Order submitted successfully!');
                this.isSaving = false;
                this._router.navigate(['/orders/my-orders']);
            },
            error: (err) => {
                this._msg.error(err?.error?.message || 'Failed to submit order.');
                this.isSaving = false;
            },
        });
    }

    reset() {
        this.invoiceNo = '';
        this.orderDate = new Date().toISOString().split('T')[0];
        this.notes = '';
        this.groups = [];
        this.addCustomer();
    }
}
