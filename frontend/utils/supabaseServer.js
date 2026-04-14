import { createServerClient } from '@supabase/ssr';
import { parse, serialize } from 'cookie';

export const createServerSupabase = (req, res) => {
  const cookies = parse(req.headers.cookie || '');
  const appendSetCookie = (cookieStr) => {
    const existing = res.getHeader('Set-Cookie');
    const next = Array.isArray(existing)
      ? [...existing, cookieStr]
      : existing
        ? [existing, cookieStr]
        : [cookieStr];
    res.setHeader('Set-Cookie', next);
  };

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key) => cookies[key],
        set: (key, value, options) => {
          appendSetCookie(
            serialize(key, value, {
              path: options?.path,
              maxAge: options?.maxAge,
              expires: options?.expires,
              httpOnly: options?.httpOnly,
              sameSite: options?.sameSite,
              secure: options?.secure,
            })
          );
        },
        remove: (key, options) => {
          appendSetCookie(
            serialize(key, '', {
              path: options?.path,
              maxAge: 0,
            })
          );
        },
      },
    }
  );
  return supabase;
};