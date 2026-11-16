// A chave "publishable" do Supabase é pública por design: pode ficar no código do jogo.
// NUNCA coloque aqui a chave "service_role" nem "secret".
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://njgzspjszjggvqoqqdpu.supabase.co'
export const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_KEY || 'sb_publishable_ovJEumDJgljIp_cwv3lAjQ_5d9pxrkd'
