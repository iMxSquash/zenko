function requireEnv(key: keyof ImportMetaEnv): string {
  const value = import.meta.env[key]
  if (!value) throw new Error(`Missing env var: ${key}`)
  return value
}

export const env = {
  supabaseUrl: requireEnv('VITE_SUPABASE_URL'),
  supabaseAnonKey: requireEnv('VITE_SUPABASE_ANON_KEY'),
}
