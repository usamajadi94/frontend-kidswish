import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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
    Carton: number;
    Notes: string;
}

interface CustomerGroup {
    CustomerID: number | null;
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
    private _route = inject(ActivatedRoute);

    invoiceNo = '';
    orderDate: string = new Date().toISOString().split('T')[0];
    notes = '';
    groups: CustomerGroup[] = [];
    products: any[] = [];
    customers: any[] = [];
    isSaving = false;
    orderId: number | null = null;

    get isEditMode(): boolean { return this.orderId !== null; }
    get isAdmin(): boolean { return this._localStorage.isDistributor !== 'true'; }

    ngOnInit() {
        this._drp.getProductsDrp().subscribe({ next: (res: any) => { this.products = res || []; } });
        this._drp.getCustomerInformationDrp().subscribe({ next: (res: any) => { this.customers = res || []; } });

        const id = this._route.snapshot.params['id'];
        if (id) {
            this.orderId = +id;
            this.loadExistingOrder(+id);
        } else {
            this.addCustomer();
            this.loadNextOrderNo();
        }
    }

    loadExistingOrder(id: number) {
        const headers = this.authHeaders;
        this._http.get<any>(`${apiUrls.server}${apiUrls.distributorOrderController}/${id}`, { headers }).subscribe({
            next: (order) => {
                this.invoiceNo = order.InvoiceNo || '';
                this.orderDate = order.OrderDate ? order.OrderDate.split('T')[0] : new Date().toISOString().split('T')[0];
                this.notes = order.Notes || '';

                const groupMap = new Map<number, CustomerGroup>();
                for (const item of (order.Items || [])) {
                    const cid = item.CustomerID;
                    if (!groupMap.has(cid)) groupMap.set(cid, { CustomerID: cid, products: [] });
                    groupMap.get(cid)!.products.push({ ProductID: item.ProductID, Carton: item.Carton, Notes: item.Notes || '' });
                }
                this.groups = [...groupMap.values()];
                if (this.groups.length === 0) this.addCustomer();
            },
            error: () => { this._msg.error('Failed to load order'); this.addCustomer(); },
        });
    }

    loadNextOrderNo() {
        const headers = this.authHeaders;
        this._http.get<any>(`${apiUrls.server}${apiUrls.distributorOrderController}/next-order-no`, { headers }).subscribe({
            next: (res) => { this.invoiceNo = res?.InvoiceNo || ''; },
        });
    }

    addCustomer() {
        this.groups.push({ CustomerID: null, products: [this.emptyProduct()] });
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
        return { ProductID: null, Carton: null as any, Notes: '' };
    }

    get totalProductLines(): number {
        return this.groups.reduce((s, g) => s + g.products.length, 0);
    }

    get isValid(): boolean {
        return this.groups.every(g =>
            g.CustomerID &&
            g.products.length > 0 &&
            g.products.every(p => p.ProductID && p.Carton > 0)
        );
    }

    private get authHeaders() {
        return new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
    }

    submit() {
        if (!this.isValid) {
            this._msg.warning('Customer, Product, and Carton qty are required.');
            return;
        }
        this.isSaving = true;

        const items = this.groups.flatMap(g =>
            g.products.map(p => ({
                CustomerID: g.CustomerID,
                ProductID: p.ProductID,
                Carton: p.Carton,
                Notes: p.Notes,
            }))
        );

        const payload = { InvoiceNo: this.invoiceNo, OrderDate: this.orderDate, Notes: this.notes, Items: items };
        const headers = this.authHeaders;
        const dest = this.isAdmin ? '/orders/order-list' : '/orders/my-orders';

        if (this.isEditMode) {
            this._http.put(`${apiUrls.server}${apiUrls.distributorOrderController}/${this.orderId}`, payload, { headers }).subscribe({
                next: () => {
                    this._msg.success('Order updated successfully!');
                    this.isSaving = false;
                    this._router.navigate(['/orders/order-detail', this.orderId]);
                },
                error: (err) => { this._msg.error(err?.error?.message || 'Failed to update order.'); this.isSaving = false; },
            });
        } else {
            this._http.post(`${apiUrls.server}${apiUrls.distributorOrderController}`, payload, { headers }).subscribe({
                next: () => {
                    this._msg.success('Order submitted successfully!');
                    this.isSaving = false;
                    this._router.navigate([dest]);
                },
                error: (err) => { this._msg.error(err?.error?.message || 'Failed to submit order.'); this.isSaving = false; },
            });
        }
    }

    reset() {
        this.invoiceNo = '';
        this.orderDate = new Date().toISOString().split('T')[0];
        this.notes = '';
        this.groups = [];
        this.addCustomer();
    }
}
