import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzSkeletonInputSize, NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSpaceModule } from 'ng-zorro-antd/space';

@Component({
  selector: 'bft-skeleton',
  standalone: true,
  imports: [
    CommonModule,
    NzSkeletonModule,
    NzSpaceModule
  ],
  templateUrl: './bft-skeleton.component.html',
  styleUrl: './bft-skeleton.component.scss'
})
export class BftSkeletonComponent {
  @Input() size:NzSkeletonInputSize  = 'default';
  @Input() type:'button' | 'input' | 'avatar' | 'image' | 'table' = 'input';
  @Input() columns: number = 5;
  @Input() rows: number = 5;
}
