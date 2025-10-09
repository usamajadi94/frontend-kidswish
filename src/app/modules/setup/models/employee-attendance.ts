import { componentRegister } from "app/modules/shared/services/component-register";

export class EmployeeAttendanceMaster {
    ID: number = 0;
    Date: Date = new Date();
    SCode:string = componentRegister.employeeAttendance.SCode;
    Emp_Attendance_Detail:EmployeeAttendanceDetail[]=[]
}

export class EmployeeAttendanceDetail {
    ID: number = 0;
    AttendanceMasterID: number = null;
    EmployeeID: number = null;
    IsPresent: boolean = false;
    OnVacation: boolean = false;
    AbsentHours: number = null;
}