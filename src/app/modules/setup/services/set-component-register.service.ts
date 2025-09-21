import { inject, Injectable } from '@angular/core';
import { ItemProfilePriceComponent } from 'app/modules/operations/components/item-profile-price/item-profile-price.component';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { AreaInformationComponent } from '../components/area-information/area-information-form.component';
import { CityInformationComponent } from '../components/city-information/city-information-form.component';
import { CompanyInformationComponent } from '../components/company-information/company-information-form.component';
import { ItemProfileMultiPricingComponent } from '../components/item-profile/item-profile-multi-pricing/item-profile-multi-pricing.component';
import { ItemTypeComponent } from '../components/item-type/item-type-form.component';
import { SupplierInformationComponent } from '../components/supplier-information/supplier-information-form.component';
import { CustomerInformationComponent } from '../components/customer-information/customer-information-form.component';
import { OrderBookerInformationComponent } from '../components/order-booker-information/order-booker-information.component';
import { SalesmanInformationComponent } from '../components/salesman-information/salesman-information.component';
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

    addCompanyInformation() {
        const modalRef = this._ModalService.openModal({
            component: CompanyInformationComponent,
            title: componentRegister.company.Title,
        });

        return modalRef.afterClose;
    }

    addMultipleItem() {
        const modalRef = this._ModalService.openModal({
            component: ItemProfilePriceComponent,
            title: componentRegister.MultipleitemProfile.Title,
        });

        return modalRef.afterClose;
    }

    addMultipleItemPricing() {
        const modalRef = this._ModalService.openModal({
            component: ItemProfileMultiPricingComponent,
            title: componentRegister.MultipleitemProfile.Title,
        });

        return modalRef.afterClose;
    }

    addCity() {
        const modalRef = this._ModalService.openModal({
            component: CityInformationComponent,
            title: componentRegister.city.Title,
        });

        return modalRef.afterClose;
    }

    addArea() {
        const modalRef = this._ModalService.openModal({
            component: AreaInformationComponent,
            title: componentRegister.area.Title,
        });

        return modalRef.afterClose;
    }

    addCustomer() {
        const modalRef = this._ModalService.openModal({
            component: CustomerInformationComponent,
            title: componentRegister.customer.Title,
        });

        return modalRef.afterClose;
    }
    addOrderBooker() {
        const modalRef = this._ModalService.openModal({
            component: OrderBookerInformationComponent,
            title: componentRegister.orderBooker.Title,
        });

        return modalRef.afterClose;
    }
    addSalesman() {
        const modalRef = this._ModalService.openModal({
            component: SalesmanInformationComponent,
            title: componentRegister.salesman.Title,
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
