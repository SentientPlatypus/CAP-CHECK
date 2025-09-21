import { useEffect, useState , useRef} from "react";
import { chatActions } from '@/lib/globalState';

// Global flag to prevent multiple session starts
let globalSessionStarted = false;

function TranscriptLogger() {
  const [started, setStarted] = useState(false);

  // First effect → starts transcription
  useEffect(() => {
    // Prevent multiple session starts
    if (globalSessionStarted) {
      setStarted(true);
      return;
    }

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
        globalSessionStarted = true; // Mark as started globally
        setStarted(true); // 🚀 trigger the second effect
      } catch (err) {
        console.error("Fetch error:", err);
      }
    }
    startTranscript();
  }, []);

  // Track last processed text for each speaker to avoid repeats
  const lastSpeakerAText = useRef("");
  const lastSpeakerBText = useRef("");

  // Helper function to determine if text should be updated
  const shouldUpdateText = (newText: string, lastText: string): boolean => {
    if (!lastText) return true; // First time, always update
    if (newText === lastText) return false; // Exact duplicate
    
    // Check if new text is just an extension of the previous (partial transcription)
    if (newText.length > lastText.length && newText.startsWith(lastText)) {
      const addedText = newText.slice(lastText.length).trim();
      return addedText.length > 0; // Only update if meaningful content was added
    }
    
    // Different text entirely
    return true;
  };

  // Second effect → runs only once `started === true`
  useEffect(() => {
  if (!started) return;

  console.log("TranscriptLogger mounted (polling active)");
  let timer: ReturnType<typeof setInterval>;

  async function loadTranscript() {
    const url = "http://localhost:5000/api/transcribe";
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) {
        const text = await res.text();
        console.error("Fetch failed:", res.status, res.statusText, text);
        return;
      }

      let data = await res.json();
      console.log("Transcript:", data);

      if (!Array.isArray(data) || data.length === 0) return;

      // ✅ Latest transcript object
      const latest = data[data.length - 1];
      const speaker = latest.Speaker;
      const s = speaker.slice(-1);

      const newText = latest.Text?.trim();

      if (!newText) return;

      // Handle Speaker A
      if (s.includes("A")) {
        const lastText = lastSpeakerAText.current;
        
        // Only update if text is meaningfully different
        if (shouldUpdateText(newText, lastText)) {
          console.log("➡️ Setting Person A:", newText);
          lastSpeakerAText.current = newText;
          chatActions.setPersonOneInput(newText);
        }
      } 
      // Handle Speaker B
      else if (s.includes("B")) {
        const lastText = lastSpeakerBText.current;
        
        // Only update if text is meaningfully different
        if (shouldUpdateText(newText, lastText)) {
          console.log("➡️ Setting Person B:", newText);
          lastSpeakerBText.current = newText;
          chatActions.setPersonTwoInput(newText);
        }
      }
    } catch (err) {
      console.error("Fetch error:", err);
    }
  }

  loadTranscript();
  // Reduced interval for lower latency
  timer = setInterval(loadTranscript, 500);
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