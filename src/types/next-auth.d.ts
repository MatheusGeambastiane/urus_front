import { DefaultSession } from "next-auth";

type AppUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  name?: string | null;
};

declare module "next-auth" {
  interface Session {
    user?: AppUser & DefaultSession["user"];
    accessToken?: string;
    refreshToken?: string;
  }

  interface User extends AppUser {
    accessToken: string;
    refreshToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    user?: AppUser & DefaultSession["user"];
    accessToken?: string;
    refreshToken?: string;
  }
}
