export class Shipment {
    ID: number = 0;
    ProductID: number = null;
    FlavourID: number = null;
    Qty: number = null;
    Date: Date = new Date();
    Price: number = null;
    TotalPrice: number = null;
    Case: number = null;
    ItemID: string = null;
    NetWeight: number = null;
    GrossWeight: number = null;
    Description: string = null;
    ShipmentMasterID: number = null;
}