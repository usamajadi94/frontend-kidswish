import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
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
    imports: [CommonModule, FormsModule, NzSelectModule, NzDatePickerModule, NzModalModule, CurrencyPipe, DatePipe],
    templateUrl: './vehicle-dispatch.component.html',
})
export class VehicleDispatchComponent implements OnInit {
    private _http         = inject(HttpClient);
    private _ls           = inject(LocalStorageService);
    private _drp          = inject(DrpService);
    private _modal        = inject(NzModalService);

    list: any[] = [];
    selected: any = null;
    availableItems: any[] = [];
    drivers: any[] = [];
    isLoadingList    = false;
    isLoadingDetail  = false;
    isLoadingAvail   = false;
    isConfirming     = false;
    showCreateModal  = false;
    showAddItemModal = false;
    selectedPlanIds: number[] = [];

    createForm = { DispatchDate: new Date() as any, DriverID: null as any, VehicleNo: '', Notes: '' };

    get headers() {
        return new HttpHeaders({ uid: this._ls.uid, cid: this._ls.cid, eid: this._ls.eid });
    }

    get base() { return `${apiUrls.server}${apiUrls.vehicleDispatchController}`; }

    ngOnInit() {
        this.loadList();
        this._drp.getDriverDrp().subscribe({ next: (res: any) => { this.drivers = res || []; } });
    }

    loadList() {
        this.isLoadingList = true;
        this._http.get<any[]>(this.base, { headers: this.headers }).subscribe({
            next: (res) => { this.list = res || []; this.isLoadingList = false; },
            error: () => { this.isLoadingList = false; },
        });
    }

    select(item: any) {
        this.isLoadingDetail = true;
        this._http.get<any>(`${this.base}/${item.ID}`, { headers: this.headers }).subscribe({
            next: (res) => { this.selected = res; this.isLoadingDetail = false; },
            error: () => { this.isLoadingDetail = false; },
        });
    }

    openCreate() {
        this.createForm = { DispatchDate: new Date(), DriverID: null, VehicleNo: '', Notes: '' };
        this.showCreateModal = true;
    }

    saveCreate() {
        this._http.post<any>(this.base, this.createForm, { headers: this.headers }).subscribe({
            next: (res) => {
                this.showCreateModal = false;
                this.loadList();
                this.selected = res;
            },
        });
    }

    openAddItems() {
        this.selectedPlanIds = [];
        this.isLoadingAvail = true;
        this.showAddItemModal = true;
        this._http.get<any[]>(`${this.base}/available-items`, { headers: this.headers }).subscribe({
            next: (res) => { this.availableItems = res || []; this.isLoadingAvail = false; },
            error: () => { this.isLoadingAvail = false; },
        });
    }

    togglePlanItem(planId: number) {
        this.selectedPlanIds = this.selectedPlanIds.includes(planId)
            ? this.selectedPlanIds.filter(id => id !== planId)
            : [...this.selectedPlanIds, planId];
    }

    addSelectedItems() {
        if (!this.selectedPlanIds.length) return;
        this._http.post<any>(
            `${this.base}/${this.selected.ID}/items`,
            { planIds: this.selectedPlanIds },
            { headers: this.headers }
        ).subscribe({
            next: (res) => { this.selected = res; this.showAddItemModal = false; this.loadList(); },
        });
    }

    removeItem(planId: number) {
        this._http.delete<any>(
            `${this.base}/${this.selected.ID}/items/${planId}`,
            { headers: this.headers }
        ).subscribe({ next: (res) => { this.selected = res; this.loadList(); } });
    }

    confirm() {
        this._modal.confirm({
            nzTitle: 'Confirm Delivery?',
            nzContent: `This will generate 1 Gatepass + ${this.uniqueCustomerCount} DO(s) and create invoices.`,
            nzOkText: 'Confirm',
            nzOkType: 'primary',
            nzOnOk: () => {
                this.isConfirming = true;
                this._http.post<any>(
                    `${this.base}/${this.selected.ID}/confirm`,
                    {},
                    { headers: this.headers }
                ).subscribe({
                    next: (res) => { this.selected = res; this.isConfirming = false; this.loadList(); },
                    error: () => { this.isConfirming = false; },
                });
            },
        });
    }

    deleteVD() {
        this._modal.confirm({
            nzTitle: 'Delete this vehicle dispatch?',
            nzContent: 'Items will be returned to the available pool.',
            nzOkDanger: true,
            nzOkText: 'Delete',
            nzOnOk: () => {
                this._http.delete<any>(`${this.base}/${this.selected.ID}`, { headers: this.headers }).subscribe({
                    next: () => { this.selected = null; this.loadList(); },
                });
            },
        });
    }

    get uniqueCustomerCount(): number {
        if (!this.selected?.Items) return 0;
        return new Set(this.selected.Items.map((i: any) => i.CustomerID)).size;
    }

    get groupedByCustomer(): { customer: string; items: any[]; total: number; doNo: string }[] {
        if (!this.selected?.Items) return [];
        const map = new Map<number, any>();
        for (const item of this.selected.Items) {
            if (!map.has(item.CustomerID)) {
                map.set(item.CustomerID, {
                    customer: item.CustomerName,
                    doNo: item.DONo || '—',
                    items: [],
                    total: 0,
                });
            }
            const g = map.get(item.CustomerID);
            g.items.push(item);
            g.total += +item.PlannedQty || 0;
        }
        return [...map.values()];
    }

    groupAmount(items: any[]): number {
        return items.reduce((s, i) => s + (+i.PlannedQty || 0) * (+i.CartonPrice || 0), 0);
    }

    statusClass(status: string): string {
        switch (status) {
            case 'Confirmed': return 'bg-green-100 text-green-700';
            case 'Draft':     return 'bg-yellow-100 text-yellow-700';
            default:          return 'bg-gray-100 text-gray-600';
        }
    }
}
