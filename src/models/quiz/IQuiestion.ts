import type { Choice } from "./IChoice";

export interface Question {
	type: string; // radiogroup, checkbox, html, imagepicker и т.д.
	name: string;
	title: string;
	choices?: Choice[];
	correctAnswer?: string | string[];
	html?: string;
}
