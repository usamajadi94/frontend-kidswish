import { Component, inject, OnInit } from '@angular/core';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { ListService } from 'app/modules/shared/services/list.service';
import { CustomerOrderMaster } from '../../models/customer-order-master.model';
import { ActivatedRoute } from '@angular/router';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BftInputNumberComponent } from 'app/modules/shared/components/fields/bft-input-number/bft-input-number.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftInputDateComponent } from 'app/modules/shared/components/fields/bft-input-date/bft-input-date.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { NzCollapseModule } from 'ng-zorro-antd/collapse';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { CustomerOrderDetail } from '../../models/customer-order-detail.model';
import { CustomerOrderStatus } from '../../enums/customer-order-status';

@Component({
  selector: 'app-customer-order',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    BftInputTextComponent,
    BftInputNumberComponent,
    BftInputDateComponent,
    BftSelectComponent,
    NzCollapseModule,
    BftButtonComponent
  ],
  templateUrl: './customer-order.component.html',
  styleUrl: './customer-order.component.scss'
})
export class CustomerOrderComponent extends BaseComponent<CustomerOrderMaster, CustomerOrderComponent> implements OnInit {
  private _DrpService = inject(DrpService);
  private _listService = inject(ListService);

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
    this.getData()
    this.getCustomers();
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
          flavours: [],
        };
      }

      grouped[item.ProductID].flavours.push({
        name: item.FlavorName,
        id: item.FlavorID,
        qty: 0
      });
    });

    return Object.values(grouped);
  }

  public BeforeInsert(formData: CustomerOrderMaster): void {
    this.formData.Customer_Order_Detail = [];

    this.formData.CustomerOrderStatusID = CustomerOrderStatus.InProgress;
    this.groupedPacks.forEach(pack => {
      pack.flavours.forEach(flavour => {
        if (flavour.qty && flavour.qty > 0){
          this.formData.Customer_Order_Detail.push({
            ID: 0,                        // new detail
            CustomerOrderMasterID: 0,     // backend will set
            ProductID: pack.productID,
            FlavorID: flavour.id,
            Qty: flavour.qty ?? 0         // even if 0, send it
          });
        }
      });
    });

  }

  public BeforeUpdate(formData: CustomerOrderMaster): void {

    var customerOrderDetails: CustomerOrderDetail[] = Object.assign([], this.formData.Customer_Order_Detail);
    this.formData.Customer_Order_Detail = [];

    this.formData.CustomerOrderStatusID = CustomerOrderStatus.InProgress;
    this.groupedPacks.forEach(pack => {
      pack.flavours.forEach(flavour => {
        const found = customerOrderDetails.find(
          d => d.ProductID === pack.productID && d.FlavorID === flavour.id
        );
        if (flavour.qty && flavour.qty > 0) {
          this.formData.Customer_Order_Detail.push({
            ID: found ? found.ID : 0,                  // keep old ID if exists, else insert new
            CustomerOrderMasterID: this.formData.ID,
            ProductID: pack.productID,
            FlavorID: flavour.id,
            Qty: flavour.qty ?? 0                      // always send qty, even 0
          });
        }
      });
    });

  }

  public AfterGetData(): void {
    this.groupedPacks.forEach(pack => {
      pack.flavours.forEach(flavour => {
        const found = this.formData.Customer_Order_Detail.find(
          d => d.ProductID === pack.productID && d.FlavorID === flavour.id
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
      if (formData.OrderDate == null ) {
          this.validation.push('Order Date is required.');
      }

      if (formData.CustomerID == null || formData.CustomerID === 0) {
          this.validation.push('Customer is required.');
      }
  
      return this.validation.length > 0;
  }

}

