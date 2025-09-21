import { Component, Input } from '@angular/core';
import { NzSkeletonInputSize, NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NzSpaceModule } from 'ng-zorro-antd/space';

@Component({
  selector: 'bft-skeleton',
  standalone: true,
  imports: [
    NzSkeletonModule,
    NzSpaceModule
  ],
  templateUrl: './bft-skeleton.component.html',
  styleUrl: './bft-skeleton.component.scss'
})
export class BftSkeletonComponent {
  @Input() size:NzSkeletonInputSize  = 'default';
  @Input() type:'button' | 'input' | 'avatar' | 'image' = 'input';
}
