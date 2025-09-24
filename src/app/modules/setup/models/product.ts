export class Product {
    ID: number = 0;
    ProductName: string | null = null;
    CategoryID: number | null = null;
    IsActive: boolean = true;
    Flavor_Information: Flavour[] = [];
    BoxCase: number | null = 24;
    PouchCase: number | null = null;
    StickerCase: number | null = null;
    BoxPcs: number | null = 1;
    PouchPcs: number | null = null;
    StickerPcs: number | null = null;
}

export class Flavour {
    ID: number = 0;
    FlavorName: string | null = null;
    ProductID: number | null = null;
    Box: number | null = null;
    Pouch: number | null = null;
    Sticker: number | null = null;
}
