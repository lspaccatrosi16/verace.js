import { input } from "./io";
import metadataRemover, { Metadata } from "./metadataRemover";
import fileparser from "./fileparser";
import generator from "./generator";

interface ManifestItem {
	title: string;
	unixt: number;
	description: string;
	image: string;
	url: string;
}

function runMultiFile(
	path: string,
	name: string
): [string, ManifestItem, Metadata] {
	const base = input(path);
	const baseName = name.slice(0, -3);
	const [file, metadata] = processFile(base, baseName);
	return [
		file,
		{
			title: metadata.title || "",
			description: metadata.description || "",
			unixt: metadata.date?.unix() || 0,
			image: metadata.image || "",
			url: `blog/${baseName}`,
		},
		metadata,
	];
}

function processFile(file: string, baseName: string): [string, Metadata] {
	const [cleanedFile, metadata] = metadataRemover(file, baseName);
	const ast = fileparser(cleanedFile);
	const rawHtml = generator(ast);
	return [rawHtml, metadata];
}

export default function () {
	const path = process.argv[2];
	const name = process.argv[3];

	const r = runMultiFile(path, name);
	console.log(`Worker ${process.pid} finished ${name}`);
	process.send(r);
}
