import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { BftSkeletonComponent } from '../../skeleton/bft-skeleton/bft-skeleton.component';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'bft-button',
  standalone: true,
  imports: [
    CommonModule,
    NzButtonModule,
    MatIconModule,
    BftSkeletonComponent,
    MatProgressSpinnerModule
  ],
  templateUrl: './bft-button.component.html',
  styleUrl: './bft-button.component.scss'
})
export class BftButtonComponent {
  @Input() size:'small' | 'default' | 'large' = 'default';
  @Input() edges:'circle' | 'round' | null = null;
  @Input() shape: 'circle' | 'round' | null = null;
  @Input() type : 'default' |'info' = 'default';
  @Input() type1 : 'primary' | 'default' | 'dashed' | 'link' | 'text' | null = 'default';
  @Input() icon : string = '';
  @Input() svgIcon : string = '';
  @Input() iconSuffix : string = '';
  @Input() svgIconSuffix : string = '';
  @Input() name:string = '';
  @Input() disabled:boolean | null = false;
  @Output() onClick:EventEmitter<any> = new EventEmitter();
  @Input() skeleton:boolean = false;
  @Input() loading:boolean = false;
  @Input() accessKey :string = "";
  constructor(){

  }
  btnClick(){
    this.onClick.emit();
  }
}
