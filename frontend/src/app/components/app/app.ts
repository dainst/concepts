import {Component, inject} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {Header} from '../header/header.component';
import {MessageComponent} from '../message/message.component';
import {MessageService} from '../../services/message.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, MessageComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  private readonly es = inject(MessageService);
}
