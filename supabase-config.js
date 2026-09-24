// Configuração pública do Supabase
// A Publishable Key pode ficar no frontend.
// NÃO coloque aqui uma chave "secret" ou "service_role".

const SUPABASE_URL = "https://jwlbbwznfxfawwxhfjyc.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_979gsqVIEgT2GCySEiFM8Q_ghLaBEc2";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);
