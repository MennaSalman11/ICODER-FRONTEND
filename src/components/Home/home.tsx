"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
// ─── Styles ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;500&display=swap');

  @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes scan     { 0%{top:0%} 100%{top:100%} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes shimmer  { 0%{background-position:-200% 0} 100%{background-position:200% 0} }

  .float       { animation: float 4s ease-in-out infinite; }
  .fade-up     { animation: fadeUp .6s ease both; }
  .blink-cursor::after { content:'|'; animation:blink 1s step-end infinite; margin-left:1px; color:#1e3a8a; }

  .dot-bg {
    background-image: radial-gradient(circle, #cbd5e1 1px, transparent 1px);
    background-size: 28px 28px;
  }

  .card-hover {
    transition: all .25s ease;
  }
  .card-hover:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(30,58,138,.12);
  }

  .progress-fill { background: linear-gradient(90deg, #1e3a8a, #3b82f6); }
  .progress-fill-orange { background: linear-gradient(90deg, #f97316, #fb923c); }

  .scan-line {
    position:absolute; left:0; right:0; height:2px;
    background: linear-gradient(90deg, transparent, rgba(249,115,22,.5), transparent);
    animation: scan 2.5s linear infinite;
    pointer-events:none;
  }

  .badge-pill {
    background: rgba(30,58,138,.08);
    border: 1px solid rgba(30,58,138,.2);
    color: #1e3a8a;
  }

  .section-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: .15em;
    text-transform: uppercase;
    color: #f97316;
  }
`;

// ─── Icons ────────────────────────────────────────────────────────────────────
const I = {
  code:   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  arrow:  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  play:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  check:  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  star:   <svg width="14" height="14" viewBox="0 0 24 24" fill="#fbbf24" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  trend:  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>,
  zap:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,
  target: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  bar:    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  book:   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  share:  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>,
  git:    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M13 6h3a2 2 0 0 1 2 2v7"/><line x1="6" y1="9" x2="6" y2="21"/></svg>,
  link:   <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
};

// ─── Typed ────────────────────────────────────────────────────────────────────
function Typed({ strings }: { strings: string[] }) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [del, setDel] = useState(false);
  useEffect(() => {
    const t = strings[idx];
    const id = setTimeout(() => {
      if (!del) {
        setText(t.slice(0, text.length + 1));
        if (text.length + 1 === t.length) setTimeout(() => setDel(true), 1400);
      } else {
        setText(t.slice(0, text.length - 1));
        if (text.length - 1 === 0) { setDel(false); setIdx(i => (i + 1) % strings.length); }
      }
    }, del ? 45 : 85);
    return () => clearTimeout(id);
  }, [text, del, idx, strings]);
  return <span className="blink-cursor text-[#1e3a8a]">{text}</span>;
}

// ─── Counter ──────────────────────────────────────────────────────────────────
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      let cur = 0;
      const step = to / 60;
      const tick = () => { cur = Math.min(cur + step, to); setVal(Math.floor(cur)); if (cur < to) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [to]);
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

// ─── DATA ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: I.zap,    title: "Instant Feedback",       desc: "Get detailed explanations and hints within milliseconds of submitting.", color: "#f97316", bg: "rgba(249,115,22,.08)",   border: "rgba(249,115,22,.2)" },
  { icon: I.target, title: "Smart Recommendations",  desc: "AI picks the next problem based on your weak spots and history.",        color: "#1e3a8a", bg: "rgba(30,58,138,.07)",    border: "rgba(30,58,138,.2)" },
  { icon: I.bar,    title: "Deep Analytics",          desc: "Visualise time trends and compare your performance against peers.",      color: "#7c3aed", bg: "rgba(124,58,237,.07)",   border: "rgba(124,58,237,.2)" },
  { icon: I.book,   title: "20+ Language Judge",      desc: "Sub-millisecond verdicts with memory and CPU profiling on every run.",  color: "#059669", bg: "rgba(5,150,105,.07)",    border: "rgba(5,150,105,.2)" },
];

const PROBLEMS = [
  { id:1, title:"Two Sum",               diff:"Easy",   dc:"#16a34a", dbg:"rgba(22,163,74,.1)",   tags:["Array","Hash Table"],      solved:87, time:"O(n)" },
  { id:2, title:"Reverse Linked List",   diff:"Medium", dc:"#d97706", dbg:"rgba(217,119,6,.1)",   tags:["Linked List","Recursion"], solved:72, time:"O(n)" },
  { id:3, title:"Median of Two Arrays",  diff:"Hard",   dc:"#dc2626", dbg:"rgba(220,38,38,.1)",   tags:["Array","Binary Search"],   solved:41, time:"O(log n)" },
];

const LEADERS = [
  { rank:1, name:"CodeNinja_09",   score:2345, solved:1241, streak:87, delta:"+12", av:"C", from:"#f97316", to:"#ef4444" },
  { rank:2, name:"AlgoMaster",     score:876,  solved:3120, streak:64, delta:"+5",  av:"A", from:"#1e3a8a", to:"#3b82f6" },
  { rank:3, name:"BitManipulator", score:3890, solved:2115, streak:51, delta:"+3",  av:"B", from:"#059669", to:"#3b82f6" },
];

const ROADMAP = [
  { n:"01", title:"Beginner",     desc:"Arrays, strings, sorting, and brute-force patterns.",          color:"#1e3a8a", light:"rgba(30,58,138,.08)",   border:"rgba(30,58,138,.2)" },
  { n:"02", title:"Intermediate", desc:"Dynamic programming, graphs, trees, sliding window.",          color:"#f97316", light:"rgba(249,115,22,.08)",   border:"rgba(249,115,22,.2)" },
  { n:"03", title:"Advanced",     desc:"Segment trees, number theory, live contests, system design.", color:"#7c3aed", light:"rgba(124,58,237,.08)",   border:"rgba(124,58,237,.2)" },
];

const FOOTER: Record<string,string[]> = {
  Company:   ["About","Blog","Careers","Press"],
  Product:   ["Problems","Contests","Leaderboard","Pricing"],
  Resources: ["Docs","API","Community","Status"],
  Solutions: ["Students","Companies","Bootcamps","Enterprise"],
};

// ─── HERO ─────────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-white">
      {/* dot grid */}
      <div className="absolute inset-0 dot-bg opacity-60" />
      {/* soft blobs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full blur-[120px]" style={{background:"rgba(30,58,138,.07)"}} />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px]" style={{background:"rgba(249,115,22,.07)"}} />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* LEFT */}
          <div className="fade-up">
            <div className="inline-flex items-center gap-2 badge-pill rounded-full px-4 py-1.5 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
              </span>
              <span className="text-xs font-semibold tracking-wide">1,200+ Problems · Live Judge</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-black text-slate-900 leading-[1.05] mb-5 tracking-tight">
              Level Up Your<br />
              <Typed strings={["Algorithms","Problem Solving","Coding Skills","Contest Rank"]} />
            </h1>
            <p className="text-slate-500 text-lg leading-relaxed mb-10 max-w-lg">
              Structured problem sets, a real-time judge, and deep analytics — everything you need to crack top-tier interviews and competitions.
            </p>

            <div className="flex flex-wrap gap-3 mb-14">
              <button
              onClick={() => window.location.href = "/problems"}
              className="bg-[#1e3a8a] hover:bg-blue-800 text-white px-7 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-900/20">
                Start Solving {I.arrow}
              </button>
            
            </div>

            {/* stats */}
            <div className="flex gap-10 pt-8 border-t border-slate-100">
              {[{to:50000,suffix:"+" ,label:"Active Coders"},{to:1200,suffix:"+" ,label:"Problems"},{to:98,suffix:"%",label:"Uptime"}].map(s=>(
                <div key={s.label}>
                  <div className="text-3xl font-black text-slate-900 tabular-nums"><Counter to={s.to} suffix={s.suffix}/></div>
                  <div className="text-slate-400 text-sm mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — code editor */}
          <div className="float hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xl shadow-slate-200/60">
              {/* scan line */}
              <div className="scan-line" />
              {/* title bar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <span className="ml-3 text-slate-400 text-xs font-mono">twoSum.ts</span>
                <div className="ml-auto flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> ACCEPTED
                </div>
              </div>
              {/* code — dark editor inside light page */}
              <div className="p-6 font-mono text-[13px] leading-7 bg-[#0d1117]" style={{fontFamily:"'Fira Code',monospace"}}>
                <div><span className="text-blue-400">function </span><span className="text-yellow-300">twoSum</span><span className="text-white">(</span><span className="text-orange-300">nums</span><span className="text-slate-400">: number[], </span><span className="text-orange-300">target</span><span className="text-slate-400">: number</span><span className="text-white">): number[] {"{"}</span></div>
                <div className="pl-6"><span className="text-blue-400">const </span><span className="text-white">map = </span><span className="text-blue-400">new </span><span className="text-yellow-300">Map</span><span className="text-slate-400">{"<number, number>"}</span><span className="text-white">();</span></div>
                <div className="pl-6 mt-1"><span className="text-blue-400">for </span><span className="text-white">(</span><span className="text-blue-400">let </span><span className="text-white">i = </span><span className="text-orange-400">0</span><span className="text-white">; i {"<"} nums.length; i++) {"{"}</span></div>
                <div className="pl-12"><span className="text-blue-400">const </span><span className="text-white">comp = target - nums[i];</span></div>
                <div className="pl-12"><span className="text-blue-400">if </span><span className="text-white">(map.</span><span className="text-yellow-300">has</span><span className="text-white">(comp)) </span><span className="text-blue-400">return </span><span className="text-white">[map.</span><span className="text-yellow-300">get</span><span className="text-white">(comp)</span><span className="text-slate-400">!</span><span className="text-white">, i];</span></div>
                <div className="pl-12"><span className="text-white">map.</span><span className="text-yellow-300">set</span><span className="text-white">(nums[i], i);</span></div>
                <div className="pl-6"><span className="text-white">{"}"}</span></div>
                <div className="pl-6"><span className="text-blue-400">return </span><span className="text-white">[];</span></div>
                <div><span className="text-white">{"}"}</span></div>
              </div>
              {/* result */}
              <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs">
                <div className="flex gap-4 text-slate-500">
                  <span>Runtime: <strong className="text-slate-700">72 ms</strong></span>
                  <span>Memory: <strong className="text-slate-700">42 MB</strong></span>
                </div>
                <div className="flex gap-1">
                  {[...Array(5)].map((_,i)=><div key={i} className="w-1.5 h-4 rounded-sm bg-emerald-400 opacity-80"/>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── WHY CHOOSE ───────────────────────────────────────────────────────────────
function WhyChoose() {
  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="section-eyebrow mb-3">Why iCoder</p>
          <h2 className="text-4xl font-black text-slate-900 mb-4">Built for <span className="text-[#1e3a8a]">Serious Coders</span></h2>
          <p className="text-slate-500 max-w-lg mx-auto">Everything else is a distraction. iCoder strips it down to what actually makes you better.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map(f=>(
            <div key={f.title} className="card-hover bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5" style={{background:f.bg, color:f.color, border:`1px solid ${f.border}`}}>
                {f.icon}
              </div>
              <h3 className="text-slate-900 font-bold mb-2 text-[15px]">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CODE EXPERIENCE ──────────────────────────────────────────────────────────
function CodeExperience() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* editor */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xl shadow-slate-100">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50">
                <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"/><div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"/><div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"/></div>
                <span className="ml-3 text-slate-400 text-xs font-mono">solution.py</span>
                <span className="ml-auto text-[10px] bg-slate-200 text-slate-500 px-2 py-0.5 rounded font-mono">Python 3.11</span>
              </div>
              <div className="p-5 font-mono text-[12.5px] leading-7 bg-[#0d1117]" style={{fontFamily:"'Fira Code',monospace"}}>
                <div><span className="text-blue-400">class </span><span className="text-yellow-300">Solution</span><span className="text-white">:</span></div>
                <div className="pl-6"><span className="text-blue-400">def </span><span className="text-yellow-300">maxProfit</span><span className="text-white">(self, prices) -&gt; </span><span className="text-violet-400">int</span><span className="text-white">:</span></div>
                <div className="pl-12"><span className="text-slate-500"># O(n) one-pass</span></div>
                <div className="pl-12"><span className="text-white">min_p, max_p = </span><span className="text-violet-400">float</span><span className="text-white">(</span><span className="text-orange-400">&apos;inf&apos;</span><span className="text-white">), </span><span className="text-orange-400">0</span></div>
                <div className="pl-12 mt-1"><span className="text-blue-400">for </span><span className="text-white">p </span><span className="text-blue-400">in </span><span className="text-white">prices:</span></div>
                <div className="pl-20"><span className="text-white">min_p = </span><span className="text-violet-400">min</span><span className="text-white">(min_p, p)</span></div>
                <div className="pl-20"><span className="text-white">max_p = </span><span className="text-violet-400">max</span><span className="text-white">(max_p, p - min_p)</span></div>
                <div className="pl-12 mt-1"><span className="text-blue-400">return </span><span className="text-white">max_p</span></div>
              </div>
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 space-y-1">
                {["[7,1,5,3,6,4] → 5 ✓","[7,6,4,3,1] → 0 ✓","[1,2] → 1 ✓"].map(t=>(
                  <div key={t} className="text-emerald-600 text-[11px] font-mono flex items-center gap-2">
                    <span>{I.check}</span>{t}
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 bg-emerald-500 text-white text-xs font-black px-4 py-2 rounded-xl shadow-lg">✓ ACCEPTED</div>
          </div>

          {/* text */}
          <div>
            <p className="section-eyebrow mb-4">The Editor</p>
            <h2 className="text-4xl font-black text-slate-900 mb-5 leading-tight">
              Code, Run, Submit —<br />
              <span className="text-[#1e3a8a]">All in the Browser</span>
            </h2>
            <p className="text-slate-500 text-lg mb-8 leading-relaxed">No setup. No installs. A real judge with real time limits — just open iCoder and start competing.</p>
            <ul className="space-y-3 mb-10">
              {["TypeScript, Python, Rust, Go and 17 more","Monaco editor (same engine as VS Code)","Diff view between your output and expected","Memory and time complexity on every submission"].map(t=>(
                <li key={t} className="flex items-start gap-3 text-slate-600 text-sm">
                  <span className="w-5 h-5 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5 text-[#1e3a8a]">{I.check}</span>
                  {t}
                </li>
              ))}
            </ul>
          
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── PROBLEMS ─────────────────────────────────────────────────────────────────
function FeaturedProblems() {
      const router = useRouter();

  return (
    <section className="py-24 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="section-eyebrow mb-3">Problem Set</p>
            <h2 className="text-4xl font-black text-slate-900">Today&apos;s <span className="text-[#1e3a8a]">Picks</span></h2>
          </div>
          <a href="/problems" className="text-slate-500 hover:text-[#1e3a8a] flex items-center gap-1.5 text-sm font-semibold transition-colors">
            View all {I.arrow}
          </a>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PROBLEMS.map(p=>(
            <div key={p.id} className="card-hover bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{color:p.dc, background:p.dbg}}>{p.diff}</span>
                  <span className="text-slate-300 text-xs font-mono">#{String(p.id).padStart(4,"0")}</span>
                </div>
                <h3 className="text-slate-900 font-bold text-lg mb-3">{p.title}</h3>
                <div className="flex gap-2 flex-wrap mb-5">
                  {p.tags.map(t=><span key={t} className="text-[11px] text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{t}</span>)}
                </div>
                <div className="mb-1 flex justify-between text-[11px] text-slate-400">
                  <span>Acceptance</span><span>{p.solved}%</span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-4">
                  <div className="h-full rounded-full progress-fill" style={{width:`${p.solved}%`}}/>
                </div>
                <div className="text-xs text-slate-400">
                  Best time: <span className="text-slate-600 font-mono">{p.time}</span>
                </div>
              </div>
              <button
              onClick={() => router.push("/problems")}
              className="w-full py-3 border-t border-slate-100 text-[#1e3a8a] hover:bg-blue-50 text-sm font-bold flex items-center justify-center gap-2 transition-all">
                Solve Now {I.arrow}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── LEADERBOARD ─────────────────────────────────────────────────────────────
function Leaderboard() {
  const MEDALS = ["🥇","🥈","🥉"];
  return (
    <section className="py-24 bg-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="section-eyebrow mb-3">Rankings</p>
          <h2 className="text-4xl font-black text-slate-900">Global <span className="text-[#1e3a8a]">Leaderboard</span></h2>
        </div>
        <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
          <div className="grid grid-cols-5 px-6 py-3 bg-slate-50 border-b border-slate-100">
            {["Rank","Coder","Score","Solved","Streak"].map(h=>(
              <span key={h} className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">{h}</span>
            ))}
          </div>
          {LEADERS.map((l,i)=>(
            <div key={l.rank} className="grid grid-cols-5 px-6 py-4 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors items-center">
              <div className="text-xl">{MEDALS[i]}</div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-black" style={{background:`linear-gradient(135deg,${l.from},${l.to})`}}>{l.av}</div>
                <span className="text-slate-800 font-semibold text-sm truncate">{l.name}</span>
              </div>
              <div className="text-slate-900 font-black tabular-nums">{l.score.toLocaleString()}</div>
              <div className="text-slate-500 tabular-nums">{l.solved.toLocaleString()}</div>
              <div className="flex items-center gap-2">
                <div className="flex-1 max-w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full progress-fill-orange" style={{width:`${l.streak}%`}}/>
                </div>
                <span className="text-slate-500 text-sm tabular-nums">{l.streak}</span>
                <span className="text-emerald-600 text-[11px] flex items-center gap-0.5 font-mono">{I.trend}{l.delta}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <button
          onClick={() => window.location.href = "contests"}
          className="border border-slate-200 hover:border-[#1e3a8a] text-slate-500 hover:text-[#1e3a8a] px-6 py-2.5 rounded-xl text-sm font-semibold transition-all">
            See Full Rankings {I.arrow}
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── ROADMAP ──────────────────────────────────────────────────────────────────
function Roadmap() {
  return (
    <section className="py-24 bg-slate-50 relative overflow-hidden">
      <div className="absolute inset-0 dot-bg opacity-50"/>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="section-eyebrow mb-3">Learning Path</p>
          <h2 className="text-4xl font-black text-slate-900">Your Road to <span className="text-[#1e3a8a]">Top 1%</span></h2>
        </div>
        <div className="relative">
          <div className="hidden lg:block absolute top-10 inset-x-0 mx-24 h-px bg-slate-200"/>
          <div className="grid lg:grid-cols-3 gap-6">
            {ROADMAP.map(s=>(
              <div key={s.n} className="card-hover bg-white rounded-2xl p-8 border shadow-sm relative overflow-hidden" style={{borderColor:s.border}}>
                <div className="absolute top-0 inset-x-0 h-1 rounded-t-2xl" style={{background:s.color}}/>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-sm mb-6" style={{background:s.color}}>{s.n}</div>
                <h3 className="text-slate-900 font-black text-xl mb-3">{s.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────
function CTA() {
    const router = useRouter();

  return (
    <section className="py-28 relative overflow-hidden" style={{background:"#0f172a"}}>
      <div className="absolute inset-0 dot-bg opacity-10"/>
      <div className="absolute inset-0" style={{background:"radial-gradient(ellipse at 50% 0%, rgba(249,115,22,.15) 0%, transparent 60%)"}}/>
      <div className="relative max-w-3xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-1 mb-8">
          {[...Array(5)].map((_,i)=><span key={i}>{I.star}</span>)}
          <span className="text-slate-400 text-sm ml-2">Trusted by 50,000 developers</span>
        </div>
        <h2 className="text-5xl font-black text-white mb-5 leading-tight">
          Ready to <span className="text-orange-400">Compete?</span>
        </h2>
        <p className="text-slate-400 text-xl mb-10 leading-relaxed">
          Free forever. No setup. Just open iCoder and start solving.
        </p>
        <div 
         className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
          <button 
          onClick={() => router.push("/register")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-xl font-black text-lg flex items-center justify-center gap-2 transition-all shadow-xl shadow-orange-500/25">
            Create Free Account {I.arrow}
          </button>
          <button 
          type="button"
          onClick={() => router.push("/problems")}
          className="border border-white/20 hover:border-white/40 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all hover:bg-white/5">
            Browse Problems
          </button>
        </div>
        <p className="text-slate-600 text-sm">No credit card · Cancel anytime · Free tier forever</p>
      </div>
    </section>
  );
}

// ─── FOOTER ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#1e3a8a] rounded-lg flex items-center justify-center text-white">{I.code}</div>
              <span className="text-slate-900 font-black text-xl">iCoder</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed mb-5">Elevating developers through competitive programming and algorithmic mastery.</p>
            <div className="flex gap-2">
              {[I.share,I.git,I.link].map((icon,i)=>(
                <a key={i} href="#" className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all">{icon}</a>
              ))}
            </div>
          </div>
          {Object.entries(FOOTER).map(([sec,items])=>(
            <div key={sec}>
              <h4 className="text-slate-900 font-bold text-sm mb-4">{sec}</h4>
              <ul className="space-y-2.5">
                {items.map(item=>(
                  <li key={item}><a href="#" className="text-slate-400 hover:text-slate-700 text-sm transition-colors">{item}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm">© 2025 iCoder. All rights reserved.</p>
          <div className="flex gap-6">
            {["Privacy","Terms","Cookies"].map(item=>(
              <a key={item} href="#" className="text-slate-400 hover:text-slate-600 text-xs transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── PAGE ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <style>{STYLES}</style>
      <main>
        <Hero />
        <WhyChoose />
        <CodeExperience />
        <FeaturedProblems />
        <Leaderboard />
        <Roadmap />
        <CTA />
        <Footer />
      </main>
    </>
  );
}
