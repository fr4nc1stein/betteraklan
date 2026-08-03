// Cloudflare AI Search (formerly AutoRAG) client for the Aklan Citizens
// Charter chat. Dependency-free (no `Env` coupling), matching the pattern
// in functions/lib/aerodatabox.ts.
//
// REST shape per developers.cloudflare.com/ai-search/api/search/rest-api/:
//   POST /accounts/{account_id}/ai-search/instances/{instance}/chat/completions
//   body: { messages: [{ role: "user", content: "..." }] }
// The exact response shape isn't fully documented; extractAnswer() below
// defensively checks the common OpenAI-compatible and Cloudflare-native
// shapes and should be revisited against a real response once
// AI_SEARCH_API_TOKEN / AI_SEARCH_INSTANCE are live.
const ACCOUNT_ID = 'c38cd063044a4cd77536dbc765fb746b';

export interface ChatSource {
  filename?: string;
  score?: number;
  content?: string;
}

export interface ChatAnswer {
  answer: string;
  sources: ChatSource[];
}

function extractAnswer(data: unknown): ChatAnswer {
  const d = data as Record<string, unknown>;
  const result = (d.result as Record<string, unknown>) ?? d;

  const answer =
    (result.response as string) ??
    (
      (result.choices as Array<{ message?: { content?: string } }>)?.[0]
        ?.message?.content
    ) ??
    (result.answer as string) ??
    '';

  const rawSources = (result.data ?? result.sources ?? []) as Array<
    Record<string, unknown>
  >;
  const sources: ChatSource[] = Array.isArray(rawSources)
    ? rawSources.map(s => ({
        filename: s.filename as string | undefined,
        score: s.score as number | undefined,
        content: s.content as string | undefined,
      }))
    : [];

  return { answer, sources };
}

export async function queryCitizensCharter(
  instance: string,
  apiToken: string,
  message: string
): Promise<ChatAnswer> {
  const res = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai-search/instances/${encodeURIComponent(instance)}/chat/completions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
      }),
    }
  );

  if (!res.ok) {
    throw new Error(`AI Search request failed: ${res.status}`);
  }

  const data = await res.json();
  return extractAnswer(data);
}
