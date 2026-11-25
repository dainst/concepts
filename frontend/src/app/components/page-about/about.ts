import {Component} from '@angular/core';
import {Statistics} from '../statistics/statistics';

@Component({
  selector: 'app-about',
  imports: [
    Statistics
  ],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About {

}
