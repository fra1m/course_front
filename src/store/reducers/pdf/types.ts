export type PdfState = {
	open: boolean;
	courseId: number | null;
	blobUrl: string | null;
	loading: boolean;
	error: string | null;
};
