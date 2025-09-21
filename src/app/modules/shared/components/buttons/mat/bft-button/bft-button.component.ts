import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'bft-button',
  standalone: true,
  imports: [MatButtonModule,MatIconModule],
  templateUrl: './bft-button.component.html',
  styleUrl: './bft-button.component.scss'
})
export class BftButtonComponent {
  @Input({required:true}) name:string = '';
  @Input() size : 'large' | 'default' = 'default';
  @Input() type : 'stroked' | 'default' | 'flat' = 'flat';
  @Input() beforeIcon : string = '';
  @Input() afterIcon : string = '';
  @Input() disabled :boolean = false;
  @Output() onClick:EventEmitter<any> = new EventEmitter();

  btnClick(){
    this.onClick.emit();
  }
}
