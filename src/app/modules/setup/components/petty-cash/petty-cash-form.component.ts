import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { PettyCash } from '../../models/petty-cash';

@Component({
    selector: 'app-petty-cash-form',
    standalone: true,
    imports: [FormsModule, BftInputTextComponent],
    templateUrl: './petty-cash-form.component.html',
    styleUrl: './petty-cash-form.component.scss',
})
export class PettyCashFormComponent extends BaseComponent<PettyCash, PettyCashFormComponent> {

    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.pettyCashController);
        this.setFormTitle(componentRegister.pettyCash.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }

    public override InitializeObject(): void {
        this.formData = new PettyCash();
    }

    override ValidateBeforeSave(formData: PettyCash): boolean {
        this.validation = [];
        if (!formData.Name || formData.Name.trim() === '') {
            this.validation.push('Name is required.');
        }
        return this.validation.length > 0;
    }
}
