import { Subject } from 'rxjs';

export class ActionCompleter {
  cancelUncompleted$ = new Subject<void>();

  cancelPreviousAction(): void {
    this.cancelUncompleted$.next();
  }
}

export function createActionCompleter(cancelUncompleted: boolean): ActionCompleter | null {
  return cancelUncompleted ? new ActionCompleter() : null;
}
