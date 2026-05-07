import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { PaymentTransaction } from '../../models/payment-transaction';

@Component({
    selector: 'app-payment-received-form',
    standalone: true,
    imports: [FormsModule, BftInputDateComponent, BftSelectComponent, BftInputCurrencyComponent, BftTextareaComponent],
    templateUrl: './payment-received-form.component.html',
    styleUrl: './payment-received-form.component.scss',
})
export class PaymentReceivedFormComponent extends BaseComponent<PaymentTransaction, PaymentReceivedFormComponent> {
    private _drpService = inject(DrpService);

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

    private customers: any[] = [];
    private distributors: any[] = [];
    private bankAccounts: any[] = [];
    private vendors: any[] = [];

    fromList: any[] = [];
    toList: any[] = [];
    customerOrders: any[] = [];

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
