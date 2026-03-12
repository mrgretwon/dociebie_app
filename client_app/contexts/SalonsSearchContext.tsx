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
  date: Date;
  setDate: Dispatch<SetStateAction<Date>>;
  startHour: string;
  setStartHour: Dispatch<SetStateAction<string>>;
  endHour: string;
  setEndHour: Dispatch<SetStateAction<string>>;
  distance: number;
  setDistance: Dispatch<SetStateAction<number>>;
  userLatitude: number | null;
  setUserLatitude: Dispatch<SetStateAction<number | null>>;
  userLongitude: number | null;
  setUserLongitude: Dispatch<SetStateAction<number | null>>;
  categoryId: number | null;
  setCategoryId: Dispatch<SetStateAction<number | null>>;
  subcategoryId: number | null;
  setSubcategoryId: Dispatch<SetStateAction<number | null>>;
};

const SalonsSearchContext = createContext<SalonsSearchContextValue | undefined>(undefined);

export const SalonsSearchProvider = ({ children }: { children: React.ReactNode }) => {
  const [searchText, setSearchText] = useState("");
  const [locationText, setLocationText] = useState("");
  const [date, setDate] = useState(new Date());
  const [startHour, setStartHour] = useState("");
  const [endHour, setEndHour] = useState("");
  const [distance, setDistance] = useState(5);
  const [userLatitude, setUserLatitude] = useState<number | null>(null);
  const [userLongitude, setUserLongitude] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [subcategoryId, setSubcategoryId] = useState<number | null>(null);

  const value = useMemo(
    () => ({
      searchText,
      setSearchText,
      locationText,
      setLocationText,
      date,
      setDate,
      startHour,
      setStartHour,
      endHour,
      setEndHour,
      distance,
      setDistance,
      userLatitude,
      setUserLatitude,
      userLongitude,
      setUserLongitude,
      categoryId,
      setCategoryId,
      subcategoryId,
      setSubcategoryId,
    }),
    [searchText, locationText, date, startHour, endHour, distance, userLatitude, userLongitude, categoryId, subcategoryId]
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
