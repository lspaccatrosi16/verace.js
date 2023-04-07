import rustic from "rustic";

export class Result<T, E> {
	private equipped: rustic.ResultEquipped<T, E>;

	Ok(t: T) {
		return rustic.equip(t);
	}

	Err(e: E) {
		return rustic.equip(e);
	}
}
