"use client";

import { useCallback } from "react";
import { decodeJWT } from "@/utils/jwtUtils";

export const useAuth = () => {
  const getAuthData = useCallback(() => {
    if (typeof window === 'undefined') return { token: null, tenantId: null, outletId: null };
    
    const token = localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token");
    
    let tenantId = null;
    let outletId = null;
    
    if (token) {
      try {
        const decodedToken = decodeJWT(token);
        if (decodedToken) {
          tenantId = decodedToken.tenantId;
          outletId = decodedToken.outletId;
        }
      } catch (e) {
        console.error("Error extracting data from token:", e);
      }
    }
    
    return { token, tenantId, outletId };
  }, []);

  return getAuthData();
};