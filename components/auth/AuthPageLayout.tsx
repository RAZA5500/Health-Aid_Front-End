"use client";

import Link from "next/link";
import DoctorIllustration from "@/components/illustrations/DoctorIllustration";
import HealthAidLogo from "@/components/illustrations/HealthAidLogo";
import WaveDecoration from "@/components/illustrations/WaveDecoration";
import { useAuth } from "@/context/AuthContext";

interface AuthPageLayoutProps {
  title: string;
  subtitle: string;
  brandingTitle: string;
  brandingDescription: string;
  illustration?: React.ReactNode;
  children: React.ReactNode;
}

export default function AuthPageLayout({
  title,
  subtitle,
  brandingTitle,
  brandingDescription,
  illustration,
  children,
}: AuthPageLayoutProps) {
  const { user } = useAuth();
  const brandHref = user ? "/dashboard" : "/welcome";
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

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center px-5 pb-4 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] sm:px-8 sm:pt-[calc(env(safe-area-inset-top,0px)+2rem)] lg:px-12 lg:pt-[calc(env(safe-area-inset-top,0px)+2.5rem)]">
        <Link href={brandHref} className="flex items-center gap-3 transition-opacity hover:opacity-80">
          <HealthAidLogo size={36} animated />
          <span className="text-sm font-semibold text-gray-800 sm:text-base">HealthAid</span>
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center gap-8 px-6 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-center lg:gap-12 lg:px-12 lg:py-10 xl:gap-16">
        <div className="hidden w-full flex-shrink-0 flex-col items-center lg:flex lg:w-auto lg:flex-1">
          <div className="relative">
            <div
              aria-hidden
              className="absolute inset-0 scale-110 rounded-full bg-primary/10 blur-2xl"
            />
            {illustration ?? <DoctorIllustration className="relative h-72 w-64 xl:h-96 xl:w-[22rem]" />}
          </div>
          <div className="mt-8 max-w-sm text-center">
            <h2 className="text-2xl font-bold text-primary xl:text-3xl">{brandingTitle}</h2>
            <p className="mt-3 text-base leading-relaxed text-gray-500">{brandingDescription}</p>
          </div>
        </div>

        <div className="flex w-full max-w-md flex-col sm:max-w-lg lg:max-w-lg lg:flex-1">
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <HealthAidLogo size={56} animated />
            <h1 className="mt-4 text-2xl font-bold text-gray-900">{title}</h1>
            <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
          </div>

          <div className="w-full lg:rounded-2xl lg:bg-white/90 lg:p-8 lg:shadow-xl lg:shadow-primary/5 lg:ring-1 lg:ring-gray-100 lg:backdrop-blur-sm xl:p-10">
            <div className="mb-8 hidden lg:block">
              <h1 className="text-2xl font-bold text-gray-900 xl:text-3xl">{title}</h1>
              <p className="mt-1 text-sm text-gray-500 sm:text-base">{subtitle}</p>
            </div>

            {children}
          </div>
        </div>
      </main>

      <div className="relative z-10 mt-auto w-full">
        <WaveDecoration className="h-16 w-full shrink-0 lg:h-20" />
      </div>
    </div>
  );
}
