import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { CompanyInformation } from '../../models/company-info';
import { BftInputEmailComponent } from 'app/modules/shared/components/fields/bft-input-email/bft-input-email.component';
import { BftInputPhoneComponent } from 'app/modules/shared/components/fields/bft-input-phone/bft-input-phone.component';
import { BftCheckboxComponent } from 'app/modules/shared/components/fields/bft-checkbox/bft-checkbox.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';
import { componentRegister } from 'app/modules/shared/services/component-register';

@Component({
    selector: 'app-company-information',
    standalone: true,
    imports: [BftInputTextComponent, BftInputEmailComponent, BftInputPhoneComponent,BftCheckboxComponent, BftTextareaComponent, FormsModule],
    templateUrl: './company-information-form.component.html',
    styleUrl: './company-information-form.component.scss',
})
export class CompanyInformationComponent extends BaseComponent<
    CompanyInformation,
    CompanyInformationComponent
> {
    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.companyInformationController);
        this.setFormTitle(componentRegister.company.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }

    public override InitializeObject(): void {
        this.formData = new CompanyInformation();
    }

    override ValidateBeforeSave(formData: CompanyInformation): boolean {
        this.validation = [];
        if (formData.Description == null || formData.Description.trim() == '') {
            this.validation.push('Name is required.');
        }
    //     if (formData.PhoneNo == null || formData.PhoneNo.trim() == '') {
    //        this.validation.push('Phone No is required.');
    //    }
    //     if (formData.ContactPersonName == null || formData.ContactPersonName.trim() == '') {
    //         this.validation.push('Representative Name is required.');
    //     }
        return this.validation.length > 0;
    }
}
