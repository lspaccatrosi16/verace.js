import {
	sequenceOf,
	many,
	char,
	skip,
	choice,
	letter,
	digit,
	whitespace,
	str,
	ResultType,
	Parser,
	namedSequenceOf,
} from "arcsecond";
import util from "util";

export type TokenType =
	| "HEADING" //DONE
	| "OL" //DONE
	| "UL" //DONE
	| "LISTITEM" //DONE
	| "PARAGRAPH"
	| "DIVIDER" //DONE
	| "LITERAL" //DONE
	| "BOLD" //DONE
	| "ITALIC" //DONE
	| "INLINE" //DONE
	| "LINK";

export interface Token {
	type: TokenType;
}

export interface LinearToken extends Token {
	type: TokenType;
	subToken: Token;
}

export interface LiteralToken extends Token {
	type: "LITERAL";
	text: string;
}

export interface DividerToken extends Token {
	type: "DIVIDER";
}

export interface InlineToken extends Token {
	type: "INLINE";
	subTokens: Token[];
}

export interface ListToken extends Token {
	type: "LISTITEM";
	listItems: Token[];
	closed: boolean;
}

export interface HeadingToken extends LinearToken {
	type: "HEADING";
	subToken: Token;
	level: number;
}

export interface LinkToken extends LinearToken {
	type: "LINK";
	url: string;
	subToken: Token;
}

const punctuation = [
	char("."),
	char(","),
	char("?"),
	char(":"),
	char(";"),
	char("!"),
	char("/"),
	char("'"),
	char(`"`),
];
const baseCharacters = [letter, digit, whitespace];
const symbols = [
	char("#"),
	char("+"),
	char("="),
	char("-"),
	char("%"),
	char("`"),
];
const bi = [char("*"), char("_")];

const specialPunctuation = [char("("), char(")")];

const stringChars = choice([
	...punctuation,
	...baseCharacters,
	...symbols,
	...bi,
	...specialPunctuation,
]);

const linkStringChars = choice([...punctuation, ...baseCharacters, ...symbols]);
// PARSERS:

const string = many(stringChars);
const linkString = many(linkStringChars);
const headingParser = sequenceOf([char("#"), many(char("#")), skip(string)]);
const dividerParser = str("---");

const olParser = sequenceOf([many(digit), char("."), whitespace, skip(string)]);

const ulParser = sequenceOf([
	many(whitespace),
	char("-"),
	many(whitespace),
	skip(string),
]);

const linkParser = sequenceOf([
	char("["),
	linkString,
	char("]"),
	char("("),
	linkString,
	char(")"),
	many(whitespace),
]);

function wrapWithRestrictedString<T, _, D>(p: Parser<T, string, D>) {
	return namedSequenceOf([
		["pre", string],
		["content", p],
		["post", string],
	]);
}

export function lastEl<T>(arr: T[]): T {
	if (arr.length > 0) {
		return arr[arr.length - 1];
	} else return null;
}

export default function (fileContents: string): Token[] {
	const lines = fileContents.split("\n");

	const tree: Token[] = [];

	const listItems: ListToken[] = [];

	for (let i = 0, len = lines.length; i < len; i++) {
		const thisLine = lines[i];
		const trimmed = thisLine.trim();
		if (trimmed == "") continue;
		// console.log("=".repeat(100));
		const token = parseLine(trimmed);

		if (lastEl(listItems) && !lastEl(listItems).closed) {
			const latestItem = lastEl(listItems);
			if (
				token.type == latestItem.listItems[0].type &&
				(token.type == "OL" || token.type == "UL")
			) {
				latestItem.listItems.push(token);
			} else {
				latestItem.closed = true;
				tree.push(latestItem);
				if (token.type == "OL" || token.type == "UL") {
					listItems.push({
						closed: false,
						listItems: [token],
						type: "LISTITEM",
					});
				} else {
					tree.push(token);
				}
			}
		} else if (token.type == "OL" || token.type == "UL") {
			listItems.push({
				closed: false,
				listItems: [token],
				type: "LISTITEM",
			});
		} else tree.push(token);
	}

	if (lastEl(listItems) && !lastEl(listItems).closed) {
		lastEl(listItems).closed = true;
		tree.push(lastEl(listItems));
	}

	const debugTree = util.inspect(tree, false, null, true);

	// console.log(debugTree);

	return tree;
}

function parseLine(line: string): Token {
	if (line.endsWith("\r")) {
		line.slice(0, -2);
	}

	//   console.log("toParse:", line);

	// PARSER RUNS

	const hr = headingParser.run(line);

	const ol = olParser.run(line);
	const ul = ulParser.run(line);

	const dp = dividerParser.run(line);

	// LOGIC TREE WALK

	if (!hr.isError) {
		//@ts-expect-error
		const result = hr.result;
		const newLine = line.slice(result[1].length + 1);
		const subToken = parameterisedParsing(newLine);

		return {
			type: "HEADING",
			subToken,
			level: result[1].length + 1,
		} as HeadingToken;
	} else if (!dp.isError) {
		return {
			type: "DIVIDER",
		} as DividerToken;
	} else if (!ol.isError) {
		//@ts-expect-error
		const newLine = line.slice(ol.result[0].length + 2);
		const subToken = parameterisedParsing(newLine);

		return { type: "OL", subToken } as LinearToken;
	} else if (!ul.isError) {
		const newLine = line.slice(
			//@ts-expect-error
			ul.result[0].length + 1 + ul.result[2].length
		);
		const subToken = parameterisedParsing(newLine);

		return { type: "UL", subToken } as LinearToken;
	} else {
		const subToken = parameterisedParsing(line);
		return {
			type: "PARAGRAPH",
			subToken,
		} as LinearToken;
	}
}

function parameterisedParsing(str: string): Token {
	return inStringParsing(str);
}

function formStringFromAllResults(result: unknown) {
	//   console.log("str from res", result);
	if (typeof result == "string") {
		return result;
	} else if (Array.isArray(result)) {
		for (let i = 0, len = result.length; i < len; i++) {
			if (Array.isArray(result[i])) {
				return result[i].join("");
			}
		}
		return result.join("");
	}
}

function inStringParsing(str: string): Token {
	if (str == "") return null;
	//   console.log("toStringParse:", str);

	const linkInString = wrapWithRestrictedString(linkParser);

	const lp = linkInString.run(str);
	const lpr = inlineParsing(lp, "LINK");

	if (lpr) {
		return lpr;
	} else
		return {
			type: "LITERAL",
			text: str,
		} as LiteralToken;
}

function inlineParsing<T, E, D>(
	p: ResultType<T, E, D>,
	type: TokenType
): Token {
	if (!p.isError) {
		//@ts-expect-error
		const result = p.result;

		const preStr = formStringFromAllResults(result.pre);
		const postStr = formStringFromAllResults(result.post);

		const preToken = inStringParsing(preStr);
		const postToken = inStringParsing(postStr);

		const subTokens: Token[] = [];
		if (preToken) {
			if (preToken.type == "INLINE") {
				subTokens.push(...(preToken as InlineToken).subTokens);
			} else subTokens.push(preToken);
		}

		const content = result.content;
		const subToken = inStringParsing(formStringFromAllResults(content[1]));
		const url = formStringFromAllResults(content[4]);
		subTokens.push({
			type: "LINK",
			subToken,
			url,
		} as LinkToken);

		if (postToken) {
			if (postToken.type == "INLINE") {
				subTokens.push(...(postToken as InlineToken).subTokens);
			} else subTokens.push(postToken);
		}

		// console.log(subTokens);

		return {
			type: "INLINE",
			subTokens,
		} as InlineToken;
	} else {
		// console.log("parsing found no matches");
		return null;
	}
}
