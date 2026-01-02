import { componentRegister } from "app/modules/shared/services/component-register";

export class Employee {
    ID:number = 0;
    JoinDate:Date = new Date();
    EmployeeId: string = "";
    Description: string = "";
    Email: string = "";
    PhoneNo: string = "";
    Salary: number = 0;
    IsActive: boolean = true;
    SalaryTypeID: number = null;
    SCode:string = componentRegister.employee.SCode;
}