import { db } from "@/lib/db";
import { appConfig } from "@/lib/db/schema";

const WORKFLOWS: Record<string, object[]> = {
  CO: [
    {
      step: 1,
      title: "Create CPW Online Account",
      instructions:
        "Visit the Colorado Parks & Wildlife website and create a new online account. You will need your Social Security Number, date of birth, and a valid email address. If you already have an account from a previous year, log in with your existing credentials.",
      portalUrl: "https://cpw.state.co.us",
      requiredBefore: [],
      estimatedMinutes: 10,
      tips: [
        "Use the same email you use for HuntLogic so we can cross-reference deadlines",
        "Save your Customer ID number — you'll need it every year",
      ],
    },
    {
      step: 2,
      title: "Verify Hunter Education",
      instructions:
        "Ensure your hunter education certificate is on file with CPW. If you completed hunter ed in another state, you may need to submit verification. Navigate to 'My Account' → 'Hunter Education' to confirm.",
      portalUrl: "https://cpw.state.co.us",
      requiredBefore: ["1"],
      estimatedMinutes: 5,
      tips: [
        "Colorado accepts hunter education from all US states and Canadian provinces",
        "If missing, CPW offers online courses that take about 6 hours",
      ],
    },
    {
      step: 3,
      title: "Purchase Habitat Stamp",
      instructions:
        "A Colorado Habitat Stamp ($10) is required before applying. Go to 'Buy a License' and add the Habitat Stamp to your cart. This is valid for the entire calendar year.",
      portalUrl: "https://cpw.state.co.us",
      requiredBefore: ["1"],
      estimatedMinutes: 5,
      tips: [
        "The Habitat Stamp is required even if you're only buying preference points",
        "It's valid Jan 1 through Dec 31",
      ],
    },
    {
      step: 4,
      title: "Select Hunt Choices (Primary Draw)",
      instructions:
        "Navigate to 'Apply for a License' and select your species. Enter your 1st through 4th choice hunt codes. Your primary (1st) choice should be the unit and season recommended in your HuntLogic playbook. Consider using 2nd-4th choices for higher-odds backup options.",
      portalUrl: "https://cpw.state.co.us",
      requiredBefore: ["1", "2", "3"],
      estimatedMinutes: 15,
      tips: [
        "Double-check your hunt codes against CPW's official brochure",
        "Apply with a group if hunting with partners — group applications draw together",
        "Your 4th choice can be an OTC fallback unit",
      ],
    },
    {
      step: 5,
      title: "Review and Submit Payment",
      instructions:
        "Review your application summary carefully. The application fee is $10 per species plus preference point fee if purchasing points. Submit payment via credit or debit card. Print or screenshot your confirmation number.",
      portalUrl: "https://cpw.state.co.us",
      requiredBefore: ["4"],
      estimatedMinutes: 5,
      tips: [
        "Keep your confirmation number — you'll need it to check draw results",
        "Application fees are non-refundable",
        "Draw results typically post in early June",
      ],
    },
  ],
  WY: [
    {
      step: 1,
      title: "Create WGFD Online Account",
      instructions:
        "Visit the Wyoming Game & Fish Department website and register for an online account. You'll need a valid ID, Social Security Number, and proof of hunter education.",
      portalUrl: "https://wgfd.wyo.gov",
      requiredBefore: [],
      estimatedMinutes: 15,
      tips: [
        "Non-residents must have a valid conservation stamp",
        "Your WGFD ID number carries over year to year",
      ],
    },
    {
      step: 2,
      title: "Verify Hunter Education",
      instructions:
        "Confirm your hunter education certificate is linked to your WGFD account. Wyoming requires proof of completion before any application can be submitted.",
      portalUrl: "https://wgfd.wyo.gov",
      requiredBefore: ["1"],
      estimatedMinutes: 5,
      tips: [
        "Wyoming accepts certifications from all US states",
        "Allow 2-3 business days for out-of-state verification",
      ],
    },
    {
      step: 3,
      title: "Select Species and Hunt Area",
      instructions:
        "Choose your target species (elk, deer, antelope, moose, sheep, goat, or bison). Select your desired hunt area based on your HuntLogic recommendation. Wyoming uses a preference point system — your point balance affects draw odds significantly.",
      portalUrl: "https://wgfd.wyo.gov",
      requiredBefore: ["1", "2"],
      estimatedMinutes: 10,
      tips: [
        "Wyoming's elk and deer are separate applications with separate deadlines",
        "Special species (moose, sheep, goat, bison) have much earlier deadlines",
        "Check the regulation booklet for area-specific weapon restrictions",
      ],
    },
    {
      step: 4,
      title: "Submit Application and Payment",
      instructions:
        "Review your selections, enter payment information (credit card or electronic check), and submit. Wyoming charges a non-refundable application fee plus the full tag price upfront — you'll be refunded tag cost if unsuccessful.",
      portalUrl: "https://wgfd.wyo.gov",
      requiredBefore: ["3"],
      estimatedMinutes: 10,
      tips: [
        "Wyoming charges full tag price upfront and refunds if you don't draw",
        "Non-resident elk tags are $712 — ensure sufficient funds",
        "Draw results post in mid-May for most species",
      ],
    },
  ],
  MT: [
    {
      step: 1,
      title: "Create MyFWP Account",
      instructions:
        "Register at Montana Fish, Wildlife & Parks (MyFWP). You'll need a Social Security Number, date of birth, and contact information.",
      portalUrl: "https://fwp.mt.gov",
      requiredBefore: [],
      estimatedMinutes: 10,
      tips: [
        "Your ALS (Automated Licensing System) number is your permanent ID",
        "Non-residents need to purchase a base hunting license first",
      ],
    },
    {
      step: 2,
      title: "Purchase Base Hunting License",
      instructions:
        "Non-residents must purchase a Conservation License ($10) and a base Hunting License ($15 resident / $120 non-resident) before applying for any permits.",
      portalUrl: "https://fwp.mt.gov",
      requiredBefore: ["1"],
      estimatedMinutes: 5,
      tips: [
        "The base license is required even for point-only purchases",
        "Resident sportsman licenses bundle multiple species",
      ],
    },
    {
      step: 3,
      title: "Select Permit Applications",
      instructions:
        "Navigate to 'Apply for Permits' and choose your species/district. Montana uses a bonus point system — more points increase odds but don't guarantee a draw. Select first and second choices.",
      portalUrl: "https://fwp.mt.gov",
      requiredBefore: ["1", "2"],
      estimatedMinutes: 15,
      tips: [
        "Montana's elk combo is a popular choice for non-residents",
        "Bonus points square your chances — 3 points gives you 9x the odds of a first-time applicant",
        "General elk tags are OTC for residents but limited entry for non-residents",
      ],
    },
    {
      step: 4,
      title: "Review and Submit Payment",
      instructions:
        "Confirm all application details and submit payment. Montana accepts credit cards for online applications. Keep your confirmation receipt.",
      portalUrl: "https://fwp.mt.gov",
      requiredBefore: ["3"],
      estimatedMinutes: 5,
      tips: [
        "Application fee is $5 per species",
        "Draw results typically available in mid-March for deer/elk",
      ],
    },
  ],
  AZ: [
    {
      step: 1,
      title: "Create AZGFD Portal Account",
      instructions:
        "Register at the Arizona Game & Fish Department portal. You'll need a valid ID and contact information. If you've held an Arizona license before, use the 'Recover Account' option.",
      portalUrl: "https://www.azgfd.com/license/portal",
      requiredBefore: [],
      estimatedMinutes: 10,
      tips: [
        "Your AZGFD Customer ID is permanent — save it securely",
        "Arizona uses a bonus point system similar to Montana",
      ],
    },
    {
      step: 2,
      title: "Purchase Hunting License",
      instructions:
        "Buy your General Hunting License through the portal. Non-resident licenses are $160. This must be purchased before submitting draw applications.",
      portalUrl: "https://www.azgfd.com/license/portal",
      requiredBefore: ["1"],
      estimatedMinutes: 5,
      tips: [
        "Youth licenses are significantly discounted",
        "The hunting license is valid for 365 days from purchase",
      ],
    },
    {
      step: 3,
      title: "Submit Draw Application",
      instructions:
        "Navigate to 'Apply for Draw' and select your species and hunt number. Arizona allows up to 3 choices per species on a single application. Use your HuntLogic recommendation for your first choice.",
      portalUrl: "https://www.azgfd.com/license/portal",
      requiredBefore: ["1", "2"],
      estimatedMinutes: 15,
      tips: [
        "Arizona has separate draws for different species — check deadlines carefully",
        "Elk applications are due in February, deer/antelope in June",
        "Bonus points are awarded for unsuccessful applications automatically",
      ],
    },
    {
      step: 4,
      title: "Confirm Payment and Print Receipt",
      instructions:
        "Review your application and submit payment ($13 application fee per species). Arizona charges only the application fee — tag fees are charged upon successful draw.",
      portalUrl: "https://www.azgfd.com/license/portal",
      requiredBefore: ["3"],
      estimatedMinutes: 5,
      tips: [
        "Arizona only charges the full tag fee if you draw — lower upfront cost",
        "Check results online approximately 5 weeks after the deadline",
      ],
    },
  ],
  NM: [
    {
      step: 1,
      title: "Create NMDGF Online Account",
      instructions:
        "Register at the New Mexico Department of Game & Fish website. You'll need a Social Security Number, date of birth, and valid ID.",
      portalUrl: "https://onlinesales.wildlife.state.nm.us",
      requiredBefore: [],
      estimatedMinutes: 10,
      tips: [
        "New Mexico uses a unique lottery system with no point system",
        "Everyone has equal odds regardless of how many years applied",
      ],
    },
    {
      step: 2,
      title: "Purchase Game-Hunting License",
      instructions:
        "Buy your Game-Hunting License ($15 resident / $65 non-resident). This is required before submitting any draw application.",
      portalUrl: "https://onlinesales.wildlife.state.nm.us",
      requiredBefore: ["1"],
      estimatedMinutes: 5,
      tips: [
        "NM licenses are valid April 1 through March 31",
        "The Habitat Management & Access Validation ($5) is also required",
      ],
    },
    {
      step: 3,
      title: "Submit Draw Application",
      instructions:
        "Navigate to 'Big Game Draw' and select your species. Enter your first through third hunt choices. New Mexico allows three choices per species application.",
      portalUrl: "https://onlinesales.wildlife.state.nm.us",
      requiredBefore: ["1", "2"],
      estimatedMinutes: 15,
      tips: [
        "NM has separate draw periods for different species — elk is typically March",
        "Oryx and ibex are exotic species with their own separate draws",
        "Outfitter-set-aside pools exist for guided hunt options",
      ],
    },
    {
      step: 4,
      title: "Pay Application Fees and Confirm",
      instructions:
        "Review your application details and submit payment ($12 application fee per species). New Mexico charges tag fees only upon successful draw. Save your confirmation number.",
      portalUrl: "https://onlinesales.wildlife.state.nm.us",
      requiredBefore: ["3"],
      estimatedMinutes: 5,
      tips: [
        "NM is purely random — no points to manage, just apply every year",
        "Draw results are available approximately 6 weeks after deadline",
        "Check for leftover licenses after the draw — great fallback option",
      ],
    },
  ],
};

export async function seedApplicationWorkflows() {
  console.log("Seeding application workflows...");

  for (const [stateCode, steps] of Object.entries(WORKFLOWS)) {
    await db
      .insert(appConfig)
      .values({
        namespace: "applications",
        key: `workflow.${stateCode}`,
        value: steps,
        description: `Application workflow steps for ${stateCode}`,
      })
      .onConflictDoUpdate({
        target: [appConfig.namespace, appConfig.key],
        set: {
          value: steps,
          description: `Application workflow steps for ${stateCode}`,
          updatedAt: new Date(),
        },
      });
  }

  console.log(`Seeded workflows for ${Object.keys(WORKFLOWS).length} states.`);
}
