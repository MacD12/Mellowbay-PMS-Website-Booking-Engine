// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Guest self check-in, opened by scanning the QR code at the desk.
//
// The whole page is built for one situation: somebody standing at a counter
// holding their own phone, with a receptionist waiting. So it is one column,
// large targets, no navigation off the page, and it never asks for anything the
// property does not need on a registration card.
//
// The token in the URL is the only credential. It is never shown, never copied
// into a link the guest can share by accident, and the page tells them plainly
// that a member of staff still checks what they send.
//
// Nothing here is the registration record. What is sent is an unaccepted
// submission; the desk accepts it. That is why re-submitting is allowed and
// says "update", not "you have already done this".
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
import { useEffect, useRef, useState } from 'react';
// Named rather than the `React.` namespace: this project has no global React
// type in scope, and importing the two shapes actually used says which they are.
import type { ReactNode, PointerEvent as ReactPointerEvent } from 'react';
import { useParams } from 'react-router-dom';
import {
  fetchRegistration, sendRegistration,
  type RegistrationContext, type RegistrationSubmission,
} from '../booking/api';

/** Longest edge of the stored photograph. A passport page is readable here. */
const MAX_EDGE = 1600;
const JPEG_QUALITY = 0.82;

const ID_TYPES = ['Passport', 'National ID', 'Driving licence', 'Residence permit'];

/**
 * Shrink the photograph before it leaves the phone.
 *
 * A modern phone camera produces four to eight megabytes a shot, over whatever
 * signal the lobby has. A passport page is legible well under half of one, and
 * every stored copy ends up inside the property's database and every backup
 * taken from it.
 */
async function shrink(file: File): Promise<{ mime: string; data: string }> {
  if (!file.type.startsWith('image/')) {
    const data = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error('Could not read that file'));
      r.readAsDataURL(file);
    });
    return { mime: file.type, data };
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  return { mime: 'image/jpeg', data: canvas.toDataURL('image/jpeg', JPEG_QUALITY) };
}

const field =
  'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-[15px] '
  + 'outline-none transition-colors focus:border-ink';

function Label({ children, hint }: { children: ReactNode; hint?: string }) {
  return (
    <span className="mb-1.5 block">
      <span className="block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        {children}
      </span>
      {hint && <span className="mt-0.5 block text-[11px] text-slate-400">{hint}</span>}
    </span>
  );
}

/**
 * A signature drawn with a finger.
 *
 * Sized in CSS pixels but backed at device resolution, or the stroke is a blur
 * on the phone it will actually be signed on. Pointer events rather than touch
 * events so the same code works for a stylus and a mouse.
 */
function SignaturePad({ onChange }: { onChange: (dataUrl: string | null) => void }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const drawing = useRef(false);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#111';
  }, []);

  const pos = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  return (
    <div>
      <canvas
        ref={ref}
        className="h-44 w-full touch-none rounded-xl border border-dashed border-slate-300 bg-white"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          const ctx = e.currentTarget.getContext('2d')!;
          const { x, y } = pos(e);
          ctx.beginPath();
          ctx.moveTo(x, y);
          drawing.current = true;
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return;
          const ctx = e.currentTarget.getContext('2d')!;
          const { x, y } = pos(e);
          ctx.lineTo(x, y);
          ctx.stroke();
          if (!drawn) setDrawn(true);
        }}
        onPointerUp={(e) => {
          drawing.current = false;
          if (drawn) onChange(e.currentTarget.toDataURL('image/png'));
        }}
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[11px] text-slate-400">
          {drawn ? 'Signed' : 'Sign above with your finger'}
        </span>
        <button
          type="button"
          className="text-[12px] font-medium text-slate-500 underline"
          onClick={() => {
            const canvas = ref.current;
            if (!canvas) return;
            const ctx = canvas.getContext('2d')!;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setDrawn(false);
            onChange(null);
          }}
        >
          Clear
        </button>
      </div>
    </div>
  );
}

export function Register() {
  const { token = '' } = useParams();
  const [ctx, setCtx] = useState<RegistrationContext | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<RegistrationSubmission>({ idType: 'Passport' });
  const [idPhoto, setIdPhoto] = useState<{ mime: string; data: string } | null>(null);
  const [signature, setSignature] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let live = true;
    fetchRegistration(token)
      .then((c) => {
        if (!live) return;
        setCtx(c);
        // A guest correcting a mistake should see what they wrote, not a blank
        // form that silently replaces it.
        if (c.previous) setForm({ idType: 'Passport', ...c.previous });
      })
      .catch((e) => { if (live) setLoadError(e?.message ?? 'This link is not valid.'); });
    return () => { live = false; };
  }, [token]);

  const set = <K extends keyof RegistrationSubmission>(k: K, v: RegistrationSubmission[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  async function submit() {
    setSending(true);
    setSendError(null);
    try {
      await sendRegistration(token, {
        ...form,
        idPhoto: idPhoto ?? undefined,
        signature: signature ? { mime: 'image/png', data: signature } : undefined,
      });
      setDone(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setSendError((e as { message?: string })?.message ?? 'Could not send that. Try again.');
    } finally {
      setSending(false);
    }
  }

  if (loadError) {
    return (
      <Shell>
        <h1 className="text-xl font-medium tracking-[-0.02em]">This link cannot be opened</h1>
        <p className="mt-3 text-[13px] leading-relaxed text-slate-500">{loadError}</p>
        <p className="mt-4 text-[13px] leading-relaxed text-slate-500">
          Ask reception to show you the code again â€” a new one is generated each time.
        </p>
      </Shell>
    );
  }

  if (!ctx) {
    return (
      <Shell>
        <div className="h-5 w-40 animate-pulse rounded bg-slate-200" />
        <div className="mt-4 h-32 animate-pulse rounded-xl bg-slate-100" />
      </Shell>
    );
  }

  if (done) {
    return (
      <Shell>
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white">
          âœ“
        </div>
        <h1 className="mt-4 text-xl font-medium tracking-[-0.02em]">Thank you, {ctx.guest}</h1>
        <p className="mt-3 text-[13px] leading-relaxed text-slate-500">
          Your details have gone to the front desk. A member of staff will check them and finish
          your check-in â€” you do not need to do anything else on this phone.
        </p>
        <button
          type="button"
          className="mt-6 w-full rounded-full border border-slate-300 py-3 text-[13px] font-medium"
          onClick={() => setDone(false)}
        >
          Change something
        </button>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
        {ctx.property}
      </p>
      <h1 className="mt-1 text-xl font-medium tracking-[-0.02em]">Check in</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-slate-500">
        {ctx.guest} Â· {ctx.roomType}
        <br />
        {ctx.arrival} â†’ {ctx.departure} Â· {ctx.nights} night{ctx.nights === 1 ? '' : 's'}
      </p>
      {ctx.submitted && (
        <p className="mt-3 rounded-xl bg-amber-50 px-3.5 py-2.5 text-[12px] leading-relaxed text-amber-900">
          You have already sent your details. Anything you change here replaces them.
        </p>
      )}

      <div className="mt-7 space-y-5">
        <Section title="Your details">
          <div className="grid grid-cols-2 gap-3">
            <label>
              <Label>First name</Label>
              <input className={field} value={form.firstName ?? ''}
                onChange={(e) => set('firstName', e.target.value)} autoComplete="given-name" />
            </label>
            <label>
              <Label>Last name</Label>
              <input className={field} value={form.lastName ?? ''}
                onChange={(e) => set('lastName', e.target.value)} autoComplete="family-name" />
            </label>
          </div>
          <label className="block">
            <Label>Date of birth</Label>
            <input className={field} type="date" value={form.dob ?? ''}
              onChange={(e) => set('dob', e.target.value)} />
          </label>
          <label className="block">
            <Label>Nationality</Label>
            <input className={field} value={form.nationality ?? ''}
              onChange={(e) => set('nationality', e.target.value)} autoComplete="country-name" />
          </label>
        </Section>

        <Section title="How we can reach you">
          <label className="block">
            <Label>Email</Label>
            <input className={field} type="email" inputMode="email" value={form.email ?? ''}
              onChange={(e) => set('email', e.target.value)} autoComplete="email" />
          </label>
          <label className="block">
            <Label>Phone</Label>
            <input className={field} type="tel" inputMode="tel" value={form.phone ?? ''}
              onChange={(e) => set('phone', e.target.value)} autoComplete="tel" />
          </label>
          <label className="block">
            <Label>Address</Label>
            <input className={field} placeholder="Street" value={form.address?.line1 ?? ''}
              onChange={(e) => set('address', { ...form.address, line1: e.target.value })}
              autoComplete="address-line1" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <input className={field} placeholder="City" value={form.address?.city ?? ''}
              onChange={(e) => set('address', { ...form.address, city: e.target.value })}
              autoComplete="address-level2" />
            <input className={field} placeholder="Postcode" value={form.address?.postcode ?? ''}
              onChange={(e) => set('address', { ...form.address, postcode: e.target.value })}
              autoComplete="postal-code" />
          </div>
          <input className={field} placeholder="Country" value={form.address?.country ?? ''}
            onChange={(e) => set('address', { ...form.address, country: e.target.value })}
            autoComplete="country-name" />
        </Section>

        <Section title="Identity document">
          <label className="block">
            <Label>Type</Label>
            <select className={field} value={form.idType ?? 'Passport'}
              onChange={(e) => set('idType', e.target.value)}>
              {ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </label>
          <label className="block">
            <Label>Number</Label>
            <input className={field} value={form.idNumber ?? ''}
              onChange={(e) => set('idNumber', e.target.value)} autoCapitalize="characters" />
          </label>
          <label className="block">
            <Label>Expiry date</Label>
            <input className={field} type="date" value={form.idExpiry ?? ''}
              onChange={(e) => set('idExpiry', e.target.value)} />
          </label>

          <div>
            <Label hint="Photograph the page with your name and number on it.">
              Photo of the document
            </Label>
            <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white px-4 py-6 text-[13px] font-medium text-slate-600">
              {idPhoto ? 'Photo attached â€” tap to replace'
                : ctx.hasIdPhoto ? 'Already sent â€” tap to replace'
                  : 'Take a photo'}
              <input
                type="file" accept="image/*" capture="environment" className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) setIdPhoto(await shrink(f));
                }}
              />
            </label>
            {idPhoto && (
              <img src={idPhoto.data} alt="The document you photographed"
                className="mt-3 max-h-48 w-full rounded-xl object-contain" />
            )}
          </div>
        </Section>

        <Section title="Signature">
          <SignaturePad onChange={setSignature} />
          {ctx.hasSignature && !signature && (
            <p className="text-[11px] text-slate-400">
              A signature has already been sent. Sign again only to replace it.
            </p>
          )}
        </Section>

        <label className="flex items-start gap-3">
          <input type="checkbox" className="mt-1 h-4 w-4"
            checked={form.marketingConsent === true}
            onChange={(e) => set('marketingConsent', e.target.checked)} />
          <span className="text-[12px] leading-relaxed text-slate-500">
            {ctx.property} may email me about offers. Nothing to do with this stay depends on this.
          </span>
        </label>

        {sendError && (
          <p className="rounded-xl bg-red-50 px-3.5 py-3 text-[12px] leading-relaxed text-red-700">
            {sendError}
          </p>
        )}

        <button
          type="button"
          disabled={sending}
          onClick={submit}
          className="w-full rounded-full bg-ink py-4 text-[14px] font-medium text-white disabled:opacity-50"
        >
          {sending ? 'Sendingâ€¦' : ctx.submitted ? 'Update my details' : 'Send to reception'}
        </button>

        <p className="pb-10 text-center text-[11px] leading-relaxed text-slate-400">
          Your details go straight to {ctx.property}&apos;s front desk, where a member of staff
          checks them before your check-in is completed. The photograph is stored encrypted and
          deleted automatically after your stay.
        </p>
      </div>
    </Shell>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3 rounded-[20px] border border-slate-200/70 bg-white p-5">
      <h2 className="text-[13px] font-semibold">{title}</h2>
      {children}
    </section>
  );
}

/**
 * No site chrome. There is no navigation off this page on purpose: it is a form
 * somebody is filling in at a counter, not a visit to the website.
 */
function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <div className="mx-auto w-full max-w-md px-5 py-10">{children}</div>
    </div>
  );
}
