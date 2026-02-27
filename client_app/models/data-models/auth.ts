export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  email: string;
  password: string;
  name: string;
  surname: string;
  street: string;
  city: string;
  postalCode: string;
};

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  surname: string;
  street: string;
  city: string;
  postalCode: string;
};

export type AuthResponse = {
  token: string;
  user: UserProfile;
};
