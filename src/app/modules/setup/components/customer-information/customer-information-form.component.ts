import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftCheckboxComponent } from 'app/modules/shared/components/fields/bft-checkbox/bft-checkbox.component';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';
import { BftInputNumberComponent } from 'app/modules/shared/components/fields/bft-input-number/bft-input-number.component';
import { BftInputPhoneComponent } from 'app/modules/shared/components/fields/bft-input-phone/bft-input-phone.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { CustomerInformation } from '../../models/customer-info';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { BftInputEmailComponent } from "app/modules/shared/components/fields/bft-input-email/bft-input-email.component";

@Component({
    selector: 'app-customer-information',
    standalone: true,
    imports: [
    BftSelectComponent,
    FormsModule,
    BftInputTextComponent,
    BftInputPhoneComponent,
    MatTabsModule,
    BftTextareaComponent,
    BftCheckboxComponent,
    BftInputCurrencyComponent,
    BftInputEmailComponent
],
    templateUrl: './customer-information-form.component.html',
    styleUrl: './customer-information-form.component.scss',
})
export class CustomerInformationComponent extends BaseComponent<
    CustomerInformation,
    CustomerInformationComponent
> {
    private _DrpService = inject(DrpService);
    cityDrp: any[] = [];
    areaDrp: any[] = [];
    routeDrp: any[] = [];
    memberTypeDrp: any[] = [];
    initialOpeningBalance: number = 0;
    
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

    public override async BeforeInit(): Promise<void> {
        await this.getCity();
        await this.getMemberType();
    }

    public override InitializeObject(): void {
        this.formData = new CustomerInformation();
    }

    public AfterGetData(): void {
        this.OnCitySelection(this.formData.CityID,false);
        this.OnAreaSelection(this.formData.AreaID,false);
        this.initialOpeningBalance = this.formData.OpeningBalance;
    }

    getCity() {
        this._DrpService.getCityDrp().subscribe({
            next: (res: any) => {
                this.cityDrp = res;
            },
            error: (err) => {
                console.error('Error fetching city:', err);
            },
        });
    }
    OnCitySelection(ID: number,dataReset: boolean = true) {
        if( dataReset ) {
            this.formData.AreaID = null;
            this.formData.RouteID = null;
        }
        this.areaDrp = [];
        this.routeDrp = [];
        if (ID) {
            this._DrpService.getAreaByCityIDDrp(ID).subscribe({
                next: (res: any) => {
                    this.areaDrp = res;
                },
                error: (err) => {
                    console.error('Error fetching area:', err);
                },
            });
        }else this.areaDrp = [];
    }
    OnAreaSelection(ID: number,dataReset: boolean = true) {
        if( dataReset ) {
            this.formData.RouteID = null;
        }
        if (ID) {
            this._DrpService.getRouteByAreaIDDrp(ID).subscribe({
                next: (res: any) => {
                    this.routeDrp = res;
                },
                error: (err) => {
                    console.error('Error fetching area:', err);
                },
            });
        }else this.routeDrp = [];
    }

    getMemberType() {
        this._DrpService.getMemberTypeDrp().subscribe({
            next: (res: any) => {
                this.memberTypeDrp = res;
            },
            error: (err) => {
                console.error('Error fetching member type:', err);
            },
        });
    }

    override ValidateBeforeSave(formData: CustomerInformation): boolean {
            this.validation = [];
             if (formData.Description == null || formData.Description.trim() == '') {
                this.validation.push('Name is required.');
            }
            if (formData.CityID == null || !formData.CityID) {
                this.validation.push('City is required.');
            }
            if (formData.AreaID == null || !formData.AreaID) {
                this.validation.push('Area is required.');
            }
            if (formData.RouteID == null || !formData.RouteID) {
                this.validation.push('Route is required.');
            }
            // if (formData.MemberTypeID == null || !formData.MemberTypeID) {
            //     this.validation.push('Type is required.');
            // }
            return this.validation.length > 0;
        }
}
