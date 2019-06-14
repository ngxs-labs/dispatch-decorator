/**
 * This class is used as a default action when the user
 * doesn't pass any custom action as an argument
 */
export class DispatchAction<T = unknown> {
  public static type: string | null = null;
  constructor(public payload?: T) {}
}
