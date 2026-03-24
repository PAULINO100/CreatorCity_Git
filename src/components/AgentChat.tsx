"use client";
import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "agent";
  content: string;
}

interface AgentChatProps {
  especialidade: string;
  bairro: string;
  predio: string;
  cor: string;
  especialidades: string[];
  onClose: () => void;
}

const BAIRRO_CONTEXT: Record<string, string> = {
  "Tecnologia": "Você é especialista técnico em tecnologia e desenvolvimento. Seja preciso, cite ferramentas, versões e inclua código quando útil.",
  "Engenharia": "Você é engenheiro especialista. Cite normas NBR, ISO e NR. Forneça procedimentos numerados e valores de referência.",
  "Saúde": "Você é especialista clínico. Cite valores de referência por sexo e idade. Classifique urgência. Seja tecnicamente preciso.",
  "Direito": "Você é especialista jurídico brasileiro. Cite artigos de lei, CLT, prazos e valores exatos.",
  "Educação": "Você é educador especialista. Explique de forma clara e didática com exemplos práticos.",
  "Negócios": "Você é consultor de negócios e contabilidade. Calcule cenários reais com os números do usuário.",
  "Construção": "Você é especialista em construção civil. Cite normas ABNT e forneça dimensionamentos.",
  "Agro": "Você é especialista em agronegócio. Cite práticas corretas, produtos registrados e doses.",
  "Arte": "Você é especialista criativo. Forneça técnicas e ferramentas específicas e práticas.",
  "Ciência": "Você é cientista especialista. Responda com rigor científico e metodologia precisa.",
};

export default function AgentChat({
  especialidade, bairro, predio,
  cor, especialidades, onClose
}: AgentChatProps) {
  const [messages, setMessages] = useState<Message[]>([{
    role: "agent",
    content: `Olá! Sou especialista em **${especialidade}** no ${predio}. Descreva seu problema e vou ajudar com uma solução precisa.`
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const systemPrompt = `${BAIRRO_CONTEXT[bairro] || `Você é especialista em ${bairro}.`}

Você está no ${predio}, bairro ${bairro} da Atlas City.
Especialidade atual: ${especialidade}.
Outras especialidades: ${especialidades.join(", ")}.

REGRAS:
1. Respostas completas e acionáveis
2. Linguagem técnica precisa mas acessível  
3. Inclua valores, normas e referências reais
4. Indique outros prédios da Atlas City quando pertinente
5. Máximo 2 perguntas se precisar de mais dados
6. Nunca use disclaimers sem dar informação real`;

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev,
      { role: "user", content: userMsg }
    ]);
    setLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || '';
      const res = await fetch(
        `${baseUrl}/api/chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system: systemPrompt,
            messages: [
              ...messages
                .filter((_, i) => i > 0)
                .map(m => ({
                  role: m.role === "agent"
                    ? "assistant" : "user",
                  content: m.content
                })),
              { role: "user", content: userMsg }
            ]
          })
        }
      );
      const data = await res.json();
      const reply = data.content?.[0]?.text
        ?? "Não consegui processar. Tente novamente.";
      setMessages(prev => [...prev,
        { role: "agent", content: reply }
      ]);
    } catch {
      setMessages(prev => [...prev, {
        role: "agent",
        content: "Erro de conexão. Tente novamente."
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      inset: isMobile ? 0 : "auto",
      bottom: isMobile ? 0 : 24,
      right: isMobile ? 0 : 24,
      width: isMobile ? "100%" : "min(560px, 95vw)",
      height: isMobile ? "100%" : "min(680px, 90vh)",
      maxHeight: isMobile ? "100dvh" : "90vh",
      background: "#0A1628",
      border: isMobile ? "none" : `1px solid ${cor}44`,
      borderRadius: isMobile ? 0 : 20,
      display: "flex",
      flexDirection: "column",
      boxShadow: `0 0 60px ${cor}33`,
      overflow: "hidden",
      zIndex: 200,
      fontFamily: "sans-serif",
      boxSizing: "border-box"
    }}>
      <div style={{
        padding: "16px 20px",
        borderBottom: "1px solid #1E3A5C",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0
      }}>
        <div>
          <div style={{
            fontSize: 11, color: cor,
            fontWeight: 700, letterSpacing: 1.5,
            textTransform: "uppercase"
          }}>
            {bairro} · {predio}
          </div>
          <div style={{
            fontSize: 16, fontWeight: 600,
            color: "#fff", marginTop: 3
          }}>
            Especialista em {especialidade}
          </div>
        </div>
        <button onClick={onClose} style={{
          background: "#1E3A5C", border: "none",
          color: "#94A3B8", width: 32, height: 32,
          borderRadius: 8, cursor: "pointer",
          fontSize: 18
        }}>×</button>
      </div>

      <div style={{
        flex: 1, overflowY: "auto",
        padding: "16px 20px"
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            marginBottom: 14,
            display: "flex",
            flexDirection: msg.role === "user"
              ? "row-reverse" : "row",
            gap: 10
          }}>
            <div style={{
              maxWidth: "82%",
              background: msg.role === "user"
                ? cor + "22" : "#111D2E",
              border: `1px solid ${
                msg.role === "user"
                  ? cor + "44" : "#1E3A5C"
              }`,
              borderRadius: msg.role === "user"
                ? "14px 14px 4px 14px"
                : "14px 14px 14px 4px",
              padding: "10px 14px",
              fontSize: 14, color: "#E2E8F0",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap"
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{
            color: cor, fontSize: 20,
            letterSpacing: 4, padding: "8px 0"
          }}>···</div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{
        padding: "12px 16px",
        borderTop: "1px solid #1E3A5C",
        display: "flex", gap: 10,
        flexShrink: 0,
        paddingBottom: "max(12px, env(safe-area-inset-bottom))"
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e =>
            e.key === "Enter" && !e.shiftKey && sendMessage()
          }
          placeholder={`Descreva seu problema em ${especialidade}...`}
          style={{
            flex: 1, background: "#111D2E",
            border: "1px solid #1E3A5C",
            borderRadius: 10, color: "#fff",
            padding: "10px 14px", fontSize: 14,
            outline: "none"
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            background: cor, border: "none",
            borderRadius: 10, color: "#fff",
            padding: "10px 16px", fontSize: 16,
            cursor: "pointer",
            opacity: loading || !input.trim() ? 0.5 : 1
          }}
        >→</button>
      </div>
    </div>
  );
}
