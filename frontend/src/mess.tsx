import { useEffect,useRef,useState } from "react";
import { chatActions } from '@/lib/globalState';

function TranscriptLogger() {
  const [started, setStarted] = useState(false);

    // Remember last applied values so we don't spam identical writes
  const lastA = useRef<string | null>(null);
  const lastB = useRef<string | null>(null);
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
    if (!started) return;

    console.log("TranscriptLogger mounted (polling active)");
    let timer: ReturnType<typeof setInterval>;

    async function loadTranscript() {
      const url = "http://localhost:5000/api/transcribe";
      try {
        console.log("GET", url);
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          const text = await res.text();
          console.error("Fetch failed:", res.status, res.statusText, text);
          return;
        }

        // Backend may return a single string or an array of strings like:
        // "Speaker A: Hello ..." or "Speaker B: ...".
        let data = await res.json();
        if (!Array.isArray(data)) data = [data];

        // find latest line per speaker (if any)
        const lastLineA = [...data].reverse().find((line: string) =>
          typeof line === "string" && line.startsWith("Speaker A:")
        );
        const lastLineB = [...data].reverse().find((line: string) =>
          typeof line === "string" && line.startsWith("Speaker B:")
        );

        if (lastLineA) {
          const text = lastLineA.replace("Speaker A:", "").trim();
          if (text && text !== lastA.current) {
            chatActions.setPersonOneInput(text);
            lastA.current = text;
            console.log("➡️ Person A set:", text);
          }
        }
        if (lastLineB) {
          const text = lastLineB.replace("Speaker B:", "").trim();
          if (text && text !== lastB.current) {
            chatActions.setPersonTwoInput(text);
            lastB.current = text;
            console.log("➡️ Person B set:", text);
          }
        }
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }

    loadTranscript();
    timer = setInterval(loadTranscript, 1000); // every 1s
    return () => clearInterval(timer);
  }, [started]);

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






// import { useEffect } from "react";

// function TranscriptLogger() {
//   useEffect(() => {
//     console.log("TranscriptLogger mounted");
//     let timer;

//     async function loadTranscript() {
//       const url = "http://localhost:5000/api/transcribe";
//       try {
//         console.log("POST", url);
//         const res = await fetch(url, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({})
//         });
//         const data = await res.json();
//         console.log("Transcript:", data);
//       } catch (err) {
//         console.error("Fetch error:", err);
//       }
//     }

//     loadTranscript();
//     timer = setInterval(loadTranscript, 1000); // every 2s
//     return () => clearInterval(timer);
//   }, []);

//   return null; // no UI
// }

// export default TranscriptLogger;








// import React, { useEffect, useState } from "react";

// function MyComponent() {
//   const [lines, setLines] = useState([]);

//   useEffect(() => {
//     let timer;

//     async function loadTranscript() {
//       try {
//         const url = "http://localhost:5000/api/transcribe"; // make sure this matches your Flask port
//         const res = await fetch(url, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({}) // add payload if your API expects one
//         });

//         if (!res.ok) {
//           const body = await res.text().catch(() => "");
//           console.error(`Fetch ${url} failed: ${res.status} ${res.statusText}`, body);
//           return;
//         }

//         const data = await res.json(); // [{ Speaker, Text }, ...]
//         const all = (Array.isArray(data) ? data : []).map(
//           r => `${r.Speaker}: ${r.Text}`.trim()
//         );

//         setLines(all);
//         console.log(`[${new Date().toISOString()}] Lines:`, all);
//       } catch (err) {
//         console.error("Fetch error:", err);
//       }
//     }

//     loadTranscript();
//     timer = setInterval(loadTranscript, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   return (
//     <div>
//       {lines.map((line, i) => (
//         <div key={i}>{line}</div>
//       ))}
//     </div>
//   );
// }

// export default MyComponent;