import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftCheckboxComponent } from 'app/modules/shared/components/fields/bft-checkbox/bft-checkbox.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { ItemType } from '../../models/item-type';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
@Component({
    selector: 'app-item-type',
    standalone: true,
    imports: [FormsModule, BftInputTextComponent, BftCheckboxComponent],
    templateUrl: './item-type-form.component.html',
    styleUrl: './item-type-form.component.scss',
})
export class ItemTypeComponent extends BaseComponent<
    ItemType,
    ItemTypeComponent
> {
    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.itemTypeController);
        this.setFormTitle(componentRegister.itemType.Title);
        // this.setFormTitle('Item Type');
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }

    public override InitializeObject(): void {
        this.formData = new ItemType();
    }
    override ValidateBeforeSave(formData: ItemType): boolean {
        this.validation = [];
        // if (!formData.Code) {
        //     this.validation.push('Code is required');
        // }
        if (!formData.Description) {
            this.validation.push('Name is required');
        }
        return this.validation.length > 0;
    }
}
