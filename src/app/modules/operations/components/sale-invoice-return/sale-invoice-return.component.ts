import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftCheckboxComponent } from 'app/modules/shared/components/fields/bft-checkbox/bft-checkbox.component';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftInputNumberComponent } from 'app/modules/shared/components/fields/bft-input-number/bft-input-number.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { SaleInvoiceDetailRet } from '../../model/sale-invoice-detail-ret';
import { SaleInvoiceMaster } from '../../model/sale-invoice-master';
import { SaleInvoiceMasterRet } from '../../model/sale-invoice-master-ret';

@Component({
    selector: 'app-sale-invoice-return',
    standalone: true,
    imports: [
        BftInputNumberComponent,
        BftInputTextComponent,
        CommonModule,
        FormsModule,
        BftInputDateComponent,
        MatIconModule,
        BftSelectComponent,
        MatTabsModule,
        BftInputCurrencyComponent,
        BftCheckboxComponent,
    ],
    templateUrl: './sale-invoice-return.component.html',
    styleUrl: './sale-invoice-return.component.scss',
})
export class SaleInvoiceReturnComponent extends BaseComponent<
    SaleInvoiceMasterRet,
    SaleInvoiceReturnComponent
> {
    private _DrpService = inject(DrpService);
    MemberType: string = '';
    City: string = '';
    Area: string = '';
    Route: string = '';
    suppliers: any[] = [];
    categories: any[] = [];
    companies: any[] = [];
    items: any[] = [];
    customers: any[] = [];
    orderBookers: any[] = [];
    salesmans: any[] = [];
    vehicles: any[] = [];
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
        this.setControllerName(apiUrls.saleInvoiceReturnController);
        this.setFormTitle(componentRegister.saleReturnInvoice.Title);
    }
    override ngOnInit(): void {
        super.ngOnInit();
    }

    public override async BeforeInit(): Promise<void> {
        await this.getCustomers();
        await this.getItems();
        // await this.getOrderBookers();
        await this.getSalesmans();
        await this.getVehicles();
    }

    public override InitializeObject(): void {
        this.formData = new SaleInvoiceMasterRet();
    }

    fetchInvoice() {
        this._DrpService
            .getSaleInvicebyInvoiceNumber(this.formData.SaleInvoiceNo)
            .subscribe({
                next: (res: SaleInvoiceMaster) => {
                    this.formData.CustomerID = res.CustomerID;
                    this.formData.OrderBookerID = res.OrderBookerID;
                    this.formData.SalesmanID = res.SalesmanID;
                    this.formData.VehicleID = res.VehicleID;
                    this.formData.InvoiceDate = new Date();
                    if (this.formData.CustomerID > 0) {
                        this.onCustomerChange(this.formData.CustomerID);
                    }

                    this.formData.Sale_Inv_Detail_Ret = res.Sale_Inv_Detail.map(
                        (detail) => {
                            const mapped = new SaleInvoiceDetailRet();
                            mapped.ItemID = detail.ItemID;

                            mapped.Qty = detail.Qty;
                            mapped.BuyIn = detail.BuyIn;
                            mapped.SalePrice = detail.SalePrice;
                            mapped.TotalAmount = detail.TotalAmount;
                            mapped.ApplySaleTax = detail.ApplySaleTax;
                            mapped.ApplyDiscount = detail.ApplyDiscount;
                            mapped.DiscountPer = detail.DiscountPer;
                            mapped.DiscountAmount = detail.DiscountAmount;
                            mapped.SalePer = detail.SalePer;
                            mapped.SaleAmount = detail.SaleAmount;

                            mapped.NetAmt = detail.NetAmt;
                            return mapped;
                        }
                    );
                },
                error: (err) => {
                    console.error('Error fetching order:', err);
                },
            });
    }

    deleteDetailRow(index: number) {
        if (this.formData.Sale_Inv_Detail_Ret.length > 1) {
            this.formData.Sale_Inv_Detail_Ret.splice(index, 1);
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

    getTAmt(element: SaleInvoiceDetailRet) {
        this.calculateAmounts(element);
    }

    calculateAmounts(element: SaleInvoiceDetailRet) {
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

    getTotalItems() {
        return this.formData.Sale_Inv_Detail_Ret.length;
    }

    getTotalQty() {
        let total = 0;
        for (let item of this.formData.Sale_Inv_Detail_Ret) {
            total += item.Qty ? item.Qty : 0;
        }
        return total;
    }

    getTotalAmt() {
        let total = 0;
        for (let item of this.formData.Sale_Inv_Detail_Ret) {
            if (item.ApplyDiscount || item.ApplySaleTax) {
                total += item.NetAmt ? item.NetAmt : 0;
            } else {
                total += item.TotalAmount ? item.TotalAmount : 0;
            }
        }
        return total;
    }

    public override ValidateBeforeSave(formData: SaleInvoiceMasterRet): boolean {
        this.validation = [];

        if (
            !formData.SaleInvoiceNo ||
            formData.SaleInvoiceNo.trim() === ''
        ) {
            this.validation.push('Sale Invoice is required.');
        }


        if (!formData.InvoiceDate) {
            this.validation.push('Invoice Date is required.');
        }

        return this.validation.length > 0;
    }
}
