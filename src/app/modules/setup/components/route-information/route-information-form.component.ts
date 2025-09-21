import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { RouteInformation } from '../../models/route-info';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { SetComponentRegisterService } from '../../services/set-component-register.service';

@Component({
    selector: 'app-route-information',
    standalone: true,
    imports: [BftInputTextComponent, FormsModule, BftSelectComponent],
    templateUrl: './route-information-form.component.html',
    styleUrl: './route-information-form.component.scss',
})
export class RouteInformationComponent extends BaseComponent<
    RouteInformation,
    RouteInformationComponent
> {
    private _SetComponentRegisterService = inject(SetComponentRegisterService);
    private _DrpService = inject(DrpService);
    areaList: any[] = [];
    componentRegister = componentRegister;
    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.routeInformatonController);
        this.setFormTitle(componentRegister.route.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }

    public override async BeforeInit(): Promise<void> {
        await this.getArea();
    }

    public override InitializeObject(): void {
        this.formData = new RouteInformation();
    }
    override ValidateBeforeSave(formData: RouteInformation): boolean {
        this.validation = [];
        if (!formData.Description || formData.Description.trim() === '') {
            this.validation.push('Name is required.');
        }
        if (!formData.AreaID || formData.AreaID == null) {
            this.validation.push('Area is required.');
        }
        return this.validation.length > 0;
        
    }

    getArea() {
        this._DrpService.getAreaDrp().subscribe({
            next: (res: any) => {
                this.areaList = res;
            },
            error: (err) => {
                console.error('Error fetching area:', err);
            },
        });
    }

    addArea() {
      this._SetComponentRegisterService
            .addArea()
            .subscribe((res) => {
                if (res.success) {
                    this.areaList.unshift(res.data);
                    this.formData.AreaID = res.data.ID;
                }
            });
    }
}
