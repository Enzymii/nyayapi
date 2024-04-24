import { Dispatch, createContext, useContext, useReducer } from 'react';

type BindQQState = { bind: boolean; qq?: string };
type BindQQAction = { type: 'bind' | 'unbind'; qq?: string };

const bindQQReducer = (state: BindQQState, action: BindQQAction) => {
  switch (action.type) {
    case 'bind':
      return { bind: true, qq: action.qq ?? state.qq };
    case 'unbind':
      return { bind: false, qq: state.qq };
  }
};

const initialState: BindQQState = { bind: false };

export const BindQQContext = createContext<BindQQState>({
  bind: false,
  qq: undefined,
});
export const BindQQDispatchContext =
  createContext<Dispatch<BindQQAction>>(null);

export function BindQQContextProvider({ children }) {
  const [tasks, dispatch] = useReducer<
    React.Reducer<BindQQState, BindQQAction>
  >(bindQQReducer, initialState);

  return (
    <BindQQContext.Provider value={tasks}>
      <BindQQDispatchContext.Provider value={dispatch}>
        {children}
      </BindQQDispatchContext.Provider>
    </BindQQContext.Provider>
  );
}

export const useBindQQContext = () => {
  const ctx = useContext(BindQQContext);
  const dispatch = useContext(BindQQDispatchContext);

  return [ctx, dispatch] as const;
};
