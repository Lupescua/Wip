import { Observable, SchedulerLike, Subject, UnaryFunction } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { ActionExecution, IActionExecutionOptions } from './ActionExecution';
import { takeAll } from './operators';

/**
 * @public
 */
export type ExecutionOperatorFunction<T> = UnaryFunction<
  Observable<ActionExecution<T>>,
  Observable<T>
>;

/**
 * @public
 */
export interface IExecutionOperator<T> {
  (): ExecutionOperatorFunction<T>;
}

/**
 * @internal
 */
export interface IActionHandlerOptions<T> {
  operator?: IExecutionOperator<T>;
}

/**
 * @internal
 */
export class ActionHandler<T> {
  private _subject: Subject<ActionExecution<T>>;
  public readonly execution: Observable<T>;

  public constructor(options?: IActionHandlerOptions<T>) {
    this._subject = new Subject();

    const operator = options?.operator ?? takeAll;

    this.execution = this._subject.asObservable().pipe(operator(), shareReplay());
    this.execution.subscribe();
  }

  /**
   * dispatch
   */
  public dispatch(
    source: Observable<T>,
    options: IActionExecutionOptions,
    scheduler?: SchedulerLike
  ): Observable<T> {
    const execution = new ActionExecution(source, options, scheduler);
    this._subject.next(execution);
    return execution.shared;
  }
}
