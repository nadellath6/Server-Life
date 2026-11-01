import type { EraNumber } from "../data/eras";
import { FORMS } from "../data/forms.generated";

export type FormPacket = {
  type: "WEB" | "DATA" | "MEDIA" | "UPLOAD";
  lane: number;
  spawnTime: number;
  heavy?: boolean;
};

export type GeneratedForm = {
  era: EraNumber;
  formIndex: 0 | 1 | 2;
  packets: readonly FormPacket[];
  incidentSchedule: readonly { id: string; start: number; duration: number }[];
};

export function selectForm(era: EraNumber, formIndex: number): GeneratedForm {
  const form = FORMS.find((candidate) => candidate.era === era && candidate.formIndex === formIndex);
  if (!form) throw new Error(`Missing generated form for Era ${era}, index ${formIndex}`);
  return form;
}
