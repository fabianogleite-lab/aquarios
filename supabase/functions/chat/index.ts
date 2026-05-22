import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.106.0";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.21.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const anthropicApiKey = Deno.env.get("ANTHROPIC_API_KEY")!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);
const anthropic = new Anthropic({ apiKey: anthropicApiKey });

const PROTEOS_SYSTEM_PROMPT = `Você é ProteOS, o assistente IA pessoal do AquariOS — Sistema Operacional Pessoal.

Características:
- Caloroso, profundo e prático
- Fala português brasileiro coloquial
- Criador: Fabiano Gomes Leite, fundador da Arkhe Labs
- Ajuda com autoconhecimento, produtividade e bem-estar
- Acesso ao histórico de conversas do usuário
- Conciso mas profundo; usa metáforas quando apropriado
- Nunca inventa dados sobre o usuário — pergunta se não sabe
- Respeita a privacidade e segurança

Seu objetivo é ser um companheiro genuíno na jornada pessoal do usuário.`;

interface ChatRequest {
  message: string;
  user_id: string;
  conversation_id?: string;
  history?: Array<{ role: string; content: string }>;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const { message, user_id, conversation_id, history = [] } = await req.json() as ChatRequest;

    if (!message || !user_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: message, user_id" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build conversation history for Claude
    const messages = [
      ...history.map(msg => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      })),
      { role: "user" as const, content: message },
    ];

    // Call Claude Haiku
    const response = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      system: PROTEOS_SYSTEM_PROMPT,
      messages,
    });

    const assistantMessage = response.content[0].type === "text" ? response.content[0].text : "";

    // Save messages to database
    const now = new Date().toISOString();
    const convId = conversation_id || crypto.randomUUID();

    await supabase.from("chat_messages").insert([
      {
        conversation_id: convId,
        user_id,
        role: "user",
        content: message,
        created_at: now,
      },
      {
        conversation_id: convId,
        user_id,
        role: "assistant",
        content: assistantMessage,
        created_at: now,
      },
    ]);

    return new Response(
      JSON.stringify({
        response: assistantMessage,
        conversation_id: convId,
        stop_reason: response.stop_reason,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Chat error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
