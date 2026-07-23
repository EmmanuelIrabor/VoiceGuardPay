"use client";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Wallet, Mic, MessageSquare, Radar, MoveUpRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useState, useEffect, useRef } from "react";

const examplePhrases = [
  '"Pay 10,000 NGN to Sarah"',
  '"Pay my electricity bills"',
  '"Order take out"',
  '"Send 5,000 NGN to Mum"',
  '"Top up my data bundle"',
  '"Split the bill with Chidi"',
];

export default function Home() {
  const [index, setIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [debugStatus, setDebugStatus] = useState("idle");

  const router = useRouter();
  const wsRef = useRef<WebSocket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const requestDataIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasNavigatedRef = useRef(false); // guards against double-trigger

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % examplePhrases.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const stopListening = () => {
    if (requestDataIntervalRef.current) {
      clearInterval(requestDataIntervalRef.current);
      requestDataIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    setIsListening(false);
  };

  const startListening = async () => {
    hasNavigatedRef.current = false;
    setDebugStatus("requesting mic...");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY;
      if (!apiKey) {
        setDebugStatus("ERROR: NEXT_PUBLIC_DEEPGRAM_API_KEY is missing");
        console.error("Missing NEXT_PUBLIC_DEEPGRAM_API_KEY");
        return;
      }

      const ws = new WebSocket(
        "wss://api.deepgram.com/v1/listen?smart_format=true&interim_results=false&language=en",
        ["token", apiKey]
      );
      wsRef.current = ws;

      ws.onopen = () => {
        setDebugStatus("connected, listening...");

        const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm;codecs=opus" });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(event.data);
          }
        };

        mediaRecorder.start(); // no timeslice — single continuous encode session
        requestDataIntervalRef.current = setInterval(() => {
          if (mediaRecorder.state === "recording") mediaRecorder.requestData();
        }, 250);

        setIsListening(true);
      };

      ws.onmessage = (message) => {
        let data;
        try {
          data = JSON.parse(message.data);
        } catch {
          return;
        }

        if (data.type !== "Results") return;

        const alt = data.channel?.alternatives?.[0];
        const text = alt?.transcript;

        if (!text || text.trim() === "") return;

        setTranscript(text);
        setDebugStatus(`heard: "${text}"`);

        if (hasNavigatedRef.current) return; // already navigating, ignore further results

        if (/\bpay\b/i.test(text)) {
          hasNavigatedRef.current = true;
          setDebugStatus(`MATCH on "${text}" — navigating`);
          stopListening();
          router.push(`/ConfirmTransaction?command=${encodeURIComponent(text)}`);
        }
      };

      ws.onerror = (err) => {
        console.error("Deepgram WS error:", err);
        setDebugStatus("WS error — check console");
      };

      ws.onclose = (event) => {
        console.log("WS closed:", event.code, event.reason);
        setIsListening(false);
        if (!hasNavigatedRef.current) {
          setDebugStatus(`closed (code ${event.code}${event.reason ? ": " + event.reason : ""})`);
        }
      };
    } catch (err) {
      console.error("Mic access error:", err);
      setDebugStatus("mic access denied or unavailable");
    }
  };

  useEffect(() => {
    return () => stopListening(); // cleanup on unmount
  }, []);

  return (
    <>
      <NavBar />

      <div className="px-5 xl:px-20">
        <div className="balance-card--wrapper xl:px-40">
          <div className="balance-card bg-primary-500 mt-5 px-5 py-10 rounded-md cursor-pointer ">
            <div className="flex flex-row items-center justify-between">
              <div className="">
                <p className="text-xs text-neutral-400">Welcome Back</p>
                <p className="text-xl text-white font-bold">
                  NGN 100,000{" "}
                  <span className="text-xs text-light text-neutral-500">Available</span>
                </p>
              </div>
              <div className="">
                <Wallet size={40} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        <div
          className="mt-10 flex items-center justify-center cursor-pointer"
          onClick={isListening ? stopListening : startListening}
        >
          <div className="flex flex-row gap-x-2 items-center justify-center">
            <div className="wave rounded-full w-2 h-8 bg-primary-500" style={{ "--i": ".1s" } as React.CSSProperties}></div>
            <div className="wave rounded-full w-2 h-16 bg-primary-200" style={{ "--i": ".2s" } as React.CSSProperties}></div>
            <div className="wave rounded-full w-2 h-8 bg-primary-100" style={{ "--i": ".4s" } as React.CSSProperties}></div>
            <div className="wave rounded-full w-2 h-12 bg-primary-600" style={{ "--i": ".7s" } as React.CSSProperties}></div>
            <div className="wave rounded-full w-2 h-24 bg-primary-500" style={{ "--i": ".6s" } as React.CSSProperties}></div>
            <div className="wave rounded-full w-2 h-36 bg-primary-500" style={{ "--i": ".5s" } as React.CSSProperties}></div>
            <div className="wave rounded-full w-2 h-24 bg-primary-500" style={{ "--i": ".6s" } as React.CSSProperties}></div>
            <div className="wave rounded-full w-2 h-12 bg-neutral-200" style={{ "--i": ".7s" } as React.CSSProperties}></div>
            <div className="wave rounded-full w-2 h-8 bg-primary-100" style={{ "--i": ".4s" } as React.CSSProperties}></div>
            <div className="wave rounded-full w-2 h-16 bg-primary-300" style={{ "--i": ".2s" } as React.CSSProperties}></div>
            <div className="wave rounded-full w-2 h-8 bg-primary-500" style={{ "--i": ".1s" } as React.CSSProperties}></div>
          </div>
        </div>

        <div>
          <p className="text-center font-jetbrains text-neutral-800 text-xs">
            {isListening ? "Listening .." : "Tap the wave to start"}
          </p>

          <p className="text-center mt-1 transition-opacity duration-300">
            {transcript || examplePhrases[index]}
          </p>

          {/* TEMP debug line — remove once this is confirmed working */}
          <p className="text-center mt-2 text-xs text-neutral-400 font-mono">{debugStatus}</p>
        </div>

        <div className="flex flex-row items-center justify-between absolute bottom-6 left-0 right-0 px-6 xl:px-50  mb-4">
          <div className="flex justify-start  ">
            <Link
              href={"/Chat"}
              className="w-14 h-14 rounded-full bg-white text-black shadow-xl hover:scale-105 transition flex items-center justify-center"
            >
              <MessageSquare size={24} />
            </Link>
          </div>

          <div className="flex justify-end  ">
            <Link
              href={"/Proxima"}
              className="w-14 h-14 rounded-full bg-white text-black shadow-xl hover:scale-105 transition flex items-center justify-center"
            >
              <Radar size={24} />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}