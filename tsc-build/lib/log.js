import chalk from "chalk";
export default function make_logger(testMode = false) {
    const log = new Logger(testMode);
    return (str) => {
        if (str) {
            return log.apply(str);
        }
        else
            return log;
    };
}
let devBuffer = "";
class Logger {
    constructor(testMode, opts) {
        this._color = "#FFFFFF";
        this._bold = false;
        this._underline = false;
        this.testMode = testMode;
        if (opts) {
            this._color = opts.color;
            this._bold = opts.bold;
            this._underline = opts.underline;
        }
    }
    apply(str) {
        return this._self()._log(str);
    }
    _self(opts = {}, print = false) {
        const newOpts = {
            ...{ color: this._color, bold: this._bold, underline: this._underline },
            ...opts,
        };
        // if (!print) console.log("self", this, opts, newOpts);
        return new Logger(this.testMode, newOpts);
    }
    citrus(str) {
        const newAttr = { color: "F7FF00" };
        if (!str)
            return this._self(newAttr);
        else {
            this._self(newAttr)._log(str);
        }
    }
    grey(str) {
        const newAttr = { color: "aaaaaa" };
        if (!str)
            return this._self(newAttr);
        else {
            this._self(newAttr)._log(str);
        }
    }
    bold(str) {
        const newAttr = { bold: true };
        if (!str)
            return this._self(newAttr);
        else {
            this._self(newAttr)._log(str);
        }
    }
    underline(str) {
        const newAttr = { underline: true };
        if (!str)
            return this._self(newAttr);
        else {
            this._self(newAttr)._log(str);
        }
    }
    danger(str) {
        const newAttr = { bold: true, color: "#eb445a" };
        if (!str)
            return this._self(newAttr);
        else {
            this._self(newAttr)._log(str);
        }
    }
    warn(str) {
        const newAttr = { color: "#ff8709" };
        if (!str)
            return this._self(newAttr);
        else {
            this._self(newAttr)._log(str);
        }
    }
    info(str) {
        const newAttr = { color: "#23a8f2" };
        if (!str)
            return this._self(newAttr);
        else {
            this._self(newAttr)._log(str);
        }
    }
    success(str) {
        const newAttr = { color: "#2dd36f" };
        if (!str)
            return this._self(newAttr);
        else {
            this._self(newAttr)._log(str);
        }
    }
    get context() {
        return this;
    }
    _logTree(str) {
        if (this._bold) {
            if (this._underline)
                return chalk.bold.underline.hex(this._color)(str);
            else
                return chalk.bold.hex(this._color)(str);
        }
        else if (this._underline)
            return chalk.underline.hex(this._color)(str);
        else
            return chalk.hex(this._color)(str);
    }
    _log(str) {
        const logOutput = this._logTree(this.sanitiseString(str) + "\n");
        this.StdoutWrite(logOutput);
        return this._self({}, true);
    }
    sanitiseString(str) {
        const maxW = 100;
        const newString = [];
        let newStr = "";
        if (str)
            newStr = str.toString();
        const splitStr = newStr.split("\n");
        splitStr.forEach((el) => {
            // console.log("len:", el.length);
            if (el.length > maxW && !this.testMode) {
                // console.log("len > max");
                newString.push([el.slice(0, maxW), "\n", this.sanitiseString(el.slice(maxW))].join(""));
            }
            else {
                newString.push(el);
            }
        });
        let outstr = newString.join("\n");
        // if (newString.length != 1 && !multi) outstr = outstr.trimEnd();
        return outstr;
    }
    multi(parts) {
        let outstr = "";
        parts.forEach((el) => {
            const fn = el[0];
            const str = el[1];
            // console.log("fnres:", fn);
            outstr += fn._logTree(this.sanitiseString(str));
        });
        outstr += "\n";
        return this.StdoutWrite(outstr);
    }
    get dumpBuffer() {
        if (this.testMode)
            return devBuffer;
        else
            return null;
    }
    StdoutWrite(data) {
        if (!this.testMode) {
            process.stdout.write(data);
        }
        else {
            devBuffer += data;
            return data;
        }
    }
}
