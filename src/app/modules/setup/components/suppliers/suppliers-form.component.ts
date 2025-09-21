import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftCheckboxComponent } from 'app/modules/shared/components/fields/bft-checkbox/bft-checkbox.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { SupplierInformation } from '../../models/supplier-info';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BftInputEmailComponent } from 'app/modules/shared/components/fields/bft-input-email/bft-input-email.component';
import { BftInputPhoneComponent } from 'app/modules/shared/components/fields/bft-input-phone/bft-input-phone.component';

@Component({
  selector: 'app-suppliers-form',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BftInputTextComponent,
    BftInputEmailComponent,
    BftInputPhoneComponent,
    BftTextareaComponent, 
    BftCheckboxComponent
  ],
  templateUrl: './suppliers-form.component.html',
  styleUrl: './suppliers-form.component.scss'
})
export class SuppliersFormComponent  extends BaseComponent<
    SupplierInformation,
    SuppliersFormComponent
> {
    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.supplierInformationController);
        this.setFormTitle(componentRegister.supplier.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }

    public override InitializeObject(): void {
        this.formData = new SupplierInformation();
    }

    override ValidateBeforeSave(formData: SupplierInformation): boolean {
        this.validation = [];
        if (!formData.Code || formData.Code.trim() === '') {
            this.validation.push('Code is required.');
        }
        if (!formData.Description || formData.Description.trim() === '') {
            this.validation.push('Name is required.');
        }
        return this.validation.length > 0;
    }
}
