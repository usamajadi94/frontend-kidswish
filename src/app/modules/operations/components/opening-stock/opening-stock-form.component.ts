import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftInputNumberComponent } from 'app/modules/shared/components/fields/bft-input-number/bft-input-number.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { OpeningStock } from '../../model/opening-stock';
import { componentRegister } from 'app/modules/shared/services/component-register';

@Component({
    selector: 'app-opening-stock',
    standalone: true,
    imports: [
        BftButtonComponent,
        BftInputDateComponent,
        BftSelectComponent,
        BftInputNumberComponent,
        FormsModule,
        MatIcon,
    ],
    templateUrl: './opening-stock-form.component.html',
    styleUrl: './opening-stock-form.component.scss',
})
export class OpeningStockComponent extends BaseComponent<
    Array<OpeningStock>,
    OpeningStockComponent
> {
    private _DrpService = inject(DrpService);
    items: Array<any> = [];

    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.openingStockController);
         this.setFormTitle(componentRegister.openingStock.Title);
    }

    ngOnInit(): void {
        super.ngOnInit();
    }
    override AfterDisplay(): void {
        this.addOpeningRow();
    }
    override InitializeObject(): void {
        this.formData = new Array<OpeningStock>();
    }
    public async BeforeInit(): Promise<void> {
        await this.getItems();
    }

    getItems() {
        this._DrpService.getItemsDrp().subscribe({
            next: (res: any) => {
                this.items = res;
            },
            error: (err) => {
                console.error('Error fetching items:', err);
            },
        });
    }

    addOpeningRow() {
        let row = Object.assign({}, new OpeningStock());
        this.formData.push(row);
    }

    deleteDetailRow(index: number) {
        if (this.formData.length > 1) {
            this.formData.splice(index, 1);
        }
    }

    onItemSelect(element: OpeningStock) {
        this.resetFields(element);
        if (element.ItemID != null) {
            let item: any = this.items.filter((x) => x.ID == element.ItemID);
            if (item.length > 0) {
                element.CurrentStock = item[0].StockInHand;
            }
        }
    }

    resetFields(element: OpeningStock): void {
        element.CurrentStock = 0;
        element.StockDiff = 0;
        element.StockUpdate = 0;
    }

    stockDiff(element: OpeningStock): void {
        element.StockDiff = element.StockUpdate - element.CurrentStock;
    }


    override ValidateBeforeSave(formData: OpeningStock[]): boolean {
        this.validation = []; // Clear previous validation errors

        let hasError = false;

        if (!formData || formData.length === 0) {
            hasError = true;
        } else {
            for (const detail of formData) {
                if (
                    !detail.ItemID ||
                    !detail.StockUpdate ||
                    detail.StockUpdate <= 0
                ) {
                    hasError = true;
                    break; // No need to continue checking once we find an error
                }
            }
        }

        if (hasError) {
            this.validation.push('Kindly fill your required fields.');
        }

        return this.validation.length > 0;
    }
}
