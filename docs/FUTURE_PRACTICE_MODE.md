# Future Feature: Practice Mode (AI-powered)

This mode is intentionally postponed until we have a real tajwīd-aware AI backend.

Planned goals:

- Real ASR + tajwīd engine (Python service: FastAPI/Flask + Whisper/wav2vec2 or similar).
- Rule-focused practice:
  - ghunnah
  - madd (طبيعي / متصل / منفصل / لازم)
  - idgham (with/without ghunnah)
  - ikhfa, iqlab, etc.
- Unlock Practice Mode only when:
  - The backend can reliably:
    - align recitation with Qur’an text
    - detect specific tajwīd rules per word
    - return structured feedback in `TajweedAnalysisResponse`.

Additional TODOs for this future mode:

- Design a dedicated “Practice” flow:

  - Choose specific tajwīd rules to focus on (e.g. “practice ghunnah only”).
  - Filter ayat/segments that contain those rules.
  - Show per-rule progress (e.g. “your ghunnah consistency over time”).

- Extend the current API contract:

  - Per-rule scoring (rule-level stats, not just overall score).
  - Rule-focused feedback summaries (e.g. “you improved in madd, but ghunnah needs more work”).

- UX considerations:
  - Make it clear to the user that Practice Mode is _training_ and not a formal certification.
  - Keep tone encouraging and gentle.

---

The idea is: for this phase we keep Noor Tajweed simple and honest (Free + Kids only), and we clearly document that a real, AI-powered Practice Mode will come later when the backend is ready.
