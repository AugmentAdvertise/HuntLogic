"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Plus, Check, X, Star, ChevronDown } from "lucide-react";

interface HarvestRecord {
  id: string;
  year: number;
  success: boolean;
  weaponType: string | null;
  trophyScore: string | null;
  notes: string | null;
  stateCode: string;
  stateName: string;
  speciesSlug: string;
  speciesName: string;
}

interface StateOption {
  code: string;
  name: string;
}

interface SpeciesOption {
  slug: string;
  commonName: string;
}

export default function HarvestPage() {
  return (
    <Suspense
      fallback={
        <div className="space-y-6">
          <div className="h-8 w-48 rounded-lg bg-brand-sage/10 motion-safe:animate-pulse dark:bg-brand-sage/20" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-brand-sage/10 motion-safe:animate-pulse dark:bg-brand-sage/20" />
          ))}
        </div>
      }
    >
      <HarvestPageContent />
    </Suspense>
  );
}

function HarvestPageContent() {
  const searchParams = useSearchParams();
  const [harvests, setHarvests] = useState<HarvestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statesOptions, setStatesOptions] = useState<StateOption[]>([]);
  const [speciesOptions, setSpeciesOptions] = useState<SpeciesOption[]>([]);

  // Form state
  const [stateCode, setStateCode] = useState(searchParams.get("state") ?? "");
  const [speciesSlug, setSpeciesSlug] = useState(
    searchParams.get("species") ?? ""
  );
  const [unitCode, setUnitCode] = useState("");
  const [year, setYear] = useState(
    parseInt(searchParams.get("year") ?? "") || new Date().getFullYear()
  );
  const [success, setSuccess] = useState(false);
  const [weaponType, setWeaponType] = useState("");
  const [trophyScore, setTrophyScore] = useState("");
  const [daysHunted, setDaysHunted] = useState("");
  const [satisfaction, setSatisfaction] = useState(0);
  const [wouldHuntAgain, setWouldHuntAgain] = useState(true);
  const [notes, setNotes] = useState("");

  const fetchHarvests = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/profile/harvest");
      if (res.ok) {
        const data = await res.json();
        setHarvests(data.harvests ?? []);
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOptions = useCallback(async () => {
    try {
      const [statesRes, speciesRes] = await Promise.all([
        fetch("/api/v1/explore/states"),
        fetch("/api/v1/explore/species"),
      ]);
      if (statesRes.ok) {
        const data = await statesRes.json();
        setStatesOptions(data.states ?? []);
      }
      if (speciesRes.ok) {
        const data = await speciesRes.json();
        setSpeciesOptions(data.species ?? []);
      }
    } catch {
      // Silent fail
    }
  }, []);

  useEffect(() => {
    fetchHarvests();
    fetchOptions();
  }, [fetchHarvests, fetchOptions]);

  // Auto-show form if URL params present
  useEffect(() => {
    if (searchParams.get("state") || searchParams.get("species")) {
      setShowForm(true);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stateCode || !speciesSlug || !year) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/profile/harvest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stateCode,
          speciesSlug,
          unitCode: unitCode || undefined,
          year,
          success,
          weaponType: weaponType || undefined,
          trophyScore: trophyScore ? parseFloat(trophyScore) : undefined,
          daysHunted: daysHunted ? parseInt(daysHunted) : undefined,
          satisfaction: satisfaction || undefined,
          wouldHuntAgain,
          notes: notes || undefined,
        }),
      });

      if (res.ok) {
        setShowForm(false);
        resetForm();
        fetchHarvests();
      }
    } catch {
      // Silent fail
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setStateCode("");
    setSpeciesSlug("");
    setUnitCode("");
    setYear(new Date().getFullYear());
    setSuccess(false);
    setWeaponType("");
    setTrophyScore("");
    setDaysHunted("");
    setSatisfaction(0);
    setWouldHuntAgain(true);
    setNotes("");
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 rounded-lg bg-brand-sage/10 motion-safe:animate-pulse dark:bg-brand-sage/20" />
          <div className="h-10 w-36 rounded-[8px] bg-brand-sage/10 motion-safe:animate-pulse dark:bg-brand-sage/20" />
        </div>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-brand-sage/10 motion-safe:animate-pulse dark:bg-brand-sage/20"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-brand-bark dark:text-brand-cream">
            Harvest Log
          </h1>
          <p className="mt-1 text-sm text-brand-sage">
            Record your hunts to improve future recommendations
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex min-h-[44px] items-center gap-2 rounded-[8px] bg-gradient-cta px-4 py-2 text-sm font-semibold text-white transition-all hover:shadow-md motion-safe:hover:-translate-y-0.5"
        >
          <Plus className="h-4 w-4" />
          Log Harvest
        </button>
      </div>

      {/* Harvest Entry Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-brand-sage/10 bg-white p-6 shadow-sm dark:border-brand-sage/20 dark:bg-brand-bark"
        >
          <h2 className="mb-4 text-lg font-semibold text-brand-bark dark:text-brand-cream">
            How did your hunt go?
          </h2>

          <div className="grid gap-4 sm:grid-cols-2">
            {/* State */}
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-bark dark:text-brand-cream">
                State
              </label>
              <div className="relative">
                <select
                  value={stateCode}
                  onChange={(e) => setStateCode(e.target.value)}
                  className="min-h-[44px] w-full appearance-none rounded-[10px] border border-brand-sage/20 bg-white px-3 py-2 pr-8 text-sm text-brand-bark dark:border-brand-sage/30 dark:bg-brand-bark/50 dark:text-brand-cream"
                  required
                >
                  <option value="">Select state...</option>
                  {statesOptions.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-sage" />
              </div>
            </div>

            {/* Species */}
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-bark dark:text-brand-cream">
                Species
              </label>
              <div className="relative">
                <select
                  value={speciesSlug}
                  onChange={(e) => setSpeciesSlug(e.target.value)}
                  className="min-h-[44px] w-full appearance-none rounded-[10px] border border-brand-sage/20 bg-white px-3 py-2 pr-8 text-sm text-brand-bark dark:border-brand-sage/30 dark:bg-brand-bark/50 dark:text-brand-cream"
                  required
                >
                  <option value="">Select species...</option>
                  {speciesOptions.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.commonName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-sage" />
              </div>
            </div>

            {/* Unit */}
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-bark dark:text-brand-cream">
                Unit (optional)
              </label>
              <input
                type="text"
                value={unitCode}
                onChange={(e) => setUnitCode(e.target.value)}
                placeholder="e.g., 201"
                className="min-h-[44px] w-full rounded-[10px] border border-brand-sage/20 bg-white px-3 py-2 text-sm text-brand-bark placeholder:text-brand-sage/50 dark:border-brand-sage/30 dark:bg-brand-bark/50 dark:text-brand-cream"
              />
            </div>

            {/* Year */}
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-bark dark:text-brand-cream">
                Year
              </label>
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || 0)}
                min={2000}
                max={2030}
                className="min-h-[44px] w-full rounded-[10px] border border-brand-sage/20 bg-white px-3 py-2 text-sm text-brand-bark dark:border-brand-sage/30 dark:bg-brand-bark/50 dark:text-brand-cream"
                required
              />
            </div>

            {/* Success Toggle */}
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-bark dark:text-brand-cream">
                Harvest Success
              </label>
              <button
                type="button"
                onClick={() => setSuccess(!success)}
                className={cn(
                  "flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] border px-3 py-2 text-sm font-medium transition-colors",
                  success
                    ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                    : "border-brand-sage/20 bg-white text-brand-sage dark:border-brand-sage/30 dark:bg-brand-bark/50"
                )}
              >
                {success ? (
                  <>
                    <Check className="h-4 w-4" /> Successful
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4" /> Unsuccessful
                  </>
                )}
              </button>
            </div>

            {/* Weapon Type */}
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-bark dark:text-brand-cream">
                Weapon
              </label>
              <div className="relative">
                <select
                  value={weaponType}
                  onChange={(e) => setWeaponType(e.target.value)}
                  className="min-h-[44px] w-full appearance-none rounded-[10px] border border-brand-sage/20 bg-white px-3 py-2 pr-8 text-sm text-brand-bark dark:border-brand-sage/30 dark:bg-brand-bark/50 dark:text-brand-cream"
                >
                  <option value="">Select weapon...</option>
                  <option value="rifle">Rifle</option>
                  <option value="archery">Archery</option>
                  <option value="muzzleloader">Muzzleloader</option>
                  <option value="shotgun">Shotgun</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-sage" />
              </div>
            </div>

            {/* Trophy Score */}
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-bark dark:text-brand-cream">
                Trophy Score (optional)
              </label>
              <input
                type="number"
                value={trophyScore}
                onChange={(e) => setTrophyScore(e.target.value)}
                placeholder="e.g., 320"
                step="0.01"
                className="min-h-[44px] w-full rounded-[10px] border border-brand-sage/20 bg-white px-3 py-2 text-sm text-brand-bark placeholder:text-brand-sage/50 dark:border-brand-sage/30 dark:bg-brand-bark/50 dark:text-brand-cream"
              />
            </div>

            {/* Days Hunted */}
            <div>
              <label className="mb-1 block text-sm font-medium text-brand-bark dark:text-brand-cream">
                Days Hunted
              </label>
              <input
                type="number"
                value={daysHunted}
                onChange={(e) => setDaysHunted(e.target.value)}
                placeholder="e.g., 5"
                min={1}
                max={60}
                className="min-h-[44px] w-full rounded-[10px] border border-brand-sage/20 bg-white px-3 py-2 text-sm text-brand-bark placeholder:text-brand-sage/50 dark:border-brand-sage/30 dark:bg-brand-bark/50 dark:text-brand-cream"
              />
            </div>
          </div>

          {/* Satisfaction Stars */}
          <div className="mt-4">
            <label className="mb-2 block text-sm font-medium text-brand-bark dark:text-brand-cream">
              Overall Satisfaction
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSatisfaction(star)}
                  className="min-h-[44px] min-w-[44px] rounded-lg p-2 transition-colors hover:bg-brand-sage/10"
                >
                  <Star
                    className={cn(
                      "h-6 w-6",
                      star <= satisfaction
                        ? "fill-amber-400 text-amber-400"
                        : "text-brand-sage/30 dark:text-brand-sage/50"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Would Hunt Again */}
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-brand-bark dark:text-brand-cream">
              Would you hunt this unit again?
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setWouldHuntAgain(true)}
                className={cn(
                  "flex min-h-[44px] flex-1 items-center justify-center rounded-[10px] border px-3 py-2 text-sm font-medium transition-colors",
                  wouldHuntAgain
                    ? "border-brand-forest bg-brand-forest/10 text-brand-forest dark:border-brand-sage dark:bg-brand-sage/20 dark:text-brand-cream"
                    : "border-brand-sage/20 text-brand-sage dark:border-brand-sage/30"
                )}
              >
                Yes
              </button>
              <button
                type="button"
                onClick={() => setWouldHuntAgain(false)}
                className={cn(
                  "flex min-h-[44px] flex-1 items-center justify-center rounded-[10px] border px-3 py-2 text-sm font-medium transition-colors",
                  !wouldHuntAgain
                    ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                    : "border-brand-sage/20 text-brand-sage dark:border-brand-sage/30"
                )}
              >
                No
              </button>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-brand-bark dark:text-brand-cream">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="How was the hunt? Any tips for next time?"
              className="w-full rounded-[10px] border border-brand-sage/20 bg-white px-3 py-2 text-sm text-brand-bark placeholder:text-brand-sage/50 dark:border-brand-sage/30 dark:bg-brand-bark/50 dark:text-brand-cream"
            />
          </div>

          {/* Submit */}
          <div className="mt-6 flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex min-h-[44px] items-center gap-2 rounded-[8px] bg-gradient-cta px-6 py-2 text-sm font-semibold text-white transition-all hover:shadow-md disabled:opacity-50 motion-safe:hover:-translate-y-0.5"
            >
              {submitting ? "Saving..." : "Save Harvest"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              className="flex min-h-[44px] items-center rounded-[8px] border border-brand-sage/20 px-4 py-2 text-sm font-medium text-brand-sage transition-colors hover:bg-brand-sage/5 dark:border-brand-sage/30"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Harvest History */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-brand-bark dark:text-brand-cream">
          Past Harvests
        </h2>

        {harvests.length === 0 ? (
          <div className="rounded-xl border border-brand-sage/10 bg-white p-8 text-center dark:border-brand-sage/20 dark:bg-brand-bark">
            <p className="text-sm text-brand-sage">
              No harvest records yet. Log your first hunt above!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {harvests.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between rounded-xl border border-brand-sage/10 bg-white px-4 py-3 shadow-sm dark:border-brand-sage/20 dark:bg-brand-bark"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold",
                      h.success
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    )}
                  >
                    {h.success ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <X className="h-4 w-4" />
                    )}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-brand-bark dark:text-brand-cream">
                      {h.stateName} — {h.speciesName}
                    </p>
                    <p className="text-xs text-brand-sage">
                      {h.year}
                      {h.weaponType && ` · ${h.weaponType}`}
                      {h.trophyScore && ` · Score: ${h.trophyScore}`}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                    h.success
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  )}
                >
                  {h.success ? "Success" : "Unsuccessful"}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
