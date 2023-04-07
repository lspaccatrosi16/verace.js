#!/usr/bin/env node
var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// build/veraceTemp.cjs
var require_veraceTemp = __commonJS({
  "build/veraceTemp.cjs"(exports2, module2) {
    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __commonJS2 = (cb, mod) => function __require() {
      return mod || (0, cb[__getOwnPropNames2(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    };
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
      mod
    ));
    var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var require_universalify = __commonJS2({
      "../../node_modules/universalify/index.js"(exports3) {
        "use strict";
        exports3.fromCallback = function(fn) {
          return Object.defineProperty(function(...args) {
            if (typeof args[args.length - 1] === "function")
              fn.apply(this, args);
            else {
              return new Promise((resolve, reject) => {
                fn.call(
                  this,
                  ...args,
                  (err, res) => err != null ? reject(err) : resolve(res)
                );
              });
            }
          }, "name", { value: fn.name });
        };
        exports3.fromPromise = function(fn) {
          return Object.defineProperty(function(...args) {
            const cb = args[args.length - 1];
            if (typeof cb !== "function")
              return fn.apply(this, args);
            else
              fn.apply(this, args.slice(0, -1)).then((r) => cb(null, r), cb);
          }, "name", { value: fn.name });
        };
      }
    });
    var require_polyfills = __commonJS2({
      "../../node_modules/graceful-fs/polyfills.js"(exports3, module22) {
        var constants = require("constants");
        var origCwd = process.cwd;
        var cwd = null;
        var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
        process.cwd = function() {
          if (!cwd)
            cwd = origCwd.call(process);
          return cwd;
        };
        try {
          process.cwd();
        } catch (er) {
        }
        if (typeof process.chdir === "function") {
          chdir = process.chdir;
          process.chdir = function(d) {
            cwd = null;
            chdir.call(process, d);
          };
          if (Object.setPrototypeOf)
            Object.setPrototypeOf(process.chdir, chdir);
        }
        var chdir;
        module22.exports = patch;
        function patch(fs2) {
          if (constants.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
            patchLchmod(fs2);
          }
          if (!fs2.lutimes) {
            patchLutimes(fs2);
          }
          fs2.chown = chownFix(fs2.chown);
          fs2.fchown = chownFix(fs2.fchown);
          fs2.lchown = chownFix(fs2.lchown);
          fs2.chmod = chmodFix(fs2.chmod);
          fs2.fchmod = chmodFix(fs2.fchmod);
          fs2.lchmod = chmodFix(fs2.lchmod);
          fs2.chownSync = chownFixSync(fs2.chownSync);
          fs2.fchownSync = chownFixSync(fs2.fchownSync);
          fs2.lchownSync = chownFixSync(fs2.lchownSync);
          fs2.chmodSync = chmodFixSync(fs2.chmodSync);
          fs2.fchmodSync = chmodFixSync(fs2.fchmodSync);
          fs2.lchmodSync = chmodFixSync(fs2.lchmodSync);
          fs2.stat = statFix(fs2.stat);
          fs2.fstat = statFix(fs2.fstat);
          fs2.lstat = statFix(fs2.lstat);
          fs2.statSync = statFixSync(fs2.statSync);
          fs2.fstatSync = statFixSync(fs2.fstatSync);
          fs2.lstatSync = statFixSync(fs2.lstatSync);
          if (fs2.chmod && !fs2.lchmod) {
            fs2.lchmod = function(path2, mode, cb) {
              if (cb)
                process.nextTick(cb);
            };
            fs2.lchmodSync = function() {
            };
          }
          if (fs2.chown && !fs2.lchown) {
            fs2.lchown = function(path2, uid, gid, cb) {
              if (cb)
                process.nextTick(cb);
            };
            fs2.lchownSync = function() {
            };
          }
          if (platform === "win32") {
            fs2.rename = typeof fs2.rename !== "function" ? fs2.rename : function(fs$rename) {
              function rename(from, to, cb) {
                var start = Date.now();
                var backoff = 0;
                fs$rename(from, to, function CB(er) {
                  if (er && (er.code === "EACCES" || er.code === "EPERM" || er.code === "EBUSY") && Date.now() - start < 6e4) {
                    setTimeout(function() {
                      fs2.stat(to, function(stater, st) {
                        if (stater && stater.code === "ENOENT")
                          fs$rename(from, to, CB);
                        else
                          cb(er);
                      });
                    }, backoff);
                    if (backoff < 100)
                      backoff += 10;
                    return;
                  }
                  if (cb)
                    cb(er);
                });
              }
              if (Object.setPrototypeOf)
                Object.setPrototypeOf(rename, fs$rename);
              return rename;
            }(fs2.rename);
          }
          fs2.read = typeof fs2.read !== "function" ? fs2.read : function(fs$read) {
            function read(fd, buffer, offset, length, position, callback_) {
              var callback;
              if (callback_ && typeof callback_ === "function") {
                var eagCounter = 0;
                callback = function(er, _, __) {
                  if (er && er.code === "EAGAIN" && eagCounter < 10) {
                    eagCounter++;
                    return fs$read.call(fs2, fd, buffer, offset, length, position, callback);
                  }
                  callback_.apply(this, arguments);
                };
              }
              return fs$read.call(fs2, fd, buffer, offset, length, position, callback);
            }
            if (Object.setPrototypeOf)
              Object.setPrototypeOf(read, fs$read);
            return read;
          }(fs2.read);
          fs2.readSync = typeof fs2.readSync !== "function" ? fs2.readSync : function(fs$readSync) {
            return function(fd, buffer, offset, length, position) {
              var eagCounter = 0;
              while (true) {
                try {
                  return fs$readSync.call(fs2, fd, buffer, offset, length, position);
                } catch (er) {
                  if (er.code === "EAGAIN" && eagCounter < 10) {
                    eagCounter++;
                    continue;
                  }
                  throw er;
                }
              }
            };
          }(fs2.readSync);
          function patchLchmod(fs3) {
            fs3.lchmod = function(path2, mode, callback) {
              fs3.open(
                path2,
                constants.O_WRONLY | constants.O_SYMLINK,
                mode,
                function(err, fd) {
                  if (err) {
                    if (callback)
                      callback(err);
                    return;
                  }
                  fs3.fchmod(fd, mode, function(err2) {
                    fs3.close(fd, function(err22) {
                      if (callback)
                        callback(err2 || err22);
                    });
                  });
                }
              );
            };
            fs3.lchmodSync = function(path2, mode) {
              var fd = fs3.openSync(path2, constants.O_WRONLY | constants.O_SYMLINK, mode);
              var threw = true;
              var ret;
              try {
                ret = fs3.fchmodSync(fd, mode);
                threw = false;
              } finally {
                if (threw) {
                  try {
                    fs3.closeSync(fd);
                  } catch (er) {
                  }
                } else {
                  fs3.closeSync(fd);
                }
              }
              return ret;
            };
          }
          function patchLutimes(fs3) {
            if (constants.hasOwnProperty("O_SYMLINK") && fs3.futimes) {
              fs3.lutimes = function(path2, at, mt, cb) {
                fs3.open(path2, constants.O_SYMLINK, function(er, fd) {
                  if (er) {
                    if (cb)
                      cb(er);
                    return;
                  }
                  fs3.futimes(fd, at, mt, function(er2) {
                    fs3.close(fd, function(er22) {
                      if (cb)
                        cb(er2 || er22);
                    });
                  });
                });
              };
              fs3.lutimesSync = function(path2, at, mt) {
                var fd = fs3.openSync(path2, constants.O_SYMLINK);
                var ret;
                var threw = true;
                try {
                  ret = fs3.futimesSync(fd, at, mt);
                  threw = false;
                } finally {
                  if (threw) {
                    try {
                      fs3.closeSync(fd);
                    } catch (er) {
                    }
                  } else {
                    fs3.closeSync(fd);
                  }
                }
                return ret;
              };
            } else if (fs3.futimes) {
              fs3.lutimes = function(_a, _b, _c, cb) {
                if (cb)
                  process.nextTick(cb);
              };
              fs3.lutimesSync = function() {
              };
            }
          }
          function chmodFix(orig) {
            if (!orig)
              return orig;
            return function(target, mode, cb) {
              return orig.call(fs2, target, mode, function(er) {
                if (chownErOk(er))
                  er = null;
                if (cb)
                  cb.apply(this, arguments);
              });
            };
          }
          function chmodFixSync(orig) {
            if (!orig)
              return orig;
            return function(target, mode) {
              try {
                return orig.call(fs2, target, mode);
              } catch (er) {
                if (!chownErOk(er))
                  throw er;
              }
            };
          }
          function chownFix(orig) {
            if (!orig)
              return orig;
            return function(target, uid, gid, cb) {
              return orig.call(fs2, target, uid, gid, function(er) {
                if (chownErOk(er))
                  er = null;
                if (cb)
                  cb.apply(this, arguments);
              });
            };
          }
          function chownFixSync(orig) {
            if (!orig)
              return orig;
            return function(target, uid, gid) {
              try {
                return orig.call(fs2, target, uid, gid);
              } catch (er) {
                if (!chownErOk(er))
                  throw er;
              }
            };
          }
          function statFix(orig) {
            if (!orig)
              return orig;
            return function(target, options, cb) {
              if (typeof options === "function") {
                cb = options;
                options = null;
              }
              function callback(er, stats) {
                if (stats) {
                  if (stats.uid < 0)
                    stats.uid += 4294967296;
                  if (stats.gid < 0)
                    stats.gid += 4294967296;
                }
                if (cb)
                  cb.apply(this, arguments);
              }
              return options ? orig.call(fs2, target, options, callback) : orig.call(fs2, target, callback);
            };
          }
          function statFixSync(orig) {
            if (!orig)
              return orig;
            return function(target, options) {
              var stats = options ? orig.call(fs2, target, options) : orig.call(fs2, target);
              if (stats) {
                if (stats.uid < 0)
                  stats.uid += 4294967296;
                if (stats.gid < 0)
                  stats.gid += 4294967296;
              }
              return stats;
            };
          }
          function chownErOk(er) {
            if (!er)
              return true;
            if (er.code === "ENOSYS")
              return true;
            var nonroot = !process.getuid || process.getuid() !== 0;
            if (nonroot) {
              if (er.code === "EINVAL" || er.code === "EPERM")
                return true;
            }
            return false;
          }
        }
      }
    });
    var require_legacy_streams = __commonJS2({
      "../../node_modules/graceful-fs/legacy-streams.js"(exports3, module22) {
        var Stream = require("stream").Stream;
        module22.exports = legacy;
        function legacy(fs2) {
          return {
            ReadStream,
            WriteStream
          };
          function ReadStream(path2, options) {
            if (!(this instanceof ReadStream))
              return new ReadStream(path2, options);
            Stream.call(this);
            var self2 = this;
            this.path = path2;
            this.fd = null;
            this.readable = true;
            this.paused = false;
            this.flags = "r";
            this.mode = 438;
            this.bufferSize = 64 * 1024;
            options = options || {};
            var keys = Object.keys(options);
            for (var index = 0, length = keys.length; index < length; index++) {
              var key = keys[index];
              this[key] = options[key];
            }
            if (this.encoding)
              this.setEncoding(this.encoding);
            if (this.start !== void 0) {
              if ("number" !== typeof this.start) {
                throw TypeError("start must be a Number");
              }
              if (this.end === void 0) {
                this.end = Infinity;
              } else if ("number" !== typeof this.end) {
                throw TypeError("end must be a Number");
              }
              if (this.start > this.end) {
                throw new Error("start must be <= end");
              }
              this.pos = this.start;
            }
            if (this.fd !== null) {
              process.nextTick(function() {
                self2._read();
              });
              return;
            }
            fs2.open(this.path, this.flags, this.mode, function(err, fd) {
              if (err) {
                self2.emit("error", err);
                self2.readable = false;
                return;
              }
              self2.fd = fd;
              self2.emit("open", fd);
              self2._read();
            });
          }
          function WriteStream(path2, options) {
            if (!(this instanceof WriteStream))
              return new WriteStream(path2, options);
            Stream.call(this);
            this.path = path2;
            this.fd = null;
            this.writable = true;
            this.flags = "w";
            this.encoding = "binary";
            this.mode = 438;
            this.bytesWritten = 0;
            options = options || {};
            var keys = Object.keys(options);
            for (var index = 0, length = keys.length; index < length; index++) {
              var key = keys[index];
              this[key] = options[key];
            }
            if (this.start !== void 0) {
              if ("number" !== typeof this.start) {
                throw TypeError("start must be a Number");
              }
              if (this.start < 0) {
                throw new Error("start must be >= zero");
              }
              this.pos = this.start;
            }
            this.busy = false;
            this._queue = [];
            if (this.fd === null) {
              this._open = fs2.open;
              this._queue.push([this._open, this.path, this.flags, this.mode, void 0]);
              this.flush();
            }
          }
        }
      }
    });
    var require_clone = __commonJS2({
      "../../node_modules/graceful-fs/clone.js"(exports3, module22) {
        "use strict";
        module22.exports = clone;
        var getPrototypeOf = Object.getPrototypeOf || function(obj) {
          return obj.__proto__;
        };
        function clone(obj) {
          if (obj === null || typeof obj !== "object")
            return obj;
          if (obj instanceof Object)
            var copy = { __proto__: getPrototypeOf(obj) };
          else
            var copy = /* @__PURE__ */ Object.create(null);
          Object.getOwnPropertyNames(obj).forEach(function(key) {
            Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
          });
          return copy;
        }
      }
    });
    var require_graceful_fs = __commonJS2({
      "../../node_modules/graceful-fs/graceful-fs.js"(exports3, module22) {
        var fs2 = require("fs");
        var polyfills = require_polyfills();
        var legacy = require_legacy_streams();
        var clone = require_clone();
        var util2 = require("util");
        var gracefulQueue;
        var previousSymbol;
        if (typeof Symbol === "function" && typeof Symbol.for === "function") {
          gracefulQueue = Symbol.for("graceful-fs.queue");
          previousSymbol = Symbol.for("graceful-fs.previous");
        } else {
          gracefulQueue = "___graceful-fs.queue";
          previousSymbol = "___graceful-fs.previous";
        }
        function noop() {
        }
        function publishQueue(context, queue2) {
          Object.defineProperty(context, gracefulQueue, {
            get: function() {
              return queue2;
            }
          });
        }
        var debug = noop;
        if (util2.debuglog)
          debug = util2.debuglog("gfs4");
        else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || ""))
          debug = function() {
            var m = util2.format.apply(util2, arguments);
            m = "GFS4: " + m.split(/\n/).join("\nGFS4: ");
            console.error(m);
          };
        if (!fs2[gracefulQueue]) {
          queue = global[gracefulQueue] || [];
          publishQueue(fs2, queue);
          fs2.close = function(fs$close) {
            function close(fd, cb) {
              return fs$close.call(fs2, fd, function(err) {
                if (!err) {
                  resetQueue();
                }
                if (typeof cb === "function")
                  cb.apply(this, arguments);
              });
            }
            Object.defineProperty(close, previousSymbol, {
              value: fs$close
            });
            return close;
          }(fs2.close);
          fs2.closeSync = function(fs$closeSync) {
            function closeSync(fd) {
              fs$closeSync.apply(fs2, arguments);
              resetQueue();
            }
            Object.defineProperty(closeSync, previousSymbol, {
              value: fs$closeSync
            });
            return closeSync;
          }(fs2.closeSync);
          if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || "")) {
            process.on("exit", function() {
              debug(fs2[gracefulQueue]);
              require("assert").equal(fs2[gracefulQueue].length, 0);
            });
          }
        }
        var queue;
        if (!global[gracefulQueue]) {
          publishQueue(global, fs2[gracefulQueue]);
        }
        module22.exports = patch(clone(fs2));
        if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs2.__patched) {
          module22.exports = patch(fs2);
          fs2.__patched = true;
        }
        function patch(fs3) {
          polyfills(fs3);
          fs3.gracefulify = patch;
          fs3.createReadStream = createReadStream;
          fs3.createWriteStream = createWriteStream;
          var fs$readFile = fs3.readFile;
          fs3.readFile = readFile;
          function readFile(path2, options, cb) {
            if (typeof options === "function")
              cb = options, options = null;
            return go$readFile(path2, options, cb);
            function go$readFile(path3, options2, cb2, startTime) {
              return fs$readFile(path3, options2, function(err) {
                if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
                  enqueue([go$readFile, [path3, options2, cb2], err, startTime || Date.now(), Date.now()]);
                else {
                  if (typeof cb2 === "function")
                    cb2.apply(this, arguments);
                }
              });
            }
          }
          var fs$writeFile = fs3.writeFile;
          fs3.writeFile = writeFile;
          function writeFile(path2, data, options, cb) {
            if (typeof options === "function")
              cb = options, options = null;
            return go$writeFile(path2, data, options, cb);
            function go$writeFile(path3, data2, options2, cb2, startTime) {
              return fs$writeFile(path3, data2, options2, function(err) {
                if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
                  enqueue([go$writeFile, [path3, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
                else {
                  if (typeof cb2 === "function")
                    cb2.apply(this, arguments);
                }
              });
            }
          }
          var fs$appendFile = fs3.appendFile;
          if (fs$appendFile)
            fs3.appendFile = appendFile;
          function appendFile(path2, data, options, cb) {
            if (typeof options === "function")
              cb = options, options = null;
            return go$appendFile(path2, data, options, cb);
            function go$appendFile(path3, data2, options2, cb2, startTime) {
              return fs$appendFile(path3, data2, options2, function(err) {
                if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
                  enqueue([go$appendFile, [path3, data2, options2, cb2], err, startTime || Date.now(), Date.now()]);
                else {
                  if (typeof cb2 === "function")
                    cb2.apply(this, arguments);
                }
              });
            }
          }
          var fs$copyFile = fs3.copyFile;
          if (fs$copyFile)
            fs3.copyFile = copyFile;
          function copyFile(src, dest, flags, cb) {
            if (typeof flags === "function") {
              cb = flags;
              flags = 0;
            }
            return go$copyFile(src, dest, flags, cb);
            function go$copyFile(src2, dest2, flags2, cb2, startTime) {
              return fs$copyFile(src2, dest2, flags2, function(err) {
                if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
                  enqueue([go$copyFile, [src2, dest2, flags2, cb2], err, startTime || Date.now(), Date.now()]);
                else {
                  if (typeof cb2 === "function")
                    cb2.apply(this, arguments);
                }
              });
            }
          }
          var fs$readdir = fs3.readdir;
          fs3.readdir = readdir;
          var noReaddirOptionVersions = /^v[0-5]\./;
          function readdir(path2, options, cb) {
            if (typeof options === "function")
              cb = options, options = null;
            var go$readdir = noReaddirOptionVersions.test(process.version) ? function go$readdir2(path3, options2, cb2, startTime) {
              return fs$readdir(path3, fs$readdirCallback(
                path3,
                options2,
                cb2,
                startTime
              ));
            } : function go$readdir2(path3, options2, cb2, startTime) {
              return fs$readdir(path3, options2, fs$readdirCallback(
                path3,
                options2,
                cb2,
                startTime
              ));
            };
            return go$readdir(path2, options, cb);
            function fs$readdirCallback(path3, options2, cb2, startTime) {
              return function(err, files) {
                if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
                  enqueue([
                    go$readdir,
                    [path3, options2, cb2],
                    err,
                    startTime || Date.now(),
                    Date.now()
                  ]);
                else {
                  if (files && files.sort)
                    files.sort();
                  if (typeof cb2 === "function")
                    cb2.call(this, err, files);
                }
              };
            }
          }
          if (process.version.substr(0, 4) === "v0.8") {
            var legStreams = legacy(fs3);
            ReadStream = legStreams.ReadStream;
            WriteStream = legStreams.WriteStream;
          }
          var fs$ReadStream = fs3.ReadStream;
          if (fs$ReadStream) {
            ReadStream.prototype = Object.create(fs$ReadStream.prototype);
            ReadStream.prototype.open = ReadStream$open;
          }
          var fs$WriteStream = fs3.WriteStream;
          if (fs$WriteStream) {
            WriteStream.prototype = Object.create(fs$WriteStream.prototype);
            WriteStream.prototype.open = WriteStream$open;
          }
          Object.defineProperty(fs3, "ReadStream", {
            get: function() {
              return ReadStream;
            },
            set: function(val) {
              ReadStream = val;
            },
            enumerable: true,
            configurable: true
          });
          Object.defineProperty(fs3, "WriteStream", {
            get: function() {
              return WriteStream;
            },
            set: function(val) {
              WriteStream = val;
            },
            enumerable: true,
            configurable: true
          });
          var FileReadStream = ReadStream;
          Object.defineProperty(fs3, "FileReadStream", {
            get: function() {
              return FileReadStream;
            },
            set: function(val) {
              FileReadStream = val;
            },
            enumerable: true,
            configurable: true
          });
          var FileWriteStream = WriteStream;
          Object.defineProperty(fs3, "FileWriteStream", {
            get: function() {
              return FileWriteStream;
            },
            set: function(val) {
              FileWriteStream = val;
            },
            enumerable: true,
            configurable: true
          });
          function ReadStream(path2, options) {
            if (this instanceof ReadStream)
              return fs$ReadStream.apply(this, arguments), this;
            else
              return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
          }
          function ReadStream$open() {
            var that = this;
            open(that.path, that.flags, that.mode, function(err, fd) {
              if (err) {
                if (that.autoClose)
                  that.destroy();
                that.emit("error", err);
              } else {
                that.fd = fd;
                that.emit("open", fd);
                that.read();
              }
            });
          }
          function WriteStream(path2, options) {
            if (this instanceof WriteStream)
              return fs$WriteStream.apply(this, arguments), this;
            else
              return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
          }
          function WriteStream$open() {
            var that = this;
            open(that.path, that.flags, that.mode, function(err, fd) {
              if (err) {
                that.destroy();
                that.emit("error", err);
              } else {
                that.fd = fd;
                that.emit("open", fd);
              }
            });
          }
          function createReadStream(path2, options) {
            return new fs3.ReadStream(path2, options);
          }
          function createWriteStream(path2, options) {
            return new fs3.WriteStream(path2, options);
          }
          var fs$open = fs3.open;
          fs3.open = open;
          function open(path2, flags, mode, cb) {
            if (typeof mode === "function")
              cb = mode, mode = null;
            return go$open(path2, flags, mode, cb);
            function go$open(path3, flags2, mode2, cb2, startTime) {
              return fs$open(path3, flags2, mode2, function(err, fd) {
                if (err && (err.code === "EMFILE" || err.code === "ENFILE"))
                  enqueue([go$open, [path3, flags2, mode2, cb2], err, startTime || Date.now(), Date.now()]);
                else {
                  if (typeof cb2 === "function")
                    cb2.apply(this, arguments);
                }
              });
            }
          }
          return fs3;
        }
        function enqueue(elem) {
          debug("ENQUEUE", elem[0].name, elem[1]);
          fs2[gracefulQueue].push(elem);
          retry();
        }
        var retryTimer;
        function resetQueue() {
          var now = Date.now();
          for (var i = 0; i < fs2[gracefulQueue].length; ++i) {
            if (fs2[gracefulQueue][i].length > 2) {
              fs2[gracefulQueue][i][3] = now;
              fs2[gracefulQueue][i][4] = now;
            }
          }
          retry();
        }
        function retry() {
          clearTimeout(retryTimer);
          retryTimer = void 0;
          if (fs2[gracefulQueue].length === 0)
            return;
          var elem = fs2[gracefulQueue].shift();
          var fn = elem[0];
          var args = elem[1];
          var err = elem[2];
          var startTime = elem[3];
          var lastTime = elem[4];
          if (startTime === void 0) {
            debug("RETRY", fn.name, args);
            fn.apply(null, args);
          } else if (Date.now() - startTime >= 6e4) {
            debug("TIMEOUT", fn.name, args);
            var cb = args.pop();
            if (typeof cb === "function")
              cb.call(null, err);
          } else {
            var sinceAttempt = Date.now() - lastTime;
            var sinceStart = Math.max(lastTime - startTime, 1);
            var desiredDelay = Math.min(sinceStart * 1.2, 100);
            if (sinceAttempt >= desiredDelay) {
              debug("RETRY", fn.name, args);
              fn.apply(null, args.concat([startTime]));
            } else {
              fs2[gracefulQueue].push(elem);
            }
          }
          if (retryTimer === void 0) {
            retryTimer = setTimeout(retry, 0);
          }
        }
      }
    });
    var require_fs = __commonJS2({
      "../../node_modules/fs-extra/lib/fs/index.js"(exports3) {
        "use strict";
        var u = require_universalify().fromCallback;
        var fs2 = require_graceful_fs();
        var api = [
          "access",
          "appendFile",
          "chmod",
          "chown",
          "close",
          "copyFile",
          "fchmod",
          "fchown",
          "fdatasync",
          "fstat",
          "fsync",
          "ftruncate",
          "futimes",
          "lchmod",
          "lchown",
          "link",
          "lstat",
          "mkdir",
          "mkdtemp",
          "open",
          "opendir",
          "readdir",
          "readFile",
          "readlink",
          "realpath",
          "rename",
          "rm",
          "rmdir",
          "stat",
          "symlink",
          "truncate",
          "unlink",
          "utimes",
          "writeFile"
        ].filter((key) => {
          return typeof fs2[key] === "function";
        });
        Object.assign(exports3, fs2);
        api.forEach((method) => {
          exports3[method] = u(fs2[method]);
        });
        exports3.exists = function(filename, callback) {
          if (typeof callback === "function") {
            return fs2.exists(filename, callback);
          }
          return new Promise((resolve) => {
            return fs2.exists(filename, resolve);
          });
        };
        exports3.read = function(fd, buffer, offset, length, position, callback) {
          if (typeof callback === "function") {
            return fs2.read(fd, buffer, offset, length, position, callback);
          }
          return new Promise((resolve, reject) => {
            fs2.read(fd, buffer, offset, length, position, (err, bytesRead, buffer2) => {
              if (err)
                return reject(err);
              resolve({ bytesRead, buffer: buffer2 });
            });
          });
        };
        exports3.write = function(fd, buffer, ...args) {
          if (typeof args[args.length - 1] === "function") {
            return fs2.write(fd, buffer, ...args);
          }
          return new Promise((resolve, reject) => {
            fs2.write(fd, buffer, ...args, (err, bytesWritten, buffer2) => {
              if (err)
                return reject(err);
              resolve({ bytesWritten, buffer: buffer2 });
            });
          });
        };
        exports3.readv = function(fd, buffers, ...args) {
          if (typeof args[args.length - 1] === "function") {
            return fs2.readv(fd, buffers, ...args);
          }
          return new Promise((resolve, reject) => {
            fs2.readv(fd, buffers, ...args, (err, bytesRead, buffers2) => {
              if (err)
                return reject(err);
              resolve({ bytesRead, buffers: buffers2 });
            });
          });
        };
        exports3.writev = function(fd, buffers, ...args) {
          if (typeof args[args.length - 1] === "function") {
            return fs2.writev(fd, buffers, ...args);
          }
          return new Promise((resolve, reject) => {
            fs2.writev(fd, buffers, ...args, (err, bytesWritten, buffers2) => {
              if (err)
                return reject(err);
              resolve({ bytesWritten, buffers: buffers2 });
            });
          });
        };
        if (typeof fs2.realpath.native === "function") {
          exports3.realpath.native = u(fs2.realpath.native);
        } else {
          process.emitWarning(
            "fs.realpath.native is not a function. Is fs being monkey-patched?",
            "Warning",
            "fs-extra-WARN0003"
          );
        }
      }
    });
    var require_utils = __commonJS2({
      "../../node_modules/fs-extra/lib/mkdirs/utils.js"(exports3, module22) {
        "use strict";
        var path2 = require("path");
        module22.exports.checkPath = function checkPath(pth) {
          if (process.platform === "win32") {
            const pathHasInvalidWinCharacters = /[<>:"|?*]/.test(pth.replace(path2.parse(pth).root, ""));
            if (pathHasInvalidWinCharacters) {
              const error = new Error(`Path contains invalid characters: ${pth}`);
              error.code = "EINVAL";
              throw error;
            }
          }
        };
      }
    });
    var require_make_dir = __commonJS2({
      "../../node_modules/fs-extra/lib/mkdirs/make-dir.js"(exports3, module22) {
        "use strict";
        var fs2 = require_fs();
        var { checkPath } = require_utils();
        var getMode = (options) => {
          const defaults = { mode: 511 };
          if (typeof options === "number")
            return options;
          return { ...defaults, ...options }.mode;
        };
        module22.exports.makeDir = async (dir, options) => {
          checkPath(dir);
          return fs2.mkdir(dir, {
            mode: getMode(options),
            recursive: true
          });
        };
        module22.exports.makeDirSync = (dir, options) => {
          checkPath(dir);
          return fs2.mkdirSync(dir, {
            mode: getMode(options),
            recursive: true
          });
        };
      }
    });
    var require_mkdirs = __commonJS2({
      "../../node_modules/fs-extra/lib/mkdirs/index.js"(exports3, module22) {
        "use strict";
        var u = require_universalify().fromPromise;
        var { makeDir: _makeDir, makeDirSync } = require_make_dir();
        var makeDir = u(_makeDir);
        module22.exports = {
          mkdirs: makeDir,
          mkdirsSync: makeDirSync,
          // alias
          mkdirp: makeDir,
          mkdirpSync: makeDirSync,
          ensureDir: makeDir,
          ensureDirSync: makeDirSync
        };
      }
    });
    var require_path_exists = __commonJS2({
      "../../node_modules/fs-extra/lib/path-exists/index.js"(exports3, module22) {
        "use strict";
        var u = require_universalify().fromPromise;
        var fs2 = require_fs();
        function pathExists(path2) {
          return fs2.access(path2).then(() => true).catch(() => false);
        }
        module22.exports = {
          pathExists: u(pathExists),
          pathExistsSync: fs2.existsSync
        };
      }
    });
    var require_utimes = __commonJS2({
      "../../node_modules/fs-extra/lib/util/utimes.js"(exports3, module22) {
        "use strict";
        var fs2 = require_graceful_fs();
        function utimesMillis(path2, atime, mtime, callback) {
          fs2.open(path2, "r+", (err, fd) => {
            if (err)
              return callback(err);
            fs2.futimes(fd, atime, mtime, (futimesErr) => {
              fs2.close(fd, (closeErr) => {
                if (callback)
                  callback(futimesErr || closeErr);
              });
            });
          });
        }
        function utimesMillisSync(path2, atime, mtime) {
          const fd = fs2.openSync(path2, "r+");
          fs2.futimesSync(fd, atime, mtime);
          return fs2.closeSync(fd);
        }
        module22.exports = {
          utimesMillis,
          utimesMillisSync
        };
      }
    });
    var require_stat = __commonJS2({
      "../../node_modules/fs-extra/lib/util/stat.js"(exports3, module22) {
        "use strict";
        var fs2 = require_fs();
        var path2 = require("path");
        var util2 = require("util");
        function getStats(src, dest, opts) {
          const statFunc = opts.dereference ? (file) => fs2.stat(file, { bigint: true }) : (file) => fs2.lstat(file, { bigint: true });
          return Promise.all([
            statFunc(src),
            statFunc(dest).catch((err) => {
              if (err.code === "ENOENT")
                return null;
              throw err;
            })
          ]).then(([srcStat, destStat]) => ({ srcStat, destStat }));
        }
        function getStatsSync(src, dest, opts) {
          let destStat;
          const statFunc = opts.dereference ? (file) => fs2.statSync(file, { bigint: true }) : (file) => fs2.lstatSync(file, { bigint: true });
          const srcStat = statFunc(src);
          try {
            destStat = statFunc(dest);
          } catch (err) {
            if (err.code === "ENOENT")
              return { srcStat, destStat: null };
            throw err;
          }
          return { srcStat, destStat };
        }
        function checkPaths(src, dest, funcName, opts, cb) {
          util2.callbackify(getStats)(src, dest, opts, (err, stats) => {
            if (err)
              return cb(err);
            const { srcStat, destStat } = stats;
            if (destStat) {
              if (areIdentical(srcStat, destStat)) {
                const srcBaseName = path2.basename(src);
                const destBaseName = path2.basename(dest);
                if (funcName === "move" && srcBaseName !== destBaseName && srcBaseName.toLowerCase() === destBaseName.toLowerCase()) {
                  return cb(null, { srcStat, destStat, isChangingCase: true });
                }
                return cb(new Error("Source and destination must not be the same."));
              }
              if (srcStat.isDirectory() && !destStat.isDirectory()) {
                return cb(new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`));
              }
              if (!srcStat.isDirectory() && destStat.isDirectory()) {
                return cb(new Error(`Cannot overwrite directory '${dest}' with non-directory '${src}'.`));
              }
            }
            if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
              return cb(new Error(errMsg(src, dest, funcName)));
            }
            return cb(null, { srcStat, destStat });
          });
        }
        function checkPathsSync(src, dest, funcName, opts) {
          const { srcStat, destStat } = getStatsSync(src, dest, opts);
          if (destStat) {
            if (areIdentical(srcStat, destStat)) {
              const srcBaseName = path2.basename(src);
              const destBaseName = path2.basename(dest);
              if (funcName === "move" && srcBaseName !== destBaseName && srcBaseName.toLowerCase() === destBaseName.toLowerCase()) {
                return { srcStat, destStat, isChangingCase: true };
              }
              throw new Error("Source and destination must not be the same.");
            }
            if (srcStat.isDirectory() && !destStat.isDirectory()) {
              throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
            }
            if (!srcStat.isDirectory() && destStat.isDirectory()) {
              throw new Error(`Cannot overwrite directory '${dest}' with non-directory '${src}'.`);
            }
          }
          if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
            throw new Error(errMsg(src, dest, funcName));
          }
          return { srcStat, destStat };
        }
        function checkParentPaths(src, srcStat, dest, funcName, cb) {
          const srcParent = path2.resolve(path2.dirname(src));
          const destParent = path2.resolve(path2.dirname(dest));
          if (destParent === srcParent || destParent === path2.parse(destParent).root)
            return cb();
          fs2.stat(destParent, { bigint: true }, (err, destStat) => {
            if (err) {
              if (err.code === "ENOENT")
                return cb();
              return cb(err);
            }
            if (areIdentical(srcStat, destStat)) {
              return cb(new Error(errMsg(src, dest, funcName)));
            }
            return checkParentPaths(src, srcStat, destParent, funcName, cb);
          });
        }
        function checkParentPathsSync(src, srcStat, dest, funcName) {
          const srcParent = path2.resolve(path2.dirname(src));
          const destParent = path2.resolve(path2.dirname(dest));
          if (destParent === srcParent || destParent === path2.parse(destParent).root)
            return;
          let destStat;
          try {
            destStat = fs2.statSync(destParent, { bigint: true });
          } catch (err) {
            if (err.code === "ENOENT")
              return;
            throw err;
          }
          if (areIdentical(srcStat, destStat)) {
            throw new Error(errMsg(src, dest, funcName));
          }
          return checkParentPathsSync(src, srcStat, destParent, funcName);
        }
        function areIdentical(srcStat, destStat) {
          return destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev;
        }
        function isSrcSubdir(src, dest) {
          const srcArr = path2.resolve(src).split(path2.sep).filter((i) => i);
          const destArr = path2.resolve(dest).split(path2.sep).filter((i) => i);
          return srcArr.reduce((acc, cur, i) => acc && destArr[i] === cur, true);
        }
        function errMsg(src, dest, funcName) {
          return `Cannot ${funcName} '${src}' to a subdirectory of itself, '${dest}'.`;
        }
        module22.exports = {
          checkPaths,
          checkPathsSync,
          checkParentPaths,
          checkParentPathsSync,
          isSrcSubdir,
          areIdentical
        };
      }
    });
    var require_copy = __commonJS2({
      "../../node_modules/fs-extra/lib/copy/copy.js"(exports3, module22) {
        "use strict";
        var fs2 = require_graceful_fs();
        var path2 = require("path");
        var mkdirs = require_mkdirs().mkdirs;
        var pathExists = require_path_exists().pathExists;
        var utimesMillis = require_utimes().utimesMillis;
        var stat = require_stat();
        function copy(src, dest, opts, cb) {
          if (typeof opts === "function" && !cb) {
            cb = opts;
            opts = {};
          } else if (typeof opts === "function") {
            opts = { filter: opts };
          }
          cb = cb || function() {
          };
          opts = opts || {};
          opts.clobber = "clobber" in opts ? !!opts.clobber : true;
          opts.overwrite = "overwrite" in opts ? !!opts.overwrite : opts.clobber;
          if (opts.preserveTimestamps && process.arch === "ia32") {
            process.emitWarning(
              "Using the preserveTimestamps option in 32-bit node is not recommended;\n\n	see https://github.com/jprichardson/node-fs-extra/issues/269",
              "Warning",
              "fs-extra-WARN0001"
            );
          }
          stat.checkPaths(src, dest, "copy", opts, (err, stats) => {
            if (err)
              return cb(err);
            const { srcStat, destStat } = stats;
            stat.checkParentPaths(src, srcStat, dest, "copy", (err2) => {
              if (err2)
                return cb(err2);
              runFilter(src, dest, opts, (err3, include) => {
                if (err3)
                  return cb(err3);
                if (!include)
                  return cb();
                checkParentDir(destStat, src, dest, opts, cb);
              });
            });
          });
        }
        function checkParentDir(destStat, src, dest, opts, cb) {
          const destParent = path2.dirname(dest);
          pathExists(destParent, (err, dirExists) => {
            if (err)
              return cb(err);
            if (dirExists)
              return getStats(destStat, src, dest, opts, cb);
            mkdirs(destParent, (err2) => {
              if (err2)
                return cb(err2);
              return getStats(destStat, src, dest, opts, cb);
            });
          });
        }
        function runFilter(src, dest, opts, cb) {
          if (!opts.filter)
            return cb(null, true);
          Promise.resolve(opts.filter(src, dest)).then((include) => cb(null, include), (error) => cb(error));
        }
        function getStats(destStat, src, dest, opts, cb) {
          const stat2 = opts.dereference ? fs2.stat : fs2.lstat;
          stat2(src, (err, srcStat) => {
            if (err)
              return cb(err);
            if (srcStat.isDirectory())
              return onDir(srcStat, destStat, src, dest, opts, cb);
            else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice())
              return onFile(srcStat, destStat, src, dest, opts, cb);
            else if (srcStat.isSymbolicLink())
              return onLink(destStat, src, dest, opts, cb);
            else if (srcStat.isSocket())
              return cb(new Error(`Cannot copy a socket file: ${src}`));
            else if (srcStat.isFIFO())
              return cb(new Error(`Cannot copy a FIFO pipe: ${src}`));
            return cb(new Error(`Unknown file: ${src}`));
          });
        }
        function onFile(srcStat, destStat, src, dest, opts, cb) {
          if (!destStat)
            return copyFile(srcStat, src, dest, opts, cb);
          return mayCopyFile(srcStat, src, dest, opts, cb);
        }
        function mayCopyFile(srcStat, src, dest, opts, cb) {
          if (opts.overwrite) {
            fs2.unlink(dest, (err) => {
              if (err)
                return cb(err);
              return copyFile(srcStat, src, dest, opts, cb);
            });
          } else if (opts.errorOnExist) {
            return cb(new Error(`'${dest}' already exists`));
          } else
            return cb();
        }
        function copyFile(srcStat, src, dest, opts, cb) {
          fs2.copyFile(src, dest, (err) => {
            if (err)
              return cb(err);
            if (opts.preserveTimestamps)
              return handleTimestampsAndMode(srcStat.mode, src, dest, cb);
            return setDestMode(dest, srcStat.mode, cb);
          });
        }
        function handleTimestampsAndMode(srcMode, src, dest, cb) {
          if (fileIsNotWritable(srcMode)) {
            return makeFileWritable(dest, srcMode, (err) => {
              if (err)
                return cb(err);
              return setDestTimestampsAndMode(srcMode, src, dest, cb);
            });
          }
          return setDestTimestampsAndMode(srcMode, src, dest, cb);
        }
        function fileIsNotWritable(srcMode) {
          return (srcMode & 128) === 0;
        }
        function makeFileWritable(dest, srcMode, cb) {
          return setDestMode(dest, srcMode | 128, cb);
        }
        function setDestTimestampsAndMode(srcMode, src, dest, cb) {
          setDestTimestamps(src, dest, (err) => {
            if (err)
              return cb(err);
            return setDestMode(dest, srcMode, cb);
          });
        }
        function setDestMode(dest, srcMode, cb) {
          return fs2.chmod(dest, srcMode, cb);
        }
        function setDestTimestamps(src, dest, cb) {
          fs2.stat(src, (err, updatedSrcStat) => {
            if (err)
              return cb(err);
            return utimesMillis(dest, updatedSrcStat.atime, updatedSrcStat.mtime, cb);
          });
        }
        function onDir(srcStat, destStat, src, dest, opts, cb) {
          if (!destStat)
            return mkDirAndCopy(srcStat.mode, src, dest, opts, cb);
          return copyDir(src, dest, opts, cb);
        }
        function mkDirAndCopy(srcMode, src, dest, opts, cb) {
          fs2.mkdir(dest, (err) => {
            if (err)
              return cb(err);
            copyDir(src, dest, opts, (err2) => {
              if (err2)
                return cb(err2);
              return setDestMode(dest, srcMode, cb);
            });
          });
        }
        function copyDir(src, dest, opts, cb) {
          fs2.readdir(src, (err, items) => {
            if (err)
              return cb(err);
            return copyDirItems(items, src, dest, opts, cb);
          });
        }
        function copyDirItems(items, src, dest, opts, cb) {
          const item = items.pop();
          if (!item)
            return cb();
          return copyDirItem(items, item, src, dest, opts, cb);
        }
        function copyDirItem(items, item, src, dest, opts, cb) {
          const srcItem = path2.join(src, item);
          const destItem = path2.join(dest, item);
          runFilter(srcItem, destItem, opts, (err, include) => {
            if (err)
              return cb(err);
            if (!include)
              return copyDirItems(items, src, dest, opts, cb);
            stat.checkPaths(srcItem, destItem, "copy", opts, (err2, stats) => {
              if (err2)
                return cb(err2);
              const { destStat } = stats;
              getStats(destStat, srcItem, destItem, opts, (err3) => {
                if (err3)
                  return cb(err3);
                return copyDirItems(items, src, dest, opts, cb);
              });
            });
          });
        }
        function onLink(destStat, src, dest, opts, cb) {
          fs2.readlink(src, (err, resolvedSrc) => {
            if (err)
              return cb(err);
            if (opts.dereference) {
              resolvedSrc = path2.resolve(process.cwd(), resolvedSrc);
            }
            if (!destStat) {
              return fs2.symlink(resolvedSrc, dest, cb);
            } else {
              fs2.readlink(dest, (err2, resolvedDest) => {
                if (err2) {
                  if (err2.code === "EINVAL" || err2.code === "UNKNOWN")
                    return fs2.symlink(resolvedSrc, dest, cb);
                  return cb(err2);
                }
                if (opts.dereference) {
                  resolvedDest = path2.resolve(process.cwd(), resolvedDest);
                }
                if (stat.isSrcSubdir(resolvedSrc, resolvedDest)) {
                  return cb(new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`));
                }
                if (stat.isSrcSubdir(resolvedDest, resolvedSrc)) {
                  return cb(new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`));
                }
                return copyLink(resolvedSrc, dest, cb);
              });
            }
          });
        }
        function copyLink(resolvedSrc, dest, cb) {
          fs2.unlink(dest, (err) => {
            if (err)
              return cb(err);
            return fs2.symlink(resolvedSrc, dest, cb);
          });
        }
        module22.exports = copy;
      }
    });
    var require_copy_sync = __commonJS2({
      "../../node_modules/fs-extra/lib/copy/copy-sync.js"(exports3, module22) {
        "use strict";
        var fs2 = require_graceful_fs();
        var path2 = require("path");
        var mkdirsSync = require_mkdirs().mkdirsSync;
        var utimesMillisSync = require_utimes().utimesMillisSync;
        var stat = require_stat();
        function copySync(src, dest, opts) {
          if (typeof opts === "function") {
            opts = { filter: opts };
          }
          opts = opts || {};
          opts.clobber = "clobber" in opts ? !!opts.clobber : true;
          opts.overwrite = "overwrite" in opts ? !!opts.overwrite : opts.clobber;
          if (opts.preserveTimestamps && process.arch === "ia32") {
            process.emitWarning(
              "Using the preserveTimestamps option in 32-bit node is not recommended;\n\n	see https://github.com/jprichardson/node-fs-extra/issues/269",
              "Warning",
              "fs-extra-WARN0002"
            );
          }
          const { srcStat, destStat } = stat.checkPathsSync(src, dest, "copy", opts);
          stat.checkParentPathsSync(src, srcStat, dest, "copy");
          if (opts.filter && !opts.filter(src, dest))
            return;
          const destParent = path2.dirname(dest);
          if (!fs2.existsSync(destParent))
            mkdirsSync(destParent);
          return getStats(destStat, src, dest, opts);
        }
        function getStats(destStat, src, dest, opts) {
          const statSync = opts.dereference ? fs2.statSync : fs2.lstatSync;
          const srcStat = statSync(src);
          if (srcStat.isDirectory())
            return onDir(srcStat, destStat, src, dest, opts);
          else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice())
            return onFile(srcStat, destStat, src, dest, opts);
          else if (srcStat.isSymbolicLink())
            return onLink(destStat, src, dest, opts);
          else if (srcStat.isSocket())
            throw new Error(`Cannot copy a socket file: ${src}`);
          else if (srcStat.isFIFO())
            throw new Error(`Cannot copy a FIFO pipe: ${src}`);
          throw new Error(`Unknown file: ${src}`);
        }
        function onFile(srcStat, destStat, src, dest, opts) {
          if (!destStat)
            return copyFile(srcStat, src, dest, opts);
          return mayCopyFile(srcStat, src, dest, opts);
        }
        function mayCopyFile(srcStat, src, dest, opts) {
          if (opts.overwrite) {
            fs2.unlinkSync(dest);
            return copyFile(srcStat, src, dest, opts);
          } else if (opts.errorOnExist) {
            throw new Error(`'${dest}' already exists`);
          }
        }
        function copyFile(srcStat, src, dest, opts) {
          fs2.copyFileSync(src, dest);
          if (opts.preserveTimestamps)
            handleTimestamps(srcStat.mode, src, dest);
          return setDestMode(dest, srcStat.mode);
        }
        function handleTimestamps(srcMode, src, dest) {
          if (fileIsNotWritable(srcMode))
            makeFileWritable(dest, srcMode);
          return setDestTimestamps(src, dest);
        }
        function fileIsNotWritable(srcMode) {
          return (srcMode & 128) === 0;
        }
        function makeFileWritable(dest, srcMode) {
          return setDestMode(dest, srcMode | 128);
        }
        function setDestMode(dest, srcMode) {
          return fs2.chmodSync(dest, srcMode);
        }
        function setDestTimestamps(src, dest) {
          const updatedSrcStat = fs2.statSync(src);
          return utimesMillisSync(dest, updatedSrcStat.atime, updatedSrcStat.mtime);
        }
        function onDir(srcStat, destStat, src, dest, opts) {
          if (!destStat)
            return mkDirAndCopy(srcStat.mode, src, dest, opts);
          return copyDir(src, dest, opts);
        }
        function mkDirAndCopy(srcMode, src, dest, opts) {
          fs2.mkdirSync(dest);
          copyDir(src, dest, opts);
          return setDestMode(dest, srcMode);
        }
        function copyDir(src, dest, opts) {
          fs2.readdirSync(src).forEach((item) => copyDirItem(item, src, dest, opts));
        }
        function copyDirItem(item, src, dest, opts) {
          const srcItem = path2.join(src, item);
          const destItem = path2.join(dest, item);
          if (opts.filter && !opts.filter(srcItem, destItem))
            return;
          const { destStat } = stat.checkPathsSync(srcItem, destItem, "copy", opts);
          return getStats(destStat, srcItem, destItem, opts);
        }
        function onLink(destStat, src, dest, opts) {
          let resolvedSrc = fs2.readlinkSync(src);
          if (opts.dereference) {
            resolvedSrc = path2.resolve(process.cwd(), resolvedSrc);
          }
          if (!destStat) {
            return fs2.symlinkSync(resolvedSrc, dest);
          } else {
            let resolvedDest;
            try {
              resolvedDest = fs2.readlinkSync(dest);
            } catch (err) {
              if (err.code === "EINVAL" || err.code === "UNKNOWN")
                return fs2.symlinkSync(resolvedSrc, dest);
              throw err;
            }
            if (opts.dereference) {
              resolvedDest = path2.resolve(process.cwd(), resolvedDest);
            }
            if (stat.isSrcSubdir(resolvedSrc, resolvedDest)) {
              throw new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`);
            }
            if (stat.isSrcSubdir(resolvedDest, resolvedSrc)) {
              throw new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`);
            }
            return copyLink(resolvedSrc, dest);
          }
        }
        function copyLink(resolvedSrc, dest) {
          fs2.unlinkSync(dest);
          return fs2.symlinkSync(resolvedSrc, dest);
        }
        module22.exports = copySync;
      }
    });
    var require_copy2 = __commonJS2({
      "../../node_modules/fs-extra/lib/copy/index.js"(exports3, module22) {
        "use strict";
        var u = require_universalify().fromCallback;
        module22.exports = {
          copy: u(require_copy()),
          copySync: require_copy_sync()
        };
      }
    });
    var require_remove = __commonJS2({
      "../../node_modules/fs-extra/lib/remove/index.js"(exports3, module22) {
        "use strict";
        var fs2 = require_graceful_fs();
        var u = require_universalify().fromCallback;
        function remove(path2, callback) {
          fs2.rm(path2, { recursive: true, force: true }, callback);
        }
        function removeSync(path2) {
          fs2.rmSync(path2, { recursive: true, force: true });
        }
        module22.exports = {
          remove: u(remove),
          removeSync
        };
      }
    });
    var require_empty = __commonJS2({
      "../../node_modules/fs-extra/lib/empty/index.js"(exports3, module22) {
        "use strict";
        var u = require_universalify().fromPromise;
        var fs2 = require_fs();
        var path2 = require("path");
        var mkdir = require_mkdirs();
        var remove = require_remove();
        var emptyDir = u(async function emptyDir2(dir) {
          let items;
          try {
            items = await fs2.readdir(dir);
          } catch {
            return mkdir.mkdirs(dir);
          }
          return Promise.all(items.map((item) => remove.remove(path2.join(dir, item))));
        });
        function emptyDirSync(dir) {
          let items;
          try {
            items = fs2.readdirSync(dir);
          } catch {
            return mkdir.mkdirsSync(dir);
          }
          items.forEach((item) => {
            item = path2.join(dir, item);
            remove.removeSync(item);
          });
        }
        module22.exports = {
          emptyDirSync,
          emptydirSync: emptyDirSync,
          emptyDir,
          emptydir: emptyDir
        };
      }
    });
    var require_file = __commonJS2({
      "../../node_modules/fs-extra/lib/ensure/file.js"(exports3, module22) {
        "use strict";
        var u = require_universalify().fromCallback;
        var path2 = require("path");
        var fs2 = require_graceful_fs();
        var mkdir = require_mkdirs();
        function createFile(file, callback) {
          function makeFile() {
            fs2.writeFile(file, "", (err) => {
              if (err)
                return callback(err);
              callback();
            });
          }
          fs2.stat(file, (err, stats) => {
            if (!err && stats.isFile())
              return callback();
            const dir = path2.dirname(file);
            fs2.stat(dir, (err2, stats2) => {
              if (err2) {
                if (err2.code === "ENOENT") {
                  return mkdir.mkdirs(dir, (err3) => {
                    if (err3)
                      return callback(err3);
                    makeFile();
                  });
                }
                return callback(err2);
              }
              if (stats2.isDirectory())
                makeFile();
              else {
                fs2.readdir(dir, (err3) => {
                  if (err3)
                    return callback(err3);
                });
              }
            });
          });
        }
        function createFileSync(file) {
          let stats;
          try {
            stats = fs2.statSync(file);
          } catch {
          }
          if (stats && stats.isFile())
            return;
          const dir = path2.dirname(file);
          try {
            if (!fs2.statSync(dir).isDirectory()) {
              fs2.readdirSync(dir);
            }
          } catch (err) {
            if (err && err.code === "ENOENT")
              mkdir.mkdirsSync(dir);
            else
              throw err;
          }
          fs2.writeFileSync(file, "");
        }
        module22.exports = {
          createFile: u(createFile),
          createFileSync
        };
      }
    });
    var require_link = __commonJS2({
      "../../node_modules/fs-extra/lib/ensure/link.js"(exports3, module22) {
        "use strict";
        var u = require_universalify().fromCallback;
        var path2 = require("path");
        var fs2 = require_graceful_fs();
        var mkdir = require_mkdirs();
        var pathExists = require_path_exists().pathExists;
        var { areIdentical } = require_stat();
        function createLink(srcpath, dstpath, callback) {
          function makeLink(srcpath2, dstpath2) {
            fs2.link(srcpath2, dstpath2, (err) => {
              if (err)
                return callback(err);
              callback(null);
            });
          }
          fs2.lstat(dstpath, (_, dstStat) => {
            fs2.lstat(srcpath, (err, srcStat) => {
              if (err) {
                err.message = err.message.replace("lstat", "ensureLink");
                return callback(err);
              }
              if (dstStat && areIdentical(srcStat, dstStat))
                return callback(null);
              const dir = path2.dirname(dstpath);
              pathExists(dir, (err2, dirExists) => {
                if (err2)
                  return callback(err2);
                if (dirExists)
                  return makeLink(srcpath, dstpath);
                mkdir.mkdirs(dir, (err3) => {
                  if (err3)
                    return callback(err3);
                  makeLink(srcpath, dstpath);
                });
              });
            });
          });
        }
        function createLinkSync(srcpath, dstpath) {
          let dstStat;
          try {
            dstStat = fs2.lstatSync(dstpath);
          } catch {
          }
          try {
            const srcStat = fs2.lstatSync(srcpath);
            if (dstStat && areIdentical(srcStat, dstStat))
              return;
          } catch (err) {
            err.message = err.message.replace("lstat", "ensureLink");
            throw err;
          }
          const dir = path2.dirname(dstpath);
          const dirExists = fs2.existsSync(dir);
          if (dirExists)
            return fs2.linkSync(srcpath, dstpath);
          mkdir.mkdirsSync(dir);
          return fs2.linkSync(srcpath, dstpath);
        }
        module22.exports = {
          createLink: u(createLink),
          createLinkSync
        };
      }
    });
    var require_symlink_paths = __commonJS2({
      "../../node_modules/fs-extra/lib/ensure/symlink-paths.js"(exports3, module22) {
        "use strict";
        var path2 = require("path");
        var fs2 = require_graceful_fs();
        var pathExists = require_path_exists().pathExists;
        function symlinkPaths(srcpath, dstpath, callback) {
          if (path2.isAbsolute(srcpath)) {
            return fs2.lstat(srcpath, (err) => {
              if (err) {
                err.message = err.message.replace("lstat", "ensureSymlink");
                return callback(err);
              }
              return callback(null, {
                toCwd: srcpath,
                toDst: srcpath
              });
            });
          } else {
            const dstdir = path2.dirname(dstpath);
            const relativeToDst = path2.join(dstdir, srcpath);
            return pathExists(relativeToDst, (err, exists) => {
              if (err)
                return callback(err);
              if (exists) {
                return callback(null, {
                  toCwd: relativeToDst,
                  toDst: srcpath
                });
              } else {
                return fs2.lstat(srcpath, (err2) => {
                  if (err2) {
                    err2.message = err2.message.replace("lstat", "ensureSymlink");
                    return callback(err2);
                  }
                  return callback(null, {
                    toCwd: srcpath,
                    toDst: path2.relative(dstdir, srcpath)
                  });
                });
              }
            });
          }
        }
        function symlinkPathsSync(srcpath, dstpath) {
          let exists;
          if (path2.isAbsolute(srcpath)) {
            exists = fs2.existsSync(srcpath);
            if (!exists)
              throw new Error("absolute srcpath does not exist");
            return {
              toCwd: srcpath,
              toDst: srcpath
            };
          } else {
            const dstdir = path2.dirname(dstpath);
            const relativeToDst = path2.join(dstdir, srcpath);
            exists = fs2.existsSync(relativeToDst);
            if (exists) {
              return {
                toCwd: relativeToDst,
                toDst: srcpath
              };
            } else {
              exists = fs2.existsSync(srcpath);
              if (!exists)
                throw new Error("relative srcpath does not exist");
              return {
                toCwd: srcpath,
                toDst: path2.relative(dstdir, srcpath)
              };
            }
          }
        }
        module22.exports = {
          symlinkPaths,
          symlinkPathsSync
        };
      }
    });
    var require_symlink_type = __commonJS2({
      "../../node_modules/fs-extra/lib/ensure/symlink-type.js"(exports3, module22) {
        "use strict";
        var fs2 = require_graceful_fs();
        function symlinkType(srcpath, type, callback) {
          callback = typeof type === "function" ? type : callback;
          type = typeof type === "function" ? false : type;
          if (type)
            return callback(null, type);
          fs2.lstat(srcpath, (err, stats) => {
            if (err)
              return callback(null, "file");
            type = stats && stats.isDirectory() ? "dir" : "file";
            callback(null, type);
          });
        }
        function symlinkTypeSync(srcpath, type) {
          let stats;
          if (type)
            return type;
          try {
            stats = fs2.lstatSync(srcpath);
          } catch {
            return "file";
          }
          return stats && stats.isDirectory() ? "dir" : "file";
        }
        module22.exports = {
          symlinkType,
          symlinkTypeSync
        };
      }
    });
    var require_symlink = __commonJS2({
      "../../node_modules/fs-extra/lib/ensure/symlink.js"(exports3, module22) {
        "use strict";
        var u = require_universalify().fromCallback;
        var path2 = require("path");
        var fs2 = require_fs();
        var _mkdirs = require_mkdirs();
        var mkdirs = _mkdirs.mkdirs;
        var mkdirsSync = _mkdirs.mkdirsSync;
        var _symlinkPaths = require_symlink_paths();
        var symlinkPaths = _symlinkPaths.symlinkPaths;
        var symlinkPathsSync = _symlinkPaths.symlinkPathsSync;
        var _symlinkType = require_symlink_type();
        var symlinkType = _symlinkType.symlinkType;
        var symlinkTypeSync = _symlinkType.symlinkTypeSync;
        var pathExists = require_path_exists().pathExists;
        var { areIdentical } = require_stat();
        function createSymlink(srcpath, dstpath, type, callback) {
          callback = typeof type === "function" ? type : callback;
          type = typeof type === "function" ? false : type;
          fs2.lstat(dstpath, (err, stats) => {
            if (!err && stats.isSymbolicLink()) {
              Promise.all([
                fs2.stat(srcpath),
                fs2.stat(dstpath)
              ]).then(([srcStat, dstStat]) => {
                if (areIdentical(srcStat, dstStat))
                  return callback(null);
                _createSymlink(srcpath, dstpath, type, callback);
              });
            } else
              _createSymlink(srcpath, dstpath, type, callback);
          });
        }
        function _createSymlink(srcpath, dstpath, type, callback) {
          symlinkPaths(srcpath, dstpath, (err, relative) => {
            if (err)
              return callback(err);
            srcpath = relative.toDst;
            symlinkType(relative.toCwd, type, (err2, type2) => {
              if (err2)
                return callback(err2);
              const dir = path2.dirname(dstpath);
              pathExists(dir, (err3, dirExists) => {
                if (err3)
                  return callback(err3);
                if (dirExists)
                  return fs2.symlink(srcpath, dstpath, type2, callback);
                mkdirs(dir, (err4) => {
                  if (err4)
                    return callback(err4);
                  fs2.symlink(srcpath, dstpath, type2, callback);
                });
              });
            });
          });
        }
        function createSymlinkSync(srcpath, dstpath, type) {
          let stats;
          try {
            stats = fs2.lstatSync(dstpath);
          } catch {
          }
          if (stats && stats.isSymbolicLink()) {
            const srcStat = fs2.statSync(srcpath);
            const dstStat = fs2.statSync(dstpath);
            if (areIdentical(srcStat, dstStat))
              return;
          }
          const relative = symlinkPathsSync(srcpath, dstpath);
          srcpath = relative.toDst;
          type = symlinkTypeSync(relative.toCwd, type);
          const dir = path2.dirname(dstpath);
          const exists = fs2.existsSync(dir);
          if (exists)
            return fs2.symlinkSync(srcpath, dstpath, type);
          mkdirsSync(dir);
          return fs2.symlinkSync(srcpath, dstpath, type);
        }
        module22.exports = {
          createSymlink: u(createSymlink),
          createSymlinkSync
        };
      }
    });
    var require_ensure = __commonJS2({
      "../../node_modules/fs-extra/lib/ensure/index.js"(exports3, module22) {
        "use strict";
        var { createFile, createFileSync } = require_file();
        var { createLink, createLinkSync } = require_link();
        var { createSymlink, createSymlinkSync } = require_symlink();
        module22.exports = {
          // file
          createFile,
          createFileSync,
          ensureFile: createFile,
          ensureFileSync: createFileSync,
          // link
          createLink,
          createLinkSync,
          ensureLink: createLink,
          ensureLinkSync: createLinkSync,
          // symlink
          createSymlink,
          createSymlinkSync,
          ensureSymlink: createSymlink,
          ensureSymlinkSync: createSymlinkSync
        };
      }
    });
    var require_utils2 = __commonJS2({
      "../../node_modules/jsonfile/utils.js"(exports3, module22) {
        function stringify(obj, { EOL = "\n", finalEOL = true, replacer = null, spaces } = {}) {
          const EOF = finalEOL ? EOL : "";
          const str3 = JSON.stringify(obj, replacer, spaces);
          return str3.replace(/\n/g, EOL) + EOF;
        }
        function stripBom(content) {
          if (Buffer.isBuffer(content))
            content = content.toString("utf8");
          return content.replace(/^\uFEFF/, "");
        }
        module22.exports = { stringify, stripBom };
      }
    });
    var require_jsonfile = __commonJS2({
      "../../node_modules/jsonfile/index.js"(exports3, module22) {
        var _fs;
        try {
          _fs = require_graceful_fs();
        } catch (_) {
          _fs = require("fs");
        }
        var universalify = require_universalify();
        var { stringify, stripBom } = require_utils2();
        async function _readFile(file, options = {}) {
          if (typeof options === "string") {
            options = { encoding: options };
          }
          const fs2 = options.fs || _fs;
          const shouldThrow = "throws" in options ? options.throws : true;
          let data = await universalify.fromCallback(fs2.readFile)(file, options);
          data = stripBom(data);
          let obj;
          try {
            obj = JSON.parse(data, options ? options.reviver : null);
          } catch (err) {
            if (shouldThrow) {
              err.message = `${file}: ${err.message}`;
              throw err;
            } else {
              return null;
            }
          }
          return obj;
        }
        var readFile = universalify.fromPromise(_readFile);
        function readFileSync(file, options = {}) {
          if (typeof options === "string") {
            options = { encoding: options };
          }
          const fs2 = options.fs || _fs;
          const shouldThrow = "throws" in options ? options.throws : true;
          try {
            let content = fs2.readFileSync(file, options);
            content = stripBom(content);
            return JSON.parse(content, options.reviver);
          } catch (err) {
            if (shouldThrow) {
              err.message = `${file}: ${err.message}`;
              throw err;
            } else {
              return null;
            }
          }
        }
        async function _writeFile(file, obj, options = {}) {
          const fs2 = options.fs || _fs;
          const str3 = stringify(obj, options);
          await universalify.fromCallback(fs2.writeFile)(file, str3, options);
        }
        var writeFile = universalify.fromPromise(_writeFile);
        function writeFileSync(file, obj, options = {}) {
          const fs2 = options.fs || _fs;
          const str3 = stringify(obj, options);
          return fs2.writeFileSync(file, str3, options);
        }
        var jsonfile = {
          readFile,
          readFileSync,
          writeFile,
          writeFileSync
        };
        module22.exports = jsonfile;
      }
    });
    var require_jsonfile2 = __commonJS2({
      "../../node_modules/fs-extra/lib/json/jsonfile.js"(exports3, module22) {
        "use strict";
        var jsonFile = require_jsonfile();
        module22.exports = {
          // jsonfile exports
          readJson: jsonFile.readFile,
          readJsonSync: jsonFile.readFileSync,
          writeJson: jsonFile.writeFile,
          writeJsonSync: jsonFile.writeFileSync
        };
      }
    });
    var require_output_file = __commonJS2({
      "../../node_modules/fs-extra/lib/output-file/index.js"(exports3, module22) {
        "use strict";
        var u = require_universalify().fromCallback;
        var fs2 = require_graceful_fs();
        var path2 = require("path");
        var mkdir = require_mkdirs();
        var pathExists = require_path_exists().pathExists;
        function outputFile(file, data, encoding, callback) {
          if (typeof encoding === "function") {
            callback = encoding;
            encoding = "utf8";
          }
          const dir = path2.dirname(file);
          pathExists(dir, (err, itDoes) => {
            if (err)
              return callback(err);
            if (itDoes)
              return fs2.writeFile(file, data, encoding, callback);
            mkdir.mkdirs(dir, (err2) => {
              if (err2)
                return callback(err2);
              fs2.writeFile(file, data, encoding, callback);
            });
          });
        }
        function outputFileSync(file, ...args) {
          const dir = path2.dirname(file);
          if (fs2.existsSync(dir)) {
            return fs2.writeFileSync(file, ...args);
          }
          mkdir.mkdirsSync(dir);
          fs2.writeFileSync(file, ...args);
        }
        module22.exports = {
          outputFile: u(outputFile),
          outputFileSync
        };
      }
    });
    var require_output_json = __commonJS2({
      "../../node_modules/fs-extra/lib/json/output-json.js"(exports3, module22) {
        "use strict";
        var { stringify } = require_utils2();
        var { outputFile } = require_output_file();
        async function outputJson(file, data, options = {}) {
          const str3 = stringify(data, options);
          await outputFile(file, str3, options);
        }
        module22.exports = outputJson;
      }
    });
    var require_output_json_sync = __commonJS2({
      "../../node_modules/fs-extra/lib/json/output-json-sync.js"(exports3, module22) {
        "use strict";
        var { stringify } = require_utils2();
        var { outputFileSync } = require_output_file();
        function outputJsonSync(file, data, options) {
          const str3 = stringify(data, options);
          outputFileSync(file, str3, options);
        }
        module22.exports = outputJsonSync;
      }
    });
    var require_json = __commonJS2({
      "../../node_modules/fs-extra/lib/json/index.js"(exports3, module22) {
        "use strict";
        var u = require_universalify().fromPromise;
        var jsonFile = require_jsonfile2();
        jsonFile.outputJson = u(require_output_json());
        jsonFile.outputJsonSync = require_output_json_sync();
        jsonFile.outputJSON = jsonFile.outputJson;
        jsonFile.outputJSONSync = jsonFile.outputJsonSync;
        jsonFile.writeJSON = jsonFile.writeJson;
        jsonFile.writeJSONSync = jsonFile.writeJsonSync;
        jsonFile.readJSON = jsonFile.readJson;
        jsonFile.readJSONSync = jsonFile.readJsonSync;
        module22.exports = jsonFile;
      }
    });
    var require_move = __commonJS2({
      "../../node_modules/fs-extra/lib/move/move.js"(exports3, module22) {
        "use strict";
        var fs2 = require_graceful_fs();
        var path2 = require("path");
        var copy = require_copy2().copy;
        var remove = require_remove().remove;
        var mkdirp = require_mkdirs().mkdirp;
        var pathExists = require_path_exists().pathExists;
        var stat = require_stat();
        function move(src, dest, opts, cb) {
          if (typeof opts === "function") {
            cb = opts;
            opts = {};
          }
          opts = opts || {};
          const overwrite = opts.overwrite || opts.clobber || false;
          stat.checkPaths(src, dest, "move", opts, (err, stats) => {
            if (err)
              return cb(err);
            const { srcStat, isChangingCase = false } = stats;
            stat.checkParentPaths(src, srcStat, dest, "move", (err2) => {
              if (err2)
                return cb(err2);
              if (isParentRoot(dest))
                return doRename(src, dest, overwrite, isChangingCase, cb);
              mkdirp(path2.dirname(dest), (err3) => {
                if (err3)
                  return cb(err3);
                return doRename(src, dest, overwrite, isChangingCase, cb);
              });
            });
          });
        }
        function isParentRoot(dest) {
          const parent = path2.dirname(dest);
          const parsedPath = path2.parse(parent);
          return parsedPath.root === parent;
        }
        function doRename(src, dest, overwrite, isChangingCase, cb) {
          if (isChangingCase)
            return rename(src, dest, overwrite, cb);
          if (overwrite) {
            return remove(dest, (err) => {
              if (err)
                return cb(err);
              return rename(src, dest, overwrite, cb);
            });
          }
          pathExists(dest, (err, destExists) => {
            if (err)
              return cb(err);
            if (destExists)
              return cb(new Error("dest already exists."));
            return rename(src, dest, overwrite, cb);
          });
        }
        function rename(src, dest, overwrite, cb) {
          fs2.rename(src, dest, (err) => {
            if (!err)
              return cb();
            if (err.code !== "EXDEV")
              return cb(err);
            return moveAcrossDevice(src, dest, overwrite, cb);
          });
        }
        function moveAcrossDevice(src, dest, overwrite, cb) {
          const opts = {
            overwrite,
            errorOnExist: true,
            preserveTimestamps: true
          };
          copy(src, dest, opts, (err) => {
            if (err)
              return cb(err);
            return remove(src, cb);
          });
        }
        module22.exports = move;
      }
    });
    var require_move_sync = __commonJS2({
      "../../node_modules/fs-extra/lib/move/move-sync.js"(exports3, module22) {
        "use strict";
        var fs2 = require_graceful_fs();
        var path2 = require("path");
        var copySync = require_copy2().copySync;
        var removeSync = require_remove().removeSync;
        var mkdirpSync = require_mkdirs().mkdirpSync;
        var stat = require_stat();
        function moveSync(src, dest, opts) {
          opts = opts || {};
          const overwrite = opts.overwrite || opts.clobber || false;
          const { srcStat, isChangingCase = false } = stat.checkPathsSync(src, dest, "move", opts);
          stat.checkParentPathsSync(src, srcStat, dest, "move");
          if (!isParentRoot(dest))
            mkdirpSync(path2.dirname(dest));
          return doRename(src, dest, overwrite, isChangingCase);
        }
        function isParentRoot(dest) {
          const parent = path2.dirname(dest);
          const parsedPath = path2.parse(parent);
          return parsedPath.root === parent;
        }
        function doRename(src, dest, overwrite, isChangingCase) {
          if (isChangingCase)
            return rename(src, dest, overwrite);
          if (overwrite) {
            removeSync(dest);
            return rename(src, dest, overwrite);
          }
          if (fs2.existsSync(dest))
            throw new Error("dest already exists.");
          return rename(src, dest, overwrite);
        }
        function rename(src, dest, overwrite) {
          try {
            fs2.renameSync(src, dest);
          } catch (err) {
            if (err.code !== "EXDEV")
              throw err;
            return moveAcrossDevice(src, dest, overwrite);
          }
        }
        function moveAcrossDevice(src, dest, overwrite) {
          const opts = {
            overwrite,
            errorOnExist: true,
            preserveTimestamps: true
          };
          copySync(src, dest, opts);
          return removeSync(src);
        }
        module22.exports = moveSync;
      }
    });
    var require_move2 = __commonJS2({
      "../../node_modules/fs-extra/lib/move/index.js"(exports3, module22) {
        "use strict";
        var u = require_universalify().fromCallback;
        module22.exports = {
          move: u(require_move()),
          moveSync: require_move_sync()
        };
      }
    });
    var require_lib = __commonJS2({
      "../../node_modules/fs-extra/lib/index.js"(exports3, module22) {
        "use strict";
        module22.exports = {
          // Export promiseified graceful-fs:
          ...require_fs(),
          // Export extra methods:
          ...require_copy2(),
          ...require_empty(),
          ...require_ensure(),
          ...require_json(),
          ...require_mkdirs(),
          ...require_move2(),
          ...require_output_file(),
          ...require_path_exists(),
          ...require_remove()
        };
      }
    });
    var require_arcsecond = __commonJS2({
      "../../node_modules/arcsecond/index.js"(exports3) {
        "use strict";
        Object.defineProperty(exports3, "__esModule", { value: true });
        var text;
        if (typeof TextEncoder !== "undefined") {
          text = { Encoder: TextEncoder, Decoder: TextDecoder };
        } else {
          try {
            const util2 = require("util");
            text = { Encoder: util2.TextEncoder, Decoder: util2.TextDecoder };
          } catch (ex) {
            throw new Error("Arcsecond requires TextEncoder and TextDecoder to be polyfilled.");
          }
        }
        var encoder = new text.Encoder();
        var decoder = new text.Decoder();
        var getString = (index, length, dataView) => {
          const bytes = Uint8Array.from({ length }, (_, i) => dataView.getUint8(index + i));
          const decodedString = decoder.decode(bytes);
          return decodedString;
        };
        var getNextCharWidth = (index, dataView) => {
          const byte = dataView.getUint8(index);
          if ((byte & 128) >> 7 === 0)
            return 1;
          else if ((byte & 224) >> 5 === 6)
            return 2;
          else if ((byte & 240) >> 4 === 14)
            return 3;
          else if ((byte & 240) >> 4 === 15)
            return 4;
          return 1;
        };
        var getUtf8Char = (index, length, dataView) => {
          const bytes = Uint8Array.from({ length }, (_, i) => dataView.getUint8(index + i));
          return decoder.decode(bytes);
        };
        var getCharacterLength = (str4) => {
          let cp;
          let total = 0;
          let i = 0;
          while (i < str4.length) {
            cp = str4.codePointAt(i);
            while (cp) {
              cp = cp >> 8;
              i++;
            }
            total++;
          }
          return total;
        };
        var isTypedArray = (x) => x instanceof Uint8Array || x instanceof Uint8ClampedArray || x instanceof Int8Array || x instanceof Uint16Array || x instanceof Int16Array || x instanceof Uint32Array || x instanceof Int32Array || x instanceof Float32Array || x instanceof Float64Array;
        exports3.InputTypes = void 0;
        (function(InputTypes) {
          InputTypes["STRING"] = "string";
          InputTypes["ARRAY_BUFFER"] = "arrayBuffer";
          InputTypes["TYPED_ARRAY"] = "typedArray";
          InputTypes["DATA_VIEW"] = "dataView";
        })(exports3.InputTypes || (exports3.InputTypes = {}));
        var createParserState = (target, data = null) => {
          let dataView;
          let inputType;
          if (typeof target === "string") {
            const bytes = encoder.encode(target);
            dataView = new DataView(bytes.buffer);
            inputType = exports3.InputTypes.STRING;
          } else if (target instanceof ArrayBuffer) {
            dataView = new DataView(target);
            inputType = exports3.InputTypes.ARRAY_BUFFER;
          } else if (isTypedArray(target)) {
            dataView = new DataView(target.buffer);
            inputType = exports3.InputTypes.TYPED_ARRAY;
          } else if (target instanceof DataView) {
            dataView = target;
            inputType = exports3.InputTypes.DATA_VIEW;
          } else {
            throw new Error(`Cannot process input. Must be a string, ArrayBuffer, TypedArray, or DataView. but got ${typeof target}`);
          }
          return {
            dataView,
            inputType,
            isError: false,
            error: null,
            result: null,
            data,
            index: 0
          };
        };
        var updateError = (state, error) => Object.assign(Object.assign({}, state), { isError: true, error });
        var updateResult = (state, result) => Object.assign(Object.assign({}, state), { result });
        var updateData = (state, data) => Object.assign(Object.assign({}, state), { data });
        var updateParserState = (state, result, index) => Object.assign(Object.assign({}, state), {
          result,
          index
        });
        var Parser = class {
          constructor(p) {
            this.p = p;
          }
          // run :: Parser e a s ~> x -> Either e a
          run(target) {
            const state = createParserState(target);
            const resultState = this.p(state);
            if (resultState.isError) {
              return {
                isError: true,
                error: resultState.error,
                index: resultState.index,
                data: resultState.data
              };
            }
            return {
              isError: false,
              result: resultState.result,
              index: resultState.index,
              data: resultState.data
            };
          }
          // fork :: Parser e a s ~> x -> (e -> ParserState e a s -> f) -> (a -> ParserState e a s -> b)
          fork(target, errorFn, successFn) {
            const state = createParserState(target);
            const newState = this.p(state);
            if (newState.isError) {
              return errorFn(newState.error, newState);
            }
            return successFn(newState.result, newState);
          }
          // map :: Parser e a s ~> (a -> b) -> Parser e b s
          map(fn) {
            const p = this.p;
            return new Parser(function Parser$map$state(state) {
              const newState = p(state);
              if (newState.isError)
                return newState;
              return updateResult(newState, fn(newState.result));
            });
          }
          // chain :: Parser e a s ~> (a -> Parser e b s) -> Parser e b s
          chain(fn) {
            const p = this.p;
            return new Parser(function Parser$chain$state(state) {
              const newState = p(state);
              if (newState.isError)
                return newState;
              return fn(newState.result).p(newState);
            });
          }
          // ap :: Parser e a s ~> Parser e (a -> b) s -> Parser e b s
          ap(parserOfFunction) {
            const p = this.p;
            return new Parser(function Parser$ap$state(state) {
              if (state.isError)
                return state;
              const argumentState = p(state);
              if (argumentState.isError)
                return argumentState;
              const fnState = parserOfFunction.p(argumentState);
              if (fnState.isError)
                return fnState;
              return updateResult(fnState, fnState.result(argumentState.result));
            });
          }
          // errorMap :: Parser e a s ~> (e -> f) -> Parser f a s
          errorMap(fn) {
            const p = this.p;
            return new Parser(function Parser$errorMap$state(state) {
              const nextState = p(state);
              if (!nextState.isError)
                return nextState;
              return updateError(nextState, fn({
                isError: true,
                error: nextState.error,
                index: nextState.index,
                data: nextState.data
              }));
            });
          }
          // errorChain :: Parser e a s ~> ((e, Integer, s) -> Parser f a s) -> Parser f a s
          errorChain(fn) {
            const p = this.p;
            return new Parser(function Parser$errorChain$state(state) {
              const nextState = p(state);
              if (nextState.isError) {
                const { error, index, data } = nextState;
                const nextParser = fn({ isError: true, error, index, data });
                return nextParser.p(Object.assign(Object.assign({}, nextState), { isError: false }));
              }
              return nextState;
            });
          }
          // mapFromData :: Parser e a s ~> (StateData a s -> b) -> Parser e b s
          mapFromData(fn) {
            const p = this.p;
            return new Parser((state) => {
              const newState = p(state);
              if (newState.isError && newState.error)
                return newState;
              return updateResult(newState, fn({
                isError: false,
                result: newState.result,
                data: newState.data,
                index: newState.index
              }));
            });
          }
          // chainFromData :: Parser e a s ~> (StateData a s -> Parser f b t) -> Parser f b t
          chainFromData(fn) {
            const p = this.p;
            return new Parser(function Parser$chainFromData$state(state) {
              const newState = p(state);
              if (newState.isError && newState.error)
                return newState;
              return fn({ result: newState.result, data: newState.data }).p(newState);
            });
          }
          // mapData :: Parser e a s ~> (s -> t) -> Parser e a t
          mapData(fn) {
            const p = this.p;
            return new Parser(function mapData$state(state) {
              const newState = p(state);
              return updateData(newState, fn(newState.data));
            });
          }
          // of :: a -> Parser e a s
          static of(x) {
            return new Parser((state) => updateResult(state, x));
          }
        };
        var reDigit = /[0-9]/;
        var reDigits = /^[0-9]+/;
        var reLetter = /[a-zA-Z]/;
        var reLetters = /^[a-zA-Z]+/;
        var reWhitespaces = /^\s+/;
        var reErrorExpectation = /ParseError.+Expecting/;
        var getData = new Parser(function getData$state(state) {
          if (state.isError)
            return state;
          return updateResult(state, state.data);
        });
        function setData(data) {
          return new Parser(function setData$state(state) {
            if (state.isError)
              return state;
            return updateData(state, data);
          });
        }
        function mapData(fn) {
          return new Parser(function mapData$state(state) {
            if (state.isError)
              return state;
            return updateData(state, fn(state.data));
          });
        }
        function withData(parser) {
          return function withData$stateData(stateData) {
            return setData(stateData).chain(() => parser);
          };
        }
        function pipeParsers(parsers) {
          return new Parser(function pipeParsers$state(state) {
            let nextState = state;
            for (const parser of parsers) {
              nextState = parser.p(nextState);
            }
            return nextState;
          });
        }
        function composeParsers(parsers) {
          return new Parser(function composeParsers$state(state) {
            return pipeParsers([...parsers].reverse()).p(state);
          });
        }
        function tapParser(fn) {
          return new Parser(function tapParser$state(state) {
            fn(state);
            return state;
          });
        }
        function parse(parser) {
          return function parse$targetString(target) {
            return parser.run(target);
          };
        }
        function decide(fn) {
          return new Parser(function decide$state(state) {
            if (state.isError)
              return state;
            const parser = fn(state.result);
            return parser.p(state);
          });
        }
        function fail(errorMessage) {
          return new Parser(function fail$state(state) {
            if (state.isError)
              return state;
            return updateError(state, errorMessage);
          });
        }
        var succeedWith = Parser.of;
        function either(parser) {
          return new Parser(function either$state(state) {
            if (state.isError)
              return state;
            const nextState = parser.p(state);
            return updateResult(Object.assign(Object.assign({}, nextState), { isError: false }), {
              isError: nextState.isError,
              value: nextState.isError ? nextState.error : nextState.result
            });
          });
        }
        function coroutine(parserFn) {
          return new Parser(function coroutine$state(state) {
            let currentValue;
            let currentState = state;
            const run = (parser) => {
              if (!(parser && parser instanceof Parser)) {
                throw new Error(`[coroutine] passed values must be Parsers, got ${parser}.`);
              }
              const newState = parser.p(currentState);
              if (newState.isError) {
                throw newState;
              } else {
                currentState = newState;
              }
              currentValue = currentState.result;
              return currentValue;
            };
            try {
              const result = parserFn(run);
              return updateResult(currentState, result);
            } catch (e) {
              if (e instanceof Error) {
                throw e;
              } else {
                return e;
              }
            }
          });
        }
        function exactly(n) {
          if (typeof n !== "number" || n <= 0) {
            throw new TypeError(`exactly must be called with a number > 0, but got ${n}`);
          }
          return function exactly$factory(parser) {
            return new Parser(function exactly$factory$state(state) {
              if (state.isError)
                return state;
              const results = [];
              let nextState = state;
              for (let i = 0; i < n; i++) {
                const out = parser.p(nextState);
                if (out.isError) {
                  return out;
                } else {
                  nextState = out;
                  results.push(nextState.result);
                }
              }
              return updateResult(nextState, results);
            }).errorMap(({ index, error }) => `ParseError (position ${index}): Expecting ${n}${error.replace(reErrorExpectation, "")}`);
          };
        }
        var many4 = function many5(parser) {
          return new Parser(function many$state(state) {
            if (state.isError)
              return state;
            const results = [];
            let nextState = state;
            while (true) {
              const out = parser.p(nextState);
              if (out.isError) {
                break;
              } else {
                nextState = out;
                results.push(nextState.result);
                if (nextState.index >= nextState.dataView.byteLength) {
                  break;
                }
              }
            }
            return updateResult(nextState, results);
          });
        };
        var many1 = function many12(parser) {
          return new Parser(function many1$state(state) {
            if (state.isError)
              return state;
            const resState = many4(parser).p(state);
            if (resState.result.length)
              return resState;
            return updateError(state, `ParseError 'many1' (position ${state.index}): Expecting to match at least one value`);
          });
        };
        function mapTo(fn) {
          return new Parser(function mapTo$state(state) {
            if (state.isError)
              return state;
            return updateResult(state, fn(state.result));
          });
        }
        function errorMapTo(fn) {
          return new Parser(function errorMapTo$state(state) {
            if (!state.isError)
              return state;
            return updateError(state, fn(state.error, state.index, state.data));
          });
        }
        var char4 = function char5(c) {
          if (!c || getCharacterLength(c) !== 1) {
            throw new TypeError(`char must be called with a single character, but got ${c}`);
          }
          return new Parser(function char$state(state) {
            if (state.isError)
              return state;
            const { index, dataView } = state;
            if (index < dataView.byteLength) {
              const charWidth = getNextCharWidth(index, dataView);
              if (index + charWidth <= dataView.byteLength) {
                const char6 = getUtf8Char(index, charWidth, dataView);
                return char6 === c ? updateParserState(state, c, index + charWidth) : updateError(state, `ParseError (position ${index}): Expecting character '${c}', got '${char6}'`);
              }
            }
            return updateError(state, `ParseError (position ${index}): Expecting character '${c}', but got end of input.`);
          });
        };
        var anyChar2 = new Parser(function anyChar$state(state) {
          if (state.isError)
            return state;
          const { index, dataView } = state;
          if (index < dataView.byteLength) {
            const charWidth = getNextCharWidth(index, dataView);
            if (index + charWidth <= dataView.byteLength) {
              const char5 = getUtf8Char(index, charWidth, dataView);
              return updateParserState(state, char5, index + charWidth);
            }
          }
          return updateError(state, `ParseError (position ${index}): Expecting a character, but got end of input.`);
        });
        var peek = new Parser(function peek$state(state) {
          if (state.isError)
            return state;
          const { index, dataView } = state;
          if (index < dataView.byteLength) {
            return updateParserState(state, dataView.getUint8(index), index);
          }
          return updateError(state, `ParseError (position ${index}): Unexpected end of input.`);
        });
        function str3(s) {
          if (!s || getCharacterLength(s) < 1) {
            throw new TypeError(`str must be called with a string with length > 1, but got ${s}`);
          }
          const encodedStr = encoder.encode(s);
          return new Parser(function str$state(state) {
            const { index, dataView } = state;
            const remainingBytes = dataView.byteLength - index;
            if (remainingBytes < encodedStr.byteLength) {
              return updateError(state, `ParseError (position ${index}): Expecting string '${s}', but got end of input.`);
            }
            const stringAtIndex = getString(index, encodedStr.byteLength, dataView);
            return s === stringAtIndex ? updateParserState(state, s, index + encoder.encode(s).byteLength) : updateError(state, `ParseError (position ${index}): Expecting string '${s}', got '${stringAtIndex}...'`);
          });
        }
        function regex(re) {
          const typeofre = Object.prototype.toString.call(re);
          if (typeofre !== "[object RegExp]") {
            throw new TypeError(`regex must be called with a Regular Expression, but got ${typeofre}`);
          }
          if (re.toString()[1] !== "^") {
            throw new Error(`regex parsers must contain '^' start assertion.`);
          }
          return new Parser(function regex$state(state) {
            if (state.isError)
              return state;
            const { dataView, index } = state;
            const rest = getString(index, dataView.byteLength - index, dataView);
            if (rest.length >= 1) {
              const match = rest.match(re);
              return match ? updateParserState(state, match[0], index + encoder.encode(match[0]).byteLength) : updateError(state, `ParseError (position ${index}): Expecting string matching '${re}', got '${rest.slice(0, 5)}...'`);
            }
            return updateError(state, `ParseError (position ${index}): Expecting string matching '${re}', but got end of input.`);
          });
        }
        var digit2 = new Parser(function digit$state(state) {
          if (state.isError)
            return state;
          const { dataView, index } = state;
          if (dataView.byteLength > index) {
            const charWidth = getNextCharWidth(index, dataView);
            if (index + charWidth <= dataView.byteLength) {
              const char5 = getUtf8Char(index, charWidth, dataView);
              return dataView.byteLength && char5 && reDigit.test(char5) ? updateParserState(state, char5, index + charWidth) : updateError(state, `ParseError (position ${index}): Expecting digit, got '${char5}'`);
            }
          }
          return updateError(state, `ParseError (position ${index}): Expecting digit, but got end of input.`);
        });
        var digits = regex(reDigits).errorMap(({ index }) => `ParseError (position ${index}): Expecting digits`);
        var letter2 = new Parser(function letter$state(state) {
          if (state.isError)
            return state;
          const { index, dataView } = state;
          if (dataView.byteLength > index) {
            const charWidth = getNextCharWidth(index, dataView);
            if (index + charWidth <= dataView.byteLength) {
              const char5 = getUtf8Char(index, charWidth, dataView);
              return dataView.byteLength && char5 && reLetter.test(char5) ? updateParserState(state, char5, index + charWidth) : updateError(state, `ParseError (position ${index}): Expecting letter, got '${char5}'`);
            }
          }
          return updateError(state, `ParseError (position ${index}): Expecting letter, but got end of input.`);
        });
        var letters = regex(reLetters).errorMap(({ index }) => `ParseError (position ${index}): Expecting letters`);
        function anyOfString(s) {
          return new Parser(function anyOfString$state(state) {
            if (state.isError)
              return state;
            const { dataView, index } = state;
            if (dataView.byteLength > index) {
              const charWidth = getNextCharWidth(index, dataView);
              if (index + charWidth <= dataView.byteLength) {
                const char5 = getUtf8Char(index, charWidth, dataView);
                return s.includes(char5) ? updateParserState(state, char5, index + charWidth) : updateError(state, `ParseError (position ${index}): Expecting any of the string "${s}", got ${char5}`);
              }
            }
            return updateError(state, `ParseError (position ${index}): Expecting any of the string "${s}", but got end of input.`);
          });
        }
        function namedSequenceOf2(pairedParsers) {
          return new Parser(function namedSequenceOf$state(state) {
            if (state.isError)
              return state;
            const results = {};
            let nextState = state;
            for (const [key, parser] of pairedParsers) {
              const out = parser.p(nextState);
              if (out.isError) {
                return out;
              } else {
                nextState = out;
                results[key] = out.result;
              }
            }
            return updateResult(nextState, results);
          });
        }
        function sequenceOf4(parsers) {
          return new Parser(function sequenceOf$state(state) {
            if (state.isError)
              return state;
            const length = parsers.length;
            const results = new Array(length);
            let nextState = state;
            for (let i = 0; i < length; i++) {
              const out = parsers[i].p(nextState);
              if (out.isError) {
                return out;
              } else {
                nextState = out;
                results[i] = out.result;
              }
            }
            return updateResult(nextState, results);
          });
        }
        function sepBy(sepParser) {
          return function sepBy$valParser(valueParser) {
            return new Parser(function sepBy$valParser$state(state) {
              if (state.isError)
                return state;
              let nextState = state;
              let error = null;
              const results = [];
              while (true) {
                const valState = valueParser.p(nextState);
                const sepState = sepParser.p(valState);
                if (valState.isError) {
                  error = valState;
                  break;
                } else {
                  results.push(valState.result);
                }
                if (sepState.isError) {
                  nextState = valState;
                  break;
                }
                nextState = sepState;
              }
              if (error) {
                if (results.length === 0) {
                  return updateResult(state, results);
                }
                return error;
              }
              return updateResult(nextState, results);
            });
          };
        }
        var sepBy1 = function sepBy12(sepParser) {
          return function sepBy1$valParser(valueParser) {
            return new Parser(function sepBy1$valParser$state(state) {
              if (state.isError)
                return state;
              const out = sepBy(sepParser)(valueParser).p(state);
              if (out.isError)
                return out;
              if (out.result.length === 0) {
                return updateError(state, `ParseError 'sepBy1' (position ${state.index}): Expecting to match at least one separated value`);
              }
              return out;
            });
          };
        };
        function choice2(parsers) {
          if (parsers.length === 0)
            throw new Error(`List of parsers can't be empty.`);
          return new Parser(function choice$state(state) {
            if (state.isError)
              return state;
            let error = null;
            for (const parser of parsers) {
              const out = parser.p(state);
              if (!out.isError)
                return out;
              if (error === null || error && out.index > error.index) {
                error = out;
              }
            }
            return error;
          });
        }
        function between(leftParser) {
          return function between$rightParser(rightParser) {
            return function between$parser(parser) {
              return sequenceOf4([leftParser, parser, rightParser]).map(([_, x]) => x);
            };
          };
        }
        function everythingUntil(parser) {
          return new Parser((state) => {
            if (state.isError)
              return state;
            const results = [];
            let nextState = state;
            while (true) {
              const out = parser.p(nextState);
              if (out.isError) {
                const { index, dataView } = nextState;
                if (dataView.byteLength <= index) {
                  return updateError(nextState, `ParseError 'everythingUntil' (position ${nextState.index}): Unexpected end of input.`);
                }
                const val = dataView.getUint8(index);
                if (val) {
                  results.push(val);
                  nextState = updateParserState(nextState, val, index + 1);
                }
              } else {
                break;
              }
            }
            return updateResult(nextState, results);
          });
        }
        var everyCharUntil = (parser) => everythingUntil(parser).map((results) => decoder.decode(Uint8Array.from(results)));
        var anythingExcept = function anythingExcept2(parser) {
          return new Parser(function anythingExcept$state(state) {
            if (state.isError)
              return state;
            const { dataView, index } = state;
            const out = parser.p(state);
            if (out.isError) {
              return updateParserState(state, dataView.getUint8(index), index + 1);
            }
            return updateError(state, `ParseError 'anythingExcept' (position ${index}): Matched '${out.result}' from the exception parser`);
          });
        };
        var anyCharExcept3 = function anyCharExcept4(parser) {
          return new Parser(function anyCharExcept$state(state) {
            if (state.isError)
              return state;
            const { dataView, index } = state;
            const out = parser.p(state);
            if (out.isError) {
              if (index < dataView.byteLength) {
                const charWidth = getNextCharWidth(index, dataView);
                if (index + charWidth <= dataView.byteLength) {
                  const char5 = getUtf8Char(index, charWidth, dataView);
                  return updateParserState(state, char5, index + charWidth);
                }
              }
              return updateError(state, `ParseError 'anyCharExcept' (position ${index}): Unexpected end of input`);
            }
            return updateError(state, `ParseError 'anyCharExcept' (position ${index}): Matched '${out.result}' from the exception parser`);
          });
        };
        function lookAhead(parser) {
          return new Parser(function lookAhead$state(state) {
            if (state.isError)
              return state;
            const nextState = parser.p(state);
            return nextState.isError ? updateError(state, nextState.error) : updateResult(state, nextState.result);
          });
        }
        function possibly(parser) {
          return new Parser(function possibly$state(state) {
            if (state.isError)
              return state;
            const nextState = parser.p(state);
            return nextState.isError ? updateResult(state, null) : nextState;
          });
        }
        function skip2(parser) {
          return new Parser(function skip$state(state) {
            if (state.isError)
              return state;
            const nextState = parser.p(state);
            if (nextState.isError)
              return nextState;
            return updateResult(nextState, state.result);
          });
        }
        var startOfInput = new Parser(function startOfInput$state(state) {
          if (state.isError)
            return state;
          const { index } = state;
          if (index > 0) {
            return updateError(state, `ParseError 'startOfInput' (position ${index}): Expected start of input'`);
          }
          return state;
        });
        var endOfInput = new Parser(function endOfInput$state(state) {
          if (state.isError)
            return state;
          const { dataView, index, inputType } = state;
          if (index !== dataView.byteLength) {
            const errorByte = inputType === exports3.InputTypes.STRING ? String.fromCharCode(dataView.getUint8(index)) : `0x${dataView.getUint8(index).toString(16).padStart(2, "0")}`;
            return updateError(state, `ParseError 'endOfInput' (position ${index}): Expected end of input but got '${errorByte}'`);
          }
          return updateResult(state, null);
        });
        var whitespace2 = regex(reWhitespaces).errorMap(({ index }) => `ParseError 'many1' (position ${index}): Expecting to match at least one value`);
        var optionalWhitespace = possibly(whitespace2).map((x) => x || "");
        function recursiveParser(parserThunk) {
          return new Parser(function recursiveParser$state(state) {
            return parserThunk().p(state);
          });
        }
        function takeRight(leftParser) {
          return function takeRight$rightParser(rightParser) {
            return leftParser.chain(() => rightParser);
          };
        }
        var takeLeft = function takeLeft2(leftParser) {
          return function takeLeft$rightParser(rightParser) {
            return leftParser.chain((x) => rightParser.map(() => x));
          };
        };
        function toPromise(result) {
          return result.isError === true ? Promise.reject({
            error: result.error,
            index: result.index,
            data: result.data
          }) : Promise.resolve(result.result);
        }
        function toValue(result) {
          if (result.isError === true) {
            const e = new Error(String(result.error) || "null");
            e.parseIndex = result.index;
            e.data = result.data;
            throw e;
          }
          return result.result;
        }
        exports3.Parser = Parser;
        exports3.anyChar = anyChar2;
        exports3.anyCharExcept = anyCharExcept3;
        exports3.anyOfString = anyOfString;
        exports3.anythingExcept = anythingExcept;
        exports3.between = between;
        exports3.char = char4;
        exports3.choice = choice2;
        exports3.composeParsers = composeParsers;
        exports3.coroutine = coroutine;
        exports3.decide = decide;
        exports3.decoder = decoder;
        exports3.digit = digit2;
        exports3.digits = digits;
        exports3.either = either;
        exports3.encoder = encoder;
        exports3.endOfInput = endOfInput;
        exports3.errorMapTo = errorMapTo;
        exports3.everyCharUntil = everyCharUntil;
        exports3.everythingUntil = everythingUntil;
        exports3.exactly = exactly;
        exports3.fail = fail;
        exports3.getCharacterLength = getCharacterLength;
        exports3.getData = getData;
        exports3.getNextCharWidth = getNextCharWidth;
        exports3.getString = getString;
        exports3.getUtf8Char = getUtf8Char;
        exports3.letter = letter2;
        exports3.letters = letters;
        exports3.lookAhead = lookAhead;
        exports3.many = many4;
        exports3.many1 = many1;
        exports3.mapData = mapData;
        exports3.mapTo = mapTo;
        exports3.namedSequenceOf = namedSequenceOf2;
        exports3.optionalWhitespace = optionalWhitespace;
        exports3.parse = parse;
        exports3.peek = peek;
        exports3.pipeParsers = pipeParsers;
        exports3.possibly = possibly;
        exports3.recursiveParser = recursiveParser;
        exports3.regex = regex;
        exports3.sepBy = sepBy;
        exports3.sepBy1 = sepBy1;
        exports3.sequenceOf = sequenceOf4;
        exports3.setData = setData;
        exports3.skip = skip2;
        exports3.startOfInput = startOfInput;
        exports3.str = str3;
        exports3.succeedWith = succeedWith;
        exports3.takeLeft = takeLeft;
        exports3.takeRight = takeRight;
        exports3.tapParser = tapParser;
        exports3.toPromise = toPromise;
        exports3.toValue = toValue;
        exports3.updateData = updateData;
        exports3.updateError = updateError;
        exports3.updateParserState = updateParserState;
        exports3.updateResult = updateResult;
        exports3.whitespace = whitespace2;
        exports3.withData = withData;
      }
    });
    var require_dayjs_min = __commonJS2({
      "../../node_modules/dayjs/dayjs.min.js"(exports3, module22) {
        !function(t, e) {
          "object" == typeof exports3 && "undefined" != typeof module22 ? module22.exports = e() : "function" == typeof define && define.amd ? define(e) : (t = "undefined" != typeof globalThis ? globalThis : t || self).dayjs = e();
        }(exports3, function() {
          "use strict";
          var t = 1e3, e = 6e4, n = 36e5, r = "millisecond", i = "second", s = "minute", u = "hour", a = "day", o = "week", f = "month", h = "quarter", c = "year", d = "date", l = "Invalid Date", $ = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(t2) {
            var e2 = ["th", "st", "nd", "rd"], n2 = t2 % 100;
            return "[" + t2 + (e2[(n2 - 20) % 10] || e2[n2] || e2[0]) + "]";
          } }, m = function(t2, e2, n2) {
            var r2 = String(t2);
            return !r2 || r2.length >= e2 ? t2 : "" + Array(e2 + 1 - r2.length).join(n2) + t2;
          }, v = { s: m, z: function(t2) {
            var e2 = -t2.utcOffset(), n2 = Math.abs(e2), r2 = Math.floor(n2 / 60), i2 = n2 % 60;
            return (e2 <= 0 ? "+" : "-") + m(r2, 2, "0") + ":" + m(i2, 2, "0");
          }, m: function t2(e2, n2) {
            if (e2.date() < n2.date())
              return -t2(n2, e2);
            var r2 = 12 * (n2.year() - e2.year()) + (n2.month() - e2.month()), i2 = e2.clone().add(r2, f), s2 = n2 - i2 < 0, u2 = e2.clone().add(r2 + (s2 ? -1 : 1), f);
            return +(-(r2 + (n2 - i2) / (s2 ? i2 - u2 : u2 - i2)) || 0);
          }, a: function(t2) {
            return t2 < 0 ? Math.ceil(t2) || 0 : Math.floor(t2);
          }, p: function(t2) {
            return { M: f, y: c, w: o, d: a, D: d, h: u, m: s, s: i, ms: r, Q: h }[t2] || String(t2 || "").toLowerCase().replace(/s$/, "");
          }, u: function(t2) {
            return void 0 === t2;
          } }, g = "en", D = {};
          D[g] = M;
          var p = function(t2) {
            return t2 instanceof _;
          }, S = function t2(e2, n2, r2) {
            var i2;
            if (!e2)
              return g;
            if ("string" == typeof e2) {
              var s2 = e2.toLowerCase();
              D[s2] && (i2 = s2), n2 && (D[s2] = n2, i2 = s2);
              var u2 = e2.split("-");
              if (!i2 && u2.length > 1)
                return t2(u2[0]);
            } else {
              var a2 = e2.name;
              D[a2] = e2, i2 = a2;
            }
            return !r2 && i2 && (g = i2), i2 || !r2 && g;
          }, w = function(t2, e2) {
            if (p(t2))
              return t2.clone();
            var n2 = "object" == typeof e2 ? e2 : {};
            return n2.date = t2, n2.args = arguments, new _(n2);
          }, O = v;
          O.l = S, O.i = p, O.w = function(t2, e2) {
            return w(t2, { locale: e2.$L, utc: e2.$u, x: e2.$x, $offset: e2.$offset });
          };
          var _ = function() {
            function M2(t2) {
              this.$L = S(t2.locale, null, true), this.parse(t2);
            }
            var m2 = M2.prototype;
            return m2.parse = function(t2) {
              this.$d = function(t3) {
                var e2 = t3.date, n2 = t3.utc;
                if (null === e2)
                  return /* @__PURE__ */ new Date(NaN);
                if (O.u(e2))
                  return /* @__PURE__ */ new Date();
                if (e2 instanceof Date)
                  return new Date(e2);
                if ("string" == typeof e2 && !/Z$/i.test(e2)) {
                  var r2 = e2.match($);
                  if (r2) {
                    var i2 = r2[2] - 1 || 0, s2 = (r2[7] || "0").substring(0, 3);
                    return n2 ? new Date(Date.UTC(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2)) : new Date(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2);
                  }
                }
                return new Date(e2);
              }(t2), this.$x = t2.x || {}, this.init();
            }, m2.init = function() {
              var t2 = this.$d;
              this.$y = t2.getFullYear(), this.$M = t2.getMonth(), this.$D = t2.getDate(), this.$W = t2.getDay(), this.$H = t2.getHours(), this.$m = t2.getMinutes(), this.$s = t2.getSeconds(), this.$ms = t2.getMilliseconds();
            }, m2.$utils = function() {
              return O;
            }, m2.isValid = function() {
              return !(this.$d.toString() === l);
            }, m2.isSame = function(t2, e2) {
              var n2 = w(t2);
              return this.startOf(e2) <= n2 && n2 <= this.endOf(e2);
            }, m2.isAfter = function(t2, e2) {
              return w(t2) < this.startOf(e2);
            }, m2.isBefore = function(t2, e2) {
              return this.endOf(e2) < w(t2);
            }, m2.$g = function(t2, e2, n2) {
              return O.u(t2) ? this[e2] : this.set(n2, t2);
            }, m2.unix = function() {
              return Math.floor(this.valueOf() / 1e3);
            }, m2.valueOf = function() {
              return this.$d.getTime();
            }, m2.startOf = function(t2, e2) {
              var n2 = this, r2 = !!O.u(e2) || e2, h2 = O.p(t2), l2 = function(t3, e3) {
                var i2 = O.w(n2.$u ? Date.UTC(n2.$y, e3, t3) : new Date(n2.$y, e3, t3), n2);
                return r2 ? i2 : i2.endOf(a);
              }, $2 = function(t3, e3) {
                return O.w(n2.toDate()[t3].apply(n2.toDate("s"), (r2 ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e3)), n2);
              }, y2 = this.$W, M3 = this.$M, m3 = this.$D, v2 = "set" + (this.$u ? "UTC" : "");
              switch (h2) {
                case c:
                  return r2 ? l2(1, 0) : l2(31, 11);
                case f:
                  return r2 ? l2(1, M3) : l2(0, M3 + 1);
                case o:
                  var g2 = this.$locale().weekStart || 0, D2 = (y2 < g2 ? y2 + 7 : y2) - g2;
                  return l2(r2 ? m3 - D2 : m3 + (6 - D2), M3);
                case a:
                case d:
                  return $2(v2 + "Hours", 0);
                case u:
                  return $2(v2 + "Minutes", 1);
                case s:
                  return $2(v2 + "Seconds", 2);
                case i:
                  return $2(v2 + "Milliseconds", 3);
                default:
                  return this.clone();
              }
            }, m2.endOf = function(t2) {
              return this.startOf(t2, false);
            }, m2.$set = function(t2, e2) {
              var n2, o2 = O.p(t2), h2 = "set" + (this.$u ? "UTC" : ""), l2 = (n2 = {}, n2[a] = h2 + "Date", n2[d] = h2 + "Date", n2[f] = h2 + "Month", n2[c] = h2 + "FullYear", n2[u] = h2 + "Hours", n2[s] = h2 + "Minutes", n2[i] = h2 + "Seconds", n2[r] = h2 + "Milliseconds", n2)[o2], $2 = o2 === a ? this.$D + (e2 - this.$W) : e2;
              if (o2 === f || o2 === c) {
                var y2 = this.clone().set(d, 1);
                y2.$d[l2]($2), y2.init(), this.$d = y2.set(d, Math.min(this.$D, y2.daysInMonth())).$d;
              } else
                l2 && this.$d[l2]($2);
              return this.init(), this;
            }, m2.set = function(t2, e2) {
              return this.clone().$set(t2, e2);
            }, m2.get = function(t2) {
              return this[O.p(t2)]();
            }, m2.add = function(r2, h2) {
              var d2, l2 = this;
              r2 = Number(r2);
              var $2 = O.p(h2), y2 = function(t2) {
                var e2 = w(l2);
                return O.w(e2.date(e2.date() + Math.round(t2 * r2)), l2);
              };
              if ($2 === f)
                return this.set(f, this.$M + r2);
              if ($2 === c)
                return this.set(c, this.$y + r2);
              if ($2 === a)
                return y2(1);
              if ($2 === o)
                return y2(7);
              var M3 = (d2 = {}, d2[s] = e, d2[u] = n, d2[i] = t, d2)[$2] || 1, m3 = this.$d.getTime() + r2 * M3;
              return O.w(m3, this);
            }, m2.subtract = function(t2, e2) {
              return this.add(-1 * t2, e2);
            }, m2.format = function(t2) {
              var e2 = this, n2 = this.$locale();
              if (!this.isValid())
                return n2.invalidDate || l;
              var r2 = t2 || "YYYY-MM-DDTHH:mm:ssZ", i2 = O.z(this), s2 = this.$H, u2 = this.$m, a2 = this.$M, o2 = n2.weekdays, f2 = n2.months, h2 = function(t3, n3, i3, s3) {
                return t3 && (t3[n3] || t3(e2, r2)) || i3[n3].slice(0, s3);
              }, c2 = function(t3) {
                return O.s(s2 % 12 || 12, t3, "0");
              }, d2 = n2.meridiem || function(t3, e3, n3) {
                var r3 = t3 < 12 ? "AM" : "PM";
                return n3 ? r3.toLowerCase() : r3;
              }, $2 = { YY: String(this.$y).slice(-2), YYYY: this.$y, M: a2 + 1, MM: O.s(a2 + 1, 2, "0"), MMM: h2(n2.monthsShort, a2, f2, 3), MMMM: h2(f2, a2), D: this.$D, DD: O.s(this.$D, 2, "0"), d: String(this.$W), dd: h2(n2.weekdaysMin, this.$W, o2, 2), ddd: h2(n2.weekdaysShort, this.$W, o2, 3), dddd: o2[this.$W], H: String(s2), HH: O.s(s2, 2, "0"), h: c2(1), hh: c2(2), a: d2(s2, u2, true), A: d2(s2, u2, false), m: String(u2), mm: O.s(u2, 2, "0"), s: String(this.$s), ss: O.s(this.$s, 2, "0"), SSS: O.s(this.$ms, 3, "0"), Z: i2 };
              return r2.replace(y, function(t3, e3) {
                return e3 || $2[t3] || i2.replace(":", "");
              });
            }, m2.utcOffset = function() {
              return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
            }, m2.diff = function(r2, d2, l2) {
              var $2, y2 = O.p(d2), M3 = w(r2), m3 = (M3.utcOffset() - this.utcOffset()) * e, v2 = this - M3, g2 = O.m(this, M3);
              return g2 = ($2 = {}, $2[c] = g2 / 12, $2[f] = g2, $2[h] = g2 / 3, $2[o] = (v2 - m3) / 6048e5, $2[a] = (v2 - m3) / 864e5, $2[u] = v2 / n, $2[s] = v2 / e, $2[i] = v2 / t, $2)[y2] || v2, l2 ? g2 : O.a(g2);
            }, m2.daysInMonth = function() {
              return this.endOf(f).$D;
            }, m2.$locale = function() {
              return D[this.$L];
            }, m2.locale = function(t2, e2) {
              if (!t2)
                return this.$L;
              var n2 = this.clone(), r2 = S(t2, e2, true);
              return r2 && (n2.$L = r2), n2;
            }, m2.clone = function() {
              return O.w(this.$d, this);
            }, m2.toDate = function() {
              return new Date(this.valueOf());
            }, m2.toJSON = function() {
              return this.isValid() ? this.toISOString() : null;
            }, m2.toISOString = function() {
              return this.$d.toISOString();
            }, m2.toString = function() {
              return this.$d.toUTCString();
            }, M2;
          }(), T = _.prototype;
          return w.prototype = T, [["$ms", r], ["$s", i], ["$m", s], ["$H", u], ["$W", a], ["$M", f], ["$y", c], ["$D", d]].forEach(function(t2) {
            T[t2[1]] = function(e2) {
              return this.$g(e2, t2[0], t2[1]);
            };
          }), w.extend = function(t2, e2) {
            return t2.$i || (t2(e2, _, w), t2.$i = true), w;
          }, w.locale = S, w.isDayjs = p, w.unix = function(t2) {
            return w(1e3 * t2);
          }, w.en = D[g], w.Ls = D, w.p = {}, w;
        });
      }
    });
    var require_utc = __commonJS2({
      "../../node_modules/dayjs/plugin/utc.js"(exports3, module22) {
        !function(t, i) {
          "object" == typeof exports3 && "undefined" != typeof module22 ? module22.exports = i() : "function" == typeof define && define.amd ? define(i) : (t = "undefined" != typeof globalThis ? globalThis : t || self).dayjs_plugin_utc = i();
        }(exports3, function() {
          "use strict";
          var t = "minute", i = /[+-]\d\d(?::?\d\d)?/g, e = /([+-]|\d\d)/g;
          return function(s, f, n) {
            var u = f.prototype;
            n.utc = function(t2) {
              var i2 = { date: t2, utc: true, args: arguments };
              return new f(i2);
            }, u.utc = function(i2) {
              var e2 = n(this.toDate(), { locale: this.$L, utc: true });
              return i2 ? e2.add(this.utcOffset(), t) : e2;
            }, u.local = function() {
              return n(this.toDate(), { locale: this.$L, utc: false });
            };
            var o = u.parse;
            u.parse = function(t2) {
              t2.utc && (this.$u = true), this.$utils().u(t2.$offset) || (this.$offset = t2.$offset), o.call(this, t2);
            };
            var r = u.init;
            u.init = function() {
              if (this.$u) {
                var t2 = this.$d;
                this.$y = t2.getUTCFullYear(), this.$M = t2.getUTCMonth(), this.$D = t2.getUTCDate(), this.$W = t2.getUTCDay(), this.$H = t2.getUTCHours(), this.$m = t2.getUTCMinutes(), this.$s = t2.getUTCSeconds(), this.$ms = t2.getUTCMilliseconds();
              } else
                r.call(this);
            };
            var a = u.utcOffset;
            u.utcOffset = function(s2, f2) {
              var n2 = this.$utils().u;
              if (n2(s2))
                return this.$u ? 0 : n2(this.$offset) ? a.call(this) : this.$offset;
              if ("string" == typeof s2 && (s2 = function(t2) {
                void 0 === t2 && (t2 = "");
                var s3 = t2.match(i);
                if (!s3)
                  return null;
                var f3 = ("" + s3[0]).match(e) || ["-", 0, 0], n3 = f3[0], u3 = 60 * +f3[1] + +f3[2];
                return 0 === u3 ? 0 : "+" === n3 ? u3 : -u3;
              }(s2), null === s2))
                return this;
              var u2 = Math.abs(s2) <= 16 ? 60 * s2 : s2, o2 = this;
              if (f2)
                return o2.$offset = u2, o2.$u = 0 === s2, o2;
              if (0 !== s2) {
                var r2 = this.$u ? this.toDate().getTimezoneOffset() : -1 * this.utcOffset();
                (o2 = this.local().add(u2 + r2, t)).$offset = u2, o2.$x.$localOffset = r2;
              } else
                o2 = this.utc();
              return o2;
            };
            var h = u.format;
            u.format = function(t2) {
              var i2 = t2 || (this.$u ? "YYYY-MM-DDTHH:mm:ss[Z]" : "");
              return h.call(this, i2);
            }, u.valueOf = function() {
              var t2 = this.$utils().u(this.$offset) ? 0 : this.$offset + (this.$x.$localOffset || this.$d.getTimezoneOffset());
              return this.$d.valueOf() - 6e4 * t2;
            }, u.isUTC = function() {
              return !!this.$u;
            }, u.toISOString = function() {
              return this.toDate().toISOString();
            }, u.toString = function() {
              return this.toDate().toUTCString();
            };
            var l = u.toDate;
            u.toDate = function(t2) {
              return "s" === t2 && this.$offset ? n(this.format("YYYY-MM-DD HH:mm:ss:SSS")).toDate() : l.call(this);
            };
            var c = u.diff;
            u.diff = function(t2, i2, e2) {
              if (t2 && this.$u === t2.$u)
                return c.call(this, t2, i2, e2);
              var s2 = this.local(), f2 = n(t2).local();
              return c.call(s2, f2, i2, e2);
            };
          };
        });
      }
    });
    var tsc_build_exports = {};
    __export(tsc_build_exports, {
      default: () => tsc_build_default
    });
    module2.exports = __toCommonJS(tsc_build_exports);
    var import_fs_extra = __toESM(require_lib(), 1);
    var import_path = __toESM(require("path"), 1);
    function input(fileName) {
      let fp = import_path.default.join(process.cwd(), fileName);
      if (import_path.default.isAbsolute(fileName))
        fp = fileName;
      if (!import_fs_extra.default.existsSync(fp)) {
        console.log(`FILE NOT FOUND: ${fp}`);
        process.exit(1);
      }
      const file = import_fs_extra.default.readFileSync(fp);
      return file.toString();
    }
    var import_arcsecond = __toESM(require_arcsecond(), 1);
    var import_dayjs = __toESM(require_dayjs_min(), 1);
    var import_utc = __toESM(require_utc(), 1);
    import_dayjs.default.extend(import_utc.default);
    function metadataRemover_default(file, filename) {
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
      const metadataParser = (0, import_arcsecond.sequenceOf)([
        (0, import_arcsecond.many)((0, import_arcsecond.anyCharExcept)((0, import_arcsecond.char)(":"))),
        (0, import_arcsecond.char)(":"),
        (0, import_arcsecond.many)(import_arcsecond.anyChar)
      ]);
      const metadata = {
        title: "",
        image: "",
        description: "",
        date: null,
        otherMetadata: {}
      };
      metaDataSection.forEach((line) => {
        const metaParse = metadataParser.run(line);
        if (!metaParse.isError) {
          const result = metaParse.result;
          const key = result[0].join("").trim();
          const val = result[2].join("").trim();
          if (key in metadata && key != "otherMetadata") {
            if (key != "date") {
              metadata[key] = val;
            } else {
              metadata.date = import_dayjs.default.utc(val);
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
      if (metadata.title == "" || metadata.description == "" || metadata.date == null) {
        console.log(`error parsing ${filename}. Missing required fields`, metadata);
        process.exit(1);
      }
      return [normalSection.join("\n"), metadata];
    }
    var import_arcsecond2 = __toESM(require_arcsecond(), 1);
    var import_util = __toESM(require("util"), 1);
    var punctuation = [
      (0, import_arcsecond2.char)("."),
      (0, import_arcsecond2.char)(","),
      (0, import_arcsecond2.char)("?"),
      (0, import_arcsecond2.char)(":"),
      (0, import_arcsecond2.char)(";"),
      (0, import_arcsecond2.char)("!"),
      (0, import_arcsecond2.char)("/"),
      (0, import_arcsecond2.char)("'"),
      (0, import_arcsecond2.char)(`"`)
    ];
    var baseCharacters = [import_arcsecond2.letter, import_arcsecond2.digit, import_arcsecond2.whitespace];
    var symbols = [
      (0, import_arcsecond2.char)("#"),
      (0, import_arcsecond2.char)("+"),
      (0, import_arcsecond2.char)("="),
      (0, import_arcsecond2.char)("-"),
      (0, import_arcsecond2.char)("%"),
      (0, import_arcsecond2.char)("`")
    ];
    var bi = [(0, import_arcsecond2.char)("*"), (0, import_arcsecond2.char)("_")];
    var specialPunctuation = [(0, import_arcsecond2.char)("("), (0, import_arcsecond2.char)(")")];
    var stringChars = (0, import_arcsecond2.choice)([
      ...punctuation,
      ...baseCharacters,
      ...symbols,
      ...bi,
      ...specialPunctuation
    ]);
    var linkStringChars = (0, import_arcsecond2.choice)([...punctuation, ...baseCharacters, ...symbols]);
    var string = (0, import_arcsecond2.many)(stringChars);
    var linkString = (0, import_arcsecond2.many)(linkStringChars);
    var headingParser = (0, import_arcsecond2.sequenceOf)([(0, import_arcsecond2.char)("#"), (0, import_arcsecond2.many)((0, import_arcsecond2.char)("#")), (0, import_arcsecond2.skip)(string)]);
    var dividerParser = (0, import_arcsecond2.str)("---");
    var olParser = (0, import_arcsecond2.sequenceOf)([(0, import_arcsecond2.many)(import_arcsecond2.digit), (0, import_arcsecond2.char)("."), import_arcsecond2.whitespace, (0, import_arcsecond2.skip)(string)]);
    var ulParser = (0, import_arcsecond2.sequenceOf)([
      (0, import_arcsecond2.many)(import_arcsecond2.whitespace),
      (0, import_arcsecond2.char)("-"),
      (0, import_arcsecond2.many)(import_arcsecond2.whitespace),
      (0, import_arcsecond2.skip)(string)
    ]);
    var linkParser = (0, import_arcsecond2.sequenceOf)([
      (0, import_arcsecond2.char)("["),
      linkString,
      (0, import_arcsecond2.char)("]"),
      (0, import_arcsecond2.char)("("),
      linkString,
      (0, import_arcsecond2.char)(")"),
      (0, import_arcsecond2.many)(import_arcsecond2.whitespace)
    ]);
    function wrapWithRestrictedString(p) {
      return (0, import_arcsecond2.namedSequenceOf)([
        ["pre", string],
        ["content", p],
        ["post", string]
      ]);
    }
    function lastEl(arr) {
      if (arr.length > 0) {
        return arr[arr.length - 1];
      } else
        return null;
    }
    function fileparser_default(fileContents) {
      const lines = fileContents.split("\n");
      const tree = [];
      const listItems = [];
      for (let i = 0, len = lines.length; i < len; i++) {
        const thisLine = lines[i];
        const trimmed = thisLine.trim();
        if (trimmed == "")
          continue;
        const token = parseLine(trimmed);
        if (lastEl(listItems) && !lastEl(listItems).closed) {
          const latestItem = lastEl(listItems);
          if (token.type == latestItem.listItems[0].type && (token.type == "OL" || token.type == "UL")) {
            latestItem.listItems.push(token);
          } else {
            latestItem.closed = true;
            tree.push(latestItem);
            if (token.type == "OL" || token.type == "UL") {
              listItems.push({
                closed: false,
                listItems: [token],
                type: "LISTITEM"
              });
            } else {
              tree.push(token);
            }
          }
        } else if (token.type == "OL" || token.type == "UL") {
          listItems.push({
            closed: false,
            listItems: [token],
            type: "LISTITEM"
          });
        } else
          tree.push(token);
      }
      if (lastEl(listItems) && !lastEl(listItems).closed) {
        lastEl(listItems).closed = true;
        tree.push(lastEl(listItems));
      }
      const debugTree = import_util.default.inspect(tree, false, null, true);
      return tree;
    }
    function parseLine(line) {
      if (line.endsWith("\r")) {
        line.slice(0, -2);
      }
      const hr = headingParser.run(line);
      const ol = olParser.run(line);
      const ul = ulParser.run(line);
      const dp = dividerParser.run(line);
      if (!hr.isError) {
        const result = hr.result;
        const newLine = line.slice(result[1].length + 1);
        const subToken = parameterisedParsing(newLine);
        return {
          type: "HEADING",
          subToken,
          level: result[1].length + 1
        };
      } else if (!dp.isError) {
        return {
          type: "DIVIDER"
        };
      } else if (!ol.isError) {
        const newLine = line.slice(ol.result[0].length + 2);
        const subToken = parameterisedParsing(newLine);
        return { type: "OL", subToken };
      } else if (!ul.isError) {
        const newLine = line.slice(
          //@ts-expect-error
          ul.result[0].length + 1 + ul.result[2].length
        );
        const subToken = parameterisedParsing(newLine);
        return { type: "UL", subToken };
      } else {
        const subToken = parameterisedParsing(line);
        return {
          type: "PARAGRAPH",
          subToken
        };
      }
    }
    function parameterisedParsing(str3) {
      return inStringParsing(str3);
    }
    function formStringFromAllResults(result) {
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
    function inStringParsing(str3) {
      if (str3 == "")
        return null;
      const linkInString = wrapWithRestrictedString(linkParser);
      const lp = linkInString.run(str3);
      const lpr = inlineParsing(lp, "LINK");
      if (lpr) {
        return lpr;
      } else
        return {
          type: "LITERAL",
          text: str3
        };
    }
    function inlineParsing(p, type) {
      if (!p.isError) {
        const result = p.result;
        const preStr = formStringFromAllResults(result.pre);
        const postStr = formStringFromAllResults(result.post);
        const preToken = inStringParsing(preStr);
        const postToken = inStringParsing(postStr);
        const subTokens = [];
        if (preToken) {
          if (preToken.type == "INLINE") {
            subTokens.push(...preToken.subTokens);
          } else
            subTokens.push(preToken);
        }
        const content = result.content;
        const subToken = inStringParsing(formStringFromAllResults(content[1]));
        const url = formStringFromAllResults(content[4]);
        subTokens.push({
          type: "LINK",
          subToken,
          url
        });
        if (postToken) {
          if (postToken.type == "INLINE") {
            subTokens.push(...postToken.subTokens);
          } else
            subTokens.push(postToken);
        }
        return {
          type: "INLINE",
          subTokens
        };
      } else {
        return null;
      }
    }
    var import_arcsecond3 = __toESM(require_arcsecond(), 1);
    function generator_default(ast) {
      return doList(ast);
    }
    function doList(tokenList) {
      const htmlStatements = [];
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
    function tokenTree(token) {
      switch (token.type) {
        case "HEADING":
          return doHeading(token);
        case "BOLD":
          return doBold(token);
        case "DIVIDER":
          return doDivider();
        case "INLINE":
          return doInline(token);
        case "ITALIC":
          return doItalic(token);
        case "LISTITEM":
          return doListItem(token);
        case "LITERAL":
          return insertBoldItalic(token.text);
        case "OL":
        case "UL":
          return doListElement(token);
        case "PARAGRAPH":
          return doParagraph(token);
        case "LINK":
          return doLink(token);
      }
    }
    function doHeading(token) {
      const content = tokenTree(token.subToken);
      return `<h${token.level}>${content}</h${token.level}>`;
    }
    function doBold(token) {
      const content = tokenTree(token.subToken);
      return `<b>${content}</b>`;
    }
    function doDivider() {
      return `<div class="divider" />`;
    }
    function doInline(token) {
      return doList(token.subTokens);
    }
    function doItalic(token) {
      const content = tokenTree(token.subToken);
      return `<i>${content}</i>`;
    }
    function doListItem(token) {
      const subList = doList(token.listItems);
      const type = token.listItems[0].type == "OL" ? "ol" : "ul";
      return `<${type}>${subList}</${type}>`;
    }
    function doParagraph(token) {
      const content = tokenTree(token.subToken);
      return `<p>${content}</p>`;
    }
    function doListElement(token) {
      const content = tokenTree(token.subToken);
      return `<li>${content}</li>`;
    }
    function doLink(token) {
      const content = tokenTree(token.subToken);
      return `<a href="${token.url}">${content}</a>`;
    }
    function insertBoldItalic(text) {
      const boldParser = (0, import_arcsecond3.sequenceOf)([
        (0, import_arcsecond3.many)((0, import_arcsecond3.anyCharExcept)((0, import_arcsecond3.char)("*"))),
        (0, import_arcsecond3.str)("**"),
        (0, import_arcsecond3.many)((0, import_arcsecond3.anyCharExcept)((0, import_arcsecond3.char)("*"))),
        (0, import_arcsecond3.str)("**"),
        (0, import_arcsecond3.many)((0, import_arcsecond3.anyCharExcept)((0, import_arcsecond3.char)("*")))
      ]);
      const italicParser = (0, import_arcsecond3.sequenceOf)([
        (0, import_arcsecond3.many)((0, import_arcsecond3.anyCharExcept)((0, import_arcsecond3.char)("_"))),
        (0, import_arcsecond3.char)("_"),
        (0, import_arcsecond3.many)((0, import_arcsecond3.anyCharExcept)((0, import_arcsecond3.char)("_"))),
        (0, import_arcsecond3.char)("_"),
        (0, import_arcsecond3.many)((0, import_arcsecond3.anyCharExcept)((0, import_arcsecond3.char)("_")))
      ]);
      const bp = boldParser.run(text);
      const ip = italicParser.run(text);
      if (!ip.isError) {
        const result = ip.result;
        const inside = insertBoldItalic(result[2].join(""));
        const statement = `${result[0].join("")}<i>${inside}</i>${result[4].join("")}`;
        return statement;
      } else if (!bp.isError) {
        const result = bp.result;
        const inside = insertBoldItalic(result[2].join(""));
        const statement = `${result[0].join("")}<b>${inside}</b>${result[4].join("")}`;
        return statement;
      } else
        return text;
    }
    function runMultiFile(path2, name) {
      const base = input(path2);
      const baseName = name.slice(0, -3);
      const [file, metadata] = processFile(base, baseName);
      return [
        file,
        {
          title: metadata.title,
          description: metadata.description,
          unixt: metadata.date.unix(),
          image: metadata.image,
          url: `blog/${baseName}`
        },
        metadata
      ];
    }
    function processFile(file, baseName) {
      const [cleanedFile, metadata] = metadataRemover_default(file, baseName);
      const ast = fileparser_default(cleanedFile);
      const rawHtml = generator_default(ast);
      return [rawHtml, metadata];
    }
    function tsc_build_default() {
      const path2 = process.argv[2];
      const name = process.argv[3];
      const r = runMultiFile(path2, name);
      process.send(r);
    }
  }
});

// verace.json
var require_verace = __commonJS({
  "verace.json"(exports2, module2) {
    module2.exports = {
      lang: "ts",
      name: "blog-build-worker",
      version: "0.0.2",
      targets: [
        "win64",
        "linux64"
      ],
      data: {
        foo: "bar"
      },
      outDir: "bin",
      entrypoint: "",
      ts: {
        buildDir: "tsc-build",
        cleanAfterBuild: true,
        produceTypes: false,
        skipPkg: true,
        test: "",
        assets: "assets"
      },
      go: {
        gomod: ""
      }
    };
  }
});

// build/index.cjs
var exec = require_veraceTemp();
var config = require_verace();
exec.default(config);
