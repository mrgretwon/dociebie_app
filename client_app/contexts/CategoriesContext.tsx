import { CategoryItem, fetchCategories } from "@/services/api";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type CategoriesContextValue = {
  categories: CategoryItem[];
  isLoading: boolean;
};

const CategoriesContext = createContext<CategoriesContextValue | undefined>(undefined);

export const CategoriesProvider = ({ children }: { children: React.ReactNode }) => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch((err) => console.warn(err))
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo(() => ({ categories, isLoading }), [categories, isLoading]);

  return <CategoriesContext.Provider value={value}>{children}</CategoriesContext.Provider>;
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
};
