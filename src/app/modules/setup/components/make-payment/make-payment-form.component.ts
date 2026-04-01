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
    selector: 'app-make-payment-form',
    standalone: true,
    imports: [FormsModule, BftInputDateComponent, BftSelectComponent, BftInputCurrencyComponent, BftTextareaComponent],
    templateUrl: './make-payment-form.component.html',
    styleUrl: './make-payment-form.component.scss',
})
export class MakePaymentFormComponent extends BaseComponent<PaymentTransaction, MakePaymentFormComponent> {
    private _drpService = inject(DrpService);

    paymentTypes = [
        { ID: 'Cash', Name: 'Cash' },
        { ID: 'Bank Transfer', Name: 'Bank Transfer' },
        { ID: 'Cheque', Name: 'Cheque' },
        { ID: 'Online Transfer', Name: 'Online Transfer' },
    ];

    bankAccounts: any[] = [];
    vendors: any[] = [];

    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.paymentTransactionController);
        this.setFormTitle(componentRegister.makePayment.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this._drpService.getBankAccountDrp().subscribe({ next: (res: any) => { this.bankAccounts = res; } });
        this._drpService.getVendorDrp().subscribe({ next: (res: any) => { this.vendors = res; } });
    }

    public override InitializeObject(): void {
        this.formData = new PaymentTransaction();
        this.formData.TransactionType = 'payment';
        this.formData.FromPartyType = 'bank_account';
        this.formData.ToPartyType = 'vendor';
        this.formData.SCode = 'pay_02';
    }

    override BeforeUpSert(): void {
        this.formData.TransactionType = 'payment';
        this.formData.FromPartyType = 'bank_account';
        this.formData.ToPartyType = 'vendor';
        this.formData.SCode = 'pay_02';
    }

    override ValidateBeforeSave(formData: PaymentTransaction): boolean {
        this.validation = [];
        if (!formData.Date) this.validation.push('Date is required.');
        if (!formData.Amount || formData.Amount <= 0) this.validation.push('Amount must be greater than 0.');
        if (!formData.PaymentType) this.validation.push('Payment Type is required.');
        if (!formData.FromPartyID) this.validation.push('Bank Account is required.');
        if (!formData.ToPartyID) this.validation.push('Vendor is required.');
        return this.validation.length > 0;
    }
}
