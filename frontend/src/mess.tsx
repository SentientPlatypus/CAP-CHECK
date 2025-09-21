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