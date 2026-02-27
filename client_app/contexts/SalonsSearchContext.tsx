import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

type SalonsSearchContextValue = {
  searchText: string;
  setSearchText: Dispatch<SetStateAction<string>>;
  locationText: string;
  setLocationText: Dispatch<SetStateAction<string>>;
  startDate: Date;
  setStartDate: Dispatch<SetStateAction<Date>>;
  endDate: Date;
  setEndDate: Dispatch<SetStateAction<Date>>;
  distance: number;
  setDistance: Dispatch<SetStateAction<number>>;
};

const SalonsSearchContext = createContext<SalonsSearchContextValue | undefined>(undefined);

export const SalonsSearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [searchText, setSearchText] = useState("");
  const [locationText, setLocationText] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date;
  });
  const [distance, setDistance] = useState(5);

  const value = useMemo(
    () => ({
      searchText,
      setSearchText,
      locationText,
      setLocationText,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
      distance,
      setDistance,
    }),
    [searchText, locationText, startDate, endDate, distance]
  );

  return <SalonsSearchContext.Provider value={value}>{children}</SalonsSearchContext.Provider>;
};

export const useSalonsSearch = () => {
  const context = useContext(SalonsSearchContext);

  if (!context) {
    throw new Error("useSalonsSearch must be used within a SalonsSearchProvider");
  }

  return context;
};
