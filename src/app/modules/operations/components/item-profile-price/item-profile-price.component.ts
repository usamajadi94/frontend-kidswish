import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';
import { BftInputNumberComponent } from 'app/modules/shared/components/fields/bft-input-number/bft-input-number.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import {
    ItemProfilePrice,
} from '../../model/item-profile-price';
import { MatIcon } from '@angular/material/icon';
import { componentRegister } from 'app/modules/shared/services/component-register';

@Component({
    selector: 'app-item-profile-price',
    standalone: true,
    imports: [
        BftButtonComponent,
        BftSelectComponent,
        BftInputCurrencyComponent,
        BftInputTextComponent,
        BftInputNumberComponent,
        FormsModule,
        MatIcon
    ],
    templateUrl: './item-profile-price.component.html',
    styleUrl: './item-profile-price.component.scss',
})
export class ItemProfilePriceComponent extends BaseComponent<
    Array<ItemProfilePrice>,
    ItemProfilePriceComponent
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
        this.setControllerName(apiUrls.itemProfilePriceHistory);
        this.setFormTitle(componentRegister.MultipleitemProfile.Title);
    }

    ngOnInit(): void {
        super.ngOnInit();
    }

    public AfterDisplay(): void {
        this.addPriceRow();
    }

    override InitializeObject(): void {
        this.formData = new Array<ItemProfilePrice>();
    }
    public async BeforeInit(): Promise<void> {
        await this.getItems();
    }

    // ---
    addPriceRow() {
        let row = Object.assign({}, new ItemProfilePrice());
        this.formData.push(row);
    }

    onItemSelect(element: ItemProfilePrice) {
        this.reset(element);
        if (element.ItemID != null) {
            let item: any = this.items.filter((x) => x.ID == element.ItemID);
            if (item.length > 0) {
                element.CostPr = item[0].CostPr;
                element.SalePr = item[0].SalePr;
                element.CtnCost = item[0].CtnCost;
                element.CtnSale = item[0].CtnSale;
                element.PackPcsCost = item[0].PackPcsCost;
                element.PackPcsSale = item[0].PackPcsSale;
                element.SizeUnitGm = item[0].SizeUnitGm;
                element.PackPcs = item[0].PackPcs;
                element.Ctn = item[0].Ctn;
            }
        }
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

    calculateValues(element: ItemProfilePrice): void {
        element.PackPcsCost = element.PackPcs * element.CostPr;
        element.PackPcsSale = element.PackPcs * element.SalePr;

        element.CtnCost = element.Ctn * element.PackPcsCost;
        element.CtnSale = element.Ctn * element.PackPcsSale;
    }

    public BeforeInsert(formData: ItemProfilePrice[]): void {
        formData.forEach(element => {
            element.Description = 'MIP';
        })
    }

    reset(element: ItemProfilePrice) {
        element.PackPcsCost = 0;
        element.PackPcsSale = 0;
        element.CtnCost = 0;
        element.CtnSale = 0;
        element.PackPcs = 0;
        element.Ctn = 0;
        element.SizeUnitGm = '';
        element.CostPr = 0;
        element.SalePr = 0;
    }

    deleteDetailRow(index: number) {
        if (this.formData.length > 1) {
            this.formData.splice(index, 1);
        }
    }

    ValidateBeforeSave(formData: ItemProfilePrice[]): boolean {
        this.validation = [];

        const selectedItems = formData.map(item => ({ itemID: item.ItemID, itemName: this.items.find(x => x.ID === item.ItemID)?.Description || '' }));
        const duplicateItems = selectedItems.filter((item, index) => selectedItems.findIndex(x => x.itemID === item.itemID) !== index);

        if (duplicateItems.length > 0) {
            duplicateItems.forEach(item => {
                this.validation.push(`"${item.itemName}" is already added`);
            });
        }

        return this.validation.length > 0;
    }

    getTotalItems() {
        return this.formData.filter(row => row.ItemID).length;
    }


}
