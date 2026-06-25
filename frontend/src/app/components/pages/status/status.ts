import {Component, OnInit, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {lastValueFrom} from 'rxjs';
import {Msg} from 'concepts-common/src/interfaces/default';

@Component({
  selector: 'app-status',
  imports: [],
  templateUrl: './status.html',
  styleUrl: './status.css',
})
export class Status implements OnInit {
  constructor(
    private http: HttpClient
  ) { }

  readonly text = signal<string>('...');
  active = signal(1);

  async ngOnInit() {
    this.text.set((await lastValueFrom(this.http.get<Msg>('http://localhost:3000'))).text);
  }
}
