import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  Copy,
  Check,
  Play,
  FlaskConical,
  Clock,
  Target,
  Cpu,
  FileCode2,
  Sparkles,
  Info,
  Layers,
  ArrowDownRight,
  TrendingDown
} from "lucide-react";
import { getEvaluationMetrics, runBenchmarkTest } from "../services/evaluationApi";

export default function ResearchEvaluationPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMeasuredData, setIsMeasuredData] = useState(false);
  const [runningBenchmark, setRunningBenchmark] = useState(false);
  const [benchmarkResult, setBenchmarkResult] = useState(null);
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'efficiency', 'accuracy', 'performance'
  const [showLatexModal, setShowLatexModal] = useState(false);
  const [selectedLatexTable, setSelectedLatexTable] = useState("table1");

  useEffect(() => {
    fetchMetrics(isMeasuredData);
  }, [isMeasuredData]);

  const fetchMetrics = async (measured) => {
    setLoading(true);
    try {
      const res = await getEvaluationMetrics(measured);
      if (res.success && res.data) {
        setData(res.data);
      }
    } catch (err) {
      console.error("Failed to load metrics", err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunBenchmark = async () => {
    setRunningBenchmark(true);
    setBenchmarkResult(null);
    try {
      const res = await runBenchmarkTest();
      if (res.success && res.data) {
        setBenchmarkResult(res.data);
        // Refresh metrics with measured mode enabled
        setIsMeasuredData(true);
      }
    } catch (err) {
      console.error("Benchmark test failed", err);
    } finally {
      setRunningBenchmark(false);
    }
  };

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const downloadImage = (url, filename) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-secondary text-sm font-mono">Loading Research Evaluation Metrics...</p>
        </div>
      </div>
    );
  }

  const { parsingTimeMetrics, accuracyMetrics, systemPerformanceMetrics, latexTables, graphAssetUrls } = data || {};

  return (
    <div className="space-y-8 pb-16">
      {/* Header Banner */}
      <div className="glass-card p-8 rounded-2xl relative overflow-hidden border border-white/10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full filter blur-3xl -z-10 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider bg-accent/10 text-accent border border-accent/20 flex items-center gap-1.5">
                <FlaskConical size={14} /> Empirical Evaluation & Benchmarks
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-mono font-semibold uppercase tracking-wider ${
                isMeasuredData
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
              }`}>
                {isMeasuredData ? "● Live Telemetry Data" : "○ Illustrative Benchmark Dataset"}
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Research Evaluation
            </h1>
            <p className="text-text-secondary text-sm max-w-3xl mt-1 leading-relaxed">
              Quantitative benchmark analysis evaluating PrepAce across three core technical dimensions: 
              <strong className="text-white"> Parsing Efficiency</strong>, <strong className="text-white">Entity Extraction Accuracy</strong>, and <strong className="text-white">System Pipeline Performance</strong> for academic paper submission.
            </p>
          </div>

          {/* Data Mode & Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsMeasuredData(!isMeasuredData)}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold tracking-wide transition-all flex items-center gap-2"
              title="Toggle dataset between placeholder baseline and live measured telemetry"
            >
              <Info size={15} className="text-accent" />
              {isMeasuredData ? "Switch to Benchmark Dataset" : "Switch to Live Telemetry"}
            </button>

            <button
              onClick={handleRunBenchmark}
              disabled={runningBenchmark}
              className="px-4 py-2.5 rounded-xl bg-accent text-primary font-bold text-xs tracking-wide shadow-[0_0_20px_rgba(217,255,0,0.3)] hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {runningBenchmark ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  Measuring Latency...
                </>
              ) : (
                <>
                  <Play size={15} /> Run Benchmark Test
                </>
              )}
            </button>

            <button
              onClick={() => setShowLatexModal(true)}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-2"
            >
              <FileCode2 size={15} className="text-accent" /> Copy LaTeX Tables
            </button>
          </div>
        </div>

        {/* Notice for Academic Evaluation */}
        <div className="mt-6 p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3">
          <Info size={18} className="text-accent shrink-0 mt-0.5" />
          <div className="text-xs text-text-secondary leading-normal">
            <strong className="text-white">Academic Notice:</strong> High-resolution publication-ready PNG charts (300 DPI, IEEE/Springer 2-column paper format) have been generated. Use the download buttons below each chart to save standalone graph files for insertion into your research manuscript.
          </div>
        </div>
      </div>

      {/* Benchmark Live Execution Banner Result */}
      {benchmarkResult && (
        <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start justify-between gap-4 animate-in fade-in">
          <div className="flex items-start gap-3">
            <Check size={20} className="text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <p className="font-bold text-sm text-white">Automated Benchmark Execution Completed!</p>
              <p className="text-xs text-emerald-300/80 mt-1 font-mono">
                Experiment ID: {benchmarkResult.experimentId} | Total Pipeline Latency: <strong>{benchmarkResult.totalPipelineLatencySec}s</strong> (LLM Inference: {benchmarkResult.llmAnalysisLatencySec}s, Question Gen: {benchmarkResult.questionGenLatencySec}s)
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300">
            Recorded @ {new Date(benchmarkResult.timestamp).toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Main Section Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-white/10 pb-4">
        {[
          { id: "all", label: "All Dimensions", icon: <Layers size={16} /> },
          { id: "efficiency", label: "A. Parsing Efficiency", icon: <Clock size={16} /> },
          { id: "accuracy", label: "B. Parsing Accuracy", icon: <Target size={16} /> },
          { id: "performance", label: "C. System Performance", icon: <Cpu size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? "bg-accent text-primary shadow-[0_0_15px_rgba(217,255,0,0.25)]"
                : "text-text-secondary hover:text-white hover:bg-white/5"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ========================================================== */}
      {/* SUBSECTION A: RESUME PARSING EFFICIENCY (HUMAN VS PREPACE) */}
      {/* ========================================================== */}
      {(activeTab === "all" || activeTab === "efficiency") && (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold">
                A
              </div>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  A. Resume Parsing Efficiency
                </h2>
                <p className="text-xs text-text-secondary">
                  Comparative analysis of average processing time per resume: Manual Human Extraction vs. PrepAce Automated Pipeline.
                </p>
              </div>
            </div>

            {/* Time Reduction Badge */}
            <div className="hidden sm:flex items-center gap-3 px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <TrendingDown size={20} className="text-emerald-400" />
              <div>
                <p className="text-[10px] text-emerald-400/80 font-mono uppercase font-bold">Time Reduction</p>
                <p className="text-lg font-extrabold text-emerald-400 font-mono">
                  {parsingTimeMetrics?.percentageTimeReduction?.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Graph Card 1 */}
            <div className="lg:col-span-6 glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 size={16} className="text-accent" />
                    Fig. 1. Resume Parsing Time Comparison
                  </h3>
                  <button
                    onClick={() => downloadImage(graphAssetUrls?.fig1, "fig1_resume_parsing_time_comparison.png")}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-all"
                  >
                    <Download size={13} /> Download IEEE PNG
                  </button>
                </div>

                {/* Academic PNG Chart Preview */}
                <div className="bg-white rounded-xl p-3 border border-slate-300 shadow-inner flex items-center justify-center">
                  <img
                    src={graphAssetUrls?.fig1}
                    alt="Fig. 1 Resume Parsing Time Comparison"
                    className="max-h-72 object-contain rounded"
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-text-secondary">
                <span>Unit: Seconds (s) | Lower is better</span>
                <span className="font-mono text-accent font-semibold">Mean ± Standard Deviation</span>
              </div>
            </div>

            {/* Table I: Resume Parsing Time Comparison */}
            <div className="lg:col-span-6 glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-white tracking-tight">
                      Table I. Resume Parsing Time Comparison
                    </h3>
                    <p className="text-[11px] text-text-secondary">Measured parsing duration in seconds across N observations</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(latexTables?.table1, "t1")}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5 transition-all"
                  >
                    {copiedKey === "t1" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedKey === "t1" ? "Copied LaTeX!" : "Copy LaTeX"}
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-text-secondary font-mono uppercase text-[10px]">
                      <tr>
                        <th className="p-3 border-b border-white/10">Method</th>
                        <th className="p-3 border-b border-white/10 text-right">Avg (s)</th>
                        <th className="p-3 border-b border-white/10 text-right">Min (s)</th>
                        <th className="p-3 border-b border-white/10 text-right">Max (s)</th>
                        <th className="p-3 border-b border-white/10 text-right">Std Dev (s)</th>
                        <th className="p-3 border-b border-white/10 text-right">Reduction</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      <tr className="hover:bg-white/5 transition-colors">
                        <td className="p-3 text-white font-sans font-medium">{parsingTimeMetrics?.humanRow?.method}</td>
                        <td className="p-3 text-right font-bold text-amber-400">{parsingTimeMetrics?.humanRow?.averageTimeSec?.toFixed(2)}</td>
                        <td className="p-3 text-right text-text-secondary">{parsingTimeMetrics?.humanRow?.minSec?.toFixed(2)}</td>
                        <td className="p-3 text-right text-text-secondary">{parsingTimeMetrics?.humanRow?.maxSec?.toFixed(2)}</td>
                        <td className="p-3 text-right text-text-secondary">±{parsingTimeMetrics?.humanRow?.stdDevSec?.toFixed(2)}</td>
                        <td className="p-3 text-right text-text-secondary font-sans">{parsingTimeMetrics?.humanRow?.timeReduction}</td>
                      </tr>
                      <tr className="bg-accent/5 hover:bg-accent/10 transition-colors">
                        <td className="p-3 text-accent font-sans font-bold flex items-center gap-1.5">
                          <Sparkles size={14} /> {parsingTimeMetrics?.prepaceRow?.method}
                        </td>
                        <td className="p-3 text-right font-bold text-emerald-400">{parsingTimeMetrics?.prepaceRow?.averageTimeSec?.toFixed(2)}</td>
                        <td className="p-3 text-right text-emerald-400/80">{parsingTimeMetrics?.prepaceRow?.minSec?.toFixed(2)}</td>
                        <td className="p-3 text-right text-emerald-400/80">{parsingTimeMetrics?.prepaceRow?.maxSec?.toFixed(2)}</td>
                        <td className="p-3 text-right text-emerald-400/80">±{parsingTimeMetrics?.prepaceRow?.stdDevSec?.toFixed(2)}</td>
                        <td className="p-3 text-right font-bold text-emerald-400 font-sans">{parsingTimeMetrics?.prepaceRow?.timeReduction}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Time Reduction Formula Box */}
              <div className="mt-4 p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-text-secondary space-y-1">
                <p className="text-white font-semibold text-[11px] uppercase tracking-wider font-mono">Mathematical Formula:</p>
                <div className="font-mono text-accent bg-black/30 p-2 rounded text-[11px] text-center">
                  Time Reduction (%) = ((Human Time - PrepAce Time) / Human Time) × 100
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================== */}
      {/* SUBSECTION B: RESUME PARSING ACCURACY                      */}
      {/* ========================================================== */}
      {(activeTab === "all" || activeTab === "accuracy") && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold">
              B
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                B. Resume Information Extraction Accuracy
              </h2>
              <p className="text-xs text-text-secondary">
                Entity-level extraction precision, recall, and harmonic mean F1-score evaluated against manually verified ground truth.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Graph Card 2 */}
            <div className="lg:col-span-6 glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 size={16} className="text-accent" />
                    Fig. 2. Resume Extraction Accuracy Across Categories
                  </h3>
                  <button
                    onClick={() => downloadImage(graphAssetUrls?.fig2, "fig2_entity_extraction_accuracy.png")}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-all"
                  >
                    <Download size={13} /> Download IEEE PNG
                  </button>
                </div>

                <div className="bg-white rounded-xl p-3 border border-slate-300 shadow-inner flex items-center justify-center">
                  <img
                    src={graphAssetUrls?.fig2}
                    alt="Fig. 2 Entity Extraction Accuracy"
                    className="max-h-72 object-contain rounded"
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-text-secondary">
                <span>Metrics: Precision, Recall, F1-Score (0.00 – 1.00)</span>
                <span className="font-mono text-accent font-semibold">Higher is better</span>
              </div>
            </div>

            {/* Table II: Accuracy Table */}
            <div className="lg:col-span-6 glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-white tracking-tight">
                      Table II. Resume Information Extraction Accuracy
                    </h3>
                    <p className="text-[11px] text-text-secondary">Categorized performance scores across extracted candidate attributes</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(latexTables?.table2, "t2")}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5 transition-all"
                  >
                    {copiedKey === "t2" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedKey === "t2" ? "Copied LaTeX!" : "Copy LaTeX"}
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-text-secondary font-mono uppercase text-[10px]">
                      <tr>
                        <th className="p-3 border-b border-white/10">Entity Category</th>
                        <th className="p-3 border-b border-white/10 text-right">Precision</th>
                        <th className="p-3 border-b border-white/10 text-right">Recall</th>
                        <th className="p-3 border-b border-white/10 text-right font-bold text-white">F1-Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {accuracyMetrics?.map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 text-white font-sans font-semibold flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-accent" />
                            {row.entityType}
                          </td>
                          <td className="p-3 text-right text-blue-400">{row.precision?.toFixed(3)}</td>
                          <td className="p-3 text-right text-teal-400">{row.recall?.toFixed(3)}</td>
                          <td className="p-3 text-right font-extrabold text-amber-400 text-sm bg-amber-500/5">
                            {row.f1Score?.toFixed(3)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* F1 Score Formula Box */}
              <div className="mt-4 p-3.5 rounded-xl bg-white/5 border border-white/10 text-xs text-text-secondary space-y-1">
                <p className="text-white font-semibold text-[11px] uppercase tracking-wider font-mono">F1-Score Harmonic Mean Formula:</p>
                <div className="font-mono text-accent bg-black/30 p-2 rounded text-[11px] text-center">
                  F₁ = 2 × (Precision × Recall) / (Precision + Recall)
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================== */}
      {/* SUBSECTION C: SYSTEM PERFORMANCE & LATENCY BREAKDOWN       */}
      {/* ========================================================== */}
      {(activeTab === "all" || activeTab === "performance") && (
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold">
              C
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                C. PrepAce System Pipeline Performance
              </h2>
              <p className="text-xs text-text-secondary">
                Detailed latency breakdown across the 5 end-to-end stages of the AI interview generation pipeline.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Graph Card 3 */}
            <div className="lg:col-span-6 glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <BarChart3 size={16} className="text-accent" />
                    Fig. 3. Multi-Stage Pipeline Latency Breakdown
                  </h3>
                  <button
                    onClick={() => downloadImage(graphAssetUrls?.fig3, "fig3_pipeline_latency_breakdown.png")}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10 transition-all"
                  >
                    <Download size={13} /> Download IEEE PNG
                  </button>
                </div>

                <div className="bg-white rounded-xl p-3 border border-slate-300 shadow-inner flex items-center justify-center">
                  <img
                    src={graphAssetUrls?.fig3}
                    alt="Fig. 3 System Pipeline Latency Breakdown"
                    className="max-h-72 object-contain rounded"
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-text-secondary">
                <span>End-to-End Latency: {systemPerformanceMetrics?.totalEndToEndLatencySec?.toFixed(2)}s</span>
                <span className="font-mono text-accent font-semibold">Stage 4 (Groq LLM) is dominant bottleneck</span>
              </div>
            </div>

            {/* Table III: Pipeline Performance Table */}
            <div className="lg:col-span-6 glass-card p-6 rounded-2xl border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-extrabold text-white tracking-tight">
                      Table III. PrepAce Processing Performance
                    </h3>
                    <p className="text-[11px] text-text-secondary">Stage-wise execution duration in seconds with percentage contribution</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(latexTables?.table3, "t3")}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5 transition-all"
                  >
                    {copiedKey === "t3" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    {copiedKey === "t3" ? "Copied LaTeX!" : "Copy LaTeX"}
                  </button>
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/10">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-text-secondary font-mono uppercase text-[10px]">
                      <tr>
                        <th className="p-3 border-b border-white/10">Pipeline Stage</th>
                        <th className="p-3 border-b border-white/10 text-right">Avg (s)</th>
                        <th className="p-3 border-b border-white/10 text-right">Min (s)</th>
                        <th className="p-3 border-b border-white/10 text-right">Max (s)</th>
                        <th className="p-3 border-b border-white/10 text-right">Std Dev (s)</th>
                        <th className="p-3 border-b border-white/10 text-right">% Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 font-mono">
                      {systemPerformanceMetrics?.stages?.map((st, idx) => (
                        <tr key={idx} className="hover:bg-white/5 transition-colors">
                          <td className="p-3 text-white font-sans font-medium">{st.stageName}</td>
                          <td className="p-3 text-right font-bold text-accent">{st.averageLatencySec?.toFixed(2)}</td>
                          <td className="p-3 text-right text-text-secondary">{st.minSec?.toFixed(2)}</td>
                          <td className="p-3 text-right text-text-secondary">{st.maxSec?.toFixed(2)}</td>
                          <td className="p-3 text-right text-text-secondary">±{st.stdDevSec?.toFixed(2)}</td>
                          <td className="p-3 text-right text-emerald-400 font-bold">{st.percentageContribution?.toFixed(1)}%</td>
                        </tr>
                      ))}
                      <tr className="bg-white/10 font-bold border-t-2 border-white/20">
                        <td className="p-3 text-white font-sans">Total End-to-End Latency</td>
                        <td className="p-3 text-right text-emerald-400 text-sm">{systemPerformanceMetrics?.totalEndToEndLatencySec?.toFixed(2)}s</td>
                        <td className="p-3 text-right text-text-secondary">--</td>
                        <td className="p-3 text-right text-text-secondary">--</td>
                        <td className="p-3 text-right text-text-secondary">--</td>
                        <td className="p-3 text-right text-emerald-400">100.0%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Stage Contribution Progress Visualizer */}
              <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <p className="text-xs font-semibold text-white flex items-center justify-between">
                  <span>Stage Latency Contribution Visualizer:</span>
                  <span className="text-accent font-mono">Total: {systemPerformanceMetrics?.totalEndToEndLatencySec?.toFixed(2)}s</span>
                </p>
                <div className="w-full h-3 rounded-full bg-black/40 overflow-hidden flex">
                  {systemPerformanceMetrics?.stages?.map((st, idx) => {
                    const bgColors = ["bg-slate-500", "bg-slate-400", "bg-sky-500", "bg-blue-600", "bg-purple-600"];
                    return (
                      <div
                        key={idx}
                        style={{ width: `${st.percentageContribution}%` }}
                        className={`${bgColors[idx % bgColors.length]} h-full transition-all`}
                        title={`${st.stageName}: ${st.averageLatencySec}s (${st.percentageContribution?.toFixed(1)}%)`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* LaTeX Code Export Modal */}
      {showLatexModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-card max-w-3xl w-full p-6 rounded-2xl border border-white/20 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCode2 size={20} className="text-accent" /> Export LaTeX Tables for Research Paper
              </h3>
              <button
                onClick={() => setShowLatexModal(false)}
                className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Table Selector Tabs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedLatexTable("table1")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedLatexTable === "table1" ? "bg-accent text-primary" : "bg-white/5 text-text-secondary"
                }`}
              >
                Table I (Parsing Time)
              </button>
              <button
                onClick={() => setSelectedLatexTable("table2")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedLatexTable === "table2" ? "bg-accent text-primary" : "bg-white/5 text-text-secondary"
                }`}
              >
                Table II (Accuracy)
              </button>
              <button
                onClick={() => setSelectedLatexTable("table3")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  selectedLatexTable === "table3" ? "bg-accent text-primary" : "bg-white/5 text-text-secondary"
                }`}
              >
                Table III (Pipeline Latency)
              </button>
            </div>

            {/* LaTeX Textarea Code */}
            <div className="relative">
              <textarea
                readOnly
                rows={12}
                value={latexTables?.[selectedLatexTable] || ""}
                className="w-full bg-black/60 text-emerald-400 font-mono text-xs p-4 rounded-xl border border-white/10 focus:outline-none"
              />
              <button
                onClick={() => copyToClipboard(latexTables?.[selectedLatexTable], selectedLatexTable)}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-accent text-primary font-bold text-xs flex items-center gap-1.5 shadow-lg"
              >
                {copiedKey === selectedLatexTable ? <Check size={14} /> : <Copy size={14} />}
                {copiedKey === selectedLatexTable ? "Copied!" : "Copy LaTeX"}
              </button>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowLatexModal(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-white font-semibold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
