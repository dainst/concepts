import {Service, signal} from '@angular/core';
import {AppError} from '../interfaces/error';

@Service()
export class ErrorService {
  readonly errors = signal<AppError[]>([]);

  add(error: AppError) {
    const errors = [...this.errors()];
    errors.push(error);
    queueMicrotask(() => { // important for error from rxResource (and others?)
      this.errors.set([...errors]);
    });
  }

  remove(i: number) {
    const errors = this.errors();
    errors.splice(i, 1);
    this.errors.set([...errors]);
  }
}
