import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { UserService } from 'app/core/user/user.service';
import { CurrentUser } from 'app/core/user/user.types';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftInputNumberComponent } from 'app/modules/shared/components/fields/bft-input-number/bft-input-number.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { ListService } from 'app/modules/shared/services/list.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { Subject, takeUntil } from 'rxjs';
import { CustomerOrderStatus } from '../../enums/customer-order-status';
import { CustomerOrderDetail } from '../../models/customer-order-detail.model';
import { CustomerOrderMaster } from '../../models/customer-order-master.model';

@Component({
    selector: 'app-customer-order',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        BftInputTextComponent,
        BftInputNumberComponent,
        BftInputDateComponent,
        NzCollapseModule,
        BftButtonComponent,
    ],
    templateUrl: './customer-order.component.html',
    styleUrl: './customer-order.component.scss',
})
export class CustomerOrderComponent
    extends BaseComponent<CustomerOrderMaster, CustomerOrderComponent>
    implements OnInit
{
    private _DrpService = inject(DrpService);
    private _listService = inject(ListService);
    private _userService = inject(UserService);
    private _unsubscribeAll: Subject<any> = new Subject<any>();
    private _changeDetectorRef = inject(ChangeDetectorRef);

    user: CurrentUser;
    groupedPacks: any[] = [];
    customers: any[] = [];

    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.customerOrderController);
        this.setFormTitle(componentRegister.customerOrder.Title);
    }

    ngOnInit(): void {
        super.ngOnInit();
    }

    public InitializeObject(): void {
        this.formData = new CustomerOrderMaster();
    }

    public override async BeforeInit(): Promise<void> {
        this.getLoginUser();
        this.getData();
        this.getCustomers();
    }

    getLoginUser() {
        this._userService.user$
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((user: CurrentUser) => {
                this.user = user;
                // Mark for check
                this._changeDetectorRef.markForCheck();
            });
    }

    getCustomers() {
        this._DrpService.getCustomerInformationDrp().subscribe({
            next: (res: any) => {
                this.customers = res;
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
            },
            error: (err) => {
                console.error('Error fetching products with Flavor:', err);
            },
        });
    }

    groupByProduct(data: any[]): any[] {
        const grouped: { [key: number]: any } = {};

        data.forEach((item) => {
            if (!grouped[item.ProductID]) {
                grouped[item.ProductID] = {
                    productID: item.ProductID,
                    name: item.ProductName,
                    category: item.ProductCategory,
                    BoxCase:item.BoxCase,
                    flavours: [],
                };
            }

            grouped[item.ProductID].flavours.push({
                name: item.FlavorName,
                id: item.FlavorID,
                qty: 0,
                BoxCase:item.BoxCase
            });
        });

        return Object.values(grouped);
    }

    public BeforeInsert(formData: CustomerOrderMaster): void {
        this.formData.Customer_Order_Detail = [];

        this.formData.CustomerOrderStatusID = CustomerOrderStatus.InProgress;
        this.groupedPacks.forEach((pack) => {
            pack.flavours.forEach((flavour) => {
                if (flavour.qty && flavour.qty > 0) {
                    this.formData.Customer_Order_Detail.push({
                        ID: 0, // new detail
                        CustomerOrderMasterID: 0, // backend will set
                        ProductID: pack.productID,
                        FlavorID: flavour.id,
                        Qty: flavour.qty ?? 0, // even if 0, send it
                    });
                }
            });
        });
    }

    public BeforeUpdate(formData: CustomerOrderMaster): void {
        var customerOrderDetails: CustomerOrderDetail[] = Object.assign(
            [],
            this.formData.Customer_Order_Detail
        );
        this.formData.Customer_Order_Detail = [];

        this.formData.CustomerOrderStatusID = CustomerOrderStatus.InProgress;
        this.groupedPacks.forEach((pack) => {
            pack.flavours.forEach((flavour) => {
                const found = customerOrderDetails.find(
                    (d) =>
                        d.ProductID === pack.productID &&
                        d.FlavorID === flavour.id
                );
                if (flavour.qty && flavour.qty > 0) {
                    this.formData.Customer_Order_Detail.push({
                        ID: found ? found.ID : 0, // keep old ID if exists, else insert new
                        CustomerOrderMasterID: this.formData.ID,
                        ProductID: pack.productID,
                        FlavorID: flavour.id,
                        Qty: flavour.qty ?? 0, // always send qty, even 0
                    });
                }
            });
        });
    }

    public AfterGetData(): void {
        this.groupedPacks.forEach((pack) => {
            pack.flavours.forEach((flavour) => {
                const found = this.formData.Customer_Order_Detail.find(
                    (d) =>
                        d.ProductID === pack.productID &&
                        d.FlavorID === flavour.id
                );
                flavour.qty = found ? found.Qty : 0;
            });
        });
    }
    incrementQty(flavour: any) {
        flavour.qty = (flavour.qty ?? 0) + 1;
    }

    decrementQty(flavour: any) {
        flavour.qty = flavour.qty - 1;
    }
    override ValidateBeforeSave(formData: CustomerOrderMaster): boolean {
        this.validation = [];
        if (formData.OrderDate == null) {
            this.validation.push('Order Date is required.');
        }

        return this.validation.length > 0;
    }
    
    getCaseQty(detail: any, type: 'Box' | 'Pouch' | 'Sticker',Qty:any) {
        if (detail[Qty] && detail[type + 'Case'] > 0) {
            return Math.floor(detail[Qty] / detail[type + 'Case']);
        }
        else { return 0;}
    }
}
