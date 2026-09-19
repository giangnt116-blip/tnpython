import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

function createMockSupabase(): SupabaseClient {
  console.warn(
    '[AI Studio] Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY) are not configured. Running in offline/mock mode.'
  );

  const mockQueryBuilder = (): any => {
    const builder: any = {
      select: () => builder,
      insert: async () => ({ data: null, error: null }),
      update: async () => ({ data: null, error: null }),
      delete: async () => ({ data: null, error: null }),
      upsert: async () => ({ data: null, error: null }),
      eq: () => builder,
      neq: () => builder,
      gt: () => builder,
      gte: () => builder,
      lt: () => builder,
      lte: () => builder,
      order: () => builder,
      limit: () => builder,
      range: () => builder,
      single: async () => ({ data: null, error: null }),
      maybeSingle: async () => ({ data: null, error: null }),
      then: (resolve: any) => Promise.resolve({ data: [], error: null }).then(resolve),
      catch: (reject: any) => Promise.resolve({ data: [], error: null }).catch(reject),
    };
    return builder;
  };

  const mockAuth = {
    getSession: async () => ({ data: { session: null }, error: null }),
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({
      data: { user: null, session: null },
      error: new Error('Cần thiết lập VITE_SUPABASE_URL và VITE_SUPABASE_PUBLISHABLE_KEY để đăng nhập giáo viên.'),
    }),
    signOut: async () => ({ error: null }),
    onAuthStateChange: (_callback: any) => ({
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    }),
  };

  return new Proxy(
    {
      from: (_table: string) => mockQueryBuilder(),
      auth: mockAuth,
    } as unknown as SupabaseClient,
    {
      get(target: any, prop: string | symbol) {
        if (prop in target) {
          return target[prop];
        }
        if (prop === 'from') {
          return () => mockQueryBuilder();
        }
        if (prop === 'auth') {
          return mockAuth;
        }
        return () => mockQueryBuilder();
      },
    }
  );
}

export const supabase: SupabaseClient =
  supabaseUrl && supabasePublishableKey
    ? createClient(supabaseUrl, supabasePublishableKey)
    : createMockSupabase();

