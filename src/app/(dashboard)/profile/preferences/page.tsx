"use client";

import { useState, useEffect, useCallback } from "react";
import { Check } from "lucide-react";
import { apiClient } from "@/lib/api/client";

interface SpeciesOption {
  slug: string;
  name: string;
}

interface StateOption {
  code: string;
  name: string;
}

interface PreferenceItem {
  id: string;
  category: string;
  key: string;
  value: unknown;
  source: string;
}

const ORIENTATION_OPTIONS = [
  { value: "meat", label: "Meat / Freezer Filler" },
  { value: "trophy", label: "Trophy Oriented" },
  { value: "both", label: "Balanced (Both)" },
  { value: "experience", label: "Experience Focused" },
];

const BUDGET_OPTIONS = [
  { value: "under_1000", label: "Under $1,000" },
  { value: "1000_3000", label: "$1,000 – $3,000" },
  { value: "3000_5000", label: "$3,000 – $5,000" },
  { value: "5000_10000", label: "$5,000 – $10,000" },
  { value: "over_10000", label: "Over $10,000" },
];

const TRAVEL_OPTIONS = [
  { value: "local", label: "Local / In-State" },
  { value: "regional", label: "Regional (Neighboring States)" },
  { value: "national_drive", label: "Will Drive Nationally" },
  { value: "fly", label: "Will Fly Anywhere" },
];

const TIMELINE_OPTIONS = [
  { value: "this_year", label: "This Year" },
  { value: "1_to_3_years", label: "1–3 Years" },
  { value: "3_to_5_years", label: "3–5 Years" },
  { value: "long_term", label: "Long-Term (5+)" },
  { value: "mix", label: "Mix of All" },
];

const WEAPON_OPTIONS = [
  { value: "rifle", label: "Rifle" },
  { value: "archery", label: "Archery" },
  { value: "muzzleloader", label: "Muzzleloader" },
  { value: "shotgun", label: "Shotgun" },
];

const HUNT_STYLE_OPTIONS = [
  { value: "diy_public", label: "DIY – Public Land" },
  { value: "diy_private", label: "DIY – Private Land" },
  { value: "guided", label: "Guided / Outfitter" },
  { value: "semi_guided", label: "Semi-Guided" },
];

const PHYSICAL_OPTIONS = [
  { value: "limited", label: "Limited" },
  { value: "moderate", label: "Moderate" },
  { value: "high", label: "High" },
  { value: "elite", label: "Elite" },
];

export default function PreferencesPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [prefs, setPrefs] = useState<PreferenceItem[]>([]);
  const [speciesOptions, setSpeciesOptions] = useState<SpeciesOption[]>([]);
  const [stateOptions, setStateOptions] = useState<StateOption[]>([]);
  const [dirty, setDirty] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [prefsRes, speciesRes, statesRes] = await Promise.all([
        apiClient.get<{ preferences: PreferenceItem[] }>("/profile/preferences"),
        apiClient.get<{ species: SpeciesOption[] }>("/species"),
        apiClient.get<{ states: StateOption[] }>("/regulations"),
      ]);
      setPrefs(prefsRes.data?.preferences ?? []);
      setSpeciesOptions(speciesRes.data?.species ?? []);
      setStateOptions(statesRes.data?.states ?? []);
    } catch (err) {
      console.error("[preferences] Load failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const getValues = (category: string): string[] =>
    prefs.filter((p) => p.category === category).map((p) => p.key);

  const getSingleValue = (category: string, key: string): string =>
    (prefs.find((p) => p.category === category && p.key === key)?.value as string) ?? "";

  const toggleMultiSelect = (category: string, key: string) => {
    setDirty(true);
    const exists = prefs.find((p) => p.category === category && p.key === key);
    if (exists) {
      setPrefs(prefs.filter((p) => !(p.category === category && p.key === key)));
    } else {
      setPrefs([...prefs, { id: crypto.randomUUID(), category, key, value: true, source: "user" }]);
    }
  };

  const setSingleSelect = (category: string, key: string, value: string) => {
    setDirty(true);
    const updated = prefs.filter((p) => !(p.category === category && p.key === key));
    updated.push({ id: crypto.randomUUID(), category, key, value, source: "user" });
    setPrefs(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiClient.put("/profile/preferences", { preferences: prefs });
      setDirty(false);
    } catch (err) {
      console.error("[preferences] Save failed:", err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-brand-forest dark:text-brand-cream">Hunting Preferences</h1></div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-32 motion-safe:animate-pulse rounded-xl bg-brand-sage/10" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-forest dark:text-brand-cream">
            Hunting Preferences
          </h1>
          <p className="mt-1 text-sm text-brand-sage">
            Update your preferences to refine recommendations
          </p>
        </div>
        {dirty && (
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-[8px] bg-gradient-cta px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>

      {/* Target Species */}
      <Section title="Target Species" description="Which species are you most interested in hunting?">
        <div className="flex flex-wrap gap-2">
          {speciesOptions.map((s) => (
            <ToggleChip
              key={s.slug}
              label={s.name}
              selected={getValues("species_interest").includes(s.slug)}
              onClick={() => toggleMultiSelect("species_interest", s.slug)}
            />
          ))}
        </div>
      </Section>

      {/* Target States */}
      <Section title="Target States" description="Which states are you interested in?">
        <div className="flex flex-wrap gap-2">
          {stateOptions.map((s) => (
            <ToggleChip
              key={s.code}
              label={`${s.code} — ${s.name}`}
              selected={getValues("state_interest").includes(s.code.toLowerCase())}
              onClick={() => toggleMultiSelect("state_interest", s.code.toLowerCase())}
            />
          ))}
        </div>
      </Section>

      {/* Hunt Orientation */}
      <Section title="Hunt Orientation" description="What's your primary hunting goal?">
        <RadioGroup
          options={ORIENTATION_OPTIONS}
          value={getSingleValue("hunt_orientation", "orientation")}
          onChange={(v) => setSingleSelect("hunt_orientation", "orientation", v)}
        />
      </Section>

      {/* Budget */}
      <Section title="Annual Budget" description="Approximate yearly hunting budget">
        <RadioGroup
          options={BUDGET_OPTIONS}
          value={getSingleValue("budget", "annual_budget")}
          onChange={(v) => setSingleSelect("budget", "annual_budget", v)}
        />
      </Section>

      {/* Timeline */}
      <Section title="Timeline" description="When are you looking to hunt?">
        <RadioGroup
          options={TIMELINE_OPTIONS}
          value={getSingleValue("timeline", "hunt_timeline")}
          onChange={(v) => setSingleSelect("timeline", "hunt_timeline", v)}
        />
      </Section>

      {/* Travel Tolerance */}
      <Section title="Travel Tolerance" description="How far are you willing to travel?">
        <RadioGroup
          options={TRAVEL_OPTIONS}
          value={getSingleValue("travel", "travel_tolerance")}
          onChange={(v) => setSingleSelect("travel", "travel_tolerance", v)}
        />
      </Section>

      {/* Weapon Preferences */}
      <Section title="Weapon Preferences" description="What weapons do you hunt with?">
        <div className="flex flex-wrap gap-2">
          {WEAPON_OPTIONS.map((w) => (
            <ToggleChip
              key={w.value}
              label={w.label}
              selected={getValues("weapon").includes(w.value)}
              onClick={() => toggleMultiSelect("weapon", w.value)}
            />
          ))}
        </div>
      </Section>

      {/* Hunt Style */}
      <Section title="Hunt Style" description="What type of hunting experience do you prefer?">
        <div className="flex flex-wrap gap-2">
          {HUNT_STYLE_OPTIONS.map((s) => (
            <ToggleChip
              key={s.value}
              label={s.label}
              selected={getValues("hunt_style").includes(s.value)}
              onClick={() => toggleMultiSelect("hunt_style", s.value)}
            />
          ))}
        </div>
      </Section>

      {/* Physical Ability */}
      <Section title="Physical Ability" description="Your physical fitness level for hunting">
        <RadioGroup
          options={PHYSICAL_OPTIONS}
          value={getSingleValue("physical", "physical_ability")}
          onChange={(v) => setSingleSelect("physical", "physical_ability", v)}
        />
      </Section>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-brand-sage/10 bg-white p-6 dark:bg-brand-bark dark:border-brand-sage/20">
      <h3 className="text-lg font-semibold text-brand-bark dark:text-brand-cream">{title}</h3>
      <p className="mt-1 mb-4 text-sm text-brand-sage">{description}</p>
      {children}
    </div>
  );
}

function ToggleChip({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`min-h-[40px] rounded-full border px-4 py-2 text-sm font-medium transition-all ${
        selected
          ? "border-brand-forest bg-brand-forest/10 text-brand-forest dark:border-brand-sage dark:bg-brand-sage/20 dark:text-brand-cream"
          : "border-brand-sage/20 text-brand-sage hover:border-brand-sage/40 hover:text-brand-bark dark:hover:text-brand-cream"
      }`}
    >
      {label}
    </button>
  );
}

function RadioGroup({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`min-h-[44px] rounded-[10px] border px-4 py-3 text-left text-sm font-medium transition-all ${
            value === opt.value
              ? "border-brand-forest bg-brand-forest/10 text-brand-forest dark:border-brand-sage dark:bg-brand-sage/20 dark:text-brand-cream"
              : "border-brand-sage/20 text-brand-sage hover:border-brand-sage/40 hover:text-brand-bark dark:hover:text-brand-cream"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
