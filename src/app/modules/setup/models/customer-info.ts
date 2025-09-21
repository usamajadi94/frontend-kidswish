import { componentRegister } from "app/modules/shared/services/component-register";

export class CustomerInformation{
    ID: number = 0;
    Description: string = '';
    Code: string = '';
    BusinessName: string = '';
    Address: string = '';
    Email: string = '';
    PhoneNo: string = '';
    PhoneNo2: string = '';
    OpeningBalance: number = 0;
    TotalPurchase: number = 0;
    Payment: number = 0;
    ClosingBalance: number = 0;
    Limit: number = 0;
    MemberTypeID: number|null = null;
    AreaID: number | null = null;
    CityID: number | null = null;
    RouteID: number | null = null;
    IsActive: boolean = true;
    SCode:string = componentRegister.customer.SCode;
}