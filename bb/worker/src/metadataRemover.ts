import { anyChar, anyCharExcept, char, many, sequenceOf } from "arcsecond";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export interface Metadata {
	description?: string;
	title?: string;
	image?: string;
	date: dayjs.Dayjs;
	otherMetadata?: Record<string, string>;
}

export default function (file: string, filename: string): [string, Metadata] {
	const lines = file.split("\n");

	let readingMetadata = false;
	const metaDataSection = [];
	const normalSection = [];

	for (let i = 0, len = lines.length; i < len; i++) {
		const thisLine = lines[i];
		if (i === 0 && thisLine === "---") {
			readingMetadata = true;
			continue;
		}

		if (readingMetadata) {
			if (thisLine != "---") {
				metaDataSection.push(thisLine);
			} else {
				readingMetadata = false;
				continue;
			}
		} else {
			normalSection.push(thisLine);
		}
	}

	const metadataParser = sequenceOf([
		many(anyCharExcept(char(":"))),
		char(":"),
		many(anyChar),
	]);

	const metadata: Metadata = {
		title: "",
		image: "",
		description: "",
		date: null,
		otherMetadata: {},
	};

	metaDataSection.forEach(line => {
		const metaParse = metadataParser.run(line);
		if (!metaParse.isError) {
			//@ts-expect-error
			const result = metaParse.result;
			const key = result[0].join("").trim();
			const val = result[2].join("").trim();

			if (key in metadata && key != "otherMetadata") {
				if (key != "date") {
					metadata[key as keyof Metadata] = val;
				} else {
					metadata.date = dayjs.utc(val);

					if (!metadata.date.isValid()) {
						console.log("INVALID DATE:", val);
						process.exit(1);
					}
				}
			} else {
				metadata.otherMetadata[key] = val;
			}
		}
	});

	return [normalSection.join("\n"), metadata];
}
