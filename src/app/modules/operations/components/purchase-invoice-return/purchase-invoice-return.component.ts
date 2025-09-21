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
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { NzTableModule } from 'ng-zorro-antd/table';
import { PurInvDetailReturn } from '../../model/pur-inv-detail-ret';
import { PurInvMaster } from '../../model/pur-inv-master';
import { PurInvMasterReturn } from '../../model/pur-inv-master-ret';
import { componentRegister } from 'app/modules/shared/services/component-register';

@Component({
    selector: 'app-purchase-invoice-return',
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
        BftSelectComponent,
        MatTabsModule,
        BftInputCurrencyComponent,
        BftCheckboxComponent,
    ],
    templateUrl: './purchase-invoice-return.component.html',
    styleUrl: './purchase-invoice-return.component.scss',
})
export class PurchaseInvoiceReturnComponent extends BaseComponent<
    PurInvMasterReturn,
    PurchaseInvoiceReturnComponent
> {
    private _DrpService = inject(DrpService);

    suppliers: any[] = [];
    categories: any[] = [];
    companies: any[] = [];
    items: any[] = [];
    buyInList: any[] = [
        { Description: 'Pcs' },
        { Description: 'Pack' },
        { Description: 'Ctn' },
    ];

    override ngOnInit(): void {
        super.ngOnInit();
    }

    public override InitializeObject(): void {
        this.formData = new PurInvMasterReturn();
    }

    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.purchaseReturnInvoiceController);
         this.setFormTitle(componentRegister.purchaseReturnInvoice.Title);
        
        // this.setFormTitle('Purchase Invoice');
    }

    public override async BeforeInit(): Promise<void> {
        await this.getSuppliers();
        await this.getCategories();
        await this.getCompanies();
        await this.getItems();
    }



    deleteDetailRow(index: number) {
        if (this.formData.Pur_Inv_Detail_Ret.length > 1) {
            this.formData.Pur_Inv_Detail_Ret.splice(index, 1);
        }
    }


    getTAmt(element: PurInvDetailReturn) {
        this.calculateAmounts(element);
    }

 
    calculateAmounts(element: PurInvDetailReturn) {
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

    public BeforeInsert(formData: PurInvMasterReturn): void {
        formData.Pur_Inv_Detail_Ret.forEach((element: PurInvDetailReturn) => {
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
        this.formData.Pur_Inv_Detail_Ret.forEach(
            (element: PurInvDetailReturn) => {
                if (element.BuyIn == 'Pcs') {
                    element.Qty = element.Pcs;
                } else if (element.BuyIn == 'Pack') {
                    element.Qty = element.Pack;
                } else if (element.BuyIn == 'Ctn') {
                    element.Qty = element.Ctn;
                }
            }
        );
    }

    fetchInvoice() {
        this._DrpService
            .getInvoicebyInvoiceNumber(this.formData.PurchaseInvoiceNo)
            .subscribe({
                next: (res: PurInvMaster) => {
                    this.formData.CategoryID = res.CategoryID;
                    this.formData.DcNo = res.DcNo;
                    this.formData.DcDt = res.DcDt;
                    this.formData.SupplierID = res.SupplierID;
                    this.formData.CompanyID = res.CompanyID;
                    this.formData.InvoiceDate = new Date();
                    this.formData.Pur_Inv_Detail_Ret = res.Pur_Inv_Detail;
                    this.formData.Pur_Inv_Detail_Ret.forEach((element) => {
                        element.ID = 0;
                        if (element.BuyIn == 'Pcs') {
                            element.Qty = element.Pcs;
                        } else if (element.BuyIn == 'Pack') {
                            element.Qty = element.Pack;
                        } else if (element.BuyIn == 'Ctn') {
                            element.Qty = element.Ctn;
                        }
                    });
                },
                error: (err) => {
                    console.error('Error fetching invoice:', err);
                },
            });
    }

    // fetch Dropdown Data

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

    getTotalItems() {
        return this.formData.Pur_Inv_Detail_Ret.length;
    }

    getTotalQty() {
        let total = 0;
        for (let item of this.formData.Pur_Inv_Detail_Ret) {
            total += item.Qty ? item.Qty : 0;
        }
        return total;
    }

    getTotalAmt() {
        let total = 0;
        for (let item of this.formData.Pur_Inv_Detail_Ret) {
            if (item.ApplyDiscount || item.ApplySaleTax) {
                total += item.NetAmt ? item.NetAmt : 0;
            } else {
                total += item.TAmt ? item.TAmt : 0;
            }
        }
        return total;
    }

    public override ValidateBeforeSave(formData: PurInvMasterReturn): boolean {
        this.validation = [];

        if (!formData.PurchaseInvoiceNo || formData.PurchaseInvoiceNo.trim() === '') {
            this.validation.push('Purchase Invoice is required.');
        }

        // if (!formData.InvoiceNo || formData.InvoiceNo.trim() === '') {
        //     this.validation.push('Invoice No is required.');
        // }

        if (!formData.InvoiceDate) {
            this.validation.push('Invoice Date is required.');
        }

        return this.validation.length > 0;
    }



}

