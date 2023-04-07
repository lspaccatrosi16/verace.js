import rustic from "rustic";
import { z } from "zod";

export default function zodWrapper<T extends z.ZodTypeAny>(
	parser: T,
	data: unknown
): rustic.ResultEquipped<z.infer<T>, string> {
	try {
		const result = parser.parse(data);
		return rustic.equip(rustic.Ok(result));
	} catch (e) {
		if (e instanceof z.ZodError) {
			const errorString = e.toString();
			return rustic.equip(rustic.Err(errorString));
		} else {
			return rustic.equip(rustic.Err("Unknown error"));
		}
	}
}
