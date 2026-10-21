"use client";

import {
  useCallback,
  useState,
  type CSSProperties,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
} from "lucide-react";
import { features, useCases, faqs, recordingPoints, selfHostPoints, pricingPlans } from "@/data/data";

import { FaEnvelope, FaGithub } from "react-icons/fa";

import PageTitle from "@/components/PageTitle";
import { SpaceBlueprint } from "@/components/SpaceBlueprint";
import Link from "next/link";
import { VideoLinkDemo } from "@/components/landing/VideoLinkDemo";
import { LanguageSelectDemo } from "@/components/landing/LanguageSelectDemo";
import { CaptionAlongsideDemo } from "@/components/landing/ScriptDemo";
import { ReadyToShareDemo } from "@/components/landing/ReadyToShareDemo";
import { UseCasesShowcase } from "@/components/landing/UseCaseShowcase";

// Snappy easeOutExpo curve so things decelerate cleanly instead of drifting.
const EASE = [0.16, 1, 0.3, 1] as const;
// The marketing site intentionally has a fixed light palette, independent of
// the theme selected elsewhere in the app.
const landingLightTheme: CSSProperties & Record<`--${string}`, string> = {
  "--background": "#ffffff",
  "--foreground": "#131313",
  "--primary": "#f0f0f0",
  "--muted": "#e2e2e2",
  "--brand": "#0041aa",
  "--border": "#dcdcdc",
  "--selection-background": "#131313",
  "--selection-text": "#ffffff",
};

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.18, delayChildren: 0.1 },
  },
};

const riseVariants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1, ease: EASE },
  },
};

const boxVariants = {
  hidden: { opacity: 0, scale: 0.96, y: 16 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 1.2, ease: EASE },
  },
};


const SectionDivider = () => (
  <div className="hidden border-t border-[#dcdcdc] md:block" />
);

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  const handleMobileNavClick = useCallback((id: string) => {
    setMobileMenuOpen(false);
    window.history.pushState(null, "", `#${id}`);
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, []);

  return (
    <div
      className="min-h-screen bg-[#ffffff] text-[#131313]"
      style={landingLightTheme}
    >
      <PageTitle
        title="Home"
        description="DubFlow helps you dub videos into other languages with studio-quality recording. Open source and easy to self-host."
      />
      <main className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden bg-[#ffffff] px-4 pt-24 sm:px-6 sm:pt-28">
        <div className="absolute inset-0 z-0 bg-[url('/img/bg.png')] bg-cover bg-bottom" />

        <header className="absolute inset-x-0 top-0 z-20">
          <nav className="mx-auto grid max-w-5xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center px-4 py-3 sm:px-0">
            <Link href="/" className="flex items-center gap-2 justify-self-start">
              <img
                src="/logo/logo-dark.png"
                className="h-full w-[24px] select-none"
                alt="DubFlow"
              />
              <span className="text-lg font-bold uppercase text-white">
                DubFlow
              </span>
            </Link>

            <nav
              aria-label="Landing page navigation"
              className="col-start-2 hidden items-center gap-2 justify-self-center text-sm font-medium text-white/80 md:flex"
            >
              <a
                href="#features"
                className="rounded-full px-3 py-2 transition-colors hover:bg-white/10 hover:text-white"
              >
                Features
              </a>
              <a
                href="#use-cases"
                className="rounded-full px-3 py-2 transition-colors hover:bg-white/10 hover:text-white"
              >
                Use cases
              </a>
              <a
                href="#privacy"
                className="rounded-full px-3 py-2 transition-colors hover:bg-white/10 hover:text-white"
              >
                Privacy
              </a>
              <a
                href="#pricing"
                className="rounded-full px-3 py-2 transition-colors hover:bg-white/10 hover:text-white"
              >
                Pricing
              </a>
            </nav>

            <div className="col-start-3 flex items-center justify-self-end gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setMobileMenuOpen((open) => !open)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
                className="flex size-9 cursor-pointer items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 md:hidden"
              >
                {mobileMenuOpen ? (
                  <X className="size-5" />
                ) : (
                  <Menu className="size-5" />
                )}
              </button>
            </div>
          </nav>

          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25, ease: EASE }}
                className="overflow-hidden md:hidden"
              >
                <nav
                  aria-label="Mobile navigation"
                  className="mx-4 mb-3 flex flex-col gap-1 rounded-2xl bg-[#0041aa] p-3 shadow-[0_16px_40px_rgba(0,0,0,0.25)]"
                >
                  <a
                    href="#features"
                    onClick={(event) => {
                      event.preventDefault();
                      handleMobileNavClick("features");
                    }}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Features
                  </a>
                  <a
                    href="#use-cases"
                    onClick={(event) => {
                      event.preventDefault();
                      handleMobileNavClick("use-cases");
                    }}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Use cases
                  </a>
                  <a
                    href="#privacy"
                    onClick={(event) => {
                      event.preventDefault();
                      handleMobileNavClick("privacy");
                    }}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Privacy
                  </a>
                  <a
                    href="#pricing"
                    onClick={(event) => {
                      event.preventDefault();
                      handleMobileNavClick("pricing");
                    }}
                    className="rounded-xl px-4 py-3 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    Pricing
                  </a>
                </nav>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative z-10 flex w-full max-w-5xl flex-col items-start gap-3 pt-6 pb-20 text-left sm:pt-8"
        >
          <motion.h1
            variants={riseVariants}
            className="font-bricolage max-w-4xl text-3xl font-semibold leading-[1.2] text-white sm:text-[2.5rem]"
          >
            Dub any video into a language your audience understands
          </motion.h1>

          <motion.p
            variants={riseVariants}
            className="-mt-1 max-w-xl text-sm font-normal text-white/80 sm:text-base"
          >
            Studio-quality recording, open-source at its core. Self-host it free
            or let us handle the infra.
          </motion.p>

          <motion.div
            variants={riseVariants}
            className="mt-3 flex flex-wrap items-center gap-3"
          >
            <a
              href="https://github.com/hrshya/dubflow"
              target="_blank"
              rel="noopener noreferrer"
              className="flex select-none cursor-pointer items-center gap-2 rounded-full bg-[#131313] px-4.5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#131313]/90"
            >
              <FaGithub className="size-4" />
              Star on GitHub
            </a>
          </motion.div>

          <div className="relative mt-8 w-full">
            <motion.div
              variants={boxVariants}
              className="relative z-10 aspect-[3/4] w-full overflow-hidden rounded-2xl bg-background shadow-[0_0_12px_rgba(0,0,0,0.18),0_0_45px_rgba(0,0,0,0.08),0_0_90px_rgba(0,0,0,0.05)] sm:aspect-video"
            >
              <SpaceBlueprint />
            </motion.div>
          </div>
        </motion.section>
      </main>

      <div className="mx-auto max-w-6xl border-x-0 border-[#dcdcdc] md:border-x">
        <section id="features" className="bg-[#ffffff] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div
            className="max-w-xl"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={riseVariants}
          >
            <p className="text-sm font-medium text-[#131313]/60">Features</p>
            <h2 className="font-bricolage mt-2 text-2xl font-semibold tracking-tight text-[#131313] sm:text-3xl">
              Everything you need to create a video dub
            </h2>
            <p className="mt-3 text-base leading-7 text-[#131313]/70">
              From capture to sharing, DubFlow handles the whole workflow so you
              can focus on the recording itself.
            </p>
          </motion.div>

          <motion.div
            className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
          >
            {features.map(({ icon: Icon, title, description }) => (
              <motion.article
                key={title}
                variants={riseVariants}
                className="flex flex-col rounded-2xl border border-[#dcdcdc] bg-[#ffffff] p-6"
              >
                <div className="flex size-11 items-center justify-center rounded-xl bg-[#eaeaea] text-[#131313]">
                  <Icon className="size-5" />
                </div>
                <h3 className="font-bricolage mt-5 text-lg font-semibold tracking-tight text-[#131313]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#131313]/65">
                  {description}
                </p>
                <div className="relative mt-6 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-[url('/img/feature-bg.png')] bg-cover bg-center px-5 sm:aspect-[16/10]">
                  {title === "Start with a video link" && (
                    <VideoLinkDemo />
                  )}
                  {title === "Choose your target language" && (
                    <LanguageSelectDemo />
                  )}
                  {title === "Get the script alongside it" && <CaptionAlongsideDemo />}
                  {title === "A video ready to share" && <ReadyToShareDemo />}
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      <section id="use-cases" className="bg-[#ffffff] px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <motion.div
            className="max-w-xl"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={riseVariants}
          >
            <p className="text-sm font-medium text-[#131313]/60">Use cases</p>
            <h2 className="font-bricolage mt-2 text-2xl font-semibold tracking-tight text-[#131313] sm:text-3xl">
              Make your videos accessible to more people
            </h2>
            <p className="mt-3 text-base leading-7 text-[#131313]/70">
              From solo creators to compliance-sensitive teams, here is who
              records with DubFlow.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={riseVariants}
          >
            <UseCasesShowcase items={useCases} />
          </motion.div>
        </div>
      </section>

      <SectionDivider />

      <section id="faq" className="bg-[#ffffff] px-4 py-20 sm:px-6">
        <motion.div
          className="mx-auto grid max-w-5xl gap-10 md:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] md:gap-16"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div variants={riseVariants}>
            <p className="text-sm font-medium text-[#131313]/60">
              FAQ
            </p>
            <h2 className="font-bricolage mt-2 text-2xl font-semibold tracking-tight text-[#131313] sm:text-3xl">
              Everything you need to know about video dubbing
            </h2>
          </motion.div>

          <motion.div
            variants={riseVariants}
            className="divide-y divide-[#dcdcdc] border-y border-[#dcdcdc]"
          >
            {faqs.map(({ question, answer }, index) => {
              const isOpen = openFaq === index;
              return (
                <div key={question} className="py-5">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    aria-expanded={isOpen}
                    className="group flex w-full cursor-pointer items-center justify-between gap-4 text-left text-base font-medium text-[#131313] transition-colors hover:text-[#0041aa]"
                  >
                    {question}
                    <span
                      className={`text-xl font-normal text-[#131313]/55 transition-[transform,color] duration-300 group-hover:text-[#0041aa] ${
                        isOpen ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-xl pt-3 text-sm leading-6 text-[#131313]/65">
                        {answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </section>
      </div>

      <footer className="relative overflow-hidden bg-[url('/img/hero-bg.jpg')] bg-cover bg-top px-4 py-20 sm:px-6 sm:py-24">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
        <motion.div
          className="relative mx-auto grid max-w-5xl gap-12 sm:grid-cols-[1.4fr_1fr_1fr]"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.div variants={riseVariants}>
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/logo/logo-dark.png"
                className="w-7 select-none"
                alt="DubFlow"
              />
              <span className="font-bricolage text-xl font-bold uppercase text-white">
                DubFlow
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-base leading-7 text-white/70">
              Translate and dub your videos with AI powered voices, and manage
              every version in one place.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              <a
                href="https://github.com/hrshya/DubFlow"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:bg-white/15"
              >
                <FaGithub className="size-4" />
              </a>
              <a
                href="mailto:harshyadav6078@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Email"
                className="flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-white transition-colors hover:bg-white/15"
              >
                <FaEnvelope className="size-4" />
              </a>
            </div>
          </motion.div>

          <motion.div variants={riseVariants}>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/50">
              Product
            </p>
            <div className="mt-4 flex flex-col gap-3 text-base text-white/75">
              <a href="#features" className="w-fit hover:text-white">
                Features
              </a>
              <a href="#use-cases" className="w-fit hover:text-white">
                Use cases
              </a>
              <a href="#privacy" className="w-fit hover:text-white">
                Privacy
              </a>
              <a href="#pricing" className="w-fit hover:text-white">
                Pricing
              </a>
            </div>
          </motion.div>

          <motion.div variants={riseVariants}>
            <p className="text-sm font-semibold uppercase tracking-wide text-white/50">
              Company
            </p>
            <div className="mt-4 flex flex-col gap-3 text-base text-white/75">
              <a
                href="mailto:harshyadav6078@gmail.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit hover:text-white"
              >
                Contact us
              </a>
              <a
                href="https://github.com/hrshya/DubFlow"
                target="_blank"
                rel="noopener noreferrer"
                className="w-fit hover:text-white"
              >
                GitHub
              </a>
            </div>
          </motion.div>
        </motion.div>
        <motion.div
          className="relative mx-auto mt-12 flex max-w-5xl flex-col gap-2 border-t border-white/20 pt-6 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          variants={riseVariants}
        >
          <p>
            © {new Date().getFullYear()} DubFlow. Open source under the MIT
            License.
          </p>
          <p className="text-white/50">Built for everyone who enjoys content in their language.</p>
        </motion.div>
      </footer>
    </div>
  );
};
