import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { env } from "@/lib/env";

type ApiUser = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  profile_pic?: string | null;
};

type LoginResponse = {
  access: string;
  refresh: string;
  user: ApiUser;
};

type BackendJwt = {
  accessToken?: string;
  refreshToken?: string;
  error?: "RefreshAccessTokenError";
};

type SessionUpdate = {
  forceRefresh?: boolean;
};

async function refreshBackendToken(token: BackendJwt): Promise<BackendJwt> {
  if (!token.refreshToken) return { ...token, error: "RefreshAccessTokenError" };
  try {
    const response = await fetch(`${env.apiBaseUrl}/dashboard/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: token.refreshToken }),
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Refresh recusado pelo backend");
    const payload = (await response.json()) as { access?: string; refresh?: string };
    if (!payload.access) throw new Error("Resposta de refresh inválida");
    return {
      ...token,
      accessToken: payload.access,
      refreshToken: payload.refresh ?? token.refreshToken,
      error: undefined,
    };
  } catch {
    return { ...token, accessToken: undefined, error: "RefreshAccessTokenError" };
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/dashboard/login",
  },
  providers: [
    GoogleProvider({
      clientId: env.googleClientId,
      clientSecret: env.googleClientSecret,
      authorization: {
        params: {
          scope: "openid email profile",
        },
      },
    }),
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
          profile_pic: payload.user.profile_pic ?? null,
          accessToken: payload.access,
          refreshToken: payload.refresh,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }
      if (!account.id_token) {
        return "/dashboard/login?error=GoogleSignin";
      }

      try {
        const response = await fetch(
          `${env.apiBaseUrl}/dashboard/auth/google/`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_token: account.id_token }),
            cache: "no-store",
          }
        );

        if (!response.ok) {
          const errorData = (await response.json().catch(() => null)) as {
            detail?: string;
          } | null;
          console.error(
            "[dashboard-google-auth] Backend recusou o login:",
            response.status,
            errorData?.detail ?? "Resposta sem detalhes"
          );
          return "/dashboard/login?error=AccessDenied";
        }

        const payload = (await response.json()) as LoginResponse;
        Object.assign(user, {
          id: String(payload.user.id),
          email: payload.user.email,
          name: `${payload.user.first_name} ${payload.user.last_name}`.trim(),
          firstName: payload.user.first_name,
          lastName: payload.user.last_name,
          role: payload.user.role,
          profile_pic: payload.user.profile_pic ?? user.image ?? null,
          accessToken: payload.access,
          refreshToken: payload.refresh,
        });
        return true;
      } catch (error) {
        console.error(
          "[dashboard-google-auth] Falha ao chamar o backend:",
          error
        );
        return "/dashboard/login?error=GoogleSignin";
      }
    },
    async jwt({ token, user, trigger, session }) {
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
          profile_pic: user.profile_pic ?? null,
        };

        return token;
      }
      const forceRefresh =
        trigger === "update" &&
        (session as SessionUpdate | undefined)?.forceRefresh === true;
      if (!forceRefresh) {
        // Server Components call getServerSession with a read-only cookie store.
        // Rotating here would blacklist the browser's refresh token without
        // persisting its replacement. Refresh only through the session route.
        return token;
      }
      return refreshBackendToken(token as BackendJwt);
    },
    async session({ session, token }) {
      if (token?.user) {
        session.user = token.user;
      }
      session.accessToken = token.accessToken as string | undefined;
      session.error = token.error as "RefreshAccessTokenError" | undefined;
      return session;
    },
  },
};
