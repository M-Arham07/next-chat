import React, {
  SetStateAction,
  useContext,
  useState,
  createContext,
  Dispatch,
} from 'react';

type useLoaderHookType = {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

const LoaderContext = createContext<useLoaderHookType | null>(null);

export function useLoader(): useLoaderHookType {
  const ctx = useContext(LoaderContext);

  if (!ctx) {
    throw new Error(
      'Please wrap your app layout with LoaderContextProvider!'
    );
  }

  return ctx;
}

export function LoaderContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const value = useLoaderHook();
  return (
    <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>
  );
}

function useLoaderHook(): useLoaderHookType {
  const [loading, setLoading] = useState<boolean>(false);

  return { loading, setLoading };
}
