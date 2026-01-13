import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

// Import BFT components
import { BftInputDateComponent } from '../../../shared/components/fields/bft-input-date/bft-input-date.component';
import { BftSelectComponent } from '../../../shared/components/fields/bft-select/bft-select.component';
import { BftInputNumberComponent } from '../../../shared/components/fields/bft-input-number/bft-input-number.component';
import { BftButtonComponent } from '../../../shared/components/buttons/bft-button/bft-button.component';
import { SupplierOrderMaster } from '../../models/supplier-order-master';
import { Router, ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { ListService } from 'app/modules/shared/services/list.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { Supplier_Order_Detail } from '../../models/supplier-order-detail';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';
import { Supplier_Order_Products } from '../../models/supplier-order-products';
import { MatTabsModule } from '@angular/material/tabs';
import { SupplierOrderLedgerComponent } from './supplier-order-ledger/supplier-order-ledger.component';
import { NzSelectModule } from 'ng-zorro-antd/select';


@Component({
  selector: 'app-supplier-order',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    BftInputDateComponent,
    BftSelectComponent,
    BftInputNumberComponent,
    BftButtonComponent,
    BftInputCurrencyComponent,
    MatTabsModule,
    NzSelectModule
  ],
  templateUrl: './supplier-order.component.html',
  styleUrl: './supplier-order.component.scss'
})
export class SupplierOrderComponent extends BaseComponent<
  SupplierOrderMaster,
  SupplierOrderComponent
> {
  private _DrpService = inject(DrpService);
  private listService = inject(ListService);
  private _router = inject(Router);
  componentRegister = componentRegister;
  supplierItems: any[] = [];
  supplierProductItems: any[] = [];
  products: any[] = [];
  suppliers: any[] = [];
  subTotal: number = null;

  constructor(
    private genSer: GenericService,
    private msgSer: MessageModalService,
    private modalSer: ModalService,
    private toasterSer: ToastService,
    public activatedRoute: ActivatedRoute
  ) {
    super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
    this.setControllerName(apiUrls.supplierOrderController);
    this.setFormTitle(componentRegister.supplierOrder.Title);
  }
  override ngOnInit(): void {
    super.ngOnInit();
  }

  public override async BeforeInit(): Promise<void> {
    Promise.all([
      await this.getSuppliers(),
      await this.getSupplierItems(),
      await this.getProducts()
    ]);

  }

  public override async AfterInit(): Promise<void> {
    this.addRow();
  }
  public override InitializeObject(): void {
    this.formData = new SupplierOrderMaster();
  }

  public AfterGetData(): void {
    this.addProductRow()
    this.setProductItems();
  }

  addRow() {
    this.formData.Supplier_Order_Detail.push(
      ...Array.from({ length: 1 }, () => new Supplier_Order_Detail())
    );
  }

  addProductRow() {
    this.formData.Supplier_Order_Products.push(
      ...Array.from({ length: 1 }, () => new Supplier_Order_Products())
    );
  }

  async getSuppliers() {
    await this._DrpService.getSuppliersDrp().subscribe({
      next: (res: any) => {
        this.suppliers = res;
      },
      error: (err) => {
        console.error('Error fetching items:', err);
      },
    });
  }

  async getSupplierItems() {
    await this._DrpService.getSupplierItemsDrp().subscribe({
      next: (res: any) => {
        this.supplierItems = res;
      },
      error: (err) => {
        console.error('Error fetching items:', err);
      },
    });
  }

  async getProducts() {
    await this.listService.getProductWithFlavor().subscribe({
      next: (res: any) => {
        this.products = this.groupByProduct(res);
      },
      error: (err) => {
        console.error('Error fetching items:', err);
      },
    });
  }


  deleteDetailRow(index: number) {
    if (this.formData.Supplier_Order_Detail.length > 1) {
      this.formData.Supplier_Order_Detail.splice(index, 1);

    }
  }

  // -- Validation
  override ValidateBeforeSave(formData: SupplierOrderMaster): boolean {
    this.validation = []; // Clear previous validations
    if(this.formData.Date == null) {
      this.validation.push('Order Date is required.');
    }
    if(this.formData.SupplierID == null) {
      this.validation.push('Supplier is required.');
    }
    if(this.formData.Supplier_Order_Detail.length == 0) {
      this.validation.push('Order Details are required.');
    }

    return this.validation.length > 0;
  }

  onItemSelect(element: Supplier_Order_Detail) {
    if (element.SupplierItemID) {
      const supplierItems = this.supplierItems.filter(a => a.ID === element.SupplierItemID);
      if (supplierItems.length > 0) {
        element.Price = supplierItems[0]?.Price;
        this.getTAmt(element);
      }
      this.setProductItems();
    }
  }

  openLedger() {
    if (this.formData.SupplierID) {
      const supplier = this.suppliers.filter(a => a.ID === this.formData.SupplierID);
      if (supplier.length > 0) {

        this.modalSer
          .openModal({
            component: SupplierOrderLedgerComponent,
            title: componentRegister.supplierLedger.Title,
            ID: 0,
            Data: {
              SupplierName: supplier[0]?.Description,
              SupplierOrderMasterID: this.primaryKey,
              OrderDate: this.formData.Date
            }
          })
      }
    }

  }

  getTAmt(element: Supplier_Order_Detail) {
    element.TotalPrice = (element.Qty ?? 0) * (element.Price ?? 0);
    let badleafsAmount = (element.Badleafs ?? 0) * (element.Price ?? 0);
    element.DeductionAmt = badleafsAmount;
    element.NetAmt = (element.TotalPrice ?? 0) - (element.DeductionAmt ?? 0);

  }


  setProductItems() {
    const supplierItemIDs = this.formData.Supplier_Order_Detail.map(a => a.SupplierItemID);
    const filteredSupplierItems = this.supplierItems.filter(item =>
      supplierItemIDs.includes(item.ID)
    );
    this.supplierProductItems = filteredSupplierItems;
  }

  updateQtyCase(product: Supplier_Order_Products) {
    if (product.ProductID && product.Qty) {
      const productFind = this.products.find(a => a.productID == product.ProductID);
      if (productFind['BoxCase'] > 0) {
        product.QtyCase =  Math.floor(product.Qty / productFind['BoxCase']);
      }
      else {
        product.QtyCase = 0;
      }
    }
  }

  public BeforeUpSert(formData: SupplierOrderMaster): void {
    this.formData.Supplier_Order_Products = this.formData.Supplier_Order_Products.filter(item => {
      // Return true only if at least one of these fields has a meaningful value
      return (
        item.ProductID != null ||
        item.SupplierItemID != null ||
        item.Qty != null && item.Qty > 0 ||
        item.LeafUsed != null && item.LeafUsed > 0 ||
        item.QtyCase != null && item.QtyCase > 0
      );
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

  onProductItemSelect(element:Supplier_Order_Products) {
    const product = this.products.find(a => {
      return a.flavours.find(b => b.id === element.FlavorID);
    });
    if (product) {
      element.ProductID = product.productID;
    }
  }
}
