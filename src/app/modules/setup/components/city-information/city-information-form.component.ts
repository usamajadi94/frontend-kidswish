import { Component } from '@angular/core';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { CityInformation } from '../../models/city-info';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { ActivatedRoute } from '@angular/router';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { FormsModule } from '@angular/forms';
import { componentRegister } from 'app/modules/shared/services/component-register';

@Component({
  selector: 'app-city-information',
  standalone: true,
  imports: [BftInputTextComponent, FormsModule],
  templateUrl: './city-information-form.component.html',
  styleUrl: './city-information-form.component.scss'
})
export class CityInformationComponent extends BaseComponent<
    CityInformation,
    CityInformationComponent
> {
  constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.cityInformatonController);
        this.setFormTitle(componentRegister.city.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }

    public override InitializeObject(): void {
        this.formData = new CityInformation();
    }
    override ValidateBeforeSave(formData: CityInformation): boolean {
        this.validation = [];
        if (!formData.Description || formData.Description.trim() === '') {
            this.validation.push('Name is required.');
        }
        return this.validation.length > 0;
    }
}
