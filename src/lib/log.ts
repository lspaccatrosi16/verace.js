import chalk from 'chalk';

interface Opts {
  color: string;
  bold: boolean;
  underline: boolean;
}

export type uncalledFn = [Logger, string];

export type LoggerType = (str?: string) => Logger;

export default function make_logger() {
  const log = new Logger();

  return (str?: string) => {
    if (str) {
      return log.apply(str);
    } else return log;
  };
}

class Logger {
  _color: string = "#FFFFFF";
  _bold: boolean = false;
  _underline: boolean = false;
  maxWidth: 75;

  constructor(opts?: Opts) {
    if (opts) {
      this._color = opts.color;
      this._bold = opts.bold;
      this._underline = opts.underline;
    }
  }

  apply(str: string) {
    return this._self()._log(str);
  }

  _self(opts = {}, print = false) {
    const newOpts: Opts = {
      ...{ color: this._color, bold: this._bold, underline: this._underline },
      ...opts,
    };

    // if (!print) console.log("self", this, opts, newOpts);

    return new Logger(newOpts);
  }

  citrus(str?: string) {
    const newAttr = { color: "F7FF00" };
    if (!str) return this._self(newAttr);
    else {
      this._self(newAttr)._log(str);
    }
  }

  grey(str?: string) {
    const newAttr = { color: "aaaaaa" };
    if (!str) return this._self(newAttr);
    else {
      this._self(newAttr)._log(str);
    }
  }

  bold(str?: string) {
    const newAttr = { bold: true };
    if (!str) return this._self(newAttr);
    else {
      this._self(newAttr)._log(str);
    }
  }

  underline(str?: string) {
    const newAttr = { underline: true };
    if (!str) return this._self(newAttr);
    else {
      this._self(newAttr)._log(str);
    }
  }

  danger(str?: string) {
    const newAttr = { bold: true, color: "#eb445a" };
    if (!str) return this._self(newAttr);
    else {
      this._self(newAttr)._log(str);
    }
  }

  warn(str?: string) {
    const newAttr = { color: "#ff8709" };
    if (!str) return this._self(newAttr);
    else {
      this._self(newAttr)._log(str);
    }
  }

  info(str?: string) {
    const newAttr = { color: "#23a8f2" };
    if (!str) return this._self(newAttr);
    else {
      this._self(newAttr)._log(str);
    }
  }

  success(str?: string) {
    const newAttr = { color: "#2dd36f" };
    if (!str) return this._self(newAttr);
    else {
      this._self(newAttr)._log(str);
    }
  }

  get context() {
    return this;
  }

  private _logTree(str: string): string {
    if (this._bold) {
      if (this._underline) return chalk.bold.underline.hex(this._color)(str);
      else return chalk.bold.hex(this._color)(str);
    } else if (this._underline) return chalk.underline.hex(this._color)(str);
    else return chalk.hex(this._color)(str);
  }

  private _log(str: string) {
    process.stdout.write(this._logTree(this.sanitiseString(str) + "\n"));
    return this._self({}, true);
  }

  private sanitiseString(str: string, multi = false): string {
    const maxW = 100;
    const newString: string[] = [];

    let newStr = "";
    if (str) newStr = str.toString();

    const splitStr = newStr.split("\n");

    splitStr.forEach((el) => {
      // console.log("len:", el.length);
      if (el.length > maxW) {
        // console.log("len > max");
        newString.push(
          [el.slice(0, maxW), "\n", this.sanitiseString(el.slice(maxW))].join(
            ""
          )
        );
      } else {
        newString.push(el);
      }
    });

    let outstr = newString.join("\n");
    // if (newString.length != 1 && !multi) outstr = outstr.trimEnd();

    return outstr;
  }

  multi(parts: uncalledFn[]) {
    let outstr = "";
    parts.forEach((el) => {
      const fn = el[0];
      const str = el[1];

      // console.log("fnres:", fn);
      outstr += fn._logTree(this.sanitiseString(str, true));
    });

    outstr += "\n";

    process.stdout.write(outstr);
  }
}
