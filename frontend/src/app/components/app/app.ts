import {Component} from '@angular/core';
import {RouterOutlet} from '@angular/router';
import {Header} from '../header/header.component';
import {MessageComponent} from '../message/message.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, MessageComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
