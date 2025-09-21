import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { SupplierInformation } from '../../models/supplier-info';
import { SupplierInformationComponent } from '../supplier-information/supplier-information-form.component';
import { VehicleInformation } from '../../models/vehicle-info';
import { componentRegister } from 'app/modules/shared/services/component-register';

@Component({
  selector: 'app-vehicle-information',
  standalone: true,
  imports: [
        FormsModule,
        BftInputTextComponent,
    ],  templateUrl: './vehicle-information.component.html',
  styleUrl: './vehicle-information.component.scss'
})
export class VehicleInformationComponent  extends BaseComponent<
    VehicleInformation,
    VehicleInformationComponent
> {
    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.vehicleInformationController);
        this.setFormTitle(componentRegister.vehicle.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }

    public override InitializeObject(): void {
        this.formData = new VehicleInformation();
    }

    override ValidateBeforeSave(formData: VehicleInformation): boolean {
        this.validation = [];
        // if (!formData.Code || formData.Code.trim() === '') {
        //     this.validation.push('Code is required.');
        // }
        if (!formData.Description || formData.Description.trim() === '') {
            this.validation.push('Name is required.');
        }
        return this.validation.length > 0;
    }
}
