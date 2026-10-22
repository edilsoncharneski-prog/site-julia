const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://wkauvpkdpkraeaawkwzd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrYXV2cGtrZHBrcmFlYXdrd3pkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjY4ODkxMSwiZXhwIjoyMTA4MjY0OTExfQ.VbBu9F24Ck7qCZF5lgy5bwgOgrHehdPLyD0sYfUhgk0';

const client = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data, error } = await client.from('categorias').select('*');
  if (error) {
    console.error('Erro ao buscar categorias:', error);
  } else {
    console.log('Sucesso! Categorias encontradas:', data);
  }

  const { data: config } = await client.from('configuracoes_loja').select('*');
  console.log('Configurações da Loja:', config);
}

test();
