# CAP-CHECK  
**A Real-Time Debate and Conversation Analyzer**  
*Built with Python, Flask, React, and Raspberry Pi*

![CAP-CHECK Photo](capcheck.png)
---
## Overview  
**CAP-CHECK** is a wearable system created during the **Cornell Makeathon (Mar 2025)** that analyzes live debates and conversations to detect potential exaggerations or “cap.”  
The device uses **dual microphones** to capture dialogue, **AssemblyAI** for transcription, and a **web dashboard** with **LED indicators** to visualize “cap levels” in real time.  
The project explores how speech processing and embedded systems can make human interaction analysis more engaging and interactive.

---

## Tech Stack  
- **Programming Languages:** Python, TypeScript  
- **Frameworks & Tools:** Flask, React, WebSocket  
- **APIs:** AssemblyAI (Speech-to-Text)  
- **Hardware:** Raspberry Pi 4, Dual I2S Microphones, LED Matrix  

---

## How It Works
1. **Capture Audio** – Dual microphones record speakers simultaneously from different directions.  
2. **Transcribe Speech** – Audio is streamed to **AssemblyAI** for real-time transcription.  
3. **Analyze Conversation** – The backend applies tone and text heuristics (no ML) to flag possible exaggerations.  
4. **Visualize Results** – The **React** dashboard displays the transcript while the **Raspberry Pi LEDs** show the “cap level” live.

---
