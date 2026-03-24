import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <main style={{
      maxWidth: 800, margin: "60px auto", padding: 20,
      color: "#E2E8F0", fontFamily: "sans-serif", lineHeight: 1.6
    }}>
      <Link href="/" style={{ color: "#2563EB", textDecoration: "none", fontSize: 14 }}>← Voltar para Atlas City</Link>
      
      <h1 style={{ color: "#fff", marginTop: 24 }}>Política de Privacidade</h1>
      <p>Levamos sua privacidade a sério na Atlas City. Esta política explica como lidamos com dados.</p>
      
      <h2 style={{ color: "#fff" }}>1. Coleta de Dados</h2>
      <p>Coletamos apenas o necessário para segurança e operação:</p>
      <ul>
        <li>IP (anonimizado através de hash para logs de segurança).</li>
        <li>Metadados de navegação (User-Agent, tempo de resposta).</li>
      </ul>
      
      <h2 style={{ color: "#fff" }}>2. Privacidade em IA</h2>
      <p>As conversas com os agentes são processadas em tempo real e não são armazenadas de forma persistente vinculadas ao seu usuário.</p>
      
      <h2 style={{ color: "#fff" }}>3. Seus Direitos (LGPD)</h2>
      <p>Você tem direito ao esquecimento e à transparência sobre como seus dados são processados.</p>
      
      <p style={{ marginTop: 40, fontSize: 12, color: "#64748B" }}>Última atualização: 23 de Março de 2026</p>
    </main>
  );
}
