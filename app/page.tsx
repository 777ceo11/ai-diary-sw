"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

export default function Home() {
  const [diaryContent, setDiaryContent] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [selectedSentiment, setSelectedSentiment] = useState<number | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const sentiments = [
    { label: "행복", emoji: "😊", color: "text-yellow-400" },
    { label: "슬픔", emoji: "😢", color: "text-blue-400" },
    { label: "분노", emoji: "😡", color: "text-red-400" },
    { label: "놀람", emoji: "😲", color: "text-purple-400" },
    { label: "평온", emoji: "😐", color: "text-gray-400" },
  ];

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleAnalyze = async () => {
    if (!diaryContent.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setTitle(null);
    setSelectedSentiment(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: diaryContent }),
      });

      if (!response.ok) throw new Error("분석 요청 실패");

      const data = await response.json();
      setResult(data.analysis);
      setTitle(data.title);
      setSelectedSentiment(data.sentiment.index);
    } catch (error) {
      console.error("Analysis failed:", error);
      setResult("죄송합니다. 분석 중 오류가 발생했습니다.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRestart = () => {
    if (confirm("정말 새로 작성하시겠습니까? 작성 중인 내용은 사라집니다.")) {
      setDiaryContent("");
      setResult(null);
      setTitle(null);
      setSelectedSentiment(null);
    }
  };

  const handleSave = () => {
    if (!diaryContent || !result) return;
    
    const entry = {
      title,
      content: diaryContent,
      result,
      sentiment: sentiments[selectedSentiment!],
      date: new Date().toISOString(),
    };
    
    const existingEntries = JSON.parse(localStorage.getItem("ai-diary-entries") || "[]");
    localStorage.setItem("ai-diary-entries", JSON.stringify([entry, ...existingEntries]));
    
    alert("일기가 안전하게 저장되었습니다!");
  };

  const today = new Date();
  const dateStr = mounted 
    ? today.toLocaleDateString("ko-KR", { month: "long", day: "numeric" })
    : "";
  const dayStr = mounted 
    ? today.toLocaleDateString("ko-KR", { weekday: "long" })
    : "";
  const timeStr = mounted 
    ? today.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: true })
    : "";

  return (
    <div className="min-h-screen bg-[#f1f4f9] p-6 text-[#1e293b] font-sans">
      <div className="max-w-xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex justify-between items-start pt-4">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tight text-[#2d3a8c]">
              {dateStr}
            </h1>
            <div className="mt-2 flex items-center gap-2 text-zinc-500 font-medium">
              <span>{dayStr}</span>
              <span className="text-zinc-300">•</span>
              <span>{timeStr}</span>
            </div>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm text-sm font-semibold text-[#5c67f2] border border-zinc-100 hover:bg-zinc-50 transition-all">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
              <path d="M8 7h6" />
              <path d="M8 11h8" />
            </svg>
            일기 목록
          </button>
        </header>

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-zinc-800">오늘의 일기 회고</h2>
        </div>

        {/* Diary Input Section */}
        <div className="relative bg-white rounded-[2.5rem] shadow-xl shadow-indigo-100/50 p-8 min-h-[400px] flex flex-col transition-all border border-transparent hover:border-indigo-100">
          <textarea
            className="flex-1 w-full text-lg leading-relaxed placeholder:text-zinc-300 border-none outline-none resize-none text-zinc-700 font-medium"
            placeholder="오늘 하루는 어떠셨나요? 당신의 마음을 들려주세요."
            value={diaryContent}
            onChange={(e) => setDiaryContent(e.target.value)}
          />
          <div className="flex justify-end mt-4">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !diaryContent.trim()}
              className={`flex items-center gap-2 px-6 py-4 bg-[#7c5dfa] text-white rounded-3xl font-bold shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale ${
                isAnalyzing ? "animate-pulse" : "hover:bg-[#6c48f8]"
              }`}
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  분석 중...
                </div>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                    <path d="M5 3v4" />
                    <path d="M19 17v4" />
                    <path d="M3 5h4" />
                    <path d="M17 19h4" />
                  </svg>
                  AI 분석하기
                </>
              )}
            </button>
          </div>
        </div>

        {/* Diary Title Section */}
        {title && (
          <div className="text-center animate-in fade-in zoom-in duration-700">
            <h2 className="text-2xl font-bold text-[#2d3a8c] bg-white/40 inline-block px-6 py-2 rounded-2xl border border-white/60 shadow-sm">
              {title}
            </h2>
          </div>
        )}

        {/* Sentiment Emoji Section */}
        <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 border border-white shadow-sm flex justify-around items-center">
          {sentiments.map((sentiment, index) => (
            <div
              key={index}
              className={`relative flex flex-col items-center gap-2 transition-all duration-500 ${
                selectedSentiment === null
                  ? "opacity-40 grayscale"
                  : selectedSentiment === index
                  ? "scale-125 opacity-100 grayscale-0"
                  : "opacity-20 grayscale scale-90"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center text-3xl shadow-inner transition-all ${
                  selectedSentiment === index ? "bg-white shadow-lg ring-4 ring-indigo-50" : ""
                }`}
              >
                {sentiment.emoji}
              </div>
              {selectedSentiment === index && (
                <span className="text-xs font-bold text-indigo-500 animate-bounce">
                  {sentiment.label}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* AI Analysis Result Section */}
        {(result || isAnalyzing) && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 bg-[#eff3ff] rounded-[2rem] p-8 border border-indigo-50 shadow-sm">
            <h3 className="text-sm font-bold text-[#5c67f2] mb-3 uppercase tracking-widest flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#5c67f2] rounded-full animate-ping" />
              AI 일기 감성 분석 결과
            </h3>
            {isAnalyzing ? (
              <div className="space-y-2">
                <div className="h-4 bg-zinc-200 rounded-full w-full animate-pulse" />
                <div className="h-4 bg-zinc-200 rounded-full w-5/6 animate-pulse" />
              </div>
            ) : (
              <>
                <p className="text-lg font-medium text-zinc-700 leading-relaxed break-keep">
                  {result}
                </p>
                
                {/* Action Buttons */}
                <div className="mt-8 pt-6 border-t border-indigo-100 flex gap-4">
                  <button 
                    onClick={handleSave}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-md hover:bg-indigo-700 transition-all active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
                    일기 저장하기
                  </button>
                  <button 
                    onClick={handleRestart}
                    className="px-6 flex items-center justify-center gap-2 py-4 bg-white text-zinc-500 border border-zinc-200 rounded-2xl font-bold hover:bg-zinc-50 transition-all active:scale-95"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                    재시작
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
