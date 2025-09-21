import { componentRegister } from "app/modules/shared/services/component-register";
import { ItemProfileCategoriesPrice } from "./item-profile-categories-price";

export class ItemProfile {
    ID: number = 0;
    Description: string = '';
    Code: string = '';
    SupplierID: number | null = null;
    StockInHand: number | null = null;
    Location: string;
    Gst: number | null = null;
    CategoryID: number | null = null;
    CompanyID: number | null = null;
    IsActive:boolean = true;


    CostPr: number | null = 0;
    SalePr: number | null = 0;
    SizeUnitGm: string = '';

    SizeUnit: number | null = 1;

    PackPcs: number | null = 0;
    PackPcsCost: number | null = 0;
    PackPcsSale: number | null = 0;

    Ctn: number | null = 0;
    CtnCost: number | null = 0;
    CtnSale: number | null = 0;
    SCode:string = componentRegister.itemProfile.SCode;

    Item_Profile_Categories_Price: ItemProfileCategoriesPrice[] = [];
}
