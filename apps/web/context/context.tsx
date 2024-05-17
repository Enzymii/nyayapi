import { Dispatch, createContext, useContext, useReducer } from 'react';

type UserContext = {
  nickname: string;
  bindQQ: boolean;
  qq?: string;
  readonly getFromString: (b?: boolean) => string;
};

type UserAction =
  | { type: 'setNickname'; nickname: string }
  | { type: 'setQQ'; qq: string }
  | { type: 'unbindQQ' };

const initialContext: UserContext = {
  nickname: '',
  bindQQ: false,
  getFromString(b: boolean = true) {
    const { bindQQ, qq, nickname } = this;
    const str = bindQQ && qq ? `${qq}@qq` : `${nickname}@webui`;

    return b ? Buffer.from(str).toString('base64') : str;
  },
};

const userReducer = (state: UserContext, action: UserAction): UserContext => {
  switch (action.type) {
    case 'setNickname':
      return { ...state, nickname: action.nickname };
    case 'setQQ':
      return { ...state, qq: action.qq, bindQQ: true };
    case 'unbindQQ':
      return { ...state, bindQQ: false };
  }
};

export const UserContext = createContext<UserContext>(initialContext);
export const UserDispatchContext = createContext<Dispatch<UserAction>>(null);
export const UserContextProvider = ({ children }) => {
  const [user, dispatch] = useReducer(userReducer, initialContext);

  return (
    <UserContext.Provider value={user}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const ctx = useContext(UserContext);
  const dispatch = useContext(UserDispatchContext);

  return [ctx, dispatch] as const;
};
