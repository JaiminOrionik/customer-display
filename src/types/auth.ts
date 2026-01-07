// types/auth.ts (create this file)
export interface Store {
  id: string;
  tenantId: string;
  type: string;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string | null;
  businessName: string;
  email: string;
  status: string;
  country: string;
  state: string;
  city: string;
  phoneNumber: string;
  zipcode: string;
  currency: string;
  timezone: string;
  createdAt: string;
  updatedAt: string;
  image: string | null;
  fullUrl: string;
  slug: string;
  enableOnlineBooking: boolean;
  helloPayApiKey: string | null;
  helloPayMerchantKey: string | null;
  noOfOutlets: number;
}

export interface UserResult {
  id: string;
  entityId: string;
  email: string;
  resetToken: string | null;
  resetTokenExpiry: string | null;
  emailVerified: boolean;
  emailOtp: string | null;
  emailOtpExpiry: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  type: string;
  target: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    store: Store;
    result: UserResult;
    roles: Role[];
  };
  errors?: Record<string, string[]>;
}