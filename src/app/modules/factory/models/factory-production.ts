export class FactoryProduction {
    ID: number = 0;
    ProductID: number | null = null;
    FlavourID: number | null = null;
    Qty: number | null = null;
    Date: Date = new Date();
    ProductName: string = '';
    FlavorName: string = '';
    ModifiedBy: string = '';
    ModifiedDate: Date = new Date();
    QtyCase: number | null = null;
}
export class FactorProductionForm {
    ID: number = 0;
    ProductID: number | null = null;
    FlavourID: number | null = null;
    Qty: number | null = null;
    Date: Date = new Date();
    QtyCase: number | null = null;
}