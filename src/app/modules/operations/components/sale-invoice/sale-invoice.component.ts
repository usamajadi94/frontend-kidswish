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
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { NzAutocompleteModule } from 'ng-zorro-antd/auto-complete';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { SaleInvoiceDetail } from '../../model/sale-invoice-detail';
import { SaleInvoiceMaster } from '../../model/sale-invoice-master';

@Component({
    selector: 'app-sale-invoice',
    standalone: true,
    imports: [
        BftInputNumberComponent,
        NzTableModule,
        MatDividerModule,
        CommonModule,
        FormsModule,
        BftInputDateComponent,
        MatIconModule,
        BftButtonComponent,
        BftSelectComponent,
        MatTabsModule,
        BftInputCurrencyComponent,
        BftCheckboxComponent,
        NzInputModule,
        NzAutocompleteModule,
        BftAutocompleteComponent,
    ],
    templateUrl: './sale-invoice.component.html',
    styleUrl: './sale-invoice.component.scss',
})
export class SaleInvoiceComponent extends BaseComponent<
    SaleInvoiceMaster,
    SaleInvoiceComponent
> {
    private _DrpService = inject(DrpService);
    private _SetComponentRegisterService = inject(SetComponentRegisterService);
    componentRegister = componentRegister;
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
        const emptyRowIndex = this.formData.Sale_Inv_Detail.findIndex(
            (row) => !row.ItemID || row.ItemID === 0
        );

        const newItem: SaleInvoiceDetail = {
            ItemID: item.ID,
            SalePrice: item.SalePrice,
            Qty: 1,
            TotalAmount: item.SalePrice,
            ApplyDiscount: this.masterDiscountCheck ? true : false,
            DiscountPer: 0,
            DiscountAmount: 0,
            ApplySaleTax: false,
            SalePer: 0,
            SaleAmount: 0,
            NetAmt: item.SalePrice,
            ID: 0,
            SaleMasterID: 0,
            BuyIn: 'Pcs',
        };

        if (emptyRowIndex !== -1) {
            this.formData.Sale_Inv_Detail[emptyRowIndex] = {
                ...this.formData.Sale_Inv_Detail[emptyRowIndex],
                ...newItem,
            };
            this.onbuyInSelect(this.formData.Sale_Inv_Detail[emptyRowIndex]);
        } else {
            this.formData.Sale_Inv_Detail.push(newItem);
            this.onbuyInSelect(newItem);
        }

        // 🔄 Reset selected autocomplete
        selectedItem.nzValue = '';
        selectedItem.nzLabel = '';
        this.option = [];
    }

    suppliers: any[] = [];
    categories: any[] = [];
    companies: any[] = [];
    items: any[] = [];
    itemPrices: any[] = [];
    customers: any[] = [];
    orderBookers: any[] = [];
    salesmans: any[] = [];
    vehicles: any[] = [];
    buyInList: any[] = [
        { Description: 'Pcs' },
        { Description: 'Pack' },
        { Description: 'Ctn' },
    ];
    masterDiscountCheck: boolean = true;
    indeterminate: boolean = false;

    MemberType: string = '';
    City: string = '';
    Area: string = '';
    Route: string = '';
    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.saleInvoiceController);
        this.setFormTitle(componentRegister.saleInvoice.Title);
    }
    override ngOnInit(): void {
        super.ngOnInit();
    }

    public override async BeforeInit(): Promise<void> {
        await this.getCustomers();
        await this.getItems();
        await this.getItemPrices();
        // await this.getOrderBookers();
        await this.getSalesmans();
        await this.getVehicles();
    }

    public override InitializeObject(): void {
        this.formData = new SaleInvoiceMaster();
    }

    override AfterDisplay(): void {
        if (this.primaryKey === 0) {
            this.formData.ItemCategoryID =
                this.nzModalData?.Data?.ItemCategoryID || null;
        }
        this.addDetailsRow();
    }

    addRow() {
        let newRow: SaleInvoiceDetail = new SaleInvoiceDetail();
        newRow.ApplyDiscount = this.masterDiscountCheck;
        this.formData.Sale_Inv_Detail.push(newRow);
        this.updateMasterCheckboxState();
    }
    addDetailsRow() {
        this.formData.Sale_Inv_Detail = Array.from(
            { length: 2 },
            () => new SaleInvoiceDetail()
        );
    }
    deleteDetailRow(index: number) {
        if (this.formData.Sale_Inv_Detail.length > 1) {
            this.formData.Sale_Inv_Detail.splice(index, 1);
            this.updateMasterCheckboxState();
        }
    }

    getCustomers() {
        this._DrpService.getCustomerInformationDrp().subscribe({
            next: (res: any) => {
                this.customers = res;
            },
            error: (err) => {
                console.error('Error fetching items:', err);
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

    // getOrderBookers() {
    //     this._DrpService.getOrderBookerInformationDrp().subscribe({
    //         next: (res: any) => {
    //             this.orderBookers = res;
    //         },
    //         error: (err) => {
    //             console.error('Error fetching order bookers:', err);
    //         },
    //     });
    // }

    getSalesmans() {
        this._DrpService.getSalesmanInformationDrp().subscribe({
            next: (res: any) => {
                this.salesmans = res;
            },
            error: (err) => {
                console.error('Error fetching salesmans:', err);
            },
        });
    }

    getVehicles() {
        this._DrpService.getVehicleInformationDrp().subscribe({
            next: (res: any) => {
                this.vehicles = res;
            },
            error: (err) => {
                console.error('Error fetching vehicles:', err);
            },
        });
    }

    onCustomerChange(customerId: number) {
        var customer = this.customers.filter((c) => c.ID === customerId);
        if (customer.length > 0) {
            this.formData.CustomerID = customer[0].ID;
            this.formData.MemberTypeID = customer[0].MemberTypeID;
            this.formData.RouteID = customer[0].RouteID;
            this.formData.AreaID = customer[0].AreaID;
            this.formData.CityID = customer[0].CityID;
            this.MemberType = customer[0].MemberType;
            this.City = customer[0].City;
            this.Area = customer[0].Area;
            this.Route = customer[0].Route;
        }
    }

    onbuyInSelect(element: SaleInvoiceDetail) {
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
        const allFilled = this.formData.Sale_Inv_Detail.every(
            (x) => x.ItemID != null
        );
        if (allFilled) {
            this.addRow();
        }
    }
    getTAmt(element: SaleInvoiceDetail) {
        this.calculateAmounts(element);
    }

    getSalePercent(element: SaleInvoiceDetail) {
        this.calculateAmounts(element);
    }

    getDiscount(element: SaleInvoiceDetail) {
        this.calculateAmounts(element);
    }

    updateNetAmt(element: SaleInvoiceDetail) {
        this.calculateAmounts(element);
    }

    calculateAmounts(element: SaleInvoiceDetail) {
        // Base Amount
        element.TotalAmount = (element.SalePrice || 0) * (element.Qty || 0);

        if (element.ApplySaleTax == true) {
            element.SaleAmount = element.SalePer
                ? (element.TotalAmount * element.SalePer) / 100
                : 0;
        } else {
            element.SaleAmount = 0;
            element.SalePer = 0;
        }
        // Sale Amount

        // Discount Amount (on TAmt + SaleAmt)
        const grossAmount = element.TotalAmount + element.SaleAmount;

        if (element.ApplyDiscount == true) {
            element.DiscountAmount = element.DiscountPer
                ? (grossAmount * element.DiscountPer) / 100
                : 0;
        } else {
            element.DiscountAmount = 0;
            element.DiscountPer = 0;
        }

        // Final Net Amount
        element.NetAmt =
            element.TotalAmount + element.SaleAmount - element.DiscountAmount;
    }

    // fetchOrder() {
    //     this._DrpService
    //         .getOrderbyOrderNumber(this.formData.OrderNo)
    //         .subscribe({
    //             next: (res: OrderMaster) => {
    //                 this.formData.CustomerID = res.CustomerID;
    //                 this.formData.OrderBookerID = res.OrderBookerID;
    //                 this.formData.InvoiceDate = new Date();
    //                 if (this.formData.CustomerID > 0) {
    //                     this.onCustomerChange(this.formData.CustomerID);
    //                 }

    //                 this.formData.Sale_Inv_Detail = res.Order_Detail.map(
    //                     (detail) => {
    //                         const mapped = new SaleInvoiceDetail();
    //                         mapped.ItemID = detail.ItemID;

    //                         mapped.Qty = detail.Qty;
    //                         mapped.BuyIn = detail.BuyIn;
    //                         mapped.SalePrice = detail.SalePrice;
    //                         mapped.TotalAmount = detail.TAmt;
    //                         mapped.ApplySaleTax = detail.ApplySaleTax;
    //                         mapped.ApplyDiscount = detail.ApplyDiscount;
    //                         mapped.DiscountPer = detail.DiscountPer;
    //                         mapped.DiscountAmount = detail.DiscountAmt;
    //                         mapped.SalePer = detail.SalePer;
    //                         mapped.SaleAmount = detail.SaleAmt;

    //                         mapped.NetAmt = detail.NetAmt;
    //                         return mapped;
    //                     }
    //                 );
    //             },
    //             error: (err) => {
    //                 console.error('Error fetching order:', err);
    //             },
    //         });
    // }

    getTotalItems() {
        return this.formData.Sale_Inv_Detail.filter((row) => row.ItemID).length;
    }

    getTotalQty() {
        let total = 0;
        for (let item of this.formData.Sale_Inv_Detail) {
            total += item.Qty ? item.Qty : 0;
        }
        return total;
    }

    getTotalAmt() {
        let total = 0;
        for (let item of this.formData.Sale_Inv_Detail) {
            if (item.ApplyDiscount || item.ApplySaleTax) {
                total += item.NetAmt ? item.NetAmt : 0;
            } else {
                total += item.TotalAmount ? item.TotalAmount : 0;
            }
        }
        return total;
    }

    onApplyDisChange(element: SaleInvoiceDetail) {
        if (!element.ApplyDiscount) {
            element.DiscountPer = 0;
            this.getDiscount(element);
        } else {
            this.getDiscount(element);
        }

        this.updateMasterCheckboxState();
    }

    onApplyTaxChange(element: SaleInvoiceDetail) {
        if (!element.ApplySaleTax) {
            element.SalePer = 0;
            this.getSalePercent(element);
        } else {
            this.getSalePercent(element);
        }
    }

    onMasterCheckboxChange(value: boolean) {
        this.formData.Sale_Inv_Detail.forEach((element) => {
            element.ApplyDiscount = value;
            this.getDiscount(element); // Optional if needed
        });

        this.updateMasterCheckboxState();
    }
    updateMasterCheckboxState() {
        const allChecked = this.formData.Sale_Inv_Detail.every(
            (item) => item.ApplyDiscount
        );
        const allUnchecked = this.formData.Sale_Inv_Detail.every(
            (item) => !item.ApplyDiscount
        );

        this.masterDiscountCheck = allChecked;
        this.indeterminate = !allChecked && !allUnchecked;
    }

    // -- Validation
    override ValidateBeforeSave(formData: SaleInvoiceMaster): boolean {
        this.validation = []; // Clear previous validations
        let hasDetailError = false;
        if (!formData.InvoiceDate) {
            this.validation.push('Invoice Date is required.');
        }
        if (!formData.CustomerID || formData.CustomerID <= 0) {
            this.validation.push('Customer is required.');
        }
        if (!formData.SalesmanID || formData.SalesmanID <= 0) {
            this.validation.push('Salesman is required.');
        }
        if (
            !formData.Sale_Inv_Detail ||
            formData.Sale_Inv_Detail.length === 0
        ) {
            hasDetailError = true;
        } else {
            for (const detail of formData.Sale_Inv_Detail) {
                if (
                    !detail.ItemID ||
                    !detail.BuyIn ||
                    !detail.SalePrice ||
                    !detail.Qty
                ) {
                    hasDetailError = true;
                    break;
                }
            }
        }

        if (hasDetailError) {
            this.validation.push('Kindly fill your fields in the details tab.');
        }

        return this.validation.length > 0;
    }

    addSaleman() {
        this._SetComponentRegisterService
            .addSupplierInformation()
            .subscribe((res) => {
                if (res.success) {
                    this.salesmans.unshift(res.data);
                    this.formData.SalesmanID = res.data.ID;
                }
            });
    }

    addCustomer() {
        this._SetComponentRegisterService.addCustomer().subscribe((res) => {
            if (res.success) {
                this.customers.unshift(res.data);
                this.formData.CustomerID = res.data.ID;
                this.formData.RouteID = res.data?.RouteID;
                this.formData.CityID = res.data?.CityID;
                this.formData.AreaID = res.data?.AreaID;
            }
        });
    }
    addVehicle() {
        this._SetComponentRegisterService.addVehicle().subscribe((res) => {
            if (res.success) {
                this.vehicles.unshift(res.data);
                this.formData.VehicleID = res.data.ID;
            }
        });
    }
}
