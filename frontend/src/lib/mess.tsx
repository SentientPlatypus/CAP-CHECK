import { useEffect, useState } from "react";

function TranscriptLogger() {
  const [started, setStarted] = useState(false);

  // First effect → starts transcription
  useEffect(() => {
    async function startTranscript() {
      const url = "http://localhost:5000/api/start_transcribe";
      try {
        console.log("GET", url);
        const res = await fetch(url);
        if (!res.ok) {
          const text = await res.text();
          console.error("Fetch start failed:", res.status, res.statusText, text);
          return;
        }

        const data = await res.json();
        console.log("[startTranscript] ✅ Success! Transcript started:", data);
        setStarted(true); // 🚀 trigger the second effect
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }
    startTranscript();
  }, []);

  // Second effect → runs only once `started === true`
  useEffect(() => {
    if (!started) return; // ⏸ wait until started

    console.log("TranscriptLogger mounted (polling active)");
    let timer;

    async function loadTranscript() {
      const url = "http://localhost:5000/api/transcribe";
      try {
        console.log("GET", url);
        const res = await fetch(url);

        if (!res.ok) {
          const text = await res.text();
          console.error("Fetch failed:", res.status, res.statusText, text);
          return;
        }

        const data = await res.json();
        console.log("Transcript:", data);
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }

    loadTranscript();
    timer = setInterval(loadTranscript, 1000); // every 1s
    return () => clearInterval(timer);
  }, [started]); // ✅ runs only after setStarted(true)

  //end
    useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "p" || e.key === "P") {
        async function endTranscript() {
          const url = "http://localhost:5000/api/end_transcribe";
          try {
            console.log("GET", url);
            const res = await fetch(url);
            if (!res.ok) {
              const text = await res.text();
              console.error("Fetch end failed:", res.status, res.statusText, text);
              return;
            }

            const data = await res.json();
            console.log("[endTranscript] 🛑 Stopped:", data);
            setStarted(false); // stop polling
          } catch (err) {
            console.error("Fetch error:", err);
          }
        }
        endTranscript();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return null; // no UI
}

export default TranscriptLogger;