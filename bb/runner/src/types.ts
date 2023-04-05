import type { Dayjs } from "dayjs";

export interface Metadata {
	description?: string;
	title?: string;
	image?: string;
	date: Dayjs;
	otherMetadata?: Record<string, string>;
}

export interface ManifestItem {
	title: string;
	unixt: number;
	description: string;
	image: string;
	url: string;
}

export type WorkerReturn = [string, ManifestItem, Metadata];

export type OutputBackend = (input: WorkerReturn[]) => Promise<void>;
