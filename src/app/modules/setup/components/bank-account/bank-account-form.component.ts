import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { BankAccount } from '../../models/bank-account';

@Component({
    selector: 'app-bank-account-form',
    standalone: true,
    imports: [FormsModule, BftInputTextComponent, BftSelectComponent, BftInputCurrencyComponent, BftTextareaComponent],
    templateUrl: './bank-account-form.component.html',
    styleUrl: './bank-account-form.component.scss',
})
export class BankAccountFormComponent extends BaseComponent<BankAccount, BankAccountFormComponent> {
    accountTypes = [
        { ID: 'Bank', Name: 'Bank' },
        { ID: 'Cash', Name: 'Cash' },
    ];

    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.bankAccountController);
        this.setFormTitle(componentRegister.bankAccount.Title);
    }

    public override InitializeObject(): void {
        this.formData = new BankAccount();
    }

    override ValidateBeforeSave(formData: BankAccount): boolean {
        this.validation = [];
        if (!formData.Name || formData.Name.trim() === '') {
            this.validation.push('Account Name is required.');
        }
        if (!formData.Type) {
            this.validation.push('Type is required.');
        }
        return this.validation.length > 0;
    }
}
