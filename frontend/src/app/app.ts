import {Component, OnInit, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Msg } from 'concepts-common/src/interfaces/default';
import { HttpClient } from '@angular/common/http';
import {lastValueFrom} from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  constructor(
    private http: HttpClient
  ) { }

  text = signal<string>('...');

  async ngOnInit() {
    this.text.set((await lastValueFrom(this.http.get<Msg>('http://localhost:3000'))).text);
  }

  get debug() {
    console.log('debug:', this.text);
    return this.text;
  }
}
