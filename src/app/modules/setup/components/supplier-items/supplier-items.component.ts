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
import { SupplierItems } from '../../models/supplier-items';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';

@Component({
  selector: 'app-supplier-items',
  standalone: true,
  imports: [
    FormsModule,
    BftInputTextComponent,
    BftInputCurrencyComponent
  ],
  templateUrl: './supplier-items.component.html',
  styleUrl: './supplier-items.component.scss'
})
export class SupplierItemsComponent extends BaseComponent<
SupplierItems,
SupplierItemsComponent
> {
constructor(
    private genSer: GenericService,
    private msgSer: MessageModalService,
    private modalSer: ModalService,
    private toasterSer: ToastService,
    public activatedRoute: ActivatedRoute
) {
    super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
    this.setControllerName(apiUrls.supplierItemsController);
    this.setFormTitle(componentRegister.supplierItems.Title);
    // this.setFormTitle('Supplier Information');
}

override ngOnInit(): void {
    super.ngOnInit();
}

public override InitializeObject(): void {
    this.formData = new SupplierItems();
}

override ValidateBeforeSave(formData: SupplierItems): boolean {
    this.validation = [];
    if (!formData.Description || formData.Description.trim() === '') {
        this.validation.push('Name is required.');
    }
    return this.validation.length > 0;
}
}
