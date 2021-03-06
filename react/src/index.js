/* @flow */

import type { ComponentType, Context, Node } from "react";
import type {
  Message,
  Model,
  Storage,
  State,
  TypeofModelData,
  TypeofModelInit,
} from "crustate";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type DataProviderProps<T> = T & { name?: string, children?: ?Node };

type AnyModel = Model<any, any, any>;

// FIXME: Redefine this so it throws when undefined
export type DataFunction<T> = (data: T | void) => ?Node;

/**
 * DataProvider is a component which will load or instantiate a state-instance
 * with the given props as its initial data, and supply the state-data to its
 * children.
 */
export type DataProvider<I> = ComponentType<DataProviderProps<I>>;

/**
 * DataConsumer is a component which takes a function as children and will call
 * this function with the state data.
 */
export type DataConsumer<T> = ComponentType<{ children: DataFunction<T> }>;

/**
 * TestProvider is a component which exposes a property for setting the
 * state-data value used in children, useful for testing components by
 * supplying the state-data without having to create a state.
 */
export type TestProvider<T> = ComponentType<{ value: T, children?: ?Node }>;

/**
 * React-wrapper for a crustate-state.
 */
export type StateData<M: AnyModel> = {
  /**
   * Internal: Reference to the data-context.
   */
  +_dataContext: Context<TypeofModelData<M> | void>,
  /**
   * The model, exposed to be loaded for hydration and for testing.
   */
  +model: M,
  /**
   * A context provider allowing the state-data to be set to a constant value,
   * useful for testing.
   */
  +TestProvider: TestProvider<TypeofModelData<M>>,
  +Provider: DataProvider<TypeofModelInit<M>>,
  +Consumer: DataConsumer<TypeofModelData<M>>,
};

export type SendMessageFn = (msg: Message, srcName?: string) => Promise<void>;

type StorageProviderProps = { storage: Storage, children?: ?Node };

/**
 * The basic state context where we will carry either a Storage, or a state
 * for the current nesting.
 */
export const StateContext: Context<?State<any> | Storage> = createContext(null);

const InstanceProvider = StateContext.Provider;

/**
 * Provider for the Storage-instance to be used in all child-components.
 */
export const StorageProvider = ({ storage, children }: StorageProviderProps): Node =>
  createElement(InstanceProvider, { value: storage }, children);

/**
 * Returns a function for passing messages into the state-tree at the current
 * nesting.
 */
export function useSendMessage(): SendMessageFn {
  const supervisor = useContext(StateContext);

  if (!supervisor) {
    throw new Error("useSendMessage() must be used inside a <State.Provider />.");
  }

  return useCallback((message: Message, sourceName?: string): Promise<void> =>
    supervisor.sendMessage(message, sourceName), [supervisor]);
}

/**
 * Exclude children and name properties when using createState, children
 * are always new objects and are most likely not of interest to the state, and
 * name is an external parameter.
 */
function excludeChildren<T: { children?: ?Node, name?: string }>(
  props: T
): $Rest<T, {| children: ?Node, name: ?string |}> {
  // Manually implemented object-rest-spread to avoid Babel's larger
  // implementation
  // Object.assign causes Babel to to add an unnecessary polyfill so use spread
  const rest = { ...props };

  delete rest.children;
  delete rest.name;

  return rest;
}

export function createStateData<+M: AnyModel>(model: M): StateData<M> {
  const Ctx = (createContext(undefined): Context<TypeofModelData<M> | void>);
  const { Provider } = Ctx;

  const DataProvider = (props: DataProviderProps<TypeofModelInit<M>>): Node => {
    const context = useContext(StateContext);

    if (!context) {
      throw new Error(`<${model.id}.Provider /> must be used inside a <StorageProvider />`);
    }

    const { name } = props;
    const instance = context.getState(model, name) ||
      context.createState(model, excludeChildren(props), name);
    const [data, setData] = useState(instance.getData());

    useEffect((): (() => void) => {
      instance.addListener("stateNewData", setData);

      // Data can be new since we are runnning componentDidMount()
      // after render()
      const newData = instance.getData();

      if (data !== newData) {
        // Force re-render immediately
        setData(newData);
      }

      return (): void => {
        instance.removeListener("stateNewData", setData);

        // Drop the state if we were the last listener
        if (instance.listeners("stateNewData").length === 0) {
          context.removeState(model, name);
        }
      };
    // We need to skip the dep on data since otherwise we are going to
    // re-register the state every time
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
    }, [context, instance]);

    return createElement(InstanceProvider, { value: instance },
      createElement(Provider, { value: data },
        props.children));
  };

  return {
    _dataContext: Ctx,
    model,
    // We have to cheat here since the value must be possible to use as
    // undefined internally, but when testing it should not be possible to use
    // without a fully defined `T`:
    TestProvider: (Provider: ComponentType<{ children: ?Node, value: any }>),
    Provider: DataProvider,
    Consumer: Ctx.Consumer,
  };
}

/**
 * Returns the data in the topmost state associated with the supplied
 * StateData. Will throw if a StateData.Provider is not a parent node.
 */
export function useData<M: AnyModel>(context: StateData<M>): TypeofModelData<M> {
  const { _dataContext, model } = context;
  const data = useContext(_dataContext);

  if (data === undefined) {
    throw new Error(`useData(${model.id}) must be used inside a <${model.id}.Provider />`);
  }

  return data;
}
