import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API key not configured" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error:
            errorData.error?.message ||
            `HTTP error! status: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Filter only models that support generateContent
    const generateContentModels = data.models?.filter((model: any) =>
      model.supportedGenerationMethods?.includes("generateContent")
    );

    return NextResponse.json({
      models:
        generateContentModels?.map((model: any) => ({
          name: model.name,
          displayName: model.displayName,
          description: model.description,
          supportedMethods: model.supportedGenerationMethods,
        })) || [],
    });
  } catch (error) {
    console.error("List models error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
