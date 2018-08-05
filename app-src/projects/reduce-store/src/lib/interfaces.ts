export interface IClone<T> {
  clone(): T;
}

export interface IConstructor<T> {
  new(...args: any[]): T;
}

export interface IStateGetter<T> {
  (stateCtor: IConstructor<T>): Promise<T>;
}

export interface IReduce {
  (reducer: IReducer<any>, isDeferred?: boolean): Promise<void>;
}

export interface IReducer<T extends IClone<T>> {
  stateCtor: IConstructor<T>;
  reduceAsync: (state: T, stateGetter: IStateGetter<any>, reduce: IReduce) => Promise<T>;
}

export interface ICollection<T extends IClone<T>> extends IClone<ICollection<T>> {
  items: Array<T>;
}
