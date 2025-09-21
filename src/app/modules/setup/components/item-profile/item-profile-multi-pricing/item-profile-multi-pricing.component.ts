import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIcon } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { ItemProfilePriceComponent } from 'app/modules/operations/components/item-profile-price/item-profile-price.component';
import { ItemProfilePrice, VW_MultiItemProfilePrice } from 'app/modules/operations/model/item-profile-price';
import { BftButtonComponent } from 'app/modules/shared/components/buttons/bft-button/bft-button.component';
import { BftInputCurrencyComponent } from 'app/modules/shared/components/fields/bft-input-currency/bft-input-currency.component';
import { BftInputNumberComponent } from 'app/modules/shared/components/fields/bft-input-number/bft-input-number.component';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';
import { BftSelectComponent } from 'app/modules/shared/components/fields/bft-select/bft-select.component';
import { apiUrls } from 'app/modules/shared/services/api-url';
import { componentRegister } from 'app/modules/shared/services/component-register';
import { DrpService } from 'app/modules/shared/services/drp.service';
import { MessageModalService } from 'app/modules/shared/services/message.service';
import { ModalService } from 'app/modules/shared/services/modal.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-item-profile-multi-pricing',
  standalone: true,
  imports: [
    BftButtonComponent,
    BftSelectComponent,
    BftInputCurrencyComponent,
    BftInputTextComponent,
    BftInputNumberComponent,
    FormsModule,
    MatIcon,
    MatTabsModule,
  ],
  templateUrl: './item-profile-multi-pricing.component.html',
  styleUrl: './item-profile-multi-pricing.component.scss'
})
export class ItemProfileMultiPricingComponent extends BaseComponent<
  Array<ItemProfilePrice>,
  ItemProfilePriceComponent
> {
  private _DrpService = inject(DrpService);
  items: Array<any> = [];
  itemPrices: Array<any> = [];
  itemCategories: Array<any> = [];
  tabsData: Array<VW_MultiItemProfilePrice> = [];

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

  override InitializeObject(): void {
    this.formData = new Array<ItemProfilePrice>();
  }
  public async BeforeInit(): Promise<void> {
    await this.getItemCategories();
    await this.getItems();
  }

  public async getItemCategories(): Promise<void> {
    this.itemCategories = await lastValueFrom(this._DrpService.getItemCategories());
    this.itemPrices = await lastValueFrom(this._DrpService.getItemPrices());
    this.tabsData = this.itemCategories.map(category => ({
      ID: category.ID,
      Description: category.Description,
      Data: [
        (() => {
          const price = new ItemProfilePrice();
          price.ItemCategoryID = category.ID;
          price.Description = "MIP";
          return price;
        })()
      ]
    }));

  }

  addRow(element: VW_MultiItemProfilePrice) {
    element.Data.push(Object.assign({}, new ItemProfilePrice()));
  }

  onItemSelect(element: ItemProfilePrice) {
    this.reset(element);
    if (element.ItemID != null) {
      let itemSalePrice = this.itemPrices.filter((a) => a.ItemID == element.ItemID && a.ItemCategoryID == element.ItemCategoryID);
      let item: any = this.items.filter((x) => x.ID == element.ItemID);

      if (item.length > 0) {
        element.CostPr = item[0].CostPr;
        element.CtnCost = item[0].CtnCost;
        element.PackPcsCost = item[0].PackPcsCost;
        element.PackPcs = item[0].PackPcs;
        element.Ctn = item[0].Ctn;
      }

      if(itemSalePrice.length > 0) {
        element.SalePr = itemSalePrice[0].SalePcs;
        element.PackPcsSale = itemSalePrice[0].SalePack;
        element.CtnSale = itemSalePrice[0].SaleCtn;
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

  getItemPrices() {
    this._DrpService.getItemPrices().subscribe({
      next: (res: any) => {
        this.itemPrices = res;
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

  deleteDetailRow(index: number, tab: VW_MultiItemProfilePrice) {
    if (tab.Data.length > 1) {
      tab.Data.splice(index, 1);
    }
  }

  // ValidateBeforeSave(formData: ItemProfilePrice[]): boolean {
  //   this.validation = [];

  //   const selectedItems = formData.map(item => ({ itemID: item.ItemID, itemName: this.items.find(x => x.ID === item.ItemID)?.Description || '' }));
  //   const duplicateItems = selectedItems.filter((item, index) => selectedItems.findIndex(x => x.itemID === item.itemID) !== index);

  //   if (duplicateItems.length > 0) {
  //     duplicateItems.forEach(item => {
  //       this.validation.push(`"${item.itemName}" is already added`);
  //     });
  //   }

  //   return this.validation.length > 0;
  // }

  getTotalItems(tab: VW_MultiItemProfilePrice): number {
    return tab.Data.filter(row => row.ItemID).length;
  }

  public BeforeUpSert(formData: ItemProfilePrice[]): void {
    this.formData = [];
    this.tabsData.forEach(tab => {
      tab.Data.forEach(element => {
        if (element.ItemID) {
          element.Description = 'MIP';
          this.formData.push(element);
        }
      });
    });
  }

}
