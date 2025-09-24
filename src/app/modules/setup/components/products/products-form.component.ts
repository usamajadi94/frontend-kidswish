import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { lastValueFrom } from 'rxjs';
import { Flavour, Product } from '../../models/product';
import { SetComponentRegisterService } from '../../services/set-component-register.service';
import { BftCheckboxComponent } from 'app/modules/shared/components/fields/bft-checkbox/bft-checkbox.component';
import { BftInputNumberComponent } from 'app/modules/shared/components/fields/bft-input-number/bft-input-number.component';

@Component({
    selector: 'app-products-form',
    standalone: true,
    imports: [
        BftInputTextComponent,
        BftSelectComponent,
        BftCheckboxComponent,
        BftButtonComponent,
        MatIconModule,
        FormsModule,
        BftInputNumberComponent
    ],
    templateUrl: './products-form.component.html',
    styleUrl: './products-form.component.scss',
})
export class ProductsFormComponent extends BaseComponent<
    Product,
    ProductsFormComponent
> {
    componentRegister = componentRegister;
    private _SetComponentRegisterService = inject(SetComponentRegisterService);
    categories = [];
    private _DrpService = inject(DrpService);
    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.productController);
        this.setFormTitle(componentRegister.product.Title);
    }

    override ngOnInit(): void {
        super.ngOnInit();
    }

    async BeforeInit(): Promise<void> {
        await this.getCategories();
    }

    public override InitializeObject(): void {
        this.formData = new Product();
    }

    override AfterDisplay(): void {
        this.addDetailsRow();
    }

    addDetailsRow() {
        this.formData.Flavor_Information = Array.from(
            { length: 2 },
            () => new Flavour()
        );
    }

    addRow() {
        let newRow = new Flavour();
        this.formData.Flavor_Information.push(newRow);
    }


    removeFlavor(index: number) {
        this.formData.Flavor_Information.splice(index, 1);
    }

    async getCategories() {
        this.categories = await lastValueFrom(
            this._DrpService.getCategoriesDrp()
        );
    }

    addCategory() {
        this._SetComponentRegisterService.addItemType().subscribe((res) => {
            if (res.success) {
                this.categories.unshift(res.data);
                this.formData.CategoryID = res.data.ID;
            }
        });
    }

    public BeforeInsert(formData: Product): void {
    }


    updateCaseQty() {
  if (this.formData.BoxCase && this.formData.BoxPcs) {
    // Box case already given
    this.formData.BoxCase = this.formData.BoxCase;

    // pouch case = box case × pouch pcs (if available)
    if (this.formData.PouchPcs) {
      this.formData.PouchCase = this.formData.BoxCase * this.formData.PouchPcs;
    }

    // sticker case = box case × sticker pcs (if available)
    if (this.formData.StickerPcs) {
      this.formData.StickerCase = this.formData.BoxCase * this.formData.StickerPcs;
    }
  }
}

}
