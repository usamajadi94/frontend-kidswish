import { Component } from '@angular/core';
import { BftTableComponent } from "../../../shared/components/tables/bft-table/bft-table.component";

@Component({
  selector: 'app-example-table',
  standalone: true,
  imports: [BftTableComponent],
  templateUrl: './example-table.component.html',
  styleUrl: './example-table.component.scss'
})
export class ExampleTableComponent {
  columns: any[] = [
    {
      header: "First Name",
      name: "FirstName",
      isSort: true,
      isFilterList: true,
      type: 'text'
    },
    {
      header: "Last Name",
      name: "LastName",
      isSort: true,
      isFilterList: true,
      type: 'text'
    },
    {
      header: "Email",
      name: "Email",
      isSort: true,
      isFilterList: true,
      type: 'text'
    },
    {
      header: "IsActive",
      name: "IsActive",
      isSort: true,
      isFilterList: true,
      type: 'text'
    },
  ]
  
  data: Array<any> = [
    { FirstName: "John", LastName: "Doe", Email: "john.doe@example.com", IsActive: "true" },
    { FirstName: "Jane", LastName: "Smith", Email: "jane.smith@example.com", IsActive: "false" },
    { FirstName: "Michael", LastName: "Johnson", Email: "michael.johnson@example.com", IsActive: "true" },
    { FirstName: "Emily", LastName: "Davis", Email: "emily.davis@example.com", IsActive: "false" },
    { FirstName: "Chris", LastName: "Brown", Email: "chris.brown@example.com", IsActive: "true" },
    { FirstName: "Jessica", LastName: "Taylor", Email: "jessica.taylor@example.com", IsActive: "false" },
    { FirstName: "Daniel", LastName: "Anderson", Email: "daniel.anderson@example.com", IsActive: "true" },
    { FirstName: "Sarah", LastName: "Thomas", Email: "sarah.thomas@example.com", IsActive: "false" },
    { FirstName: "David", LastName: "Martinez", Email: "david.martinez@example.com", IsActive: "true" },
    { FirstName: "Laura", LastName: "Hernandez", Email: "laura.hernandez@example.com", IsActive: "false" },
    { FirstName: "James", LastName: "Clark", Email: "james.clark@example.com", IsActive: "true" },
    { FirstName: "Olivia", LastName: "Rodriguez", Email: "olivia.rodriguez@example.com", IsActive: "false" },
    { FirstName: "Robert", LastName: "Lewis", Email: "robert.lewis@example.com", IsActive: "true" },
    { FirstName: "Sophia", LastName: "Lee", Email: "sophia.lee@example.com", IsActive: "false" },
    { FirstName: "William", LastName: "Walker", Email: "william.walker@example.com", IsActive: "true" },
    { FirstName: "Ava", LastName: "Hall", Email: "ava.hall@example.com", IsActive: "false" },
    { FirstName: "Ethan", LastName: "Allen", Email: "ethan.allen@example.com", IsActive: "true" },
    { FirstName: "Isabella", LastName: "Young", Email: "isabella.young@example.com", IsActive: "false" },
    { FirstName: "Alexander", LastName: "King", Email: "alexander.king@example.com", IsActive: "true" },
    { FirstName: "Mia", LastName: "Wright", Email: "mia.wright@example.com", IsActive: "false" },
    { FirstName: "Benjamin", LastName: "Scott", Email: "benjamin.scott@example.com", IsActive: "true" },
    { FirstName: "Charlotte", LastName: "Green", Email: "charlotte.green@example.com", IsActive: "false" },
    { FirstName: "Matthew", LastName: "Adams", Email: "matthew.adams@example.com", IsActive: "true" },
    { FirstName: "Amelia", LastName: "Nelson", Email: "amelia.nelson@example.com", IsActive: "false" },
    { FirstName: "Henry", LastName: "Carter", Email: "henry.carter@example.com", IsActive: "true" }
  ];

  clic(){
    alert("abc test")
  }
}
