import { inject, Injectable } from '@angular/core';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { ItemTypeComponent } from '../components/item-type/item-type-form.component';
import { SupplierInformationComponent } from '../components/supplier-information/supplier-information-form.component';
import { VehicleInformationComponent } from '../components/vehicle-information/vehicle-information.component';

@Injectable({
    providedIn: 'root',
})
export class SetComponentRegisterService {
    private _ModalService = inject(ModalService);

    addSupplierInformation() {
        const modalRef = this._ModalService.openModal({
            component: SupplierInformationComponent,
            title: componentRegister.supplier.Title,
        });

        return modalRef.afterClose;
    }

    addItemType() {
        const modalRef = this._ModalService.openModal({
            component: ItemTypeComponent,
            title: componentRegister.itemType.Title,
        });

        return modalRef.afterClose;
    }

    addVehicle() {
        const modalRef = this._ModalService.openModal({
            component: VehicleInformationComponent,
            title: componentRegister.vehicle.Title,
        });

        return modalRef.afterClose;
    }
}
