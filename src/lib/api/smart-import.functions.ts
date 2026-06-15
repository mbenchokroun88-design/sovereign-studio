import { createServerFn } from "@tanstack/react-start";

export interface SmartImportInputMedia {
  url: string;
  filename?: string;
  hint?: string; // ex: "rollup", "badge"
}

export interface SmartImportInput {
  brief: string;
  medias: SmartImportInputMedia[];
}

export interface SmartImportOutput {
  title: string;
  slug: string;
  client: string;
  year: string;
  category:
    | "identity"
    | "report"
    | "event"
    | "video"
    | "3d"
    | "web";
  summary: string;
  description: string;
  tags: string[];
  cover: string;
  media: Array<{
    slot:
      | "concept_note"
      | "rollup"
      | "photocall"
      | "save_the_date"
      | "event_visual"
      | "mockup_3d"
      | "real_image"
      | "report_pdf"
      | "letter"
      | "badge"
      | "banner"
      | "testimonial"
      | "program"
      | "video"
      | "other";
    kind: "image" | "video" | "pdf";
    url: string;
    caption?: string;
    label?: string;
    mockup?: boolean;
    mockupTemplate?:
      | "magazine"
      | "rollup"
      | "poster"
      | "badge"
      | "flyer"
      | "banner"
      | "card";
  }>;
}

const SYSTEM_PROMPT = `Tu es un assistant éditorial expert en portfolio de design institutionnel (rapports, identité, événements).
À partir d'un brief court (français) et d'une liste de médias (URL + nom de fichier + indice optionnel), tu produis une fiche projet structurée et publiable IMMÉDIATEMENT.

Règles strictes :
- Réponds UNIQUEMENT en JSON valide, sans markdown ni texte autour.
- Tous les textes en français, ton professionnel et soigné.
- title : court, percutant (max 60 car.)
- summary : 1-2 phrases, accroche éditoriale (max 180 car.)
- description : 2-4 paragraphes courts séparés par \\n\\n, racontant contexte / approche / livrables
- category : choisir parmi identity, report, event, video, 3d, web
- tags : 3-6 mots-clés courts
- cover : URL d'un des médias (le plus visuel/représentatif, type image)
- Pour CHAQUE média fourni, déduire :
  - slot parmi : concept_note, rollup, photocall, save_the_date, event_visual, mockup_3d, real_image, report_pdf, letter, badge, banner, testimonial, program, video, other
  - kind : image / video / pdf (déduit de l'extension du nom de fichier ou de l'URL, .pdf → pdf, .mp4/.mov/youtube/vimeo → video, sinon image)
  - label : libellé court personnalisé (ex: "Roll-up principal", "Badge VIP")
  - mockup : true pour les visuels print imprimables (rollup, badge, banner, save_the_date, event_visual, poster) — false pour PDF, vidéo, photos réelles, ou photocall
  - mockupTemplate (si mockup=true) parmi : magazine (rapports/brochures multi-pages), rollup, poster (affiches/save the date), badge, flyer, banner, card
- Garde l'ordre logique des sections (note concept → save the date → programme → visuels → roll-ups → badges → mockups → photos réelles → rapport → témoignage).

Schéma JSON exact attendu :
{
  "title": string,
  "slug": string (kebab-case, sans accents),
  "client": string,
  "year": string (4 chiffres),
  "category": "identity"|"report"|"event"|"video"|"3d"|"web",
  "summary": string,
  "description": string,
  "tags": string[],
  "cover": string (url),
  "media": [{"slot": ..., "kind": ..., "url": ..., "label": ..., "mockup": bool, "mockupTemplate": ...?}]
}`;

function extractJson(text: string): unknown {
  // strip code fences if present
  const cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // try to grab the first {...} blob
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) return JSON.parse(m[0]);
    throw new Error("Réponse IA non parsable");
  }
}

export const smartImportProject = createServerFn({ method: "POST" })
  .inputValidator((input: SmartImportInput) => {
    if (!input || typeof input.brief !== "string" || !input.brief.trim()) {
      throw new Error("Brief requis");
    }
    if (!Array.isArray(input.medias)) {
      throw new Error("Médias requis");
    }
    return input;
  })
  .handler(async ({ data }): Promise<SmartImportOutput> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("LOVABLE_API_KEY manquante");

    const userPrompt = `BRIEF :
${data.brief}

MÉDIAS (${data.medias.length}) :
${data.medias
  .map(
    (m, i) =>
      `[${i + 1}] url="${m.url}" filename="${m.filename ?? ""}" hint="${
        m.hint ?? ""
      }"`,
  )
  .join("\n")}

Génère la fiche projet JSON.`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Lovable-API-Key": key,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      if (res.status === 429) throw new Error("Trop de requêtes IA — réessayez dans un instant.");
      if (res.status === 402) throw new Error("Crédits IA épuisés — ajoutez du crédit dans l'atelier.");
      throw new Error(`Erreur IA (${res.status}) : ${body.slice(0, 200)}`);
    }
    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = json.choices?.[0]?.message?.content ?? "";
    const parsed = extractJson(content) as SmartImportOutput;

    // basic safety net : map les URLs sur les médias d'origine si l'IA les a réordonnés
    if (!Array.isArray(parsed.media) || parsed.media.length === 0) {
      parsed.media = data.medias.map((m) => ({
        slot: "other" as const,
        kind: /\.pdf($|\?)/i.test(m.url)
          ? ("pdf" as const)
          : /\.(mp4|mov|webm)($|\?)|youtube|vimeo/i.test(m.url)
            ? ("video" as const)
            : ("image" as const),
        url: m.url,
      }));
    }
    if (!parsed.cover) {
      const firstImg = parsed.media.find((m) => m.kind === "image");
      parsed.cover = firstImg?.url ?? data.medias[0]?.url ?? "";
    }
    return parsed;
  });