import { NextRequest, NextResponse } from "next/server";

const AZURE_KEY = process.env.AZURE_TRANSLATOR_KEY;
const AZURE_REGION = process.env.AZURE_TRANSLATOR_REGION;
const ENDPOINT = "https://api.cognitive.microsofttranslator.com";

export async function POST(req: NextRequest) {
  const { text, target } = await req.json();

  if (!text || !target) {
    return NextResponse.json({ error: "Missing text or target" }, { status: 400 });
  }

  if (target === "en") {
    return NextResponse.json({ translatedText: text });
  }

  try {
    const res = await fetch(
      `${ENDPOINT}/translate?api-version=3.0&to=${target}`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_KEY!,
          "Ocp-Apim-Subscription-Region": AZURE_REGION!,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ text }]),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json({ error: data.error?.message || "Translation failed" }, { status: 500 });
    }

    return NextResponse.json({ translatedText: data[0].translations[0].text });
  } catch (err) {
    return NextResponse.json({ error: "Translation request failed" }, { status: 500 });
  }
}