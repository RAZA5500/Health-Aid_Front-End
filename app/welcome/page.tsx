"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import DoctorIllustration from "@/components/illustrations/DoctorIllustration";
import HealthAidLogo from "@/components/illustrations/HealthAidLogo";
import WaveDecoration from "@/components/illustrations/WaveDecoration";

const slides = [
  {
    title: "Welcome to HealthAid",
    description: "Your personal health companion for a safe and joyful pregnancy journey.",
  },
  {
    title: "Track Every Milestone",
    description: "Monitor kicks, appointments, medications, and your baby's growth week by week.",
  },
  {
    title: "Expert Care, Anytime",
    description: "Connect with doctors, join our community, and get tips tailored to your trimester.",
  },
];

export default function WelcomePage() {
  const [step, setStep] = useState(0);
  const router = useRouter();
  const slide = slides[step];
  const isLastSlide = step === slides.length - 1;

  const handleNext = () => {
    if (step < slides.length - 1) setStep(step + 1);
    else router.push("/signup");
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-b from-background via-primary/[0.04] to-background">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl sm:h-96 sm:w-96"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 bottom-40 h-64 w-64 rounded-full bg-coral/50 blur-3xl sm:h-80 sm:w-80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute right-1/4 top-1/3 hidden h-48 w-48 rounded-full bg-lavender/60 blur-3xl lg:block"
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 pb-4 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] sm:px-8 sm:pt-[calc(env(safe-area-inset-top,0px)+2rem)] lg:px-12 lg:pt-[calc(env(safe-area-inset-top,0px)+2.5rem)]">
        <div className="flex items-center gap-3">
          <HealthAidLogo size={36} animated />
          <span className="text-sm font-semibold text-gray-800 sm:text-base">HealthAid</span>
        </div>
        <button
          type="button"
          onClick={() => router.push("/signup")}
          className="rounded-full px-3 py-1.5 text-sm font-medium text-gray-500 transition-colors hover:bg-primary/10 hover:text-primary"
        >
          Skip
        </button>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-8 px-6 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:gap-16 lg:px-12 lg:py-10">
        <div className="flex w-full flex-shrink-0 items-center justify-center lg:w-auto lg:flex-1">
          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-0 scale-110 rounded-full bg-primary/10 blur-2xl"
            />
            <DoctorIllustration
              key={step}
              className="welcome-fade-in relative h-60 w-52 sm:h-72 sm:w-64 md:h-80 md:w-72 lg:h-[22rem] lg:w-80 xl:h-96 xl:w-[22rem]"
            />
          </div>
        </div>

        <div className="flex w-full max-w-md flex-col items-center text-center lg:max-w-lg lg:flex-1 lg:items-start lg:text-left">
          <div key={step} className="welcome-fade-in">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary/80 sm:text-sm">
              Step {step + 1} of {slides.length}
            </p>
            <h1 className="mb-3 text-2xl font-bold leading-tight text-primary sm:text-3xl lg:text-4xl">
              {slide.title}
            </h1>
            <p className="max-w-xs text-[15px] leading-relaxed text-gray-500 sm:max-w-sm sm:text-base lg:max-w-md">
              {slide.description}
            </p>
          </div>

          <div className="mt-8 flex gap-2 sm:mt-10">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === step ? "step" : undefined}
                onClick={() => setStep(i)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === step ? "w-7 bg-primary" : "w-2 bg-gray-200 hover:bg-gray-300"
                }`}
              />
            ))}
          </div>

          <div className="mt-8 hidden w-full max-w-sm lg:block">
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary flex w-full items-center justify-center gap-2 py-3.5"
            >
              {isLastSlide ? "Get Started" : "Continue"}
              <ArrowRight size={20} strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </main>

      <footer className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-6 pb-4 safe-bottom sm:px-8 lg:hidden">
        <button
          type="button"
          onClick={handleNext}
          aria-label={isLastSlide ? "Get started" : "Next slide"}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30 transition-all hover:bg-primary-dark active:scale-95"
        >
          <ArrowRight size={28} strokeWidth={2.5} />
        </button>
        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary">
            Sign In
          </Link>
        </p>
      </footer>

      <div className="relative z-10 hidden lg:block">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-12 pb-6">
          <p className="text-sm text-gray-500">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary">
              Sign In
            </Link>
          </p>
        </div>
        <WaveDecoration className="h-20 w-full shrink-0" />
      </div>

      <div className="relative z-10 lg:hidden">
        <WaveDecoration className="h-16 w-full shrink-0" />
      </div>
    </div>
  );
}
