// ─────────────────────────────────────────────────────────────
// Taking money, as one control used by every screen that does it.
//
// Four screens each had their own copy of this — the cashier, check-in,
// check-out and the guest dashboard — with four hardcoded lists of methods that
// had already drifted apart. What a receptionist could record depended on which
// screen they happened to be standing on, which is not a preference, it is a
// bug that reaches the accounts.
//
// Two behaviours make this more than a dropdown:
//
//   **Cash.** The desk types what the guest handed over and the change is
//   worked out here, big enough to read at arm's length. The payment recorded
//   is still what was owed — the drawer keeps that, and the change goes back.
//
//   **Card.** The property may add a percentage. The fee is quoted by the
//   server, not computed here, because a fee worked out twice is a fee that
//   will one day differ in the third decimal place with a guest watching. The
//   panel shows the fee and the real total before anybody presses the button.
// ─────────────────────────────────────────────────────────────
import { useEffect, useMemo, useState } from 'react';
import { Banknote, CreditCard, Info } from 'lucide-react';
import { usePaymentMethods } from './queries';
import { Field, Select } from './ui';
import { MoneyInput } from './components';
import { money, bpToPercent } from './format';
import type { PaymentMethod } from './types';

export interface PaymentDraft {
  /** Method code, e.g. `CASH`. Sent to the API as-is. */
  method: string;
  /** What the guest is settling, before any card fee. */
  amountMinor: number;
  /** Cash only: what they handed over. Null when not counted. */
  tenderedMinor: number | null;
  reference: string;
}

export const emptyPayment = (amountMinor = 0): PaymentDraft => ({
  method: 'CASH', amountMinor, tenderedMinor: null, reference: '',
});

/** The arithmetic the panel shows. Mirrors `surchargeFor` on the server. */
export function paymentTotals(
  draft: PaymentDraft,
  method: PaymentMethod | undefined,
  surchargeEnabled: boolean,
  defaultBp: number,
) {
  const rate = method?.surchargeBp ?? defaultBp;
  const applies = surchargeEnabled && method?.kind === 'card' && rate > 0 && draft.amountMinor > 0;
  const surchargeMinor = applies ? Math.round((draft.amountMinor * rate) / 10_000) : 0;
  const totalMinor = draft.amountMinor + surchargeMinor;
  const changeMinor = method?.kind === 'cash' && draft.tenderedMinor !== null
    ? draft.tenderedMinor - totalMinor
    : null;
  return { surchargeBp: applies ? rate : 0, surchargeMinor, totalMinor, changeMinor };
}

export function PaymentFields({
  draft,
  onChange,
  balanceMinor,
  compact = false,
}: {
  draft: PaymentDraft;
  onChange: (d: PaymentDraft) => void;
  /** What is outstanding, for the "settle it all" shortcut. */
  balanceMinor?: number;
  compact?: boolean;
}) {
  const list = usePaymentMethods();
  const methods = list.data?.methods ?? [];
  const method = methods.find((m) => m.code === draft.method);

  // The stored default is CASH; if a property has removed it, fall to whatever
  // they do accept rather than leaving the form pointing at nothing.
  useEffect(() => {
    if (!methods.length || method) return;
    onChange({ ...draft, method: methods[0].code });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [methods.length]);

  const t = useMemo(
    () => paymentTotals(draft, method, list.data?.cardSurchargeEnabled ?? false,
      list.data?.cardSurchargeBp ?? 0),
    [draft, method, list.data],
  );

  const isCash = method?.kind === 'cash';
  const short = t.changeMinor !== null && t.changeMinor < 0;

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <Field label="Method" required>
        <Select
          value={draft.method}
          onChange={(v) => onChange({ ...draft, method: v, tenderedMinor: null })}
          options={methods.map((m) => ({ label: m.label, value: m.code }))}
        />
      </Field>

      <Field
        label={isCash ? 'Amount to settle' : 'Amount'}
        required
        hint={balanceMinor !== undefined && balanceMinor > 0
          ? `Outstanding ${money(balanceMinor)}` : undefined}
      >
        <MoneyInput
          valueMinor={draft.amountMinor}
          onChange={(v) => onChange({ ...draft, amountMinor: v })}
        />
      </Field>

      {balanceMinor !== undefined && balanceMinor > 0 && draft.amountMinor !== balanceMinor && (
        <button
          type="button"
          className="text-[11px] font-bold underline text-dash-muted hover:text-black"
          onClick={() => onChange({ ...draft, amountMinor: balanceMinor })}
        >
          Settle the full {money(balanceMinor)}
        </button>
      )}

      {/* ── The card fee ── */}
      {t.surchargeMinor > 0 && (
        <div className="rounded-2xl border border-black/10 bg-white p-3.5">
          <div className="flex items-center gap-1.5 mb-2">
            <CreditCard className="w-3.5 h-3.5 text-dash-muted" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-dash-muted">
              Card payment
            </p>
          </div>
          <Line label="Amount" value={money(draft.amountMinor)} />
          <Line
            label={`${list.data?.cardSurchargeLabel ?? 'Card fee'} · ${bpToPercent(t.surchargeBp)}%`}
            value={money(t.surchargeMinor)}
          />
          <div className="flex justify-between items-baseline pt-2 mt-1 border-t subtle-divider">
            <span className="text-[11px] font-bold">Charge the card</span>
            <span className="text-[16px] font-black tabular-nums">{money(t.totalMinor)}</span>
          </div>
          <p className="text-[10px] text-dash-muted mt-2 leading-relaxed">
            The fee is posted to the folio as its own line, so the guest&apos;s bill shows what
            they were charged and why.
          </p>
        </div>
      )}

      {/* ── Cash and change ── */}
      {isCash && (
        <div className="rounded-2xl border border-black/10 bg-white p-3.5 space-y-3">
          <div className="flex items-center gap-1.5">
            <Banknote className="w-3.5 h-3.5 text-dash-muted" />
            <p className="text-[10px] font-bold uppercase tracking-widest text-dash-muted">
              Cash
            </p>
          </div>
          <Field label="Cash received" hint="Leave empty if it is the exact amount">
            <MoneyInput
              valueMinor={draft.tenderedMinor ?? 0}
              onChange={(v) => onChange({ ...draft, tenderedMinor: v > 0 ? v : null })}
            />
          </Field>

          {/* Round notes, because that is what people hand over. */}
          <div className="flex flex-wrap gap-1.5">
            {quickNotes(t.totalMinor).map((n) => (
              <button
                key={n}
                type="button"
                className="px-2.5 py-1 rounded-full border border-black/10 text-[11px] font-bold hover:bg-dash-bg"
                onClick={() => onChange({ ...draft, tenderedMinor: n })}
              >
                {money(n, { decimals: false })}
              </button>
            ))}
            <button
              type="button"
              className="px-2.5 py-1 rounded-full border border-black/10 text-[11px] font-bold hover:bg-dash-bg"
              onClick={() => onChange({ ...draft, tenderedMinor: t.totalMinor })}
            >
              Exact
            </button>
          </div>

          {draft.tenderedMinor !== null && (
            short ? (
              <div className="rounded-xl bg-status-bad/5 border border-status-bad/30 p-3">
                <p className="text-[12px] font-bold text-status-bad">
                  {money(Math.abs(t.changeMinor ?? 0))} short
                </p>
                <p className="text-[11px] text-dash-muted mt-0.5">
                  {money(t.totalMinor)} is due and {money(draft.tenderedMinor)} was handed over.
                </p>
              </div>
            ) : (
              <div className="rounded-xl bg-dash-mint/40 border border-black/5 p-3 flex items-baseline justify-between">
                <span className="text-[11px] font-bold uppercase tracking-widest text-dash-muted">
                  Change to give
                </span>
                <span className="text-[22px] font-black tabular-nums">
                  {money(t.changeMinor ?? 0)}
                </span>
              </div>
            )
          )}
        </div>
      )}

      <Field label="Reference" hint={method?.kind === 'card' ? 'Card auth code' : undefined}>
        <input
          value={draft.reference}
          onChange={(e) => onChange({ ...draft, reference: e.target.value })}
          placeholder="Auth code / transfer reference"
          className="w-full bg-white border border-black/10 rounded-xl px-4 py-2.5 text-[13px] outline-none focus:border-black/40"
        />
      </Field>

      {list.isError && (
        <p className="flex items-start gap-1.5 text-[11px] text-status-warn">
          <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          Could not load the payment methods — check the connection before taking money.
        </p>
      )}
    </div>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline py-0.5">
      <span className="text-[11px] text-dash-muted">{label}</span>
      <span className="text-[12px] font-semibold tabular-nums">{value}</span>
    </div>
  );
}

/**
 * The notes somebody would actually reach for, above what is owed.
 *
 * Not a fixed set: 20/50/100 is useless against a bill of 340. These are the
 * next round numbers up, which is how change is worked out in the head anyway.
 */
function quickNotes(totalMinor: number): number[] {
  if (totalMinor <= 0) return [];
  const major = totalMinor / 100;
  const steps = [5, 10, 20, 50, 100];
  const out = new Set<number>();
  for (const s of steps) {
    const up = Math.ceil(major / s) * s;
    if (up * 100 > totalMinor) out.add(Math.round(up * 100));
  }
  return [...out].sort((a, b) => a - b).slice(0, 4);
}

/** What to send to `POST /api/folios/:id/payments`. */
export function paymentBody(draft: PaymentDraft) {
  return {
    method: draft.method,
    amountMinor: draft.amountMinor,
    reference: draft.reference || undefined,
    // Only meaningful for cash; the server ignores it otherwise.
    tenderedMinor: draft.tenderedMinor,
  };
}

/**
 * Whether the button should be live.
 *
 * A cash payment that is short is the one case worth blocking outright — it is
 * always a typo or a misunderstanding at the counter, and posting it leaves a
 * folio that says paid and a drawer that disagrees.
 */
export function paymentReady(
  draft: PaymentDraft,
  method: PaymentMethod | undefined,
  surchargeEnabled: boolean,
  defaultBp: number,
): boolean {
  if (draft.amountMinor <= 0) return false;
  const t = paymentTotals(draft, method, surchargeEnabled, defaultBp);
  return !(t.changeMinor !== null && t.changeMinor < 0);
}
