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
import { PaymentTransaction } from '../../models/payment-transaction';

@Component({
    selector: 'app-account-transfer-form',
    standalone: true,
    imports: [FormsModule, BftInputDateComponent, BftSelectComponent, BftInputCurrencyComponent, BftTextareaComponent],
    template: `
        <div class="flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-4">
                <bft-input-date name="Date" label="Date" [(ngModel)]="formData.Date" [required]="true" [skeleton]="isDataLoading" />
                <bft-input-currency name="Amount" label="Amount" symbol="PKR" [(ngModel)]="formData.Amount" [skeleton]="isDataLoading" />
            </div>
            <bft-select name="FromPartyID" label="From Account" [displayList]="bankAccounts" valueField="ID" displayField="Name"
                [(ngModel)]="formData.FromPartyID" [clearable]="true" [skeleton]="isDataLoading" />
            <bft-select name="ToPartyID" label="To Account" [displayList]="toAccounts" valueField="ID" displayField="Name"
                [(ngModel)]="formData.ToPartyID" [clearable]="true" [skeleton]="isDataLoading" />
            <bft-select name="PaymentType" label="Transfer Method" [displayList]="paymentTypes" valueField="ID" displayField="Name"
                [(ngModel)]="formData.PaymentType" [skeleton]="isDataLoading" />
            <bft-textarea name="Notes" label="Notes" [(ngModel)]="formData.Notes" [skeleton]="isDataLoading" />
        </div>
    `,
})
export class AccountTransferFormComponent extends BaseComponent<PaymentTransaction, AccountTransferFormComponent> {
    private _drpService = inject(DrpService);

    bankAccounts: any[] = [];
    paymentTypes = [
        { ID: 'Cash', Name: 'Cash' },
        { ID: 'Bank Transfer', Name: 'Bank Transfer' },
        { ID: 'Cheque', Name: 'Cheque' },
        { ID: 'Online Transfer', Name: 'Online Transfer' },
    ];

    get toAccounts(): any[] {
        return this.bankAccounts.filter(a => a.ID !== this.formData.FromPartyID);
    }

    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.paymentTransactionController);
        this.setFormTitle('Account Transfer');
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this._drpService.getBankAccountDrp().subscribe({ next: (res: any) => { this.bankAccounts = res; } });
    }

    public override InitializeObject(): void {
        this.formData = new PaymentTransaction();
        this.formData.TransactionType = 'transfer';
        this.formData.FromPartyType = 'bank_account';
        this.formData.ToPartyType = 'bank_account';
        this.formData.SCode = 'pay_03';
    }

    override BeforeUpSert(): void {
        this.formData.TransactionType = 'transfer';
        this.formData.FromPartyType = 'bank_account';
        this.formData.ToPartyType = 'bank_account';
        this.formData.SCode = 'pay_03';
    }

    override ValidateBeforeSave(formData: PaymentTransaction): boolean {
        this.validation = [];
        if (!formData.Date) this.validation.push('Date is required.');
        if (!formData.Amount || formData.Amount <= 0) this.validation.push('Amount must be greater than 0.');
        if (!formData.FromPartyID) this.validation.push('From Account is required.');
        if (!formData.ToPartyID) this.validation.push('To Account is required.');
        if (formData.FromPartyID === formData.ToPartyID) this.validation.push('From and To accounts must be different.');
        return this.validation.length > 0;
    }
}
