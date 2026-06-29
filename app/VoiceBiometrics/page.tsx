"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import { Mic, ChevronLeft ,ChevronsRight } from "lucide-react";
import { CirclesThreePlus } from "phosphor-react";
import T from "@/components/T";
import Link from "next/link";
import { notify } from "@/lib/stores/notifyStore";
import { convertToWav } from "@/lib/audio/convertToWav";

const SAMPLE_PHRASES = [
  "The cat jumps over the fence",
  "Voice is the key to my account",
  "Security begins with my own words",
];

export default function VoiceBiometrics() {
  const router = useRouter();
  const [sampleIndex, setSampleIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        await uploadSample(blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      notify.error("Microphone access denied or unavailable.");
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  };

  const uploadSample = async (blob: Blob) => {
  setIsUploading(true);
  try {
    const wavBlob = await convertToWav(blob); 

    const formData = new FormData();
    formData.append("file", wavBlob, `sample-${sampleIndex + 1}.wav`);

      const token = localStorage.getItem("token");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/voice/enroll`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Enrollment failed for this sample.");
      }

      notify.success(`Sample ${sampleIndex + 1} recorded.`);

      if (sampleIndex < SAMPLE_PHRASES.length - 1) {
        setSampleIndex((prev) => prev + 1);
      } else {
        notify.success("Voice enrollment complete.");
        router.push("/Success-0126647");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed.";
      notify.error(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <NavBar />

      <div className="px-5 xl:px-20 mt-10">
        <div className="flex items-center gap-1">
          <Link href="../LanguageSelect/">
            <ChevronLeft size={15} className="text-primary-500 font-bold" />
          </Link>

          <div className="bg-primary-100 w-40 p-2 flex flex-row items-center gap-2 rounded-md font-jetbrains text-primary-500 text-xs ">
            <CirclesThreePlus size={15} className="text-primary-500" weight="fill" />
            <T>Step 02</T>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-medium mt-2 font-geist typing">
            <T>Kindly provide a voice sample.</T>
          </h1>
          <p className="text-xs text-neutral-800 mt-1">
            <T>Repeat the statements below to create your voice sample.</T>
          </p>
        </div>

        <div className="flex flex-col justify-center items-center mt-10 gap-8">
          <Mic
            size={80}
            className={`font-light ${isRecording ? "text-red-500" : "text-primary-500"}`}
          />
        </div>

        <div className="flex flex-col justify-center items-center mt-10">
          <div className="loading-wave">
            <div className="obj"></div>
            <div className="obj"></div>
            <div className="obj"></div>
            <div className="obj"></div>
            <div className="obj"></div>
            <div className="obj"></div>
            <div className="obj"></div>
            <div className="obj"></div>
          </div>
        </div>

        <div>
          <p className="text-xs text-center font-jetbrains text-neutral-800 mt-10">
            <T>{`Sample ${sampleIndex + 1} : ${SAMPLE_PHRASES[sampleIndex]}`}</T>
          </p>
        </div>

        <div className="flex flex-col justify-center items-center mt-10">
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={() => isRecording && stopRecording()}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            disabled={isUploading}
            className="btn-primary text-md rounded-md disabled:opacity-60"
          >
            <T>
              {isUploading
                ? "Uploading..."
                : isRecording
                ? "Recording... release to stop"
                : "Hold to record sample"}
            </T>
          </button>


        </div>

        <Link  href={'/Home'} className="flex items-center gap-1 text-primary-500 text-xs mt-10">

        <p >Next</p>
        <ChevronsRight size={10}/>
          
        </Link>
      </div>
      <Footer />
    </>
  );
}