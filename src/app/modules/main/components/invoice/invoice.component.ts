import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftCheckboxComponent } from 'app/modules/shared/components/fields/bft-checkbox/bft-checkbox.component';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftInputNumberComponent } from 'app/modules/shared/components/fields/bft-input-number/bft-input-number.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';
import { BftSkeletonComponent } from 'app/modules/shared/components/skeleton/bft-skeleton/bft-skeleton.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { ListService } from 'app/modules/shared/services/list.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';
import { InvoiceDetail } from '../../models/invoice-detail';
import { InvoiceMaster } from '../../models/invoice-master';
import { Company } from 'app/modules/admin/pages/models/company';
import { ApiResponse } from 'app/core/Base/interface/IResponses';
import { HttpClient } from '@angular/common/http';

@Component({
    selector: 'app-invoice',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        BftInputTextComponent,
        BftSelectComponent,
        BftInputCurrencyComponent,
        BftInputDateComponent,
        BftInputNumberComponent,
        BftButtonComponent,
        BftCheckboxComponent,
        MatIconModule,
        NzTableModule,
        MatDividerModule,
        NzSelectModule,
        BftTextareaComponent,
        BftSkeletonComponent,
    ],
    templateUrl: './invoice.component.html',
    styleUrl: './invoice.component.scss',
})
export class InvoiceComponent extends BaseComponent<
    InvoiceMaster,
    InvoiceComponent
> {
    private _DrpService = inject(DrpService);
    private listService = inject(ListService);
    private _http = inject(HttpClient);
    private _changeDetectorRef = inject(ChangeDetectorRef);
    private _router = inject(Router);
    componentRegister = componentRegister;
    items: any[] = [];
    customers: any[] = [];
    subTotal: number = null;
    companyInfo: Company = new Company();
    
    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.invoiceController);
        this.setFormTitle(componentRegister.invoice.Title);
    }
    override ngOnInit(): void {
        super.ngOnInit();
    }

    public override async BeforeInit(): Promise<void> {
        await this.getCustomers();
        await this.getItems();
    }

    public override async AfterInit(): Promise<void> {
        this.addRow();
        await this.getCompanyInfo();
    }
    public override InitializeObject(): void {
        this.formData = new InvoiceMaster();
    }

    public AfterGetData(): void {
        this.calculateTotals();
    }
    addDetailRow() {
        let newRow: InvoiceDetail = new InvoiceDetail();
        this.formData.Invoice_Detail.push(newRow);
    }

    addRow() {
        this.formData.Invoice_Detail.push(
            ...Array.from({ length: 2 }, () => new InvoiceDetail())
        );
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
        this.listService.getProductWithFlavor().subscribe({
            next: (res: any) => {
                this.items = this.groupByProduct(res);
            },
            error: (err) => {
                console.error('Error fetching items:', err);
            },
        });
    }

    getTAmt(element: InvoiceDetail) {
        element.NetAmt =
            (Number(element.Qty) || 0) * (Number(element.Price) || 0);
        this.calculateTotals();
    }

    deleteDetailRow(index: number) {
        if (this.formData.Invoice_Detail.length > 1) {
            this.formData.Invoice_Detail.splice(index, 1);
            this.calculateTotals();
        }
    }

    // -- Validation
    override ValidateBeforeSave(formData: InvoiceMaster): boolean {
        this.validation = []; // Clear previous validations
        let hasDetailError = false;
        if (!formData.InvoiceDate) {
            this.validation.push('Invoice Date is required.');
        }
        if (!formData.CustomerID || formData.CustomerID <= 0) {
            this.validation.push('Customer is required.');
        }

        if (!formData.Invoice_Detail || formData.Invoice_Detail.length === 0) {
            hasDetailError = true;
        } else {
            for (const detail of formData.Invoice_Detail) {
                if (!detail.FlavorID || !detail.Price || !detail.Qty) {
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

    groupByProduct(data: any[]) {
        const grouped: { [key: number]: any } = {};

        data.forEach((item) => {
            if (!grouped[item.ProductID]) {
                grouped[item.ProductID] = {
                    ProductID: item.ProductID,
                    name: item.ProductName,
                    NetWeight: item.NetWeight,
                    flavours: [],
                };
            }

            grouped[item.ProductID].flavours.push({
                ProductID: `${item.ProductID}`,
                FlavorID: item.FlavorID,
                name: item.FlavorName,
            });
        });

        return Object.values(grouped);
    }

    getSubTotal(): number {
        return (
            this.formData.Invoice_Detail?.reduce(
                (sum, item) => sum + (item.NetAmt || 0),
                0
            ) || 0
        );
    }

    calculateTotals() {
        const subtotal = this.getSubTotal();
        const tax =
            (Number(this.formData.Taxable) || 0) *
            (Number(this.formData.TaxRate) || 0);
        this.subTotal = subtotal;
        this.formData.Tax = tax;
        this.formData.Total =
            subtotal +
            tax +
            (Number(this.formData.SH) || 0) +
            (Number(this.formData.Others) || 0);
    }

    getQty(element: InvoiceDetail) {
        if (element.Cases && element.CaseQty) {
            element.Qty = element.Cases * element.CaseQty;
            this.onItemSelect(element);
            this.getTAmt(element);
        }
    }

    onPrint() {
        if (this.formData?.InvoiceNo) {
            const url = `${window.location.origin}/#/report/sale-invoice?invoiceNo=${this.formData.InvoiceNo}`;
            window.open(url, '_blank');
            // this.modalRef.close();
        }
    }

    onItemSelect(element:InvoiceDetail){
        const product = this.items.find(p => 
            p.flavours.some(f => f.FlavorID === element.FlavorID)
        );
        if(product != null){
            element.NetWeight = product.NetWeight * element.Cases;     
        }
    }

    async getCompanyInfo() {
        this.companyInfo = new Company();
        await this._http.get<ApiResponse<Company>>(apiUrls.companyFetch).subscribe({
            next: (res) => {
                this.companyInfo = res.Data;
                if(this.primaryKey == 0){
                    this.formData.InvoiceRegards = this.companyInfo.Notes;
                }
                this._changeDetectorRef.markForCheck();
            },
        });
    }
}
