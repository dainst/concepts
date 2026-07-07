import { Component } from '@angular/core';
import {Timeline} from '../../timeline/timeline';

@Component({
  selector: 'app-about',
  imports: [
    Timeline
  ],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {}
