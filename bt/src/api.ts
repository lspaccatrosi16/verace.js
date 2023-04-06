/*
Copyright (C) 2023  Luca Spaccatrosi

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

*/

import { api } from "verace";
import type { APICONFIG } from "verace";
import type { APIResult } from "lib/executionEnvironment";
import type { BaseConfig } from "./lib/veraceConfig";

export default function (config: APICONFIG, test: boolean): Promise<APIResult> {
	return new Promise((resolve, reject) => {
		api(config, test).then(resolve).catch(reject);
	});
}

export { BaseConfig };
