import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { Product } from 'app/modules/setup/models/product';

@Component({
    selector: 'app-product-form',
    standalone: true,
    imports: [FormsModule, BftInputTextComponent, BftTextareaComponent, BftSelectComponent],
    templateUrl: './product-form.component.html',
    styleUrl: './product-form.component.scss',
})
export class ProductFormComponent extends BaseComponent<Product, ProductFormComponent> implements OnInit {
    private drpService = inject(DrpService);
    legalEntities = [];

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
        this.drpService.getLegalEntityDrp().subscribe({
            next: (res: any) => { this.legalEntities = res; },
        });
    }

    public override InitializeObject(): void {
        this.formData = new Product();
    }

    override ValidateBeforeSave(formData: Product): boolean {
        this.validation = [];
        if (!formData.Name || formData.Name.trim() === '') {
            this.validation.push('Name is required.');
        }
        return this.validation.length > 0;
    }
}
