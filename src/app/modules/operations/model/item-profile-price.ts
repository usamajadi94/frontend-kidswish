import { componentRegister } from "app/modules/shared/services/component-register";

export class ItemProfilePrice {
    ID: number = 0;
    ItemID: number = null;
    ItemCategoryID: number = null;
    CostPr: number = 0;
    SalePr: number = 0;
    SizeUnitGm: string = '';
    PackPcs: number | null = 0;
    PackPcsCost: number | null = 0;
    PackPcsSale: number | null = 0;
    Ctn: number | null = 0;
    CtnCost: number | null = 0;
    CtnSale: number | null = 0;
    Description: string = '';
    SCode:string = componentRegister.MultipleitemProfile.SCode;
}

export class VW_MultiItemProfilePrice {
    ID: number = 0;
    Description: string = '';
    Data:ItemProfilePrice[]
}
