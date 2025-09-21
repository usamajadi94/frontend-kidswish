import { Component } from '@angular/core';
import { BftInputTextComponent } from 'app/modules/shared/components/fields/bft-input-text/bft-input-text.component';

@Component({
  selector: 'app-example-form',
  standalone: true,
  imports: [BftInputTextComponent],
  templateUrl: './example-form.component.html',
  styleUrl: './example-form.component.scss'
})
export class ExampleFormComponent {

}
