import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftCheckboxComponent } from 'app/modules/shared/components/fields/bft-checkbox/bft-checkbox.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { Vendor } from '../../models/vendor';

@Component({
    selector: 'app-vendor-form',
    standalone: true,
    imports: [FormsModule, BftInputTextComponent, BftSelectComponent, BftCheckboxComponent],
    templateUrl: './vendor-form.component.html',
    styleUrl: './vendor-form.component.scss',
})
export class VendorFormComponent extends BaseComponent<Vendor, VendorFormComponent> {
    private _drpService = inject(DrpService);

    vendorTypes: any[] = [];

    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.vendorController);
        this.setFormTitle(componentRegister.vendor.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
        this._drpService.getVendorTypeDrp().subscribe({
            next: (res: any) => { this.vendorTypes = res; },
        });
    }

    public override InitializeObject(): void {
        this.formData = new Vendor();
    }

    override ValidateBeforeSave(formData: Vendor): boolean {
        this.validation = [];
        if (!formData.Name || formData.Name.trim() === '') {
            this.validation.push('Name is required.');
        }
        return this.validation.length > 0;
    }
}
