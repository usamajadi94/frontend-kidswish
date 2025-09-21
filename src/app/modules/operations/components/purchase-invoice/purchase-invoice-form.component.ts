import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { SetComponentRegisterService } from 'app/modules/setup/services/set-component-register.service';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftAutocompleteComponent } from 'app/modules/shared/components/fields/bft-autocomplete/bft-autocomplete.component';
import { BftCheckboxComponent } from 'app/modules/shared/components/fields/bft-checkbox/bft-checkbox.component';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftInputNumberComponent } from 'app/modules/shared/components/fields/bft-input-number/bft-input-number.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { PurInvDetail } from '../../model/pur-inv-detail';
import { PurInvMaster } from '../../model/pur-inv-master';

@Component({
    selector: 'app-purchase-invoice',
    standalone: true,
    imports: [
        BftInputNumberComponent,
        BftInputTextComponent,
        BftTextareaComponent,
        NzTableModule,
        CommonModule,
        FormsModule,
        BftInputDateComponent,
        MatIconModule,
        BftButtonComponent,
        BftSelectComponent,
        MatTabsModule,
        BftInputCurrencyComponent,
        BftCheckboxComponent,
        MatDividerModule,
        BftAutocompleteComponent,
    ],
    templateUrl: './purchase-invoice-form.component.html',
    styleUrl: './purchase-invoice-form.component.scss',
})
export class PurchaseInvoiceComponent extends BaseComponent<
    PurInvMaster,
    PurchaseInvoiceComponent
> {
    private _DrpService = inject(DrpService);
    private _SetComponentRegisterService = inject(SetComponentRegisterService);
    componentRegister = componentRegister;
    suppliers: any[] = [];
    categories: any[] = [];
    companies: any[] = [];
    items: any[] = [];
    buyInList: any[] = [
        { Description: 'Pcs' },
        { Description: 'Pack' },
        { Description: 'Ctn' },
    ];

    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.purchaseInvoiceController);
        this.setFormTitle(componentRegister.purchaseInvoice.Title);
    }

    public override async BeforeInit(): Promise<void> {
        await this.getSuppliers();
        await this.getCategories();
        await this.getCompanies();
        await this.getItems();
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }

    public override InitializeObject(): void {
        this.formData = new PurInvMaster();
    }

    override AfterDisplay(): void {
        this.addDetailsRow();
    }

    // fetch Data

    getSuppliers() {
        this._DrpService.getSuppliersDrp().subscribe({
            next: (res: any) => {
                this.suppliers = res;
            },
            error: (err) => {
                console.error('Error fetching suppliers:', err);
            },
        });
    }

    getCategories() {
        this._DrpService.getCategoriesDrp().subscribe({
            next: (res: any) => {
                this.categories = res;
            },
            error: (err) => {
                console.error('Error fetching categories:', err);
            },
        });
    }

    getCompanies() {
        this._DrpService.getCompaniesDrp().subscribe({
            next: (res: any) => {
                this.companies = res;
            },
            error: (err) => {
                console.error('Error fetching companies:', err);
            },
        });
    }

    getItems() {
        this._DrpService.getItemsDrp().subscribe({
            next: (res: any) => {
                this.items = res;
            },
            error: (err) => {
                console.error('Error fetching items:', err);
            },
        });
    }

    // ----x

    addDetailsRow() {
        this.formData.Pur_Inv_Detail = Array.from(
            { length: 2 },
            () => new PurInvDetail()
        );
    }
    addRow() {
        let newRow: PurInvDetail = new PurInvDetail();
        this.formData.Pur_Inv_Detail.push(newRow);
    }

    onItemSelect(element: PurInvDetail) {
        if (element.ItemID != null) {
            let item: any = this.items.filter((x) => x.ID == element.ItemID);
            if (item.length > 0) {
                element.Cost = item[0].CostPr;
                element.Sale = item[0].SalePr;
            }
        }
    }

    deleteDetailRow(index: number) {
        if (this.formData.Pur_Inv_Detail.length > 1) {
            this.formData.Pur_Inv_Detail.splice(index, 1);
        }
    }

    onbuyInSelect(element: PurInvDetail) {
        if (element.BuyIn != null && element.ItemID != null) {
            let item: any = this.items.filter((x) => x.ID == element.ItemID);
            if (element.BuyIn == 'Pcs') {
                element.Cost = item[0].CostPr;
                element.Sale = item[0].SalePr;
            } else if (element.BuyIn == 'Pack') {
                element.Cost = item[0].PackPcsCost;
                element.Sale = item[0].PackPcsSale;
            } else if (element.BuyIn == 'Ctn') {
                element.Cost = item[0].CtnCost;
                element.Sale = item[0].CtnSale;
            }
        } else {
            element.Cost = 0;
            element.Sale = 0;
        }
        this.getTAmt(element);
        // Check if all rows have ItemID filled then Add New RowAutomatic
        const allFilled = this.formData.Pur_Inv_Detail.every(
            (x) => x.ItemID != null && x.ItemID != 0
        );
        if (allFilled) {
            this.addRow();
        }
    }
    getTAmt(element: PurInvDetail) {
        this.calculateAmounts(element);
    }

    getSalePercent(element: PurInvDetail) {
        this.calculateAmounts(element);
    }

    getDiscount(element: PurInvDetail) {
        this.calculateAmounts(element);
    }

    updateNetAmt(element: PurInvDetail) {
        this.calculateAmounts(element);
    }

    calculateAmounts(element: PurInvDetail) {
        // Base Amount
        element.TAmt = (element.Cost || 0) * (element.Qty || 0);

        // Sale Amount
        element.SaleAmt = element.SalePer
            ? (element.TAmt * element.SalePer) / 100
            : 0;

        // Discount Amount (on TAmt + SaleAmt)
        const grossAmount = element.TAmt + element.SaleAmt;
        element.DiscountAmt = element.DiscountPer
            ? (grossAmount * element.DiscountPer) / 100
            : 0;

        // Final Net Amount
        element.NetAmt = element.TAmt + element.SaleAmt - element.DiscountAmt;
    }

    public BeforeInsert(formData: PurInvMaster): void {
        formData.Pur_Inv_Detail.forEach((element: PurInvDetail) => {
            if (element.BuyIn == 'Pcs') {
                element.Pcs = element.Qty;
            } else if (element.BuyIn == 'Pack') {
                element.Pack = element.Qty;
            } else if (element.BuyIn == 'Ctn') {
                element.Ctn = element.Qty;
            }
        });
    }

    public AfterGetData(): void {
        this.formData.Pur_Inv_Detail.forEach((element: PurInvDetail) => {
            if (element.BuyIn == 'Pcs') {
                element.Qty = element.Pcs;
            } else if (element.BuyIn == 'Pack') {
                element.Qty = element.Pack;
            } else if (element.BuyIn == 'Ctn') {
                element.Qty = element.Ctn;
            }
        });
    }

    getTotalItems() {
        return this.formData.Pur_Inv_Detail.filter((row) => row.ItemID).length;
    }

    getTotalQty() {
        let total = 0;
        for (let item of this.formData.Pur_Inv_Detail) {
            total += item.Qty ? item.Qty : 0;
        }
        return total;
    }

    getTotalAmt() {
        let total = 0;
        for (let item of this.formData.Pur_Inv_Detail) {
            if (item.ApplyDiscount || item.ApplySaleTax) {
                total += item.NetAmt ? item.NetAmt : 0;
            } else {
                total += item.TAmt ? item.TAmt : 0;
            }
        }
        return total;
    }

    override ValidateBeforeSave(formData: PurInvMaster): boolean {
        this.validation = []; // Clear previous validation errors

        let hasError = false;

        if (!formData.Pur_Inv_Detail || formData.Pur_Inv_Detail.length === 0) {
            hasError = true;
        } else {
            for (const detail of formData.Pur_Inv_Detail) {
                if (
                    !detail.ItemID ||
                    !detail.Qty ||
                    detail.Qty <= 0 ||
                    !detail.Cost ||
                    detail.Cost <= 0 ||
                    !detail.BuyIn
                ) {
                    hasError = true;
                    break; // No need to continue checking once we find an error
                }
            }
        }

        if (hasError) {
            this.validation.push('Kindly fill your required fields.');
        }

        return this.validation.length > 0;
    }

    onApplyTaxChange(element: PurInvDetail) {
        if (!element.ApplySaleTax) {
            element.SalePer = 0;
            this.getSalePercent(element);
        }
    }
    onApplyDisChange(element: PurInvDetail) {
        if (!element.ApplyDiscount) {
            element.DiscountPer = 0;
            this.getDiscount(element);
        }
    }

    option: any[] = [];

    onInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value.toLowerCase();

        this.option = this.items.filter((item: any) => {
            const desc =
                typeof item.Description === 'string' ||
                typeof item.Description === 'number'
                    ? item.Description.toString().toLowerCase()
                    : '';

            return desc.includes(value);
        });
    }

    onfilterChange(selectedItem: any): void {
        if (!selectedItem) return;

        const item = selectedItem.nzValue;

        // Find index of empty row (ItemID is null, undefined or 0)
        const emptyRowIndex = this.formData.Pur_Inv_Detail.findIndex(
            (row) => !row.ItemID || row.ItemID === 0
        );

        const newItem: PurInvDetail = {
            ItemID: item.ID,
            Sale: item.SalePrice,
            Qty: 1,
            TAmt: item.SalePrice,
            ApplyDiscount: false,
            DiscountPer: 0,
            DiscountAmt: 0,
            ApplySaleTax: false,
            SalePer: 0,
            SaleAmt: 0,
            NetAmt: item.SalePrice,
            ID: 0,
            BuyIn: 'Ctn',
            Cost: item.CostPrice,
            Trade: 0,
            Retail: 0,
            Ctn: 0,
            Pcs: 0,
            Pack: 0,
            Bonus: 0,
        };

        if (emptyRowIndex !== -1) {
            this.formData.Pur_Inv_Detail[emptyRowIndex] = {
                ...this.formData.Pur_Inv_Detail[emptyRowIndex],
                ...newItem,
            };
            this.onbuyInSelect(this.formData.Pur_Inv_Detail[emptyRowIndex]);
        } else {
            this.formData.Pur_Inv_Detail.push(newItem);
            this.onbuyInSelect(newItem);
        }

        // 🔄 Reset selected autocomplete
        selectedItem.nzValue = '';
        selectedItem.nzLabel = '';
        this.option = [];
    }

    addCompany() {
        this._SetComponentRegisterService
            .addCompanyInformation()
            .subscribe((res) => {
                if (res.success) {
                    this.companies.unshift(res.data);
                    this.formData.CompanyID = res.data.ID;
                    // this.getCompanies();
                }
            });
    }
    addSupplier() {
        this._SetComponentRegisterService
            .addSupplierInformation()
            .subscribe((res) => {
                if (res.success) {
                    this.suppliers.unshift(res.data);
                    this.formData.SupplierID = res.data.ID;
                    // this.getSuppliers();
                }
            });
    }
}
