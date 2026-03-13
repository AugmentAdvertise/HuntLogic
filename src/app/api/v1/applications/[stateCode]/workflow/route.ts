import { NextRequest, NextResponse } from "next/server";
import { loadWorkflow } from "@/services/applications/workflow";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ stateCode: string }> }
) {
  const { stateCode } = await params;

  try {
    const steps = await loadWorkflow(stateCode.toUpperCase());

    if (steps.length === 0) {
      return NextResponse.json(
        { error: "No workflow found for this state" },
        { status: 404 }
      );
    }

    return NextResponse.json({ stateCode: stateCode.toUpperCase(), steps });
  } catch (error) {
    console.error("[api/applications/workflow] GET error:", error);
    return NextResponse.json(
      { error: "Failed to load workflow" },
      { status: 500 }
    );
  }
}
