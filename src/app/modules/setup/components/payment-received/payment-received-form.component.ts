import { Component, inject } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { LocalStorageService } from 'app/core/auth/localStorage.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { PaymentTransaction } from '../../models/payment-transaction';

interface BulkReceivedLine {
    Date: string;
    Amount: number | null;
    FromPartyType: string;
    DistributorID: number | null;  // used when FromPartyType = distributor, to pick sub-customers
    FromPartyID: number | null;
    PaymentType: string | null;
    ToPartyType: string;
    ToPartyID: number | null;
    Notes: string;
}

@Component({
    selector: 'app-payment-received-form',
    standalone: true,
    imports: [CommonModule, FormsModule, DecimalPipe, BftInputDateComponent, BftSelectComponent, BftInputCurrencyComponent, BftTextareaComponent],
    templateUrl: './payment-received-form.component.html',
    styleUrl: './payment-received-form.component.scss',
})
export class PaymentReceivedFormComponent extends BaseComponent<PaymentTransaction, PaymentReceivedFormComponent> {
    private _drpService = inject(DrpService);
    private _http = inject(HttpClient);
    private _localStorage = inject(LocalStorageService);

    fromPartyTypes = [
        { ID: 'distributor', Name: 'Distributor' },
        { ID: 'customer', Name: 'Customer' },
    ];
    toPartyTypes = [
        { ID: 'bank_account', Name: 'Account' },
        { ID: 'vendor', Name: 'Vendor' },
    ];
    paymentTypes = [
        { ID: 'Cash', Name: 'Cash' },
        { ID: 'Bank Transfer', Name: 'Bank Transfer' },
        { ID: 'Cheque', Name: 'Cheque' },
        { ID: 'Online Transfer', Name: 'Online Transfer' },
    ];

    customers: any[] = [];
    distributors: any[] = [];
    bankAccounts: any[] = [];
    vendors: any[] = [];

    fromList: any[] = [];
    toList: any[] = [];
    customerOrders: any[] = [];

    bulkLines: BulkReceivedLine[] = [];
    get bulkTotal(): number { return this.bulkLines.reduce((s, l) => s + (parseFloat(l.Amount as any) || 0), 0); }

    // Customers with no distributor tagged (for direct customer payments)
    get untaggedCustomers(): any[] { return this.customers.filter(c => !c.DistributorID); }
    // Customers belonging to a specific distributor
    getDistributorCustomers(distributorId: number | null): any[] {
        if (!distributorId) return [];
        return this.customers.filter(c => c.DistributorID === distributorId);
    }
    getToList(type: string): any[] {
        if (type === 'bank_account') return this.bankAccounts;
        if (type === 'vendor') return this.vendors;
        return [];
    }
    onLineFromTypeChange(line: BulkReceivedLine): void {
        line.DistributorID = null;
        line.FromPartyID = null;
    }
    onLineDistributorChange(line: BulkReceivedLine): void { line.FromPartyID = null; }
    onLineToTypeChange(line: BulkReceivedLine): void { line.ToPartyID = null; }

    private emptyLine(): BulkReceivedLine {
        return { Date: new Date().toISOString().split('T')[0], Amount: null, FromPartyType: 'customer', DistributorID: null, FromPartyID: null, PaymentType: null, ToPartyType: 'bank_account', ToPartyID: null, Notes: '' };
    }
    addLine() { this.bulkLines.push(this.emptyLine()); }
    removeLine(i: number) { this.bulkLines.splice(i, 1); }

    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.paymentTransactionController);
        this.setFormTitle(componentRegister.paymentReceived.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this._drpService.getCustomerInformationDrp().subscribe({ next: (res: any) => { this.customers = res; this.refreshFromList(); } });
        this._drpService.getDistributorDrp().subscribe({ next: (res: any) => { this.distributors = res; this.refreshFromList(); } });
        this._drpService.getBankAccountDrp().subscribe({ next: (res: any) => { this.bankAccounts = res; this.refreshToList(); } });
        this._drpService.getVendorDrp().subscribe({ next: (res: any) => { this.vendors = res; this.refreshToList(); } });
    }

    public override InitializeObject(): void {
        this.formData = new PaymentTransaction();
        this.formData.Date = new Date() as any;
        this.formData.TransactionType = 'received';
        this.formData.SCode = 'pay_01';
        this.bulkLines = [this.emptyLine()];
    }

    override async InsertRecord(): Promise<void> {
        if (this.primaryKey > 0) return super.InsertRecord();

        const validLines = this.bulkLines.filter(l => (parseFloat(l.Amount as any) || 0) > 0);
        this.validation = [];
        if (validLines.length === 0) this.validation.push('At least one line with an amount is required.');
        validLines.forEach((l, i) => {
            if (!l.Date) this.validation.push(`Row ${i + 1}: Date is required.`);
            if (!l.FromPartyID) this.validation.push(`Row ${i + 1}: From is required.`);
            if (!l.PaymentType) this.validation.push(`Row ${i + 1}: Payment Type is required.`);
            if (!l.ToPartyID) this.validation.push(`Row ${i + 1}: To is required.`);
        });
        if (this.validation.length > 0) { this.modalSer.validationModal(this.validation); return; }

        this.isSubmitLoading = true;
        const headers = new HttpHeaders({ uid: this._localStorage.uid, cid: this._localStorage.cid, eid: this._localStorage.eid });
        try {
            for (const line of validLines) {
                await firstValueFrom(this._http.post(`${apiUrls.server}${apiUrls.paymentTransactionController}`, {
                    Date: line.Date,
                    Amount: parseFloat(line.Amount as any),
                    PaymentType: line.PaymentType,
                    FromPartyType: 'customer',
                    FromPartyID: line.FromPartyID,
                    ToPartyType: line.ToPartyType,
                    ToPartyID: line.ToPartyID,
                    TransactionType: 'received',
                    Notes: line.Notes || null,
                    SCode: 'pay_01',
                }, { headers }));
            }
            this.msgSer.success(`${validLines.length} entr${validLines.length === 1 ? 'y' : 'ies'} saved!`);
            this.isCreated = true;
            this.isSubmitLoading = false;
            this.modalSer.closeModal(true);
        } catch (e: any) {
            this.isSubmitLoading = false;
            this.toasterSer.openResult(e.status || 500);
        }
    }

    override AfterGetData(): void {
        this.refreshFromList();
        this.refreshToList();
        if (this.formData.FromPartyType === 'customer' && this.formData.FromPartyID) {
            this._drpService.getOrdersByCustomerDrp(this.formData.FromPartyID).subscribe({
                next: (res: any) => { this.customerOrders = res; },
            });
        }
    }

    onFromTypeChange(): void {
        this.formData.FromPartyID = null;
        this.formData.OrderID = null;
        this.customerOrders = [];
        this.refreshFromList();
    }

    onFromPartyChange(): void {
        this.formData.OrderID = null;
        this.customerOrders = [];
        if (this.formData.FromPartyType === 'customer' && this.formData.FromPartyID) {
            this._drpService.getOrdersByCustomerDrp(this.formData.FromPartyID).subscribe({
                next: (res: any) => { this.customerOrders = res; },
            });
        }
    }

    onToTypeChange(): void {
        this.formData.ToPartyID = null;
        this.refreshToList();
    }

    private refreshFromList(): void {
        switch (this.formData?.FromPartyType) {
            case 'customer':    this.fromList = this.customers; break;
            case 'distributor': this.fromList = this.distributors; break;
            default:            this.fromList = [];
        }
    }

    private refreshToList(): void {
        switch (this.formData?.ToPartyType) {
            case 'bank_account': this.toList = this.bankAccounts; break;
            case 'vendor':       this.toList = this.vendors; break;
            default:             this.toList = [];
        }
    }

    override BeforeUpSert(): void {
        this.formData.TransactionType = 'received';
        this.formData.SCode = 'pay_01';
    }

    override ValidateBeforeSave(formData: PaymentTransaction): boolean {
        this.validation = [];
        if (!formData.Date) this.validation.push('Date is required.');
        if (!formData.Amount || formData.Amount <= 0) this.validation.push('Amount must be greater than 0.');
        if (!formData.PaymentType) this.validation.push('Payment Type is required.');
        if (!formData.FromPartyType) this.validation.push('From Type is required.');
        if (!formData.FromPartyID) this.validation.push('From is required.');
        if (!formData.ToPartyType) this.validation.push('To Type is required.');
        if (!formData.ToPartyID) this.validation.push('To is required.');
        return this.validation.length > 0;
    }
}
