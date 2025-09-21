import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-base-routed',
  standalone: true,
  imports: [],
  template: `
    <p>
      base-routed works!
    </p>
  `,
  styles: ``
})
export class BaseRoutedComponent   {
  SCode: any;

  constructor(protected route: ActivatedRoute) {
    this.SCode = this.route.snapshot.data['SCode'];
  }
}
