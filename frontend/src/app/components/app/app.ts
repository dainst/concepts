import {Component, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Header} from '../header/header.component';
import {ErrorComponent} from '../error/error.component';
import {ErrorService} from '../../services/error.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, ErrorComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly es = inject(ErrorService);
}
