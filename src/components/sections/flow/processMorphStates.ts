export type ProcessMorphName = "discovery" | "direction" | "build" | "launch";

type ProcessMorphState = {
  name: ProcessMorphName;
  outline: string;
  spine: string;
  accent: { x: number; y: number };
  detail: string;
};

// Each state keeps the same three animated elements: a closed outline, an open
// structural spine, and a square accent. Only the small contextual marks fade.
export const PROCESS_MORPH_STATES: readonly ProcessMorphState[] = [
  {
    name: "discovery",
    outline: "M 220 112 C 273 112 316 155 316 208 C 316 261 273 304 220 304 C 167 304 124 261 124 208 C 124 155 167 112 220 112 Z",
    spine: "M 285 276 L 375 366",
    accent: { x: 210, y: 198 },
    detail: "M 220 166 V 190 M 220 226 V 250 M 178 208 H 202 M 238 208 H 262",
  },
  {
    name: "direction",
    outline: "M 132 130 L 330 130 L 382 178 L 330 226 L 132 226 Z",
    spine: "M 240 106 L 240 384",
    accent: { x: 340, y: 168 },
    detail: "M 246 252 H 148 L 100 292 L 148 332 H 246 Z M 240 226 V 252",
  },
  {
    name: "build",
    outline: "M 184 272 L 296 272 L 296 318 L 282 318 L 278 362 L 258 344 L 240 382 L 222 344 L 202 362 L 198 318 L 184 318 Z",
    spine: "M 240 98 L 240 272",
    accent: { x: 230, y: 296 },
    detail: "M 150 174 L 126 198 L 150 222 M 330 174 L 354 198 L 330 222 M 286 162 L 260 234 M 184 318 H 296",
  },
  {
    name: "launch",
    outline: "M 160 130 L 360 130 L 338 180 L 360 230 L 160 230 Z",
    spine: "M 160 106 L 160 386",
    accent: { x: 340, y: 170 },
    detail: "M 204 130 V 180 H 248 V 230 M 292 130 V 180 H 338 M 160 180 H 204 M 248 180 H 292 M 204 230 H 248 M 292 230 H 338 M 140 386 H 186",
  },
] as const;
