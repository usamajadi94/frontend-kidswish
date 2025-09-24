import { Component, inject } from '@angular/core';
import { FlavorStock } from '../../models/flavor-stock';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { OpeningStock } from 'app/modules/operations/model/opening-stock';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { ListService } from 'app/modules/shared/services/list.service';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftInputNumberComponent } from 'app/modules/shared/components/fields/bft-input-number/bft-input-number.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-flavor-stock',
  standalone: true,
  imports: [
    BftButtonComponent,
    BftInputDateComponent,
    BftSelectComponent,
    BftInputNumberComponent,
    FormsModule,
    MatIcon,
     NzSelectModule,
  ],
  templateUrl: './flavor-stock.component.html',
  styleUrl: './flavor-stock.component.scss'
})
export class FlavorStockComponent extends BaseComponent<
    Array<FlavorStock>,
    FlavorStockComponent
> {
    private _DrpService = inject(DrpService);
    private listService = inject(ListService);
    items: Array<any> = [];
    flavors: Array<any> = [];
    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.flavorStockController);
         this.setFormTitle(componentRegister.flavorStock.Title);
    }

    ngOnInit(): void {
        super.ngOnInit();
    }
    override AfterDisplay(): void {
        this.addOpeningRow();
    }
    override InitializeObject(): void {
        this.formData = new Array<FlavorStock>();
    }
    public async BeforeInit(): Promise<void> {
        await this.getItems();
    }

    addOpeningRow() {
        let row = Object.assign({}, new FlavorStock());
        this.formData.push(row);
    }

    deleteDetailRow(index: number) {
        if (this.formData.length > 1) {
            this.formData.splice(index, 1);
        }
    }

    onItemSelect(element: FlavorStock) {
      debugger
        this.resetFields(element);
        if (element.FlavorID != null) {
            let item: any = this.items.filter((x) => x.FlavorID == element.FlavorID);
            if (item.length > 0) {
                element.CurrentStock = item[0].Stock || 0;
                element.ProductID = item[0].ProductID;
            }
        }
    }

    resetFields(element: FlavorStock): void {
        element.CurrentStock = 0;
        element.Qty = 0;
        element.UpdatedStock = 0;
        element.ProductID = null;
    }

    stockDiff(element: FlavorStock): void {
        element.UpdatedStock = element.Qty + element.CurrentStock;
    }


    override ValidateBeforeSave(formData: FlavorStock[]): boolean {
        this.validation = []; // Clear previous validation errors

        let hasError = false;

        if (!formData || formData.length === 0) {
            hasError = true;
        } else {
            for (const detail of formData) {
                if (
                    !detail.FlavorID ||
                    !detail.Qty 
                ) {
                    hasError = true;
                    break; // No need to continue checking once we find an error
                }
            }
        }

        if (hasError) {
            this.validation.push('Kindly fill your required fields.');
        }

        const selectedItems = formData.map(item => ({ FlavorID: item.FlavorID, FlavorName: this.items.find(x => x.FlavorID === item.FlavorID)?.FlavorName || '' }));
        const duplicateItems = selectedItems.filter((item, index) => selectedItems.findIndex(x => x.FlavorID === item.FlavorID) !== index);

        if (duplicateItems.length > 0) {
            duplicateItems.forEach(item => {
                this.validation.push(`"${item.FlavorName}" is already added`);
            });
        }

        return this.validation.length > 0;
    }

     getItems() {
        this.listService.getProductWithFlavor().subscribe({
            next: (res: any) => {
                this.items = res;
                this.flavors = this.groupByProduct(res);
            },
            error: (err) => {
                console.error('Error fetching items:', err);
            },
        });
    }

    groupByProduct(data: any[]) {
        const grouped: { [key: number]: any } = {};

        data.forEach((item) => {
            if (!grouped[item.ProductID]) {
                grouped[item.ProductID] = {
                    ProductID: item.ProductID,
                    name: item.ProductName,
                    flavours: [],
                };
            }

            grouped[item.ProductID].flavours.push({
                ProductID: `${item.ProductID}`,
                FlavorID: item.FlavorID,
                name: item.FlavorName,
            });
        });

        return Object.values(grouped);
    }
}
