import React, {
  SetStateAction,
  useContext,
  useState,
  createContext,
  Dispatch,
} from "react";

type useLoaderHookType = {
  loading: boolean;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

const LoaderContext = createContext<useLoaderHookType | null>(null);

export function useLoader(): useLoaderHookType {
  const ctx = useContext(LoaderContext);
  if (!ctx)
    throw new Error("Please wrap your layout with LoaderContextProvider!");
  return ctx;
}

export function LoaderContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <LoaderContext.Provider value={{ loading, setLoading }}>
      {children}
    </LoaderContext.Provider>
  );
}
