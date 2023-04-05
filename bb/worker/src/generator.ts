import { anyCharExcept, char, many, sequenceOf, str } from "arcsecond";
import type {
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
      return insertBoldItalic((token as LiteralToken).text);
    case "OL":
    case "UL":
      return doListElement(token as LinearToken);
    case "PARAGRAPH":
      return doParagraph(token as LinearToken);
    case "LINK":
      return doLink(token as LinkToken);
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
  return `<div class="divider" />`;
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

function insertBoldItalic(text: string): string {
  const boldParser = sequenceOf([
    many(anyCharExcept(char("*"))),
    str("**"),
    many(anyCharExcept(char("*"))),
    str("**"),
    many(anyCharExcept(char("*"))),
  ]);
  const italicParser = sequenceOf([
    many(anyCharExcept(char("_"))),
    char("_"),
    many(anyCharExcept(char("_"))),
    char("_"),
    many(anyCharExcept(char("_"))),
  ]);

  const bp = boldParser.run(text);
  const ip = italicParser.run(text);

  if (!ip.isError) {
    //@ts-expect-error
    const result = ip.result;
    const inside = insertBoldItalic(result[2].join(""));

    const statement = `${result[0].join("")}<i>${inside}</i>${result[4].join(
      ""
    )}`;

    return statement;
  } else if (!bp.isError) {
    //@ts-expect-error
    const result = bp.result;
    const inside = insertBoldItalic(result[2].join(""));
    const statement = `${result[0].join("")}<b>${inside}</b>${result[4].join(
      ""
    )}`;

    return statement;
  } else return text;
}
//CLASSLIST: .divider
