import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        async getAll() {
          const resolvedCookies = await cookieStore;
          return resolvedCookies.getAll();
        },
        async setAll(cookiesToSet: { name: string; value: string; options?: any }[]) {
          try {
            const resolvedCookies = await cookieStore;
            cookiesToSet.forEach(({ name, value, options }) =>
              resolvedCookies.set(name, value, options)
            );
          } catch {
            // Server Component — cookies can't be set here
          }
        },
      },
    }
  );
}
