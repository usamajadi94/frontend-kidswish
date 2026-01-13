import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import {
    FlavorOrderDetail,
    FlavorOrderMaster,
} from 'app/modules/setup/models/flavor-order';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftInputNumberComponent } from 'app/modules/shared/components/fields/bft-input-number/bft-input-number.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { BftTextareaComponent } from 'app/modules/shared/components/fields/bft-textarea/bft-textarea.component';
import { FlavorOrderStatusEnum } from 'app/modules/shared/enums/flavor-order-status';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { ListService } from 'app/modules/shared/services/list.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';

@Component({
    selector: 'app-product-order-form',
    standalone: true,
    imports: [
        FormsModule,
        BftInputDateComponent,
        BftSelectComponent,
        NzCollapseModule,
        MatTableModule,
        BftInputNumberComponent,
        BftButtonComponent,
        BftTextareaComponent,
    ],
    templateUrl: './product-order-form.component.html',
    styleUrl: './product-order-form.component.scss',
})
export class ProductOrderFormComponent extends BaseComponent<
    FlavorOrderMaster,
    ProductOrderFormComponent
> {
    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.flavorOrder);
        this.setFormTitle(componentRegister.flavorOrder.Title);
    }
    private _DrpService = inject(DrpService);
    private _listService = inject(ListService);

    groupedPacks: Pack[] = [];

    suppliers: any[] = [];

    override ngOnInit(): void {
        super.ngOnInit();
        this.getData();
        this.getSupplier();
    }

    public override InitializeObject(): void {
        this.formData = new FlavorOrderMaster();
    }

    getSupplier() {
        this._DrpService.getSuppliersDrp().subscribe({
            next: (res: any) => {
                this.suppliers = res;
            },
            error: (err) => {
                console.error('Error fetching suppliers:', err);
            },
        });
    }

    getData() {
        this._listService.getProductWithFlavor().subscribe({
            next: (res: any) => {
                this.groupedPacks = this.groupByProduct(res);
                console.log('groupByProduct', this.groupedPacks);
            },
            error: (err) => {
                console.error('Error fetching products with Flavor:', err);
            },
        });
    }

    groupByProduct(data: any[]) {
        console.log('product data', data);
        const grouped: { [key: number]: any } = {};

        data.forEach((item, index) => {
            if (!grouped[item.ProductID]) {
                grouped[item.ProductID] = {
                    ProductID: item.ProductID,
                    name: item.ProductName,
                    flavours: [],
                };
            }
            // this.formData.Flavor_Order_Detail.push(detail);

            grouped[item.ProductID].flavours.push({
                ProductID: `${item.ProductID}`,
                FlavorID: item.FlavorID,
                name: item.FlavorName,
                Box: 0,
                Pouch: 0,
                Sticker: 0,
                // detail: detail,
            });
        });

        return Object.values(grouped);
    }

    increment(detail: FlavorOrderDetail, field: 'Pouch' | 'Box' | 'Sticker') {
        (detail[field] as number)++;
    }

    decrement(detail: FlavorOrderDetail, field: 'Pouch' | 'Box' | 'Sticker') {
        
        (detail[field] as number)--;
        
    }

    public BeforeInsert(formData: FlavorOrderMaster): void {
        // Loop over products
        this.groupedPacks.forEach((product) => {
            // Loop over flavours
            product.flavours.forEach((flavour: any) => {
                if (
                    flavour.Box != 0 ||
                    flavour.Pouch != 0 ||
                    flavour.Sticker != 0
                ) {
                    const detail = new FlavorOrderDetail();
                    detail.ProductID = product.ProductID; // product ka ID
                    detail.FlavorID = flavour.FlavorID; // Agar flavour ki ID hoti to use set karo, abhi null rakha hai
                    detail.Box = flavour.Box;
                    detail.Pouch = flavour.Pouch;
                    detail.Sticker = flavour.Sticker;

                    this.formData.Flavor_Order_Detail.push(detail);
                }
            });
        });

        this.formData.StatusID = FlavorOrderStatusEnum.Ordered;
    }

    trackByFn(index: number, item: any): any {
        return item?.id || index;
    }

    public override AfterGetData(): void {
        console.log('After Get Data', this.formData);

        if (this.formData?.Flavor_Order_Detail?.length) {
            this.formData.Flavor_Order_Detail.forEach((detail) => {
                const product = this.groupedPacks.find(
                    (p) => p.ProductID === detail.ProductID
                );

                if (product) {
                    const flavour: any = product.flavours.find(
                        (f: any) => f.FlavorID === detail.FlavorID
                    );

                    if (flavour) {
                        flavour.Box = detail.Box;
                        flavour.Pouch = detail.Pouch;
                        flavour.Sticker = detail.Sticker;
                    }
                }
            });
        }
    }

    public BeforeUpdate(formData: FlavorOrderMaster): void {
        var flavorOrderDetail: FlavorOrderDetail[] = Object.assign(
            [],
            this.formData.Flavor_Order_Detail
        );
        this.formData.Flavor_Order_Detail = [];

        this.groupedPacks.forEach((pack) => {
            pack.flavours.forEach((flavour:any) => {
                const found = flavorOrderDetail.find(
                    (d) =>
                        d.ProductID === pack.ProductID &&
                        d.FlavorID === flavour.FlavorID
                );
                  if (
                    flavour.Box != 0 ||
                    flavour.Pouch != 0 ||
                    flavour.Sticker != 0
                ){
                    this.formData.Flavor_Order_Detail.push({
                        ID: found ? found.ID : 0, // keep old ID if exists, else insert new
                        OrderMasterID: this.formData.ID,
                        ProductID: pack.ProductID,
                        FlavorID: flavour.FlavorID,
                        Box: flavour.Box,
                        Pouch: flavour.Pouch,
                        Sticker: flavour.Sticker
                    });
                }
            });
        });
        debugger
        console.log('before Update Data===========', this.formData);
        
    }
}

interface Flavour {
    name: string;
}

interface Pack {
    ProductID: number;
    name: string;
    flavours: Flavour[];
}
