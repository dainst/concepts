import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'system-header',
  imports: [
    RouterLink,
    FormsModule
  ],
  templateUrl: './system-header.component.html',
  styleUrl: './system-header.component.css',
})
export class SystemHeader {
  protected queryParams: { q: string} = {q: ''};
  private router = inject(Router);

  search() {
    this.router.navigate(['search'], {
      queryParams: this.queryParams,
      queryParamsHandling: 'merge'
    });
  }
}
