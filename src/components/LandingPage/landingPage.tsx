"use client";


import { motion, Variants } from "framer-motion";
import Footer from "../layout/Footer";
import {
  TiWorld,
} from "react-icons/ti";
import { BiTrophy } from "react-icons/bi";
import { MdOutlineGroupAdd, MdVideoCameraFront } from "react-icons/md";
import { IoMdAnalytics } from "react-icons/io";
import { LuSquareCode } from "react-icons/lu";
import { FiArrowRight, FiPlay, FiCheckCircle } from "react-icons/fi";
import { FaCode, FaChartLine } from "react-icons/fa";

const features = [
  {
    title: "Universal Judge Support",
    desc: "Submit to Codeforces, LeetCode, AtCoder, and other popular coding platforms from a single interface.",
    icon: TiWorld,
  },
  {
    title: "Internal Contests",
    desc: "Host private contests for your university club or study group with custom scoring rules and leaderboards.",
    icon: BiTrophy,
  },
  {
    title: "Join Groups",
    desc: "Find like-minded peers, join study squads, and challenge each other to daily problem streaks.",
    icon: MdOutlineGroupAdd,
  },
  {
    title: "Collaborative Meetings",
    desc: "Real-time syntax syncing, voice chat, and whiteboard tools built specifically for explaining algorithms.",
    icon: MdVideoCameraFront,
  },
  {
    title: "Progress Analytics",
    desc: "Visualize your growth with detailed charts on topic strength, difficulty curves, and solve times.",
    icon: IoMdAnalytics,
  },
  {
    title: "API & Extensions",
    desc: "Use our browser extension to parse problems directly into your local IDE instantly.",
    icon: LuSquareCode,
  },
];

const steps = [
  {
    title: "Pick a problem",
    desc: "Browse structured sheets, topic-based problems, and curated contest-style challenges.",
    icon: FaCode,
  },
  {
    title: "Solve & submit",
    desc: "Write code, test locally, and submit to supported judges from one workflow.",
    icon: FiCheckCircle,
  },
  {
    title: "Track your growth",
    desc: "Monitor weak areas, difficulty trends, solve speed, and your overall contest progress.",
    icon: FaChartLine,
  },
];

const codeLines = [
  "#include <bits/stdc++.h>",
  "using namespace std;",
  "",
  "int solve(vector<int>& a) {",
  "  vector<int> dp(a.size() + 1, 0);",
  "  for (int i = 1; i <= (int)a.size(); i++) {",
  "    dp[i] = max(dp[i - 1], a[i - 1] + (i > 1 ? dp[i - 2] : 0));",
  "  }",
  "  return dp[a.size()];",
  "}",
];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1], // بدل "easeOut"
    },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.15,
    },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.92 },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};
export default function LandingPage() {
  return (
    <>
      <main className="relative overflow-hidden bg-[#050816] text-white">
        {/* Background layers */}
        <div className="absolute inset-0 -z-10">
          {/* Grid */}
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] [background-size:52px_52px]" />

          {/* Main glows */}
          <motion.div
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-32 top-10 h-[420px] w-[420px] rounded-full bg-blue-600/25 blur-[120px]"
          />
          <motion.div
            animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute right-[-120px] top-40 h-[500px] w-[500px] rounded-full bg-cyan-500/15 blur-[150px]"
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-100px] left-1/3 h-[380px] w-[380px] rounded-full bg-orange-500/10 blur-[120px]"
          />
        </div>

        {/* HERO */}
        <section className="container mx-auto px-6 pb-20 pt-14 md:px-10 lg:pt-20">
          <div className="grid min-h-[88vh] items-center gap-14 lg:grid-cols-[1.08fr_0.92fr]">
            {/* Left */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="relative z-10"
            >
              <motion.div
                variants={fadeUp}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-orange-200 backdrop-blur-md"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-orange-400 shadow-[0_0_20px_#fb923c]" />
                Built for competitive programmers
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="max-w-4xl text-5xl font-extrabold leading-[1.05] tracking-tight md:text-6xl xl:text-7xl"
              >
                Master Algorithms.
                <br />
                <span className="bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500 bg-clip-text text-transparent">
                  Conquer Contests.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                className="mt-6 max-w-2xl text-lg leading-8 text-slate-300 md:text-xl"
              >
                The all-in-one platform for competitive programmers — solve
                problems, join groups, host contests, and track your progress in
                real-time with a workflow built for serious practice.
              </motion.p>

              <motion.div
                variants={fadeUp}
                className="mt-8 flex flex-wrap gap-4"
              >
            
              </motion.div>

              {/* quick stats */}
              <motion.div
                variants={fadeUp}
                className="mt-10 grid max-w-2xl grid-cols-2 gap-4 sm:grid-cols-4"
              >
                {[
                  { value: "50K+", label: "Submissions" },
                  { value: "1,200+", label: "Problems" },
                  { value: "98%", label: "Uptime" },
                  { value: "24/7", label: "Practice Flow" },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm"
                  >
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right / animated editor */}
            <motion.div
              initial={{ opacity: 0, x: 40, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.15 }}
              className="relative mx-auto w-full max-w-2xl"
            >
              {/* floating chips */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -left-6 top-10 z-20 hidden rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300 backdrop-blur md:block"
              >
                <p className="font-semibold">Accepted</p>
                <p className="text-emerald-200/80">12ms runtime</p>
              </motion.div>

              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -right-4 bottom-12 z-20 hidden rounded-2xl border border-blue-400/20 bg-blue-500/10 px-4 py-3 text-sm text-blue-200 backdrop-blur md:block"
              >
                <p className="font-semibold">DP Topic</p>
                <p className="text-blue-100/80">+14 solved this week</p>
              </motion.div>

              {/* glow behind editor */}
              <div className="absolute inset-0 -z-10 rounded-[36px] bg-gradient-to-r from-blue-500/20 via-cyan-500/10 to-orange-500/10 blur-3xl" />

              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="overflow-hidden rounded-[28px] border border-white/10 bg-[#0b1020]/90 shadow-2xl shadow-black/40 backdrop-blur-xl"
              >
                {/* top bar */}
                <div className="flex items-center justify-between border-b border-white/10 bg-gradient-to-r from-[#16203f] to-[#0d1530] px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex gap-2">
                      <span className="h-3 w-3 rounded-full bg-red-500" />
                      <span className="h-3 w-3 rounded-full bg-orange-400" />
                      <span className="h-3 w-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-sm text-slate-200">solution.cpp</span>
                  </div>

                  <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
                    Live Judge Connected
                  </div>
                </div>

                {/* editor */}
                <div className="grid md:grid-cols-[56px_1fr]">
                  <div className="hidden border-r border-white/10 bg-white/[0.02] py-6 text-right text-sm text-slate-500 md:block">
                    {codeLines.map((_, i) => (
                      <div key={i} className="px-4 py-[5px]">
                        {i + 1}
                      </div>
                    ))}
                  </div>

                  <div className="relative overflow-hidden px-5 py-6 md:px-6">
                    <motion.div
                      animate={{ opacity: [0.35, 0.8, 0.35], y: [0, 120, 240] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                      className="pointer-events-none absolute left-0 top-0 h-16 w-full bg-gradient-to-b from-cyan-400/10 to-transparent"
                    />

                    <div className="space-y-2 font-mono text-sm md:text-[15px]">
                      {codeLines.map((line, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 + idx * 0.08 }}
                          className="whitespace-pre-wrap text-slate-200"
                        >
                          {highlightCode(line)}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* bottom result panel */}
                <div className="grid gap-4 border-t border-white/10 bg-gradient-to-r from-[#182447] to-[#0d1836] px-5 py-4 md:grid-cols-2 md:px-6">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-100">Output</p>
                    <ul className="space-y-1 text-sm text-slate-200">
                      <li>
                        Test Case #1:{" "}
                        <span className="font-medium text-emerald-400">Passed</span>
                      </li>
                      <li>
                        Test Case #2:{" "}
                        <span className="font-medium text-emerald-400">Passed</span>
                      </li>
                      <li>
                        Test Case #3:{" "}
                        <span className="font-medium text-emerald-400">Passed</span>
                      </li>
                    </ul>
                  </div>

                  <div className="flex flex-col justify-center md:items-end">
                    <p className="text-lg font-semibold text-emerald-400">
                      house_robber — Accepted
                    </p>
                    <p className="text-sm text-slate-300">
                      Runtime: 12ms · Memory: 42MB
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Supported platforms strip */}
        <section className="container mx-auto px-6 pb-10 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7 }}
            className="rounded-[28px] border border-white/10 bg-white/[0.04] px-6 py-6 backdrop-blur-sm"
          >
            <p className="text-center text-sm uppercase tracking-[0.3em] text-slate-400">
              Practice across your favorite judges
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:gap-8">
              {["Codeforces", "LeetCode", "AtCoder", "UVA", "SPOJ", "Gym"].map(
                (item) => (
                  <div
                    key={item}
                    className="rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-sm text-slate-200"
                  >
                    {item}
                  </div>
                )
              )}
            </div>
          </motion.div>
        </section>

        {/* HOW IT WORKS */}
        <section className="container mx-auto px-6 py-20 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">
              How it works
            </p>
            <h2 className="text-4xl font-bold md:text-5xl">
              A better workflow for deliberate practice
            </h2>
            <p className="mt-5 text-lg leading-8 text-slate-300">
              From daily problem solving to private contests and long-term
              analytics, ICoder helps you build a serious competitive
              programming routine.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            className="mt-14 grid gap-6 md:grid-cols-3"
          >
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.title}
                  variants={fadeUp}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-orange-300/30"
                >
                  <div className="absolute right-5 top-5 text-5xl font-black text-white/5">
                    0{index + 1}
                  </div>

                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#24355f] to-[#172442] text-orange-200 transition group-hover:scale-110">
                    <Icon size={24} />
                  </div>

                  <h3 className="text-2xl font-bold">{step.title}</h3>
                  <p className="mt-3 leading-7 text-slate-300">{step.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* FEATURES */}
        <section className="container mx-auto px-6 py-20 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl text-center"
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">
              Everything you need
            </p>
            <h2 className="text-4xl font-bold md:text-5xl">
              Tools that help you{" "}
              <span className="bg-gradient-to-r from-orange-300 to-orange-500 bg-clip-text text-transparent">
                level up faster
              </span>
            </h2>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.12 }}
            className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={fadeUp}
                  className="group relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.03] p-7 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-300/30 hover:shadow-[0_20px_80px_rgba(0,0,0,0.35)]"
                >
                  <div className="absolute inset-0 opacity-0 transition duration-500 group-hover:opacity-100">
                    <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-orange-400/10 blur-3xl" />
                    <div className="absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-blue-500/10 blur-3xl" />
                  </div>

                  <div className="relative z-10">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#22345d] to-[#16233f] text-orange-100 transition-all duration-300 group-hover:scale-110 group-hover:text-white">
                      <Icon size={28} />
                    </div>

                    <h3 className="text-2xl font-bold">{feature.title}</h3>
                    <p className="mt-3 leading-7 text-slate-300">
                      {feature.desc}
                    </p>

                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-orange-300">
                      Learn more
                      <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-6 pb-24 pt-10 md:px-10">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.75 }}
            className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-r from-[#0e1730] via-[#13224a] to-[#0b1020] px-8 py-14 md:px-14"
          >
            <div className="absolute -left-12 top-0 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -right-10 bottom-0 h-40 w-40 rounded-full bg-orange-500/20 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-4xl text-center">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">
                Ready to start?
              </p>
              <h2 className="text-4xl font-bold md:text-5xl">
                Practice smarter. Compete harder. Grow faster.
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Join ICoder to solve curated problems, host contests with your
                team, and turn your daily practice into measurable progress.
              </p>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <button 
                onClick={() => window.location.href = "/register"}
                className="group inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-6 py-3.5 font-semibold text-white transition hover:scale-[1.02] hover:bg-orange-600">
                  Get Started
                  <FiArrowRight className="transition-transform group-hover:translate-x-1" />
                </button>
                <button 
                onClick={() => window.location.href = "/login"}
                className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 font-semibold text-white transition hover:bg-white/10">
                  Explore Problems
                </button>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </>
  );
}

function highlightCode(line: string) {
  const tokens = [
    { regex: /#include|using|namespace|return|for|int|vector|max/g, cls: "text-blue-300" },
    { regex: /solve|dp/g, cls: "text-yellow-300" },
    { regex: /<bits\/stdc\+\+\.h>|std|size|a/g, cls: "text-slate-200" },
    { regex: /\d+/g, cls: "text-orange-300" },
  ];

  let result: React.ReactNode[] = [line];

  tokens.forEach(({ regex, cls }) => {
    const newResult: React.ReactNode[] = [];

    result.forEach((part, index) => {
      if (typeof part !== "string") {
        newResult.push(part);
        return;
      }

      let lastIndex = 0;
      const matches = [...part.matchAll(regex)];

      if (matches.length === 0) {
        newResult.push(part);
        return;
      }

      matches.forEach((match, i) => {
        const start = match.index ?? 0;
        const end = start + match[0].length;

        if (start > lastIndex) {
          newResult.push(part.slice(lastIndex, start));
        }

        newResult.push(
          <span key={`${index}-${i}-${match[0]}-${start}`} className={cls}>
            {match[0]}
          </span>
        );

        lastIndex = end;
      });

      if (lastIndex < part.length) {
        newResult.push(part.slice(lastIndex));
      }
    });

    result = newResult;
  });

  return result;
}