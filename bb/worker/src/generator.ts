import { anyChar, anyCharExcept, char, many, sequenceOf, str } from "arcsecond";
import type {
	CodeToken,
	HeadingToken,
	InlineToken,
	LinearToken,
	LinkToken,
	ListToken,
	LiteralToken,
	Token,
} from "./fileparser";

export default function (ast: Token[]): string {
	return doList(ast);
}

function doList(tokenList: Token[]): string {
	const htmlStatements: string[] = [];

	for (let i = 0, len = tokenList.length; i < len; i++) {
		const token = tokenList[i];
		try {
			htmlStatements.push(tokenTree(token));
		} catch (e) {
			console.log("ERROR GENERATING TOKEN FOR ", token);
			console.log(e);
		}
	}

	return htmlStatements.join("\n");
}

function tokenTree(token: Token): string {
	switch (token.type) {
		case "HEADING":
			return doHeading(token as HeadingToken);
		case "BOLD":
			return doBold(token as LinearToken);
		case "DIVIDER":
			return doDivider();
		case "INLINE":
			return doInline(token as InlineToken);
		case "ITALIC":
			return doItalic(token as LinearToken);
		case "LISTITEM":
			return doListItem(token as ListToken);
		case "LITERAL":
			return insertBoldItalicCode((token as LiteralToken).text);
		case "OL":
		case "UL":
			return doListElement(token as LinearToken);
		case "PARAGRAPH":
			return doParagraph(token as LinearToken);
		case "LINK":
			return doLink(token as LinkToken);

		case "CODE":
			return doCode(token as CodeToken);

		default:
			throw new Error("Unimplemented token type: " + token.type);
	}
}

function doHeading(token: HeadingToken) {
	const content = tokenTree(token.subToken);

	return `<h${token.level}>${content}</h${token.level}>`;
}
function doBold(token: LinearToken) {
	const content = tokenTree(token.subToken);

	return `<b>${content}</b>`;
}
function doDivider() {
	return `<div class="divider"></div>`;
}

function doInline(token: InlineToken) {
	return doList(token.subTokens);
}

function doItalic(token: LinearToken) {
	const content = tokenTree(token.subToken);

	return `<i>${content}</i>`;
}

function doListItem(token: ListToken) {
	const subList = doList(token.listItems);

	const type = token.listItems[0].type == "OL" ? "ol" : "ul";

	return `<${type}>${subList}</${type}>`;
}

function doParagraph(token: LinearToken) {
	const content = tokenTree(token.subToken);
	return `<p>${content}</p>`;
}

function doListElement(token: LinearToken) {
	const content = tokenTree(token.subToken);
	return `<li>${content}</li>`;
}

function doLink(token: LinkToken) {
	const content = tokenTree(token.subToken);

	return `<a href="${token.url}">${content}</a>`;
}

function doCode(token: CodeToken) {
	const content = token.contents;
	const lang = token.langCode;

	return `<div class="code-cont"><pre class="line-numbers"><code class="language-${lang}">${content}</code></pre></div>`;
}

function insertBoldItalicCode(text: string): string {
	const boldParser = sequenceOf([
		many(anyCharExcept(char("*"))),
		str("**"),
		many(anyCharExcept(char("*"))),
		str("**"),
		many(anyChar),
	]);
	const italicParser = sequenceOf([
		many(anyCharExcept(char("_"))),
		char("_"),
		many(anyCharExcept(char("_"))),
		char("_"),
		many(anyChar),
	]);

	const codeParser = sequenceOf([
		many(anyCharExcept(char("`"))),
		char("`"),
		many(anyCharExcept(char("`"))),
		char("`"),
		many(anyChar),
	]);

	const bp = boldParser.run(text);
	const ip = italicParser.run(text);
	const cp = codeParser.run(text);

	if (!cp.isError) {
		//@ts-expect-error
		const result = cp.result;
		const inside = result[2].join("");
		const left = insertBoldItalicCode(result[0].join(""));
		const right = insertBoldItalicCode(result[4].join(""));

		const statement = `${left}<code>${inside}</code>${right}`;

		return statement;
	} else if (!ip.isError) {
		//@ts-expect-error
		const result = ip.result;
		const inside = insertBoldItalicCode(result[2].join(""));
		const left = insertBoldItalicCode(result[0].join(""));
		const right = insertBoldItalicCode(result[4].join(""));

		const statement = `${left}<i>${inside}</i>${right}`;

		return statement;
	} else if (!bp.isError) {
		//@ts-expect-error
		const result = bp.result;
		const inside = insertBoldItalicCode(result[2].join(""));
		const left = insertBoldItalicCode(result[0].join(""));
		const right = insertBoldItalicCode(result[4].join(""));

		const statement = `${left}<b>${inside}</b>${right}`;

		return statement;
	} else return text;
}
//CLASSLIST: .divider
