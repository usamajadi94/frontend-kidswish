import { Component } from '@angular/core';
import { MemberTypeInformation } from '../../models/membet-type-info';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { CityInformation } from '../../models/city-info';
import { componentRegister } from 'app/modules/shared/services/component-register';

@Component({
  selector: 'app-member-type-information',
  standalone: true,
    imports: [BftInputTextComponent, FormsModule],
  templateUrl: './member-type-information.component.html',
  styleUrl: './member-type-information.component.scss'
})
export class MemberTypeInformationComponent extends BaseComponent<
    MemberTypeInformation,
    MemberTypeInformationComponent
> {
  constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.memberTypeInformatonController);
        this.setFormTitle(componentRegister.memberType.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }

    public override InitializeObject(): void {
        this.formData = new MemberTypeInformation();
    }
    override ValidateBeforeSave(formData: MemberTypeInformation): boolean {
        this.validation = [];
        if (!formData.Description) {
            this.validation.push('Description is required.');
        }
        return this.validation.length > 0;
    }
}
