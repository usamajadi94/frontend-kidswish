import { componentRegister } from "app/modules/shared/services/component-register";
import { Shipment } from "./shipment.model";

export class ShipmentMaster {
    ID: number = 0;
    ShipmentDate: Date = new Date();
    CompanyName: string = null;
    CompanyRnc: string = null;
    CompanyContactPerson: string = null;
    CompanyAddress: string = null;
    CompanyCity: string = null;
    CompanyCountry: string = null;
    CompanyTel: string = null;
    CompanyEmail: string = null;
    ClientName: string = null;
    ClientAddress: string = null;
    ClientCity: string = null;
    ClientState: string = null;
    ClientZipcode: string = null;
    ClientTel: string = null;
    ClientFax: string = null;
    ClientEmail: string = null;
    SCode: string = componentRegister.shipmentView.SCode;
    InvoiceNo: string = null;
    FirstDimension: string = null;
    SecondDimension: string = null;
    Shipment: Shipment[] = [];
}