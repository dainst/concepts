import { Component } from '@angular/core';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'system-header',
  imports: [
    RouterLink
  ],
  templateUrl: './system-header.component.html',
  styleUrl: './system-header.component.css',
})
export class SystemHeader {}
