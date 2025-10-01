import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftCheckboxComponent } from 'app/modules/shared/components/fields/bft-checkbox/bft-checkbox.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftInputEmailComponent } from 'app/modules/shared/components/fields/bft-input-email/bft-input-email.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { Employee } from '../../models/employee';
import { BftInputPhoneComponent } from 'app/modules/shared/components/fields/bft-input-phone/bft-input-phone.component';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';

@Component({
    selector: 'app-employee-management-form',
    standalone: true,
    imports: [
        FormsModule,
        BftInputTextComponent,
        BftInputEmailComponent,
        BftInputDateComponent,
        BftCheckboxComponent,
        BftInputPhoneComponent,
        BftInputCurrencyComponent
    ],
    templateUrl: './employee-management-form.component.html',
    styleUrl: './employee-management-form.component.scss',
})
export class EmployeeManagementFormComponent extends BaseComponent<
    Employee,
    EmployeeManagementFormComponent
> {
    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.employeeController);
        this.setFormTitle(componentRegister.employee.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }

    public override InitializeObject(): void {
        this.formData = new Employee();
    }

      override ValidateBeforeSave(formData: Employee): boolean {
        this.validation = [];
        if (!formData.Description || formData.Description.trim() === '') {
          this.validation.push('Employee Name is required.');
        }
        if (!formData.JoinDate || formData.JoinDate == null) {
          this.validation.push('Join Date is required.');
        }
        return this.validation.length > 0;
      }
}
