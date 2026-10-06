import {Component, inject, model, signal} from '@angular/core';
import {FormValueControl} from '@angular/forms/signals';
import {NgbDropdown, NgbDropdownItem, NgbDropdownMenu, NgbDropdownToggle} from '@ng-bootstrap/ng-bootstrap';
import {AsyncPipe, JsonPipe} from '@angular/common';
import {UserService} from '../../services/user.service';
import {DomainService} from '../../services/domain.service';
import {BehaviorSubject, combineLatest, map, Observable} from 'rxjs';
import {Domain} from 'concepts-common/interfaces/domain';
import {TitlePipe} from '../../pipes/title-pipe';
import {toObservable} from '@angular/core/rxjs-interop';
import { isUser } from "concepts-common/functions/user.typeguard";

@Component({
  selector: 'select-domain',
  imports: [
    NgbDropdownMenu,
    NgbDropdown,
    NgbDropdownToggle,
    NgbDropdownItem,
    AsyncPipe,
    TitlePipe,
    JsonPipe
  ],
  templateUrl: './select-domain.html',
  styleUrl: './select-domain.css'
})
export class SelectDomain implements FormValueControl<string> {
  readonly us = inject(UserService);
  readonly ds = inject(DomainService);
  readonly value = model<string>('');
  readonly selected$ = new BehaviorSubject<Domain>({
    id: '',
    root: null
  });

  protected readonly domains$: Observable<Domain[]> = combineLatest(this.us.user$, this.ds.domains$)
    .pipe(
      map(([user, domains]) =>
        (isUser(user) ? user.groups : [])
          .map(dId => domains.find(d => d.id === dId))
          .filter(d => !!d)
      )
    );

  constructor() {
    combineLatest(toObservable(this.value), this.domains$)
      .subscribe(([v, domainList]) => {
        console.log(v, domainList);
        const d = domainList.find(d => d.id === v);
        if (d) this.selected$.next(d);
        // TODO else: invalid
      });
  }

  protected select(domain: Domain): void {
    this.value.set(domain.id);
    // this.selected$.next(domain);
  }
}
