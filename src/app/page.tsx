// ===============================
// MikroMile — Landing Page (DESIGN.md system)
// ===============================
// Built per DESIGN.md ("Design System Inspired by Starbucks").
// Color-block rhythm: black strip → white nav → cream hero → white content →
// dark-green feature band → cream utility zone → dark-green footer.
// SoDoSans substitute per DESIGN.md "Known Gaps": Inter (already loaded in
// layout.tsx via next/font), tight tracking preserved at -0.01em / -0.16px.

'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
    Boxes,
    Route,
    Star,
    Timer,
    ShoppingBag,
    ArrowRight,
    Menu,
    X,
    Truck,
    BadgePercent,
    CheckCircle2,
} from 'lucide-react';

// ---------- Shared pill button recipes (DESIGN.md §4 Buttons) ----------
// Full-pill 50px radius everywhere, scale(0.95) active, 0.2s ease transition.
const pillBase =
    'group inline-flex items-center justify-center gap-2 rounded-[50px] transition-all duration-200 ease-in-out active:scale-[0.95] whitespace-nowrap';
const pillFonts16 = 'font-semibold text-[16px] tracking-[-0.01em]';
const pillFonts14 = 'font-semibold text-[14px] tracking-[-0.01em]';

type PillVariant =
    | 'primaryFilled'      // Green Accent fill
    | 'primaryOutlined'    // transparent, Green Accent text/border
    | 'blackFilled'        // Join now
    | 'darkOutlined'       // Sign in
    | 'greenOnGreenInverted' // white fill, green text (on House Green bands)
    | 'outlinedOnDark';    // white outline (on House Green bands)

const pillRecipes: Record<PillVariant, string> = {
    primaryFilled: 'bg-[#00754A] border border-[#00754A] text-white hover:bg-[#006241] hover:border-[#006241]',
    primaryOutlined: 'bg-transparent border border-[#00754A] text-[#00754A] hover:bg-[#00754A]/[0.06]',
    blackFilled: 'bg-black border border-black text-white hover:opacity-90',
    darkOutlined:
        'bg-transparent border border-[rgba(0,0,0,0.87)] text-[rgba(0,0,0,0.87)] hover:bg-[rgba(0,0,0,0.06)]',
    greenOnGreenInverted: 'bg-white border border-white text-[#00754A] hover:bg-[rgba(255,255,255,0.9)]',
    outlinedOnDark: 'bg-transparent border border-white text-white hover:bg-[rgba(255,255,255,0.1)]',
};

function Pill({
    variant,
    size = 'md',
    href,
    children,
    className = '',
}: {
    variant: PillVariant;
    size?: 'md' | 'sm';
    href: string;
    children: React.ReactNode;
    className?: string;
}) {
    // Standard padding 7px 16px (DESIGN.md). Hero CTAs use the 16px font tier.
    return (
        <Link
            href={href}
            className={`${pillBase} ${size === 'md' ? `${pillFonts16} px-6 py-[9px]` : `${pillFonts14} px-4 py-[7px]`} ${pillRecipes[variant]} ${className}`}
        >
            {children}
        </Link>
    );
}

// ---------- Content card shadow (DESIGN.md §6) ----------
const cardShadow =
    'shadow-[0px_0px_0.5px_0px_rgba(0,0,0,0.14),0px_1px_1px_0px_rgba(0,0,0,0.24)]';
const cardBase = `rounded-[12px] bg-white ${cardShadow}`;

// ---------- Motion helpers (styles live in globals.css `mm-` block) ----------
// Reveal: one-shot entrance when the element scrolls into view. Reduced-motion
// users get the final state instantly (CSS neutralizes the animation).
function Reveal({
    children,
    delay = 0,
    className = '',
}: {
    children: React.ReactNode;
    delay?: number;
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.classList.add('is-in');
                    io.disconnect();
                }
            },
            { threshold: 0.15 }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    return (
        <div ref={ref} className={`mm-reveal ${className}`} style={{ animationDelay: `${delay}ms` }}>
            {children}
        </div>
    );
}

// CountUp removed — its only consumer (the "25%" stat) was replaced with copy.

export default function LandingPage() {
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="bg-[#f2f0eb] text-[rgba(0,0,0,0.87)]">
            {/* ---------- Top-of-page CTA strip (Black, per §2) ---------- */}
            <div className="bg-black text-white">
                <div className="mx-auto flex max-w-[1440px] items-center justify-center gap-3 px-4 py-[9px] sm:px-6 lg:px-10">
                    <p className="hidden text-[14px] tracking-[-0.01em] sm:block">
                        Now live at VJTI Hostel — post your first trip or start your first group buy.
                    </p>
                    <p className="text-[14px] tracking-[-0.01em] sm:hidden">Now live at VJTI Hostel.</p>
                    <Pill variant="primaryFilled" size="sm" href="/login">
                        Join now
                    </Pill>
                </div>
            </div>

            {/* ---------- Global Nav (white, progressive heights 64/72/83/99) ---------- */}
            <header
                className={`sticky top-0 z-50 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1),0_2px_2px_rgba(0,0,0,0.06),0_0_2px_rgba(0,0,0,0.07)]`}
            >
                <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:h-[72px] sm:px-6 md:h-[83px] lg:h-[99px] lg:px-10">
                    {/* Wordmark */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#006241] text-[16px] font-bold text-white">
                            m
                        </span>
                        <span className="text-[24px] font-semibold tracking-[-0.16px] text-[#006241] font-display">
                            MikroMile
                        </span>
                    </Link>

                    {/* Primary links (tablet+) */}
                    <nav className="hidden items-center gap-6 md:flex">
                        {[
                            { href: '/#group-buy', label: 'Group Buy' },
                            { href: '/#errands', label: 'Community Errands' },
                            { href: '/#rewards', label: 'Rewards' },
                        ].map((l) => (
                            <a
                                key={l.label}
                                href={l.href}
                                className="nav-underline text-[14px] font-medium tracking-[-0.01em] text-[rgba(0,0,0,0.87)]"
                            >
                                {l.label}
                            </a>
                        ))}
                    </nav>

                    {/* Nav CTAs: Sign in (dark outlined) + Join now (black filled) */}
                    <div className="hidden items-center gap-2 md:flex">
                        <Pill variant="darkOutlined" size="sm" href="/login">
                            Log in
                        </Pill>
                        <Pill variant="blackFilled" size="sm" href="/login">
                            Join now
                        </Pill>
                    </div>

                    {/* Hamburger (below tablet) */}
                    <button
                        aria-label="Toggle menu"
                        aria-expanded={menuOpen}
                        onClick={() => setMenuOpen((v) => !v)}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-[rgba(0,0,0,0.87)] md:hidden"
                    >
                        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {/* Mobile drawer */}
                {menuOpen && (
                    <nav className="border-t border-[rgba(0,0,0,0.06)] bg-white px-4 py-4 sm:px-6 md:hidden">
                        <ul className="space-y-1">
                            {[
                                { href: '/#group-buy', label: 'Group Buy' },
                                { href: '/#errands', label: 'Community Errands' },
                                { href: '/#rewards', label: 'Rewards' },
                            ].map((l) => (
                                <li key={l.label}>
                                    <a
                                        href={l.href}
                                        onClick={() => setMenuOpen(false)}
                                        className="block rounded-[12px] px-3 py-2 text-[16px] tracking-[-0.01em] text-[rgba(0,0,0,0.87)] hover:bg-[#f9f9f9]"
                                    >
                                        {l.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-3 flex gap-2">
                            <Pill variant="darkOutlined" size="sm" href="/login" className="flex-1">
                                Log in
                            </Pill>
                            <Pill variant="blackFilled" size="sm" href="/login" className="flex-1">
                                Join now
                            </Pill>
                        </div>
                    </nav>
                )}
            </header>

            <main>
                {/* ---------- Hero (Neutral Warm cream, 60/40 split) ---------- */}
                <section className="relative overflow-hidden bg-[#f2f0eb]">
                    {/* Ambient motion: two soft rings drifting slowly over the cream canvas */}
                    <div
                        aria-hidden="true"
                        className="mm-drift pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full border-[10px] border-[#006241]/[0.05]"
                    />
                    <div
                        aria-hidden="true"
                        className="mm-drift-slow pointer-events-none absolute -bottom-28 left-[8%] h-96 w-96 rounded-full border-[12px] border-[#1E3932]/[0.04]"
                    />
                    <div className="relative mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-4 py-16 sm:px-6 md:grid-cols-[3fr_2fr] md:items-center lg:px-10 lg:py-[64px]">
                        {/* Content crate (60) */}
                        <div className="space-y-6">
                            <Reveal delay={0}>
                                <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-[rgba(0,0,0,0.58)]">
                                    Community commerce &amp; convenience
                                </p>
                            </Reveal>
                            {/* Hero heading — main idea (Group Buy) leads, secondary idea (Errands) follows */}
                            <Reveal delay={120}>
                                <h1 className="font-display text-[45px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#006241] max-sm:text-[38px] xl:text-[58px]">
                                    Group buy the essentials.
                                    <br />
                                    <span className="font-serif font-medium italic tracking-[-0.01em]">
                                        Errand the rest.
                                    </span>
                                </h1>
                            </Reveal>
                            <Reveal delay={240}>
                                <p className="max-w-[560px] text-[19px] leading-[1.75] tracking-[-0.16px] text-[rgba(0,0,0,0.87)]">
                                    MikroMile pools your hostel&apos;s demand into one order at a local store
                                    &mdash; unlocking prices you could never get alone. And when someone is
                                    already heading out, they carry your last-minute items too.
                                </p>
                            </Reveal>
                            {/* CTA row */}
                            <Reveal delay={360}>
                                <div className="flex flex-wrap items-center gap-3 pt-2">
                                    <Pill variant="primaryFilled" href="/login">
                                        Start a Group Buy
                                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Pill>
                                    <Pill variant="primaryOutlined" href="/login">
                                        Community Errands
                                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Pill>
                                </div>
                            </Reveal>
                        </div>

                        {/* Visual crate (40): deal + trip as physical cards on the cream canvas */}
                        <div className="relative flex flex-col gap-4 md:pl-2">
                            <div
                                className={`${cardBase} mm-float max-w-[340px] p-6 transition-transform duration-300 md:-rotate-2 hover:rotate-0`}
                            >
                                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[rgba(0,0,0,0.58)]">
                                    Group Buy · Stationery
                                </p>
                                <p className="mt-2 text-[16px] font-semibold tracking-[-0.16px]">
                                    Notebook (200 pages, ruled)
                                </p>
                                <div className="mt-3 flex items-baseline gap-2">
                                    <span className="font-display text-[24px] font-semibold tracking-[-0.02em] text-[#006241]">
                                        ₹45
                                    </span>
                                    <span className="text-[14px] text-[rgba(0,0,0,0.58)] line-through">₹60</span>
                                    <span className="text-[13px] text-[rgba(0,0,0,0.58)]">at 50+ pledged</span>
                                </div>
                                {/* Progress: Green Light track, Green Accent fill */}
                                <div className="mt-4 h-2 w-full overflow-hidden rounded-[50px] bg-[#d4e9e2]">
                                    <div className="mm-grow h-full w-[74%] origin-left rounded-[50px] bg-[#00754A]" />
                                </div>
                                <p className="mt-2 flex items-center gap-1.5 text-[13px] tracking-[-0.01em] text-[rgba(0,0,0,0.58)]">
                                    <Timer className="mm-soft-pulse h-3.5 w-3.5" />
                                    37/50 pledged · 13 more to unlock
                                </p>
                            </div>

                            <div
                                className={`${cardBase} mm-float max-w-[340px] self-end p-6 transition-transform duration-300 md:rotate-[1.5deg] hover:rotate-0`}
                                style={{ animationDelay: '1.6s' }}
                            >
                                <div className="flex items-start gap-3">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d4e9e2] text-[#00754A]">
                                        <Route className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-[14px] font-semibold tracking-[-0.01em]">
                                            Collecting the MikroMile order
                                        </p>
                                        <p className="text-[13px] tracking-[-0.01em] text-[rgba(0,0,0,0.58)]">
                                            Sai Kirana · returns by 5 PM
                                        </p>
                                    </div>
                                </div>
                                <p className="mt-3 text-[13px] leading-[1.5] tracking-[-0.01em] text-[rgba(0,0,0,0.87)]">
                                    &ldquo;I&apos;m going to collect the group order at 5 PM — I can bring
                                    your notebooks to the hostel gate.&rdquo;
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ---------- Community ticker (House Green marquee, pauses on hover) ---------- */}
                <section
                    id="ticker"
                    aria-label="Live community deals and requests"
                    className="overflow-hidden bg-[#1E3932] py-[14px]"
                >
                    <div className="mm-marquee-track flex w-max items-center">
                        {[0, 1].map((copy) => (
                            <ul key={copy} aria-hidden={copy === 1} className="flex items-center">
                                {[
                                    'Notebooks ₹60 → ₹45',
                                    'Maggi 12-pack',
                                    'Printouts in 2 hrs',
                                    'Milk · daily',
                                    'Soap 4-pack',
                                    'Fever meds · urgent',
                                    'Snacks for Friday',
                                    'Power banks',
                                ].map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-center gap-8 pr-8 text-[14px] font-medium tracking-[-0.01em] text-[rgba(255,255,255,0.7)]"
                                    >
                                        {item}
                                        <span
                                            aria-hidden="true"
                                            className="h-1.5 w-1.5 rounded-full bg-[rgba(255,255,255,0.3)]"
                                        />
                                    </li>
                                ))}
                            </ul>
                        ))}
                    </div>
                </section>

                {/* ---------- How It Works (white content zone) ---------- */}
                <section id="how-it-works" className="bg-white">
                    <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-10 lg:py-[64px]">
                        <Reveal>
                            <div className="mx-auto max-w-[720px] text-center">
                                <h2 className="font-display text-[24px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#006241] sm:text-[28px]">
                                    Two ways to save, one community
                                </h2>
                                <p className="mt-3 text-[19px] leading-[1.75] tracking-[-0.16px] text-[rgba(0,0,0,0.58)]">
                                    Buy together when you can. Share a ride when you won&apos;t.
                                </p>
                            </div>
                        </Reveal>

                        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                            {/* Pillar A — main idea */}
                            <article id="group-buy" className={`group ${cardBase} scroll-mt-32 p-6 transition-all duration-300 hover:-translate-y-1 sm:p-[24px]`}>
                                <div className="flex items-center gap-3">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d4e9e2] text-[#00754A] transition-transform duration-300 group-hover:rotate-6">
                                        <Boxes className="h-5 w-5" />
                                    </span>
                                    <h3 className="font-display text-[24px] font-semibold tracking-[-0.02em] text-[#006241]">
                                        Group Buy
                                    </h3>
                                </div>
                                <p className="mt-3 text-[16px] leading-[1.5] tracking-[-0.01em] text-[rgba(0,0,0,0.58)]">
                                    Combine demand, unlock bulk discounts, and purchase together.
                                </p>
                                <ul className="mt-5 space-y-4">
                                    {[
                                        'Pledge what you need — notebooks, snacks, soap, milk.',
                                        'Hit the minimum and the store applies the bulk price to your unit.',
                                        'One consolidated order, collected together at a hostel pickup point.',
                                    ].map((step, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#00754A]" />
                                            <span className="text-[16px] leading-[1.5] tracking-[-0.01em] text-[rgba(0,0,0,0.87)]">
                                                {step}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-6 rounded-[12px] bg-[#edebe9] px-4 py-3 text-[14px] leading-[1.5] tracking-[-0.01em] text-[rgba(0,0,0,0.87)]">
                                    <span className="font-semibold text-[#006241]">Example:</span> a notebook
                                    costs ₹60 alone — pledge 50 and everyone pays ₹45.
                                </div>
                            </article>

                            {/* Pillar B — secondary idea */}
                            <article id="errands" className={`group ${cardBase} scroll-mt-32 p-6 transition-all duration-300 hover:-translate-y-1 sm:p-[24px]`}>
                                <div className="flex items-center gap-3">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d4e9e2] text-[#00754A] transition-transform duration-300 group-hover:rotate-6">
                                        <Route className="h-5 w-5" />
                                    </span>
                                    <h3 className="font-display text-[24px] font-semibold tracking-[-0.02em] text-[#006241]">
                                        Community Errands
                                    </h3>
                                </div>
                                <p className="mt-3 text-[16px] leading-[1.5] tracking-[-0.01em] text-[rgba(0,0,0,0.58)]">
                                    Get items bought or collected by someone already going out.
                                </p>
                                <ul className="mt-5 space-y-4">
                                    {[
                                        'Post your trip — where you are heading and when you will return.',
                                        'Neighbors request small items; you accept what you can carry.',
                                        'Hand off at a shared point, earn reward points and ratings.',
                                    ].map((step, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#00754A]" />
                                            <span className="text-[16px] leading-[1.5] tracking-[-0.01em] text-[rgba(0,0,0,0.87)]">
                                                {step}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                                <div className="mt-6 rounded-[12px] bg-[#edebe9] px-4 py-3 text-[14px] leading-[1.5] tracking-[-0.01em] text-[rgba(0,0,0,0.87)]">
                                    <span className="font-semibold text-[#006241]">Urgent stuff too:</span>{' '}
                                    fever medicine, printouts, a phone cable — in your hostel lobby within
                                    hours.
                                </div>
                            </article>
                        </div>
                    </div>
                </section>

                {/* ---------- Feature band (House Green, 40/60 split) ---------- */}
                <section className="bg-[#1E3932]">
                    <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[3fr_2fr] lg:items-center lg:px-10 lg:py-[64px]">
                        {/* Left: 60% copy + CTA pair */}
                        <div className="space-y-6">
                            <Reveal delay={0}>
                                <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-[rgba(255,255,255,0.7)]">
                                    Better together
                                </p>
                            </Reveal>
                            <Reveal delay={120}>
                                <h2 className="font-display text-[45px] font-semibold leading-[1.2] tracking-[-0.02em] text-white max-sm:text-[38px]">
                                    One order. One trip.
                                    <br />
                                    Zero{' '}
                                    <span className="font-serif font-medium italic tracking-[-0.01em]">
                                        delivery fees
                                    </span>
                                    .
                                </h2>
                            </Reveal>
                            <Reveal delay={240}>
                                <p className="max-w-[560px] text-[19px] leading-[1.75] tracking-[-0.16px] text-[rgba(255,255,255,0.7)]">
                                    40 students pledge notebooks. Sharma Book Depot prepares one consolidated
                                    order. Aman is already going that way — so he brings the whole thing to the
                                    hostel gate. No store delivering 40 separate parcels, no extra trips.
                                </p>
                            </Reveal>
                            <Reveal delay={340}>
                                <p className="max-w-[560px] text-[16px] leading-[1.5] tracking-[-0.01em] text-[rgba(255,255,255,0.7)]">
                                    And when no helper is free, nothing breaks — you simply collect the order
                                    yourself. Group buys never wait on an errand.
                                </p>
                            </Reveal>
                            <Reveal delay={460}>
                                <div className="flex flex-wrap items-center gap-3 pt-2">
                                    <Pill variant="greenOnGreenInverted" href="/login">
                                        Start a Group Buy
                                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Pill>
                                    <Pill variant="outlinedOnDark" href="/login">
                                        Post a Trip
                                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                    </Pill>
                                </div>
                            </Reveal>
                        </div>

                        {/* Right: 40% — in-band card mock */}
                        <div
                            className={`${cardBase} mm-float max-w-[340px] p-6 lg:justify-self-end`}
                            style={{ animationDelay: '0.9s' }}
                        >
                            <div className="flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#d4e9e2] text-[#00754A]">
                                    <Boxes className="h-5 w-5" />
                                </span>
                                <div>
                                    <p className="text-[14px] font-semibold tracking-[-0.01em]">
                                        Group order ready — collect at Hostel Gate A
                                    </p>
                                    <p className="text-[13px] tracking-[-0.01em] text-[rgba(0,0,0,0.58)]">
                                        Notebooks × 40 · Sharma Book Depot
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 border-t border-[#e7e7e7] pt-4">
                                <p className="text-[13px] leading-[1.5] tracking-[-0.01em] text-[rgba(0,0,0,0.58)]">
                                    Aman&apos;s trip is carrying it —{" "}
                                    <span className="font-semibold text-[#00754A]">no delivery fee</span>{" "}
                                    charged, and the order was never split into 40 parcels.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ---------- Rewards utility zone (cream canvas, white cards) ---------- */}
                <section id="rewards" className="bg-[#edebe9]">
                    <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-10 lg:py-[64px]">
                        <Reveal>
                            <div className="mx-auto max-w-[720px] text-center">
                                {/* DESIGN.md: Rewards headline moments switch to the warm serif */}
                                <h2 className="font-serif text-[26px] font-medium italic leading-[1.2] tracking-[-0.01em] text-[#006241] sm:text-[30px]">
                                    Why your hostel wins with MikroMile
                                </h2>
                            </div>
                        </Reveal>

                        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
                            {/* Stat card */}
                            <div className={`group ${cardBase} p-6 transition-all duration-300 hover:-translate-y-1 sm:p-[24px]`}>
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d4e9e2] text-[#00754A] transition-transform duration-300 group-hover:rotate-6">
                                    <BadgePercent className="h-5 w-5" />
                                </span>
                                <h3 className="font-display text-[20px] font-semibold leading-[1.2] tracking-[-0.02em] text-[#006241]">
                                    Buy together. Save together.
                                </h3>
                                <p className="mt-2 text-[14px] leading-[1.5] tracking-[-0.01em] text-[rgba(0,0,0,0.58)]">
                                    Stores get consolidated demand, and your community gets access to
                                    negotiated bulk pricing.
                                </p>
                            </div>

                            <div className={`group ${cardBase} p-6 transition-all duration-300 hover:-translate-y-1 sm:p-[24px]`}>
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d4e9e2] text-[#00754A] transition-transform duration-300 group-hover:rotate-6">
                                    <Truck className="h-5 w-5" />
                                </span>
                                <p className="font-display mt-4 text-[32px] font-semibold tracking-[-0.02em] text-[#006241]">
                                    ₹0
                                </p>
                                <h3 className="text-[16px] font-semibold tracking-[-0.01em]">Delivery fees</h3>
                                <p className="mt-2 text-[14px] leading-[1.5] tracking-[-0.01em] text-[rgba(0,0,0,0.58)]">
                                    Existing foot traffic moves the day&apos;s boxes — nobody is hired.
                                </p>
                            </div>

                            {/* Rewards card — Gold is reserved for the rewards moment per DESIGN.md */}
                            <div className={`group ${cardBase} p-6 transition-all duration-300 hover:-translate-y-1 sm:p-[24px]`}>
                                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#d4e9e2] text-[#00754A] transition-transform duration-300 group-hover:rotate-6">
                                    <Star className="h-5 w-5" />
                                </span>
                                {/* Rewards Cost Pill styling (gold, 50px, 4px 12px) */}
                                <p className="mt-4 inline-block rounded-[50px] border border-[#cba258] px-3 py-1 text-[13px] font-bold tracking-[0.5px] text-[#cba258]">
                                    ★ 2 per unit
                                </p>
                                <h3 className="text-[16px] font-semibold tracking-[-0.01em]">
                                    For organizing group buys
                                </h3>
                                <p className="mt-2 text-[14px] leading-[1.5] tracking-[-0.01em] text-[rgba(0,0,0,0.58)]">
                                    Helpers and organizers earn stars on the community leaderboard.
                                </p>
                            </div>
                        </div>

                        {/* Closing CTA row */}
                        <Reveal>
                            <div className="mt-10 text-center">
                                <Pill variant="primaryFilled" href="/login">
                                    Join your hostel community
                                    <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                                </Pill>
                                <p className="mt-3 text-[13px] tracking-[-0.01em] text-[rgba(0,0,0,0.58)]">
                                    Free for students · demo accounts included · no delivery charges
                                </p>
                            </div>
                        </Reveal>
                    </div>
                </section>
            </main>

            {/* ---------- Footer (House Green with gold / white text) ---------- */}
            <footer className="bg-[#1E3932]">
                <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-10 lg:py-[64px]">
                    <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Brand */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[16px] font-bold text-[#006241]">
                                    m
                                </span>
                                <span className="text-[24px] font-semibold tracking-[-0.16px] text-white font-display">
                                    MikroMile
                                </span>
                            </div>
                            <p className="text-[14px] tracking-[-0.01em] text-[#dfc49d]">
                                Community commerce &amp; convenience.
                            </p>
                        </div>

                        {/* Link columns */}
                        {[
                            {
                                title: 'Buy together',
                                links: ['Open deals', 'Start a group buy', 'Pickup points'],
                            },
                            {
                                title: 'Errands',
                                links: ['Post a trip', 'Request an item', 'My requests'],
                            },
                            {
                                title: 'Community',
                                links: ['Leaderboard', 'Rewards', 'Invite your hostel'],
                            },
                        ].map((col) => (
                            <div key={col.title}>
                                <h4 className="text-[16px] font-semibold tracking-[-0.16px] text-white">
                                    {col.title}
                                </h4>
                                <ul className="mt-3 space-y-2">
                                    {col.links.map((l) => (
                                        <li key={l}>
                                            <Link
                                                href="/login"
                                                className="text-[14px] tracking-[-0.01em] text-[rgba(255,255,255,0.7)] hover:text-white hover:underline"
                                            >
                                                {l}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-[rgba(255,255,255,0.1)] pt-6 sm:flex-row">
                        <p className="text-[13px] tracking-[-0.01em] text-[rgba(255,255,255,0.7)]">
                            © {new Date().getFullYear()} MikroMile. Built by and for hostel residents.
                        </p>
                        <p className="text-[13px] tracking-[-0.01em] text-[rgba(255,255,255,0.7)]">
                            Micro-errands, macro-impact.
                        </p>
                    </div>
                </div>
            </footer>

            {/* ---------- Frap: floating circular CTA (DESIGN.md signature element) ---------- */}
            {/* 56px circle, Green Accent fill, layered shadow stack, -0.8rem touch offset
                (the wide p-[0.8rem] wrapper extends the tap area past the visual edge),
                ambient shadow collapses + scale(0.95) on press, soft pulse ring behind. */}
            <div className="fixed bottom-0 right-0 z-50 p-[0.8rem]">
                <Link
                    href="/login"
                    aria-label="Get started with MikroMile"
                    className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-[#00754A] text-white shadow-[0_0_6px_rgba(0,0,0,0.24),0_8px_12px_rgba(0,0,0,0.14)] transition-all duration-200 ease-in-out hover:bg-[#006241] active:scale-[0.95] active:shadow-[0_0_6px_rgba(0,0,0,0.24)]"
                >
                    <span
                        aria-hidden="true"
                        className="mm-ring pointer-events-none absolute inset-0 rounded-full bg-[#00754A]"
                    />
                    <ShoppingBag className="relative h-6 w-6 transition-transform duration-200 group-hover:-translate-y-0.5" />
                </Link>
            </div>
        </div>
    );
}
