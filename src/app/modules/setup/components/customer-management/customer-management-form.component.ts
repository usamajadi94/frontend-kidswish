import { Component, inject } from '@angular/core';
import { BftTextareaComponent } from "app/modules/shared/components/fields/bft-textarea/bft-textarea.component";
import { BftInputTextComponent } from "app/modules/shared/components/fields/bft-input-text/bft-input-text.component";
import { BftInputEmailComponent } from "app/modules/shared/components/fields/bft-input-email/bft-input-email.component";
import { BftInputPhoneComponent } from "app/modules/shared/components/fields/bft-input-phone/bft-input-phone.component";
import { CustomerInformation } from '../../models/customer-info';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { ActivatedRoute } from '@angular/router';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BftCheckboxComponent } from 'app/modules/shared/components/fields/bft-checkbox/bft-checkbox.component';

@Component({
  selector: 'app-customer-management-form',
  standalone: true,
  imports: [ 
    CommonModule,
    FormsModule,
    BftInputTextComponent,
    BftInputPhoneComponent,
    BftInputEmailComponent,
    BftTextareaComponent,
    BftCheckboxComponent
  ],
  templateUrl: './customer-management-form.component.html',
  styleUrl: './customer-management-form.component.scss'
})
export class CustomerManagementFormComponent extends BaseComponent<
  CustomerInformation,
  CustomerManagementFormComponent
> {

  constructor(
    private genSer: GenericService,
    private msgSer: MessageModalService,
    private modalSer: ModalService,
    private toasterSer: ToastService,
    public activatedRoute: ActivatedRoute
  ) {
    super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
    this.setControllerName(apiUrls.customerInformatonController);
    this.setFormTitle(componentRegister.customer.Title);
  }

  override ngOnInit(): void {
    super.ngOnInit();
  }

  public override InitializeObject(): void {
    this.formData = new CustomerInformation();
  }

  override ValidateBeforeSave(formData: CustomerInformation): boolean {
    this.validation = [];
    if (formData.Description == null || formData.Description.trim() == '') {
      this.validation.push('Name is required.');
    }
    return this.validation.length > 0;
  }
}
