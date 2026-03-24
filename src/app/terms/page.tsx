import Link from 'next/link';

export default function TermsPage() {
  return (
    <main style={{
      maxWidth: 800, margin: "60px auto", padding: 20,
      color: "#E2E8F0", fontFamily: "sans-serif", lineHeight: 1.6
    }}>
      <Link href="/" style={{ color: "#2563EB", textDecoration: "none", fontSize: 14 }}>← Voltar para Atlas City</Link>
      
      <h1 style={{ color: "#fff", marginTop: 24 }}>Termos de Uso</h1>
      <p>Bem-vindo ao Atlas City. Ao utilizar nossa plataforma, você concorda com os seguintes termos:</p>
      
      <h2 style={{ color: "#fff" }}>1. Uso do Serviço</h2>
      <p>O Atlas City é uma simulação de cidade baseada em IA. O uso deve ser ético e não abusivo.</p>
      
      <h2 style={{ color: "#fff" }}>2. Restrições</h2>
      <ul>
        <li>Não tentar extrair prompts de sistema.</li>
        <li>Não utilizar para fins ilegais ou prejudiciais.</li>
        <li>Não realizar ataques de negação de serviço ou scraping massivo.</li>
      </ul>
      
      <h2 style={{ color: "#fff" }}>3. Limitação de Responsabilidade</h2>
      <p>As respostas são geradas por Inteligência Artificial e podem conter imprecisões.</p>
      
      <p style={{ marginTop: 40, fontSize: 12, color: "#64748B" }}>Última atualização: 23 de Março de 2026</p>
    </main>
  );
}
