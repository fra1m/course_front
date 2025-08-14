import type { Page } from "./IPage";

export interface ISurveyJson {
  title?: string;
  showProgressBar: 'top' | 'bottom' | 'none';
  showNavigationButtons: boolean;
  firstPageIsStarted: boolean;
  startSurveyText: string;
  completedHtml: string;
  pages: Page[];
}