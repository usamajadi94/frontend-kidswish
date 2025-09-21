export class FlavorOrderMaster {
    ID: number = 0;
    OrderDate: Date = new Date();
    SupplierID: number | null = null;
    StatusID: number | null = null;
    Description: string = null;
    Flavor_Order_Detail: FlavorOrderDetail[] = [];
}

export class FlavorOrderDetail {
    ID: number = 0;
    ProductID: number | null = null;
    FlavorID: number | null = null;
    OrderMasterID: number | null = null;
    Box: number = 0;
    Pouch: number = 0;
    Sticker: number = 0;
    
}