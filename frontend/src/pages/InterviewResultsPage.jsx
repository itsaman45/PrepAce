import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, Button } from "../components/UI";
import { interviewApi } from "../services/interviewApi";
import {
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Clock,
  Zap,
  Brain,
  Layers,
  Download,
  Award,
  HelpCircle,
  MessageSquare
} from "lucide-react";

// ---- helpers -----------------------------------------------------------

const fmt = (n) => Number(n || 0).toFixed(1);
const clamp = (n) => Math.min(100, Math.max(0, Number(n) || 0));
const to100 = (val) => {
  const num = Number(val || 0);
  return num <= 10 ? num * 10 : num;
};

export const InterviewResultsPage = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();

  const [stateData, setStateData] = useState(null);
  const [result, setResult] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isNotCompleted, setIsNotCompleted] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      if (!sessionId) return;
      try {
        setLoading(true);
        setError(null);
        setIsNotCompleted(false);

        // Fetch full state to get result + all question evaluation rationales
        const stateRes = await interviewApi.getInterviewState(sessionId);
        if (stateRes.success && stateRes.data) {
          setStateData(stateRes.data);
          setResult(stateRes.data.result);
          setQuestions(stateRes.data.previousQuestions || []);
        } else {
          // Fallback to result API if state API doesn't return data
          const res = await interviewApi.getInterviewResult(sessionId);
          if (res.success && res.data) {
            setResult(res.data);
          } else {
            setError(res.message || "Couldn't load this result.");
          }
        }
      } catch (err) {
        console.error("Fetch Result Error:", err);
        if (err.response?.status === 409) {
          setIsNotCompleted(true);
        } else if (err.response?.status === 404) {
          setError("This result doesn't exist, or you don't have access to it.");
        } else {
          setError("Couldn't reach the server. Try again in a moment.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [sessionId]);

  // Compute topic-based summaries ensuring 0-100 scale
  const computedTopicPerformance = useMemo(() => {
    if (result?.topicPerformance && result.topicPerformance.length > 0) {
      return result.topicPerformance.map((tp) => ({
        ...tp,
        averageScore: to100(tp.averageScore),
      }));
    }
    if (!questions || questions.length === 0) return [];

    const map = {};
    questions.forEach((q) => {
      const topic = q.topic || "General Technical Assessment";
      if (!map[topic]) {
        map[topic] = { topic, count: 0, totalScore: 0 };
      }
      const rawScore = q.answer?.evaluation?.score || 0;
      map[topic].count += 1;
      map[topic].totalScore += to100(rawScore);
    });

    return Object.values(map).map((t) => {
      const avg = t.totalScore / t.count;
      let status = "AVERAGE";
      if (avg >= 75.0) status = "STRONG";
      else if (avg < 50.0) status = "WEAK";
      return {
        topic: t.topic,
        questionsAttempted: t.count,
        averageScore: avg,
        status: status,
      };
    });
  }, [result, questions]);

  // Downloadable report generator (HTML + Print ready PDF format)
  const handleDownloadReport = () => {
    if (!result) return;

    const candidateRole = result.targetRole || stateData?.session?.targetRole || "Software Engineer";
    const type = result.interviewType || stateData?.session?.interviewType || "TECHNICAL";
    const diff = result.difficulty || stateData?.session?.difficulty || "MEDIUM";
    const dateStr = result.completedAt ? new Date(result.completedAt).toLocaleDateString() : new Date().toLocaleDateString();

    const reportHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PrepAce Executive Interview Evaluation Report - ${candidateRole}</title>
  <style>
    @media print {
      body { margin: 20px; color: #0f172a; }
      .no-print { display: none; }
      .page-break { page-break-after: always; }
    }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 40px; color: #1e293b; background: #ffffff; line-height: 1.5; }
    .header { border-bottom: 3px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
    .brand { font-size: 22px; font-weight: 800; color: #0284c7; letter-spacing: -0.5px; text-transform: uppercase; }
    .report-title { font-size: 20px; font-weight: 700; color: #0f172a; margin-top: 4px; }
    .meta-bar { font-size: 12px; color: #64748b; margin-top: 6px; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: #f1f5f9; color: #334155; margin-right: 6px; }
    .badge-accent { background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; }
    .badge-strong { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
    .badge-weak { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
    
    .score-summary { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
    .score-num { font-size: 42px; font-weight: 900; color: #0284c7; line-height: 1; }
    .score-label { font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 4px; }
    
    .section-title { font-size: 16px; font-weight: 800; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px; margin-top: 28px; margin-bottom: 14px; text-transform: uppercase; letter-spacing: 0.5px; }
    
    table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 12px; }
    th { background: #f1f5f9; text-align: left; padding: 10px; border: 1px solid #cbd5e1; font-weight: 700; color: #334155; text-transform: uppercase; }
    td { padding: 10px; border: 1px solid #cbd5e1; color: #334155; }
    
    .q-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 16px; background: #fafafa; }
    .q-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
    .q-seq { font-weight: 700; color: #0284c7; font-size: 13px; }
    .q-text { font-weight: 600; font-size: 14px; color: #0f172a; margin-bottom: 8px; }
    .answer-box { background: #ffffff; border-left: 3px solid #0284c7; padding: 8px 12px; font-size: 12px; color: #334155; margin-bottom: 10px; font-style: italic; }
    
    .rationale-box { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px 12px; font-size: 12px; color: #1e3a8a; }
    .rationale-title { font-weight: 700; color: #1e40af; margin-bottom: 4px; font-size: 11px; text-transform: uppercase; }
    .improvements-box { background: #fff7ed; border: 1px solid #ffedd5; border-radius: 6px; padding: 8px 12px; font-size: 12px; color: #9a3412; margin-top: 8px; }
    
    .grid-2 { display: flex; gap: 16px; margin-bottom: 20px; }
    .col { flex: 1; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px; background: #f8fafc; }
    
    .footer { margin-top: 40px; border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 11px; color: #94a3b8; }
    .btn-download { background: #0284c7; color: white; border: none; padding: 10px 20px; border-radius: 6px; font-weight: 700; cursor: pointer; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="no-print" style="text-align: right; margin-bottom: 10px;">
    <button class="btn-download" onclick="window.print()">Print / Save as PDF</button>
  </div>

  <div class="header">
    <div>
      <div class="brand">PrepAce AI Evaluation</div>
      <div class="report-title">Candidate Performance Report</div>
      <div class="meta-bar">
        Target Role: <strong>${candidateRole}</strong> | Type: <strong>${type}</strong> | Difficulty: <strong>${diff}</strong> | Date: <strong>${dateStr}</strong>
      </div>
    </div>
    <div>
      <span class="badge badge-accent">${result.performanceLabel || "EVALUATED"}</span>
    </div>
  </div>

  <div class="score-summary">
    <div>
      <div class="score-label">Overall Competency Score</div>
      <div class="score-num">${fmt(result.overallScore)} <span style="font-size: 18px; font-weight: 400; color: #64748b;">/ 100</span></div>
    </div>
    <div style="text-align: right;">
      <div style="font-size: 12px; color: #64748b;"><strong>Questions Attempted:</strong> ${result.totalAnswered ?? 0}</div>
      <div style="font-size: 12px; color: #64748b;"><strong>Questions Skipped:</strong> ${result.totalSkipped ?? 0}</div>
    </div>
  </div>

  <div style="font-size: 13px; color: #334155; margin-bottom: 20px;">
    <strong>Executive AI Summary:</strong> ${result.feedbackSummary || "Candidate completed full mock interview simulation."}
  </div>

  <div class="section-title">1. Topic Performance Summary</div>
  <table>
    <thead>
      <tr>
        <th>Topic / Domain</th>
        <th>Questions Attempted</th>
        <th>Average Score (Out of 100)</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${(computedTopicPerformance.length > 0 ? computedTopicPerformance : [{ topic: 'General Assessment', questionsAttempted: result.totalAnswered, averageScore: result.overallScore, status: result.performanceLabel }]).map(tp => `
        <tr>
          <td><strong>${tp.topic}</strong></td>
          <td>${tp.questionsAttempted}</td>
          <td>${fmt(to100(tp.averageScore))} / 100</td>
          <td><span class="badge ${tp.status === 'STRONG' ? 'badge-strong' : tp.status === 'WEAK' ? 'badge-weak' : ''}">${tp.status}</span></td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <div class="section-title">2. Per-Question Detailed Evaluation & Scoring Rationale</div>
  ${(questions || []).map((q, idx) => {
    const evalData = q.answer?.evaluation || {};
    const scoreVal = evalData.score ? fmt(to100(evalData.score)) : "N/A";
    return `
      <div class="q-card">
        <div class="q-header">
          <span class="q-seq">Question ${q.sequence || (idx + 1)}: ${q.topic || "General"}</span>
          <span class="badge badge-accent">Score: ${scoreVal} / 100</span>
        </div>
        <div class="q-text">${q.questionText}</div>
        <div class="answer-box"><strong>Candidate Answer:</strong> "${q.answer?.answerText || "Skipped / No Answer Submitted"}"</div>
        
        <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
          <strong>Sub-scores (Out of 100):</strong> Correctness: ${evalData.correctnessScore ? fmt(to100(evalData.correctnessScore)) : "N/A"} | Relevance: ${evalData.relevanceScore ? fmt(to100(evalData.relevanceScore)) : "N/A"} | Clarity: ${evalData.clarityScore ? fmt(to100(evalData.clarityScore)) : "N/A"}
        </div>

        <div class="rationale-box">
          <div class="rationale-title">Reason Scored So (AI Rationale):</div>
          <div>${evalData.feedback || "Evaluated for technical depth, answer structure, and clarity."}</div>
        </div>

        ${evalData.improvements ? `
          <div class="improvements-box">
            <strong>Suggested Improvement:</strong> ${evalData.improvements}
          </div>
        ` : ''}
      </div>
    `;
  }).join('')}

  <div class="section-title">3. Strengths & Areas for Improvement</div>
  <div class="grid-2">
    <div class="col" style="background: #f0fdf4; border-color: #bbf7d0;">
      <strong style="color: #166534; font-size: 12px; text-transform: uppercase;">Key Strengths:</strong>
      <ul style="margin-top: 6px; padding-left: 18px; font-size: 12px; color: #14532d;">
        ${(result.strengths || []).map(s => `<li>${s}</li>`).join('') || '<li>Consistent communication.</li>'}
      </ul>
    </div>
    <div class="col" style="background: #fffbe6; border-color: #ffe58f;">
      <strong style="color: #873800; font-size: 12px; text-transform: uppercase;">Areas for Improvement:</strong>
      <ul style="margin-top: 6px; padding-left: 18px; font-size: 12px; color: #612500;">
        ${(result.weaknesses || []).map(w => `<li>${w}</li>`).join('') || '<li>Technical depth & system edge cases.</li>'}
      </ul>
    </div>
  </div>

  <div class="footer">
    PrepAce Mock Interview Platform Report • Confidential Candidate Document
  </div>
</body>
</html>
    `;

    const blob = new Blob([reportHtml], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PrepAce_Evaluation_Report_${candidateRole.replace(/\s+/g, '_')}_${dateStr.replace(/\//g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // ---- loading ----
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-accent/20 border-t-accent animate-spin" />
        <p className="text-text-secondary font-mono text-xs uppercase tracking-widest">
          Compiling candidate topic analytics & evaluation rationales…
        </p>
      </div>
    );
  }

  // ---- session still in progress ----
  if (isNotCompleted) {
    return (
      <div className="max-w-md mx-auto py-16 text-center px-4">
        <Card className="w-full max-w-none border-warning/30 bg-card/80 backdrop-blur-md p-8">
          <Clock size={40} className="text-warning mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2 font-space">Not finished yet</h3>
          <p className="text-text-secondary text-sm mb-6 leading-relaxed font-dm">
            This session hasn't been completed. Resume it to answer the remaining questions.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard")}>
              Dashboard
            </Button>
            <Button className="w-full" onClick={() => navigate(`/interview/${sessionId}`)}>
              Resume interview
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ---- error ----
  if (error || !result) {
    return (
      <div className="max-w-md mx-auto py-16 text-center px-4">
        <Card className="w-full max-w-none border-error/30 bg-card/80 backdrop-blur-md p-8">
          <AlertTriangle size={40} className="text-error mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2 font-space">Result unavailable</h3>
          <p className="text-text-secondary text-sm mb-6 font-dm">{error || "No result data found."}</p>
          <Button onClick={() => navigate("/dashboard")}>Back to dashboard</Button>
        </Card>
      </div>
    );
  }

  const overallScore = clamp(result.overallScore);

  return (
    <div className="w-full max-w-[1500px] mx-auto py-8 px-4 md:px-8 font-dm space-y-8">
      {/* Top Meta & Action Header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="px-3 py-1 rounded-md text-xs font-mono font-bold bg-accent/10 border border-accent/30 text-accent uppercase tracking-wider">
            {result.targetRole || "Software Engineer"}
          </span>
          <span className="px-3 py-1 rounded-md text-xs font-mono bg-white/[0.05] border border-white/10 text-white/80 uppercase">
            {result.interviewType || "TECHNICAL"} • {result.difficulty || "MEDIUM"}
          </span>
          {result.feedbackSource === "AI" && (
            <span className="px-3 py-1 rounded-md text-xs font-mono bg-purple-500/10 border border-purple-500/30 text-purple-400 flex items-center gap-1.5 font-semibold">
              <Sparkles size={12} /> AI Evaluated
            </span>
          )}
          <span className="text-xs font-mono text-text-secondary hidden md:inline">
            Completed: {result.completedAt ? new Date(result.completedAt).toLocaleDateString() : "Recently"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            onClick={handleDownloadReport}
            className="bg-accent text-primary hover:bg-accent/90 font-mono font-bold text-xs uppercase tracking-wider py-2.5 px-4 flex items-center gap-2"
          >
            <Download size={14} />
            <span>Download Report</span>
          </Button>

          <Button variant="outline" size="sm" onClick={() => navigate("/interview")}>
            <RotateCcw size={14} />
            <span>Practice again</span>
          </Button>

          <Button size="sm" variant="outline" onClick={() => navigate("/dashboard")}>
            <span>Dashboard</span>
            <ArrowRight size={14} />
          </Button>
        </div>
      </motion.div>

      {/* Grid: Overall Score & Strengths/Weaknesses */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch"
      >
        {/* Overall Score Card */}
        <Card className="w-full max-w-none lg:col-span-4 p-6 md:p-8 border-accent/20 bg-gradient-to-b from-secondary/80 via-card to-accent/[0.02] flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-mono uppercase tracking-widest text-text-secondary block mb-2">
              Overall Score
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-7xl font-black text-white font-space tracking-tight leading-none">
                {fmt(overallScore)}
              </span>
              <span className="text-lg font-mono text-text-secondary">/ 100</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <span
              className={`px-3.5 py-1 rounded-full text-xs font-mono font-bold uppercase border tracking-wider ${(result.performanceLabel || "").toUpperCase() === "EXCELLENT"
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : (result.performanceLabel || "").toUpperCase() === "STRONG"
                    ? "bg-accent/10 text-accent border-accent/30"
                    : (result.performanceLabel || "").toUpperCase() === "COMPETENT"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      : "bg-error/10 text-error border-error/30"
                }`}
            >
              {result.performanceLabel || "EVALUATED"}
            </span>

            <div className="flex items-center gap-4 text-xs font-mono text-text-secondary">
              <span>{result.totalAnswered ?? 0} answered</span>
              <span>•</span>
              <span>{result.totalSkipped ?? 0} skipped</span>
            </div>
          </div>
        </Card>

        {/* Strengths & Weaknesses Card */}
        <Card className="w-full max-w-none lg:col-span-8 p-6 md:p-8 border-white/10 flex flex-col justify-between space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* What Worked */}
            <div>
              <h2 className="text-sm font-bold text-white font-space uppercase tracking-wider mb-4 flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>What Worked</span>
              </h2>
              {result.strengths?.length > 0 ? (
                <ul className="space-y-2.5">
                  {result.strengths.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-white/90 leading-relaxed font-dm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-text-secondary text-xs font-mono leading-relaxed">
                  No notable technical strengths recorded for this session. Focus on foundational preparation.
                </div>
              )}
            </div>

            {/* What to Work On */}
            <div>
              <h2 className="text-sm font-bold text-white font-space uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-amber-400" />
                <span>What to Work On</span>
              </h2>
              {result.weaknesses?.length > 0 ? (
                <ul className="space-y-2.5">
                  {result.weaknesses.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-white/90 leading-relaxed font-dm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-text-secondary text-xs font-mono leading-relaxed">
                  No specific weaknesses flagged.
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* TOPIC BASED SUMMARY SECTION */}
      <Card className="w-full max-w-none p-6 md:p-8 border-white/10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/30 text-accent">
              <Layers size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-space uppercase tracking-wider">
                Topic-Based Performance Breakdown
              </h2>
              <p className="text-xs text-text-secondary font-dm">
                Summary performance per technical/HR evaluation domain.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-accent bg-accent/10 border border-accent/20 px-3 py-1 rounded-full">
            {computedTopicPerformance.length} Topics Evaluated
          </span>
        </div>

        {computedTopicPerformance.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {computedTopicPerformance.map((topicItem, idx) => {
              const statusStr = (topicItem.status || "AVERAGE").toUpperCase();
              const isStrong = statusStr === "STRONG" || statusStr === "EXCELLENT";
              const isWeak = statusStr === "WEAK" || statusStr === "NEEDS_IMPROVEMENT";

              return (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-white/[0.02] border border-white/10 hover:border-white/20 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-sm font-bold text-white font-dm leading-snug">
                      {topicItem.topic}
                    </h4>
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-md uppercase border shrink-0 ${
                        isStrong
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : isWeak
                          ? "bg-error/10 text-error border-error/30"
                          : "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      }`}
                    >
                      {statusStr}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between pt-2 border-t border-white/5">
                    <span className="text-xs text-text-secondary font-mono">
                      Questions: {topicItem.questionsAttempted || 1}
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-bold text-accent font-space">
                        {fmt(to100(topicItem.averageScore))}
                      </span>
                      <span className="text-xs text-text-secondary font-mono">/ 100</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 text-text-secondary text-xs font-mono">
            Topic breakdown summary unavailable for this session.
          </div>
        )}
      </Card>

      {/* QUESTION BY QUESTION SCORING AND RATIONALE SECTION */}
      <Card className="w-full max-w-none p-6 md:p-8 border-white/10 space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/30 text-accent">
              <Award size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white font-space uppercase tracking-wider">
                Question Marks & Scoring Rationale
              </h2>
              <p className="text-xs text-text-secondary font-dm">
                Detailed evaluation for each question asked, including candidate response, marks awarded, and reason scored.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-text-secondary bg-white/5 px-3 py-1 rounded-full border border-white/10">
            {questions.length} Questions Reviewed
          </span>
        </div>

        {questions && questions.length > 0 ? (
          <div className="space-y-6">
            {questions.map((q, idx) => {
              const evalData = q.answer?.evaluation || {};
              const rawScore = evalData.score ? Number(evalData.score) : 0;
              const score100 = to100(rawScore);
              const isHighScore = score100 >= 75.0;
              const isLowScore = score100 < 50.0 && score100 > 0;

              return (
                <div
                  key={q.id || idx}
                  className="p-5 rounded-2xl bg-secondary/40 border border-white/10 space-y-4 hover:border-white/20 transition-all"
                >
                  {/* Q Header */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md bg-accent/10 border border-accent/30 text-accent font-mono text-xs font-bold">
                        Q{q.sequence || idx + 1}
                      </span>
                      <span className="text-xs font-mono bg-white/5 border border-white/10 text-white/80 px-2.5 py-1 rounded-md">
                        {q.topic || "General"}
                      </span>
                      {q.difficulty && (
                        <span className="text-[10px] font-mono text-text-secondary uppercase">
                          • {q.difficulty}
                        </span>
                      )}
                    </div>

                    {/* Marks Awarded Badge */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary font-mono uppercase">Marks:</span>
                      <span
                        className={`px-3 py-1 rounded-lg text-sm font-bold font-mono border ${
                          isHighScore
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : isLowScore
                            ? "bg-error/10 text-error border-error/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {fmt(score100)} / 100
                      </span>
                    </div>
                  </div>

                  {/* Question Text */}
                  <div>
                    <h4 className="text-sm font-bold text-white font-dm leading-snug mb-2 flex items-start gap-2">
                      <HelpCircle size={16} className="text-accent shrink-0 mt-0.5" />
                      <span>{q.questionText}</span>
                    </h4>
                  </div>

                  {/* Candidate Answer */}
                  <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 font-dm text-xs text-white/90 space-y-1">
                    <div className="text-[10px] font-mono text-text-secondary uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare size={12} className="text-accent" /> Candidate Submitted Response:
                    </div>
                    <p className="italic text-white/80 leading-relaxed pl-1">
                      "{q.answer?.answerText || "Skipped / No Answer Provided"}"
                    </p>
                  </div>

                  {/* Sub-score breakdown */}
                  <div className="flex flex-wrap gap-3 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/10 text-text-secondary">
                      Correctness: <strong className="text-white">{fmt(to100(evalData.correctnessScore))} / 100</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/10 text-text-secondary">
                      Relevance: <strong className="text-white">{fmt(to100(evalData.relevanceScore))} / 100</strong>
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/10 text-text-secondary">
                      Clarity: <strong className="text-white">{fmt(to100(evalData.clarityScore))} / 100</strong>
                    </span>
                  </div>

                  {/* Reason Scored So / Scoring Rationale Box */}
                  <div className="p-4 rounded-xl bg-accent/[0.03] border border-accent/20 space-y-2">
                    <div className="text-xs font-mono font-bold text-accent uppercase tracking-wider flex items-center gap-2">
                      <Sparkles size={14} /> Reason Scored So (AI Rationale)
                    </div>
                    <p className="text-xs text-white/90 leading-relaxed font-dm">
                      {evalData.feedback || "Evaluated based on conceptual accuracy, role relevance, and overall communication structure."}
                    </p>

                    {evalData.improvements && (
                      <div className="pt-2 border-t border-accent/10 mt-2 text-xs text-amber-300 font-dm">
                        <strong>Key Areas for Improvement:</strong> {evalData.improvements}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/5 text-center text-text-secondary text-xs font-mono">
            No detailed question evaluation logs available for this session.
          </div>
        )}
      </Card>

      {/* AI Study Roadmap */}
      <Card className="w-full max-w-none p-6 md:p-8 border-accent/20 bg-gradient-to-b from-card via-secondary/30 to-accent/[0.02] space-y-6">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4">
          <div className="p-2.5 rounded-xl bg-accent/10 border border-accent/30 text-accent">
            <Brain size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-space uppercase tracking-wider">
              Personalized AI Study Roadmap
            </h2>
          </div>
        </div>

        {/* 3 Internal Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Col 1: Performance Summary */}
          <div className="p-5 rounded-2xl bg-secondary/50 border border-white/10 space-y-2 flex flex-col">
            <h3 className="text-xs font-mono font-bold text-accent uppercase tracking-wider flex items-center gap-2">
              <Layers size={14} /> Performance Summary
            </h3>
            <p className="text-xs text-white/90 leading-relaxed font-dm flex-1 pt-1">
              {result.feedbackSummary}
            </p>
          </div>

          {/* Col 2: Recommended Next Steps */}
          <div className="p-5 rounded-2xl bg-secondary/50 border border-white/10 space-y-3 flex flex-col">
            <h3 className="text-xs font-mono font-bold text-accent uppercase tracking-wider flex items-center gap-2">
              <Zap size={14} /> Recommended Next Steps
            </h3>
            {result.recommendations?.length > 0 ? (
              <ol className="space-y-2.5 flex-1">
                {result.recommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-white/90 leading-relaxed font-dm">
                    <span className="w-4 h-4 rounded-full bg-accent/10 border border-accent/30 text-accent font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-xs font-mono text-text-secondary">No recommendations specified.</p>
            )}
          </div>

          {/* Col 3: Topics to Review */}
          <div className="p-5 rounded-2xl bg-secondary/50 border border-white/10 space-y-3 flex flex-col">
            <h3 className="text-xs font-mono font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={14} /> Topics to Review
            </h3>
            {result.suggestedTopicsToStudy?.length > 0 ? (
              <div className="flex flex-wrap gap-2 flex-1 items-start">
                {result.suggestedTopicsToStudy.map((topic, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 rounded-lg text-xs font-mono bg-blue-500/10 border border-blue-500/20 text-blue-300 font-medium"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs font-mono text-text-secondary">No specific study topics flagged.</p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default InterviewResultsPage;