import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { AreaInformation } from '../../models/area-info';
import { SetComponentRegisterService } from '../../services/set-component-register.service';

@Component({
    selector: 'app-area-information',
    standalone: true,
    imports: [BftInputTextComponent, FormsModule, BftSelectComponent],
    templateUrl: './area-information-form.component.html',
    styleUrl: './area-information-form.component.scss',
})
export class AreaInformationComponent extends BaseComponent<
    AreaInformation,
    AreaInformationComponent
> {
    private _SetComponentRegisterService = inject(SetComponentRegisterService);
    private _DrpService = inject(DrpService);
    city: any[] = [];
    componentRegister = componentRegister;
    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.areaInformatonController);
        this.setFormTitle(componentRegister.area.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }

    public override async BeforeInit(): Promise<void> {
        await this.getCity();
    }

    public override InitializeObject(): void {
        this.formData = new AreaInformation();
    }
    override ValidateBeforeSave(formData: AreaInformation): boolean {
        this.validation = [];
        if (!formData.Description || formData.Description.trim() === '') {
            this.validation.push('Name is required.');
        }
        if (!formData.CityID || formData.CityID == null) {
            this.validation.push('City is required.');
        }
        return this.validation.length > 0;
    }

    getCity() {
      this._DrpService.getCityDrp().subscribe({
            next: (res: any) => {
                this.city = res;
            },
            error: (err) => {
                console.error('Error fetching city:', err);
            },
        });
    }

    addCity() {
      this._SetComponentRegisterService
            .addCity()
            .subscribe((res) => {
                if (res.success) {
                    this.city.unshift(res.data);
                    this.formData.CityID = res.data.ID;
                }
            });
    }
}
