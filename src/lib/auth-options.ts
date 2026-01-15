import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "@/lib/env";

type ApiUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
};

type LoginResponse = {
  access: string;
  refresh: string;
  user: ApiUser;
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/dashboard/login",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Informe e-mail e senha.");
        }

        const response = await fetch(
          `${env.apiBaseUrl}/dashboard/auth/login/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
            cache: "no-store",
          }
        );

        if (!response.ok) {
          throw new Error("E-mail ou senha inválidos.");
        }

        const payload = (await response.json()) as LoginResponse;

        return {
          id: String(payload.user.id),
          email: payload.user.email,
          name: `${payload.user.first_name} ${payload.user.last_name}`,
          firstName: payload.user.first_name,
          lastName: payload.user.last_name,
          role: payload.user.role,
          accessToken: payload.access,
          refreshToken: payload.refresh,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.user = {
          id: user.id,
          email: user.email ?? "",
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          name: user.name,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.user) {
        session.user = token.user;
      }
      session.accessToken = token.accessToken as string | undefined;
      session.refreshToken = token.refreshToken as string | undefined;
      return session;
    },
  },
};
