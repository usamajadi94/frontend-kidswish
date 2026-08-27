import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { Unit } from '../../models/unit';

@Component({
    selector: 'app-unit',
    standalone: true,
    imports: [FormsModule, BftInputTextComponent],
    templateUrl: './unit.component.html',
})
export class UnitComponent extends BaseComponent<Unit, UnitComponent> {
    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.unitController);
        this.setFormTitle(componentRegister.unit.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }

    public override InitializeObject(): void {
        this.formData = new Unit();
    }

    override ValidateBeforeSave(formData: Unit): boolean {
        this.validation = [];
        if (!formData.Name) {
            this.validation.push('Name is required');
        }
        return this.validation.length > 0;
    }
}
