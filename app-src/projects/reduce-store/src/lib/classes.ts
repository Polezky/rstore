import { IClone, IConstructor, IReducer, ICollection, IReducerConstructor } from "./interfaces";

export class Clone<T> implements IClone<T> {
  constructor(init?: Partial<T>) {
    Object.assign(this, init);
  }

  clone(): T {
    return new (<any>this.constructor)(this);
  }
}

export abstract class CollectionState<T extends IClone<T>> extends Clone<ICollection<T>> implements ICollection<T> {
  abstract readonly itemsCtor: IConstructor<T>;

  items: T[];

  constructor(init: Partial<CollectionState<T>>) {
    super(init);
    this.items = init.items.map(x => new this.itemsCtor(x));
  }

  clone(): any {
    const cloneObj = super.clone();
    cloneObj.items = this.items.map(x => x.clone());
    return cloneObj;
  }

}

export class SetStateReducer<T extends IClone<T>> implements IReducer<T> {
  constructor(
    public stateCtor: IConstructor<T>,
    public reduceAsync: (state: T) => Promise<T>,
  ) { }

  static create<U extends IClone<U>>(stateCtor: IConstructor<U>, newState: U): IReducer<U> {
    const reduceAsync = (state: U): Promise<U> => Promise.resolve(newState);
    return new SetStateReducer(stateCtor, reduceAsync);
  }

  static createAsync<U extends IClone<U>>(stateCtor: IConstructor<U>, getter: () => Promise<U>): IReducer<U> {
    const reduceAsync = (state: U): Promise<U> => getter();
    return new SetStateReducer(stateCtor, reduceAsync);
  }
}

export abstract class AsyncReducer<T extends IClone<T>, A1 = null, A2 = null, A3 = null, A4 = null, A5 = null, A6 = null> implements IReducer<T> {
  abstract readonly stateCtor: IConstructor<T>;

  abstract reduce(state: T, a1?: A1, a2?: A2, a3?: A3, a4?: A4, a5?: A5, a6?: A6): T;

  reduceAsync(state: T, a1?: A1, a2?: A2, a3?: A3, a4?: A4, a5?: A5, a6?: A6): Promise<T> {
    return Promise.resolve(this.reduce(state, a1, a2, a3, a4, a5, a6));
  }
}

export class SetCollectionStateReducer<T1 extends ICollection<T2>, T2 extends IClone<T2>> implements IReducer<ICollection<T2>> {
  constructor(
    public stateCtor: IConstructor<ICollection<T2>>,
    public reduceAsync: (state: ICollection<T2>) => Promise<ICollection<T2>>,
  ) { }

  static create<U1 extends ICollection<U2>, U2 extends IClone<U2>>(
    stateCtor: IConstructor<ICollection<U2>>,
    getter: () => Promise<U2[]>,
    itemsCtor: IConstructor<U2>
  )
    : IReducer<ICollection<U2>> {

    const reduce = async (state: ICollection<U2>): Promise<ICollection<U2>> => {
      const items = await getter();
      return new stateCtor({ items, itemsCtor });
    };
    return new SetCollectionStateReducer(stateCtor, reduce);
  }
}

export class ReducerTask<T extends IClone<T>, A1 = null, A2 = null, A3 = null, A4 = null, A5 = null, A6 = null> {
  deferredTask: DeferredTask<void, A1, A2, A3, A4, A5, A6>;

  constructor(
    private reduce: (reducerCtor: IReducerConstructor<T, A1, A2, A3, A4, A5, A6>, a1?: A1, a2?: A2, a3?: A3, a4?: A4, a5?: A5, a6?: A6) => Promise<void>,
    private reducerCtor: IReducerConstructor<T, A1, A2, A3, A4, A5, A6>,
    private delayMilliseconds?: number,
  ) {
    this.deferredTask = this.createDeferredTask();
  }

  execute(a1?: A1, a2?: A2, a3?: A3, a4?: A4, a5?: A5, a6?: A6): Promise<void> {
    return this.deferredTask.execute(a1, a2, a3, a4, a5, a6);
  }

  private createDeferredTask(): DeferredTask<void, A1, A2, A3, A4, A5, A6> {
    return new DeferredTask(
      (a1?: A1, a2?: A2, a3?: A3, a4?: A4, a5?: A5, a6?: A6) => {
        this.reduce(this.reducerCtor, a1, a2, a3, a4, a5, a6);
      },
      null,
      this.delayMilliseconds);
  }
}

export class DeferredTask<TResult, A1 = null, A2 = null, A3 = null, A4 = null, A5 = null, A6 = null> {
  private cancelToken: any;

  constructor(
    private jobToDo: (a1?: A1, a2?: A2, a3?: A3, a4?: A4, a5?: A5, a6?: A6) => TResult,
    private taskThisArg: any = null,
    private delayMilliseconds = 300,
  ) { }

  execute(a1?: A1, a2?: A2, a3?: A3, a4?: A4, a5?: A5, a6?: A6): Promise<TResult> {
    clearTimeout(this.cancelToken);

    return new Promise<TResult>((resolve, reject) => {
      this.cancelToken = setTimeout(
        () => resolve(this.jobToDo.call(this.taskThisArg, a1, a2, a3, a4, a5, a6)),
        this.delayMilliseconds);
    });
  }
}
