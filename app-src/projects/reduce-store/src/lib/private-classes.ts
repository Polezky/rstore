import { IReducer, IDependecyResolver, IConstructor } from "./interfaces";
import { IResolve, IReject } from "./private-interfaces";
import { Subscriber } from "rxjs";
import * as logging from "./logging";

export class StateSubscriber<T> {
  constructor(
    public readonly subscriber: Subscriber<T>,
    public readonly logger: logging.Logger<T>,
  ) { }
}

export class DeferredReducer<T, A1 = null, A2 = null, A3 = null, A4 = null, A5 = null, A6 = null> {
  constructor(
    public readonly reducer: IReducer<T, A1, A2, A3, A4, A5, A6>,
    public readonly reducerArgs: any[],
    public readonly resolve: IResolve<void>,
    public readonly reject: IReject,
    public readonly logger: logging.ReducerLogger<T>,
  ) {
  }
}

export class DeferredGetter<T>{
  constructor(
    public readonly resolve: (value?: T | PromiseLike<T>) => void,
    public readonly logger: logging.DurationLogger<T>,
  ) {
  }
}

export const SimpleDependecyResolver: IDependecyResolver = {
  get<T>(ctor: IConstructor<T>): T {
    return new ctor();
  }
};
