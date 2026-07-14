import { Component, inject } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import {FormsModule} from '@angular/forms';
import {NgbDropdown, NgbDropdownMenu, NgbDropdownToggle} from '@ng-bootstrap/ng-bootstrap/dropdown';
import {NgOptimizedImage} from '@angular/common';

@Component({
  selector: 'header',
  imports: [
    RouterLink,
    FormsModule,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgOptimizedImage
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class Header {
  protected queryParams: { q: string} = {q: ''};
  private router = inject(Router);

  search() {
    this.router.navigate(['search'], {
      queryParams: this.queryParams,
      queryParamsHandling: 'merge'
    });
  }
}
