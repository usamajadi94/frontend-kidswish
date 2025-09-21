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
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftAutocompleteComponent } from 'app/modules/shared/components/fields/bft-autocomplete/bft-autocomplete.component';
import { BftCheckboxComponent } from 'app/modules/shared/components/fields/bft-checkbox/bft-checkbox.component';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftInputNumberComponent } from 'app/modules/shared/components/fields/bft-input-number/bft-input-number.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { OrderDetail } from '../../model/order-detail';
import { OrderMaster } from '../../model/order-master';
import { SetComponentRegisterService } from 'app/modules/setup/services/set-component-register.service';

@Component({
    selector: 'app-order',
    standalone: true,
    imports: [
        BftInputNumberComponent,
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
    templateUrl: './order.component-form.html',
    styleUrl: './order.component-form.scss',
})
export class OrderComponent extends BaseComponent<OrderMaster, OrderComponent> {
    private _DrpService = inject(DrpService);
    private _SetComponentRegisterService = inject(SetComponentRegisterService);
    componentRegister = componentRegister;
    masterDiscountCheck: boolean = true;
    indeterminate: boolean = false;
    customersDrp: any[] = [];
    companyDrp: any[] = [];
    itemsDrp: any[] = [];
    orderBookersDrp: any[] = [];
    buyInList: any[] = [
        { Description: 'Pcs' },
        { Description: 'Pack' },
        { Description: 'Ctn' },
    ];

    itemPrices: any[] = [];

    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.orderController);
        this.setFormTitle(componentRegister.order.Title);
    }

    public override InitializeObject(): void {
        this.formData = new OrderMaster();
    }

    override async BeforeInit(): Promise<void> {
        await this.getCompanies();
        await this.getCustomers();
        await this.getItems();
        await this.getItemPrices();
        await this.getOrderBookers();
    }

    override AfterDisplay(): void {
        if (this.primaryKey === 0) {
            this.formData.ItemCategoryID =
                this.nzModalData?.Data?.ItemCategoryID || null;
        }
        this.addDetailsRow();
    }

    public AfterGetData(): void {
        this.updateMasterCheckboxState();
    }
    // -- Fetch Dropdown

    getCompanies() {
        this._DrpService.getCompaniesDrp().subscribe({
            next: (res: any) => {
                this.companyDrp = res;
            },
            error: (err) => {
                console.error('Error fetching companies:', err);
            },
        });
    }

    getCustomers() {
        this._DrpService.getCustomerInformationDrp().subscribe({
            next: (res: any) => {
                this.customersDrp = res;
            },
            error: (err) => {
                console.error('Error fetching companies:', err);
            },
        });
    }

    getItems() {
        this._DrpService.getItemsDrp().subscribe({
            next: (res: any) => {
                this.itemsDrp = res;
            },
            error: (err) => {
                console.error('Error fetching items:', err);
            },
        });
    }

    getItemPrices() {
        this._DrpService.getItemPrices().subscribe({
            next: (res: any) => {
                this.itemPrices = res;
            },
            error: (err) => {
                console.error('Error fetching items:', err);
            },
        });
    }

    getOrderBookers() {
        this._DrpService.getOrderBookerInformationDrp().subscribe({
            next: (res: any) => {
                this.orderBookersDrp = res;
            },
            error: (err) => {
                console.error('Error fetching order bookers:', err);
            },
        });
    }

    ///

    option: any[] = [];

    onInput(event: Event): void {
        const value = (event.target as HTMLInputElement).value.toLowerCase();

        this.option = this.itemsDrp.filter((item: any) => {
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
        const emptyRowIndex = this.formData.Order_Detail.findIndex(
            (row) => !row.ItemID || row.ItemID === 0
        );

        let itemPrice: any = this.itemPrices.filter(
                (x) =>
                    x.ItemID == item.ID &&
                    x.ItemCategoryID == this.formData.ItemCategoryID
            );

        const newItem: OrderDetail = {
            ItemID: item.ID,
            SalePrice: 0,
            Qty: 1,
            TAmt: 0,
            ApplyDiscount: this.masterDiscountCheck ? true : false,
            DiscountPer: 0,
            DiscountAmt: 0,
            ApplySaleTax: false,
            SalePer: 0,
            SaleAmt: 0,
            NetAmt: 0,
            ID: 0,
            BuyIn: 'Pcs',
        };

        if(itemPrice.length > 0) {
            newItem.SalePrice = itemPrice[0].SalePcs;
            newItem.BuyIn = 'Pcs';
            newItem.TAmt = itemPrice[0].SalePcs;
            newItem.NetAmt = itemPrice[0].SalePcs;
        }

        if (emptyRowIndex !== -1) {
            this.formData.Order_Detail[emptyRowIndex] = {
                ...this.formData.Order_Detail[emptyRowIndex],
                ...newItem,
            };
            this.onbuyInSelect(this.formData.Order_Detail[emptyRowIndex]);
        } else {
            this.formData.Order_Detail.push(newItem);
            this.onbuyInSelect(newItem);
        }

        // 🔄 Reset selected autocomplete
        selectedItem.nzValue = '';
        selectedItem.nzLabel = '';
        this.option = [];
    }

    addRow() {
        let newRow: OrderDetail = new OrderDetail();
        this.formData.Order_Detail.push(newRow);
        this.updateMasterCheckboxState();
    }

    addDetailsRow() {
        this.formData.Order_Detail = Array.from(
            { length: 2 },
            () => new OrderDetail()
        );
    }

    onbuyInSelect(element: OrderDetail) {
        if (element.BuyIn != null && element.ItemID != null) {
            let item: any = this.itemPrices.filter(
                (x) =>
                    x.ItemID == element.ItemID &&
                    x.ItemCategoryID == this.formData.ItemCategoryID
            );
            if (element.BuyIn == 'Pcs') {
                element.SalePrice = item[0].SalePcs;
            } else if (element.BuyIn == 'Pack') {
                element.SalePrice = item[0].SalePack;
            } else if (element.BuyIn == 'Ctn') {
                element.SalePrice = item[0].SaleCtn;
            }
        } else {
            element.SalePrice = 0;
        }
        this.getTAmt(element);
        // Check if all rows have ItemID filled then Add New RowAutomatic
        const allFilled = this.formData.Order_Detail.every(
            (x) => x.ItemID != null && x.ItemID != 0
        );
        if (allFilled) {
            this.addRow();
        }
    }

    getTAmt(element: OrderDetail) {
        this.calculateAmounts(element);
    }

    calculateAmounts(element: OrderDetail) {
        // Base Amount
        element.TAmt = (element.SalePrice || 0) * (element.Qty || 0);
        // Sale Amount
        if (element.ApplySaleTax) {
            element.SaleAmt = element.SalePer
                ? (element.TAmt * element.SalePer) / 100
                : 0;
        } else {
            element.SaleAmt = 0;
            element.SalePer = 0;
        }

        // Discount Amount (on TAmt + SaleAmt)
        const grossAmount = element.TAmt + element.SaleAmt;

        if (element.ApplyDiscount) {
            element.DiscountAmt = element.DiscountPer
                ? (grossAmount * element.DiscountPer) / 100
                : 0;
        } else {
            element.DiscountAmt = 0;
            element.DiscountPer = 0;
        }
        element.NetAmt = element.TAmt + element.SaleAmt - element.DiscountAmt;
    }

    deleteDetailRow(index: number) {
        this.formData.Order_Detail.splice(index, 1);
        this.updateMasterCheckboxState();
    }

    getSalePercent(element: OrderDetail) {
        this.calculateAmounts(element);
    }

    getDiscount(element: OrderDetail) {
        this.calculateAmounts(element);
    }

    updateNetAmt(element: OrderDetail) {
        this.calculateAmounts(element);
    }

    getTotalItems() {
        return this.formData.Order_Detail.filter((row) => row.ItemID).length;
    }

    getTotalQty() {
        let total = 0;
        for (let item of this.formData.Order_Detail) {
            total += item.Qty ? item.Qty : 0;
        }
        return total;
    }

    getTotalAmt() {
        let total = 0;
        for (let item of this.formData.Order_Detail) {
            if (item.ApplyDiscount || item.ApplySaleTax) {
                total += item.NetAmt ? item.NetAmt : 0;
            } else {
                total += item.TAmt ? item.TAmt : 0;
            }
        }
        return total;
    }

    override ValidateBeforeSave(formData: OrderMaster): boolean {
        this.validation = []; // Clear previous validations
        let hasError = false;

        // Validate master-level fields
        // if (!formData.OrderNo || formData.OrderNo.trim() === '') {
        //     this.validation.push('Order No is required.');
        // }
        if (!formData.OrderDate) {
            this.validation.push('Order Date is required.');
        }
        if (!formData.CustomerID) {
            this.validation.push('Customer is required.');
        }
        // if (!formData.OrderBookerID) {
        //     this.validation.push('Order Booker is required.');
        // }

        // Validate detail-level fields
        if (!formData.Order_Detail || formData.Order_Detail.length === 0) {
            hasError = true;
        } else {
            for (const detail of formData.Order_Detail) {
                if (
                    !detail.ItemID ||
                    !detail.BuyIn ||
                    !detail.SalePrice ||
                    !detail.Qty
                ) {
                    hasError = true;
                    break;
                }
            }
        }

        if (hasError) {
            this.validation.push(
                'Kindly fill your fields in the details tab.'
            );
        }

        return this.validation.length > 0;
    }

    onApplyDisChange(element: OrderDetail) {
        if (!element.ApplyDiscount) {
            element.DiscountPer = 0;
            this.getDiscount(element);
        } else {
            this.getDiscount(element);
        }
        // Update master checkbox state
        this.updateMasterCheckboxState();
    }

    onApplyTaxChange(element: OrderDetail) {
        if (!element.ApplySaleTax) {
            element.SalePer = 0;
            this.getSalePercent(element);
        } else {
            this.getSalePercent(element);
        }
    }

    onMasterCheckboxChange(value: boolean) {
        this.formData.Order_Detail.forEach((element) => {
            element.ApplyDiscount = value;
            this.getDiscount(element); // Optional if needed
        });

        this.updateMasterCheckboxState();
    }
    updateMasterCheckboxState() {
        const allChecked = this.formData.Order_Detail.every(
            (item) => item.ApplyDiscount
        );
        const allUnchecked = this.formData.Order_Detail.every(
            (item) => !item.ApplyDiscount
        );

        this.masterDiscountCheck = allChecked;
        this.indeterminate = !allChecked && !allUnchecked;
    }

     addCustomer() {
        this._SetComponentRegisterService
            .addCustomer()
            .subscribe((res) => {
                if (res.success) {
                    this.customersDrp.unshift(res.data);
                    this.formData.CustomerID = res.data.ID;
                }
            });
    }
     addOrderBooker() {
        this._SetComponentRegisterService
            .addOrderBooker()
            .subscribe((res) => {
                if (res.success) {
                    this.orderBookersDrp.unshift(res.data);
                    this.formData.OrderBookerID = res.data.ID;
                }
            });
    }
}
