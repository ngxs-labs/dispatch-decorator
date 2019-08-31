/**
 * This class is used as a default action when the user
 * doesn't pass any custom action as an argument
 */
export class DispatchAction<T = unknown> {
  public type!: string;
  constructor(public payload?: T) {}
}
