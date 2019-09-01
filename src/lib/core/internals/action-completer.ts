import { Subject } from 'rxjs';

export class ActionCompleter {
  cancelUncompleted$ = new Subject<void>();

  static create(cancelUncompleted: boolean): ActionCompleter | null {
    if (cancelUncompleted) {
      // Allocate memory lazily only if `cancelUncompleted` is truthy
      return new ActionCompleter();
    }

    return null;
  }

  cancelPreviousAction(): void {
    this.cancelUncompleted$.next();
  }
}
