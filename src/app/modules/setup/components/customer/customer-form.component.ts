import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { BftCheckboxComponent } from 'app/modules/shared/components/fields/bft-checkbox/bft-checkbox.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { MatButtonModule } from '@angular/material/button';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { Customer } from '../../models/customer';

@Component({
    selector: 'app-customer-form',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        BftInputTextComponent,
        BftTextareaComponent,
        BftCheckboxComponent,
        BftSelectComponent,
    ],
    templateUrl: './customer-form.component.html',
    styleUrl: './customer-form.component.scss',
})
export class CustomerFormComponent extends BaseComponent<Customer, CustomerFormComponent> {
    private _drpService = inject(DrpService);
    private _http = inject(HttpClient);
    private _ls = inject(LocalStorageService);
    distributors: any[] = [];

    // Pricing
    pricingProducts: any[] = [];
    isPricingLoading = false;
    editingProductId: number | null = null;
    editPrice: number | null = null;
    isSavingPrice = false;
    pricingError = '';
    pricingSuccess = '';

    // History modal
    historyModal = false;
    historyProduct: any = null;
    historyRows: any[] = [];
    isHistoryLoading = false;

    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute,
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.customerController);
        this.setFormTitle(componentRegister.customer.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this._drpService.getDistributorDrp().subscribe({
            next: (res: any) => { this.distributors = res; },
        });
    }

    public override InitializeObject(): void {
        this.formData = new Customer();
    }

    override ValidateBeforeSave(formData: Customer): boolean {
        this.validation = [];
        if (!formData.Name || formData.Name.trim() === '') {
            this.validation.push('Name is required.');
        }
        return this.validation.length > 0;
    }

    public override async AfterGetData(): Promise<void> {
        this.loadPricing();
    }

    private get _headers() {
        return new HttpHeaders({ uid: this._ls.uid, cid: this._ls.cid, eid: this._ls.eid });
    }

    loadPricing(): void {
        if (!this.primaryKey) return;
        this.isPricingLoading = true;
        this.pricingError = '';
        this._http.get<any>(
            `${apiUrls.server}${apiUrls.customerPricingController}?customerId=${this.primaryKey}`,
            { headers: this._headers },
        ).subscribe({
            next: (res) => { this.pricingProducts = res.Data || []; this.isPricingLoading = false; },
            error: () => { this.isPricingLoading = false; },
        });
    }

    startEdit(p: any): void {
        this.editingProductId = p.ProductID;
        this.editPrice = p.CustomerPrice;
        this.pricingError = '';
        this.pricingSuccess = '';
    }

    cancelEdit(): void {
        this.editingProductId = null;
        this.editPrice = null;
    }

    savePrice(p: any): void {
        if (this.editPrice === null || this.editPrice === undefined) return;
        this.isSavingPrice = true;
        this.pricingError = '';
        this.pricingSuccess = '';
        this._http.post<any>(
            `${apiUrls.server}${apiUrls.customerPricingController}`,
            { CustomerID: this.primaryKey, ProductID: p.ProductID, Price: this.editPrice },
            { headers: this._headers },
        ).subscribe({
            next: () => {
                this.isSavingPrice = false;
                this.editingProductId = null;
                this.editPrice = null;
                this.pricingSuccess = `"${p.ProductName}" price updated successfully`;
                this.loadPricing();
            },
            error: (e) => {
                this.isSavingPrice = false;
                this.pricingError = e?.error?.message || 'Error saving price';
            },
        });
    }

    openHistory(p: any): void {
        this.historyProduct = p;
        this.historyModal = true;
        this.historyRows = [];
        this.isHistoryLoading = true;
        this._http.get<any>(
            `${apiUrls.server}${apiUrls.customerPricingController}/history?customerId=${this.primaryKey}&productId=${p.ProductID}`,
            { headers: this._headers },
        ).subscribe({
            next: (res) => { this.historyRows = res.Data || []; this.isHistoryLoading = false; },
            error: () => { this.isHistoryLoading = false; },
        });
    }

    closeHistory(): void {
        this.historyModal = false;
        this.historyProduct = null;
        this.historyRows = [];
    }
}
