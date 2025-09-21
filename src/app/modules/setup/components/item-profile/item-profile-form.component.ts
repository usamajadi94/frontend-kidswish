import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from 'app/core/Base/base/base.component';
import { GenericService } from 'app/core/Base/services/generic.service';
import { ToastService } from 'app/core/toaster/toast.service';
import { BftCheckboxComponent } from 'app/modules/shared/components/fields/bft-checkbox/bft-checkbox.component';
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
import { ItemProfile } from '../../models/item-profile';
import {
    ItemProfileCategoriesPrice,
    VW_ItemProfileCategoriesPrice,
} from '../../models/item-profile-categories-price';
import { SetComponentRegisterService } from '../../services/set-component-register.service';

@Component({
    selector: 'app-item-profile',
    standalone: true,
    imports: [
        BftSelectComponent,
        FormsModule,
        BftInputTextComponent,
        BftInputNumberComponent,
        MatTabsModule,
        BftCheckboxComponent,
        BftInputCurrencyComponent,
    ],
    templateUrl: './item-profile-form.component.html',
    styleUrl: './item-profile-form.component.scss',
})
export class ItemProfileComponent extends BaseComponent<
    ItemProfile,
    ItemProfileComponent
> {
    private _DrpService = inject(DrpService);
    private _SetComponentRegisterService = inject(SetComponentRegisterService);

    suppliers: any[] = [];
    categories: any[] = [];
    companies: any[] = [];
    itemCategories: any[] = [];
    formItemCategories: VW_ItemProfileCategoriesPrice[] = [];
    componentRegister = componentRegister;
    override ngOnInit(): void {
        super.ngOnInit();
    }

    constructor(
        private genSer: GenericService,
        private msgSer: MessageModalService,
        private modalSer: ModalService,
        private toasterSer: ToastService,
        public activatedRoute: ActivatedRoute
    ) {
        super(genSer, msgSer, modalSer, toasterSer, activatedRoute);
        this.setControllerName(apiUrls.itemProfileController);
        this.setFormTitle(componentRegister.itemProfile.Title);
    }

    public override async BeforeInit(): Promise<void> {
        await this.getSuppliers();
        await this.getCategories();
        await this.getCompanies();
        await this.getItemCategories();
    }

    public override async AfterDisplay(): Promise<void> {
        this.itemCategories.forEach((category) => {
            var categoryPrice = new VW_ItemProfileCategoriesPrice();
            categoryPrice.ItemCategoryID = category.ID;
            categoryPrice.CategoryDescription = category.Description;
            this.formItemCategories.push(categoryPrice);
        });
    }

    public AfterGetData(): void {
        this.itemCategories.forEach((category) => {
            var filteredItem =
                this.formData.Item_Profile_Categories_Price.filter(
                    (item) => item.ItemCategoryID === category.ID
                );
            var categoryPrice = new VW_ItemProfileCategoriesPrice();
            categoryPrice.CategoryDescription = category.Description;
            if (filteredItem.length > 0) {
                categoryPrice.ID = filteredItem[0].ID;
                categoryPrice.ItemID = filteredItem[0].ItemID;
                categoryPrice.ItemCategoryID = filteredItem[0].ItemCategoryID;
                categoryPrice.SalePcs = filteredItem[0].SalePcs;
                categoryPrice.SalePack = filteredItem[0].SalePack;
                categoryPrice.SaleCtn = filteredItem[0].SaleCtn;
                if (
                    filteredItem[0].SalePcs > 0 ||
                    filteredItem[0].SalePack > 0 ||
                    filteredItem[0].SaleCtn > 0
                ) {
                    categoryPrice.IsSaleAmount = true;
                }
            } else {
                categoryPrice.ID = 0;
                categoryPrice.ItemID = this.formData.ID;
                categoryPrice.ItemCategoryID = category.ID;
            }
            this.formItemCategories.push(categoryPrice);
        });
    }

    public override InitializeObject(): void {
        this.formData = new ItemProfile();
    }

    async getSuppliers() {
        this.suppliers = await lastValueFrom(
            this._DrpService.getSuppliersDrp()
        );
    }

    async getCategories() {
        this.categories = await lastValueFrom(
            this._DrpService.getCategoriesDrp()
        );
    }

    async getCompanies() {
        this.companies = await lastValueFrom(
            this._DrpService.getCompaniesDrp()
        );
    }

    public async getItemCategories(): Promise<void> {
        this.itemCategories = await lastValueFrom(
            this._DrpService.getItemCategories()
        );
    }

    override ValidateBeforeSave(formData: ItemProfile): boolean {
        this.validation = [];

        if (!formData.Description || formData.Description.trim() === '') {
            this.validation.push('Name is required.');
        }
        return this.validation.length > 0;
    }

    public BeforeUpSert(formData: ItemProfile): void {
        this.formData.Item_Profile_Categories_Price = [];
        this.formItemCategories.forEach(
            (element: VW_ItemProfileCategoriesPrice) => {
                let itemCategoryPrice = new ItemProfileCategoriesPrice();
                itemCategoryPrice.ID = element.ID;
                itemCategoryPrice.ItemID = formData.ID;
                itemCategoryPrice.ItemCategoryID = element.ItemCategoryID;
                itemCategoryPrice.SalePcs = element.SalePcs;
                itemCategoryPrice.SalePack = element.SalePack;
                itemCategoryPrice.SaleCtn = element.SaleCtn;

                this.formData.Item_Profile_Categories_Price.push(
                    itemCategoryPrice
                );
            }
        );
    }

    calculateValues(): void {
        this.formData.PackPcsCost =
            this.formData.PackPcs * this.formData.CostPr;
        this.formData.CtnCost = this.formData.Ctn * this.formData.PackPcsCost;
    }

    calculateSalePrices(element: VW_ItemProfileCategoriesPrice): void {
        element.SalePcs = element.SalePcs || 0;
        element.SalePack = this.formData.PackPcs * element.SalePcs;
        element.SaleCtn = this.formData.Ctn * element.SalePack;
    }
    addCategory() {
        this._SetComponentRegisterService
            .addItemType()
            .subscribe((res) => {
                if (res.success) {
                    this.categories.unshift(res.data);
                    this.formData.CategoryID = res.data.ID;
                }
            });
    }

    addCompanyInformation() {
        this._SetComponentRegisterService
            .addCompanyInformation()
            .subscribe((res) => {
                if (res.success) {
                    this.companies.unshift(res.data);
                    this.formData.CompanyID = res.data.ID;
                }
            });
    }

    addSupplierInformation() {
        this._SetComponentRegisterService
            .addSupplierInformation()
            .subscribe((res) => {
                if (res.success) {
                    this.suppliers.unshift(res.data);
                    this.formData.SupplierID = res.data.ID;
                }
            });
    }
}
