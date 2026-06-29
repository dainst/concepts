import {Component} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {SystemHeader} from '../system-header/system-header.component';
import {HomeHeader} from '../home-header/home-header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SystemHeader, HomeHeader],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

}
