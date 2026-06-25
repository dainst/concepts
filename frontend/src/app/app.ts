import {Component, OnInit, signal} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Msg } from 'concepts-common/src/interfaces/default';
import { HttpClient } from '@angular/common/http';
import {lastValueFrom} from 'rxjs';
import {NgbNav, NgbNavContent, NgbNavItem, NgbNavLinkButton, NgbNavOutlet} from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NgbNavItem, NgbNav, NgbNavContent, NgbNavLinkButton, NgbNavOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  constructor(
    private http: HttpClient
  ) { }

  readonly text = signal<string>('...');
  active = signal(1);

  async ngOnInit() {
    this.text.set((await lastValueFrom(this.http.get<Msg>('http://localhost:3000'))).text);
  }

  get debug() {
    console.log('debug:', this.text);
    return this.text;
  }
}
