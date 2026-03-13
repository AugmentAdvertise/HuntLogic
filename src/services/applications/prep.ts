import { db } from "@/lib/db";
import { recommendations, states, species, huntUnits } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface ApplicationWorksheet {
  stateCode: string;
  stateName: string;
  speciesName: string;
  primaryChoice: {
    unitCode: string;
    unitName: string | null;
    species: string;
    weaponType: string | null;
  } | null;
  secondaryChoice: string | null;
  tertiaryChoice: string | null;
  costBreakdown: {
    applicationFee: number;
    pointPurchaseFee: number;
    tagFeeIfDrawn: number;
    total: number;
  };
  requiredDocuments: string[];
  paymentMethods: string[];
}

const STATE_FEE_DATA: Record<
  string,
  {
    applicationFee: number;
    pointPurchaseFee: number;
    tagFee: number;
    paymentMethods: string[];
  }
> = {
  CO: {
    applicationFee: 10,
    pointPurchaseFee: 40,
    tagFee: 660,
    paymentMethods: ["Credit Card", "Debit Card"],
  },
  WY: {
    applicationFee: 15,
    pointPurchaseFee: 52,
    tagFee: 712,
    paymentMethods: ["Credit Card", "Check"],
  },
  MT: {
    applicationFee: 5,
    pointPurchaseFee: 20,
    tagFee: 875,
    paymentMethods: ["Credit Card"],
  },
  AZ: {
    applicationFee: 13,
    pointPurchaseFee: 13,
    tagFee: 300,
    paymentMethods: ["Credit Card", "Debit Card"],
  },
  NM: {
    applicationFee: 12,
    pointPurchaseFee: 36,
    tagFee: 548,
    paymentMethods: ["Credit Card"],
  },
};

/**
 * Generate a pre-filled application worksheet for a recommendation
 */
export async function generateWorksheet(
  recommendationId: string
): Promise<ApplicationWorksheet | null> {
  const [rec] = await db
    .select()
    .from(recommendations)
    .where(eq(recommendations.id, recommendationId))
    .limit(1);

  if (!rec) return null;

  const [state] = await db
    .select()
    .from(states)
    .where(eq(states.id, rec.stateId))
    .limit(1);

  const [sp] = await db
    .select()
    .from(species)
    .where(eq(species.id, rec.speciesId))
    .limit(1);

  let unit = null;
  if (rec.huntUnitId) {
    const [u] = await db
      .select()
      .from(huntUnits)
      .where(eq(huntUnits.id, rec.huntUnitId))
      .limit(1);
    unit = u ?? null;
  }

  const stateCode = state?.code ?? "CO";
  const fees = STATE_FEE_DATA[stateCode] ?? STATE_FEE_DATA.CO;

  return {
    stateCode,
    stateName: state?.name ?? stateCode,
    speciesName: sp?.commonName ?? "Unknown",
    primaryChoice: unit
      ? {
          unitCode: unit.unitCode,
          unitName: unit.unitName,
          species: sp?.commonName ?? "Unknown",
          weaponType: rec.recType ?? null,
        }
      : null,
    secondaryChoice: null,
    tertiaryChoice: null,
    costBreakdown: {
      applicationFee: fees.applicationFee,
      pointPurchaseFee: fees.pointPurchaseFee,
      tagFeeIfDrawn: fees.tagFee,
      total: fees.applicationFee + fees.pointPurchaseFee,
    },
    requiredDocuments: [
      "Hunter Education Certificate",
      "Valid Government-Issued ID",
      "State-Specific License (if required)",
    ],
    paymentMethods: fees.paymentMethods,
  };
}
