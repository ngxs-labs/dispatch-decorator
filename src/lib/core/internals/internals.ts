import { Observable } from 'rxjs';

export type Action<T = unknown> = new (payload?: T) => any;

export type DispatchFactory = (actionOrActions: ActionOrActions) => void;

export type ActionOrActions = Action | Action[];

/**
 * This can be a plain action/actions or Promisified/streamifed action/actions
 * ```typescript
 * @Dispatch() increment = () => new Increment();
 * // OR
 * @Dispatch() increment = () => Promise.resolve(new Increment());
 * ```
 */
export type Wrapped = ActionOrActions | Observable<ActionOrActions> | Promise<ActionOrActions>;

export interface DispatchOptions {
  cancelUncompleted?: boolean;
}
