import type { Question } from "./IQuiestion";

export interface Page {
  name: string;
  title?: string;
  elements: Question[];
}
