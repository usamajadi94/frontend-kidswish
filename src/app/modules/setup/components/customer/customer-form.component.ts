import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftCheckboxComponent } from 'app/modules/shared/components/fields/bft-checkbox/bft-checkbox.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { Customer } from '../../models/customer';

@Component({
    selector: 'app-customer-form',
    standalone: true,
    imports: [FormsModule, BftInputTextComponent, BftTextareaComponent, BftCheckboxComponent, BftSelectComponent],
    templateUrl: './customer-form.component.html',
    styleUrl: './customer-form.component.scss',
})
export class CustomerFormComponent extends BaseComponent<Customer, CustomerFormComponent> {
    private _drpService = inject(DrpService);
    distributors: any[] = [];

    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.customerController);
        this.setFormTitle(componentRegister.customer.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this._drpService.getDistributorDrp().subscribe({
            next: (res: any) => { this.distributors = res; },
        });
    }

    public override InitializeObject(): void {
        this.formData = new Customer();
    }

    override ValidateBeforeSave(formData: Customer): boolean {
        this.validation = [];
        if (!formData.Name || formData.Name.trim() === '') {
            this.validation.push('Name is required.');
        }
        return this.validation.length > 0;
    }
}
