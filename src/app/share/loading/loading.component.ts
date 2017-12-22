import { Component } from '@angular/core';
import { LoadingService } from './loading.service';

@Component({
  selector: 'app-loading',
  template: `<h1 *ngIf="isVisible()">Loading</h1>`
})
export class LoadingComponent {
  constructor(private loadingService: LoadingService) {

  }

  public isVisible(): boolean {
    return this.loadingService.isVisible();
  }
}
