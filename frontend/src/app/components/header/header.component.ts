import {Component, inject} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle} from '@ng-bootstrap/ng-bootstrap/dropdown';
import {AsyncPipe, NgOptimizedImage} from '@angular/common';
import {UserService} from '../../services/user.service';
import {NgbTooltip} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'header',
  imports: [
    RouterLink,
    FormsModule,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownMenu,
    NgOptimizedImage,
    AsyncPipe,
    NgbDropdownItem,
    NgbTooltip
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class Header {
  protected queryParams: { q: string} = {q: ''};
  private router = inject(Router);
  us = inject(UserService);

  async search(): Promise<void> {
    await this.router.navigate(['search'], {
      queryParams: this.queryParams,
      queryParamsHandling: 'merge'
    });
  }
}
