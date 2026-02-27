import { Redirect } from "expo-router";
import React from "react";

import { useAuth } from "@/contexts/AuthContext";
import Spinner from "./Spinner";

type AuthBoundaryProps = {
  children: React.ReactNode;
  requireAuth?: boolean;
};

const AuthBoundary = ({ children, requireAuth = true }: AuthBoundaryProps) => {
  const { token, isHydrating } = useAuth();

  if (isHydrating) {
    return <Spinner />;
  }

  if (requireAuth && !token) {
    return <Redirect href="/(login)" />;
  }

  if (!requireAuth && token) {
    return <Redirect href="/(home)" />;
  }

  return <>{children}</>;
};

export default AuthBoundary;
