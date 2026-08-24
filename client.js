window.__ModuleLoader__.load({
  id: "dsh-session-migrator",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
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

    // client-src.js
    var client_src_exports = {};
    __export(client_src_exports, {
      apply: () => apply,
      inject: () => inject
    });
    module.exports = __toCommonJS(client_src_exports);
    var import_react = __toESM(require("react"), 1);

    // node_modules/fflate/esm/browser.js
    var u8 = Uint8Array;
    var u16 = Uint16Array;
    var i32 = Int32Array;
    var fleb = new u8([
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      1,
      1,
      1,
      1,
      2,
      2,
      2,
      2,
      3,
      3,
      3,
      3,
      4,
      4,
      4,
      4,
      5,
      5,
      5,
      5,
      0,
      /* unused */
      0,
      0,
      /* impossible */
      0
    ]);
    var fdeb = new u8([
      0,
      0,
      0,
      0,
      1,
      1,
      2,
      2,
      3,
      3,
      4,
      4,
      5,
      5,
      6,
      6,
      7,
      7,
      8,
      8,
      9,
      9,
      10,
      10,
      11,
      11,
      12,
      12,
      13,
      13,
      /* unused */
      0,
      0
    ]);
    var clim = new u8([16, 17, 18, 0, 8, 7, 9, 6, 10, 5, 11, 4, 12, 3, 13, 2, 14, 1, 15]);
    var freb = function(eb, start) {
      var b = new u16(31);
      for (var i2 = 0; i2 < 31; ++i2) {
        b[i2] = start += 1 << eb[i2 - 1];
      }
      var r = new i32(b[30]);
      for (var i2 = 1; i2 < 30; ++i2) {
        for (var j = b[i2]; j < b[i2 + 1]; ++j) {
          r[j] = j - b[i2] << 5 | i2;
        }
      }
      return { b, r };
    };
    var _a = freb(fleb, 2);
    var fl = _a.b;
    var revfl = _a.r;
    fl[28] = 258, revfl[258] = 28;
    var _b = freb(fdeb, 0);
    var fd = _b.b;
    var revfd = _b.r;
    var rev = new u16(32768);
    for (i = 0; i < 32768; ++i) {
      x = (i & 43690) >> 1 | (i & 21845) << 1;
      x = (x & 52428) >> 2 | (x & 13107) << 2;
      x = (x & 61680) >> 4 | (x & 3855) << 4;
      rev[i] = ((x & 65280) >> 8 | (x & 255) << 8) >> 1;
    }
    var x;
    var i;
    var hMap = (function(cd, mb, r) {
      var s = cd.length;
      var i2 = 0;
      var l = new u16(mb);
      for (; i2 < s; ++i2) {
        if (cd[i2])
          ++l[cd[i2] - 1];
      }
      var le = new u16(mb);
      for (i2 = 1; i2 < mb; ++i2) {
        le[i2] = le[i2 - 1] + l[i2 - 1] << 1;
      }
      var co;
      if (r) {
        co = new u16(1 << mb);
        var rvb = 15 - mb;
        for (i2 = 0; i2 < s; ++i2) {
          if (cd[i2]) {
            var sv = i2 << 4 | cd[i2];
            var r_1 = mb - cd[i2];
            var v = le[cd[i2] - 1]++ << r_1;
            for (var m = v | (1 << r_1) - 1; v <= m; ++v) {
              co[rev[v] >> rvb] = sv;
            }
          }
        }
      } else {
        co = new u16(s);
        for (i2 = 0; i2 < s; ++i2) {
          if (cd[i2]) {
            co[i2] = rev[le[cd[i2] - 1]++] >> 15 - cd[i2];
          }
        }
      }
      return co;
    });
    var flt = new u8(288);
    for (i = 0; i < 144; ++i)
      flt[i] = 8;
    var i;
    for (i = 144; i < 256; ++i)
      flt[i] = 9;
    var i;
    for (i = 256; i < 280; ++i)
      flt[i] = 7;
    var i;
    for (i = 280; i < 288; ++i)
      flt[i] = 8;
    var i;
    var fdt = new u8(32);
    for (i = 0; i < 32; ++i)
      fdt[i] = 5;
    var i;
    var flm = /* @__PURE__ */ hMap(flt, 9, 0);
    var fdm = /* @__PURE__ */ hMap(fdt, 5, 0);
    var shft = function(p) {
      return (p + 7) / 8 | 0;
    };
    var slc = function(v, s, e) {
      if (s == null || s < 0)
        s = 0;
      if (e == null || e > v.length)
        e = v.length;
      return new u8(v.subarray(s, e));
    };
    var ec = [
      "unexpected EOF",
      "invalid block type",
      "invalid length/literal",
      "invalid distance",
      "stream finished",
      "no stream handler",
      ,
      // determined by compression function
      "no callback",
      "invalid UTF-8 data",
      "extra field too long",
      "date not in range 1980-2099",
      "filename too long",
      "stream finishing",
      "invalid zip data"
      // determined by unknown compression method
    ];
    var err = function(ind, msg, nt) {
      var e = new Error(msg || ec[ind]);
      e.code = ind;
      if (Error.captureStackTrace)
        Error.captureStackTrace(e, err);
      if (!nt)
        throw e;
      return e;
    };
    var wbits = function(d, p, v) {
      v <<= p & 7;
      var o = p / 8 | 0;
      d[o] |= v;
      d[o + 1] |= v >> 8;
    };
    var wbits16 = function(d, p, v) {
      v <<= p & 7;
      var o = p / 8 | 0;
      d[o] |= v;
      d[o + 1] |= v >> 8;
      d[o + 2] |= v >> 16;
    };
    var hTree = function(d, mb) {
      var t = [];
      for (var i2 = 0; i2 < d.length; ++i2) {
        if (d[i2])
          t.push({ s: i2, f: d[i2] });
      }
      var s = t.length;
      var t2 = t.slice();
      if (!s)
        return { t: et, l: 0 };
      if (s == 1) {
        var v = new u8(t[0].s + 1);
        v[t[0].s] = 1;
        return { t: v, l: 1 };
      }
      t.sort(function(a, b) {
        return a.f - b.f;
      });
      t.push({ s: -1, f: 25001 });
      var l = t[0], r = t[1], i0 = 0, i1 = 1, i22 = 2;
      t[0] = { s: -1, f: l.f + r.f, l, r };
      while (i1 != s - 1) {
        l = t[t[i0].f < t[i22].f ? i0++ : i22++];
        r = t[i0 != i1 && t[i0].f < t[i22].f ? i0++ : i22++];
        t[i1++] = { s: -1, f: l.f + r.f, l, r };
      }
      var maxSym = t2[0].s;
      for (var i2 = 1; i2 < s; ++i2) {
        if (t2[i2].s > maxSym)
          maxSym = t2[i2].s;
      }
      var tr = new u16(maxSym + 1);
      var mbt = ln(t[i1 - 1], tr, 0);
      if (mbt > mb) {
        var i2 = 0, dt = 0;
        var lft = mbt - mb, cst = 1 << lft;
        t2.sort(function(a, b) {
          return tr[b.s] - tr[a.s] || a.f - b.f;
        });
        for (; i2 < s; ++i2) {
          var i2_1 = t2[i2].s;
          if (tr[i2_1] > mb) {
            dt += cst - (1 << mbt - tr[i2_1]);
            tr[i2_1] = mb;
          } else
            break;
        }
        dt >>= lft;
        while (dt > 0) {
          var i2_2 = t2[i2].s;
          if (tr[i2_2] < mb)
            dt -= 1 << mb - tr[i2_2]++ - 1;
          else
            ++i2;
        }
        for (; i2 >= 0 && dt; --i2) {
          var i2_3 = t2[i2].s;
          if (tr[i2_3] == mb) {
            --tr[i2_3];
            ++dt;
          }
        }
        mbt = mb;
      }
      return { t: new u8(tr), l: mbt };
    };
    var ln = function(n, l, d) {
      return n.s == -1 ? Math.max(ln(n.l, l, d + 1), ln(n.r, l, d + 1)) : l[n.s] = d;
    };
    var lc = function(c) {
      var s = c.length;
      while (s && !c[--s])
        ;
      var cl = new u16(++s);
      var cli = 0, cln = c[0], cls = 1;
      var w = function(v) {
        cl[cli++] = v;
      };
      for (var i2 = 1; i2 <= s; ++i2) {
        if (c[i2] == cln && i2 != s)
          ++cls;
        else {
          if (!cln && cls > 2) {
            for (; cls > 138; cls -= 138)
              w(32754);
            if (cls > 2) {
              w(cls > 10 ? cls - 11 << 5 | 28690 : cls - 3 << 5 | 12305);
              cls = 0;
            }
          } else if (cls > 3) {
            w(cln), --cls;
            for (; cls > 6; cls -= 6)
              w(8304);
            if (cls > 2)
              w(cls - 3 << 5 | 8208), cls = 0;
          }
          while (cls--)
            w(cln);
          cls = 1;
          cln = c[i2];
        }
      }
      return { c: cl.subarray(0, cli), n: s };
    };
    var clen = function(cf, cl) {
      var l = 0;
      for (var i2 = 0; i2 < cl.length; ++i2)
        l += cf[i2] * cl[i2];
      return l;
    };
    var wfblk = function(out, pos, dat) {
      var s = dat.length;
      var o = shft(pos + 2);
      out[o] = s & 255;
      out[o + 1] = s >> 8;
      out[o + 2] = out[o] ^ 255;
      out[o + 3] = out[o + 1] ^ 255;
      for (var i2 = 0; i2 < s; ++i2)
        out[o + i2 + 4] = dat[i2];
      return (o + 4 + s) * 8;
    };
    var wblk = function(dat, out, final, syms, lf, df, eb, li, bs, bl, p) {
      wbits(out, p++, final);
      ++lf[256];
      var _a2 = hTree(lf, 15), dlt = _a2.t, mlb = _a2.l;
      var _b2 = hTree(df, 15), ddt = _b2.t, mdb = _b2.l;
      var _c = lc(dlt), lclt = _c.c, nlc = _c.n;
      var _d = lc(ddt), lcdt = _d.c, ndc = _d.n;
      var lcfreq = new u16(19);
      for (var i2 = 0; i2 < lclt.length; ++i2)
        ++lcfreq[lclt[i2] & 31];
      for (var i2 = 0; i2 < lcdt.length; ++i2)
        ++lcfreq[lcdt[i2] & 31];
      var _e = hTree(lcfreq, 7), lct = _e.t, mlcb = _e.l;
      var nlcc = 19;
      for (; nlcc > 4 && !lct[clim[nlcc - 1]]; --nlcc)
        ;
      var flen = bl + 5 << 3;
      var ftlen = clen(lf, flt) + clen(df, fdt) + eb;
      var dtlen = clen(lf, dlt) + clen(df, ddt) + eb + 14 + 3 * nlcc + clen(lcfreq, lct) + 2 * lcfreq[16] + 3 * lcfreq[17] + 7 * lcfreq[18];
      if (bs >= 0 && flen <= ftlen && flen <= dtlen)
        return wfblk(out, p, dat.subarray(bs, bs + bl));
      var lm, ll, dm, dl;
      wbits(out, p, 1 + (dtlen < ftlen)), p += 2;
      if (dtlen < ftlen) {
        lm = hMap(dlt, mlb, 0), ll = dlt, dm = hMap(ddt, mdb, 0), dl = ddt;
        var llm = hMap(lct, mlcb, 0);
        wbits(out, p, nlc - 257);
        wbits(out, p + 5, ndc - 1);
        wbits(out, p + 10, nlcc - 4);
        p += 14;
        for (var i2 = 0; i2 < nlcc; ++i2)
          wbits(out, p + 3 * i2, lct[clim[i2]]);
        p += 3 * nlcc;
        var lcts = [lclt, lcdt];
        for (var it = 0; it < 2; ++it) {
          var clct = lcts[it];
          for (var i2 = 0; i2 < clct.length; ++i2) {
            var len = clct[i2] & 31;
            wbits(out, p, llm[len]), p += lct[len];
            if (len > 15)
              wbits(out, p, clct[i2] >> 5 & 127), p += clct[i2] >> 12;
          }
        }
      } else {
        lm = flm, ll = flt, dm = fdm, dl = fdt;
      }
      for (var i2 = 0; i2 < li; ++i2) {
        var sym = syms[i2];
        if (sym > 255) {
          var len = sym >> 18 & 31;
          wbits16(out, p, lm[len + 257]), p += ll[len + 257];
          if (len > 7)
            wbits(out, p, sym >> 23 & 31), p += fleb[len];
          var dst = sym & 31;
          wbits16(out, p, dm[dst]), p += dl[dst];
          if (dst > 3)
            wbits16(out, p, sym >> 5 & 8191), p += fdeb[dst];
        } else {
          wbits16(out, p, lm[sym]), p += ll[sym];
        }
      }
      wbits16(out, p, lm[256]);
      return p + ll[256];
    };
    var deo = /* @__PURE__ */ new i32([65540, 131080, 131088, 131104, 262176, 1048704, 1048832, 2114560, 2117632]);
    var et = /* @__PURE__ */ new u8(0);
    var dflt = function(dat, lvl, plvl, pre, post, st) {
      var s = st.z || dat.length;
      var o = new u8(pre + s + 5 * (1 + Math.ceil(s / 7e3)) + post);
      var w = o.subarray(pre, o.length - post);
      var lst = st.l;
      var pos = (st.r || 0) & 7;
      if (lvl) {
        if (pos)
          w[0] = st.r >> 3;
        var opt = deo[lvl - 1];
        var n = opt >> 13, c = opt & 8191;
        var msk_1 = (1 << plvl) - 1;
        var prev = st.p || new u16(32768), head = st.h || new u16(msk_1 + 1);
        var bs1_1 = Math.ceil(plvl / 3), bs2_1 = 2 * bs1_1;
        var hsh = function(i3) {
          return (dat[i3] ^ dat[i3 + 1] << bs1_1 ^ dat[i3 + 2] << bs2_1) & msk_1;
        };
        var syms = new i32(25e3);
        var lf = new u16(288), df = new u16(32);
        var lc_1 = 0, eb = 0, i2 = st.i || 0, li = 0, wi = st.w || 0, bs = 0;
        for (; i2 + 2 < s; ++i2) {
          var hv = hsh(i2);
          var imod = i2 & 32767, pimod = head[hv];
          prev[imod] = pimod;
          head[hv] = imod;
          if (wi <= i2) {
            var rem = s - i2;
            if ((lc_1 > 7e3 || li > 24576) && (rem > 423 || !lst)) {
              pos = wblk(dat, w, 0, syms, lf, df, eb, li, bs, i2 - bs, pos);
              li = lc_1 = eb = 0, bs = i2;
              for (var j = 0; j < 286; ++j)
                lf[j] = 0;
              for (var j = 0; j < 30; ++j)
                df[j] = 0;
            }
            var l = 2, d = 0, ch_1 = c, dif = imod - pimod & 32767;
            if (rem > 2 && hv == hsh(i2 - dif)) {
              var maxn = Math.min(n, rem) - 1;
              var maxd = Math.min(32767, i2);
              var ml = Math.min(258, rem);
              while (dif <= maxd && --ch_1 && imod != pimod) {
                if (dat[i2 + l] == dat[i2 + l - dif]) {
                  var nl = 0;
                  for (; nl < ml && dat[i2 + nl] == dat[i2 + nl - dif]; ++nl)
                    ;
                  if (nl > l) {
                    l = nl, d = dif;
                    if (nl > maxn)
                      break;
                    var mmd = Math.min(dif, nl - 2);
                    var md = 0;
                    for (var j = 0; j < mmd; ++j) {
                      var ti = i2 - dif + j & 32767;
                      var pti = prev[ti];
                      var cd = ti - pti & 32767;
                      if (cd > md)
                        md = cd, pimod = ti;
                    }
                  }
                }
                imod = pimod, pimod = prev[imod];
                dif += imod - pimod & 32767;
              }
            }
            if (d) {
              syms[li++] = 268435456 | revfl[l] << 18 | revfd[d];
              var lin = revfl[l] & 31, din = revfd[d] & 31;
              eb += fleb[lin] + fdeb[din];
              ++lf[257 + lin];
              ++df[din];
              wi = i2 + l;
              ++lc_1;
            } else {
              syms[li++] = dat[i2];
              ++lf[dat[i2]];
            }
          }
        }
        for (i2 = Math.max(i2, wi); i2 < s; ++i2) {
          syms[li++] = dat[i2];
          ++lf[dat[i2]];
        }
        pos = wblk(dat, w, lst, syms, lf, df, eb, li, bs, i2 - bs, pos);
        if (!lst) {
          st.r = pos & 7 | w[pos / 8 | 0] << 3;
          pos -= 7;
          st.h = head, st.p = prev, st.i = i2, st.w = wi;
        }
      } else {
        for (var i2 = st.w || 0; i2 < s + lst; i2 += 65535) {
          var e = i2 + 65535;
          if (e >= s) {
            w[pos / 8 | 0] = lst;
            e = s;
          }
          pos = wfblk(w, pos + 1, dat.subarray(i2, e));
        }
        st.i = s;
      }
      return slc(o, 0, pre + shft(pos) + post);
    };
    var crct = /* @__PURE__ */ (function() {
      var t = new Int32Array(256);
      for (var i2 = 0; i2 < 256; ++i2) {
        var c = i2, k = 9;
        while (--k)
          c = (c & 1 && -306674912) ^ c >>> 1;
        t[i2] = c;
      }
      return t;
    })();
    var crc = function() {
      var c = -1;
      return {
        p: function(d) {
          var cr = c;
          for (var i2 = 0; i2 < d.length; ++i2)
            cr = crct[cr & 255 ^ d[i2]] ^ cr >>> 8;
          c = cr;
        },
        d: function() {
          return ~c;
        }
      };
    };
    var dopt = function(dat, opt, pre, post, st) {
      if (!st) {
        st = { l: 1 };
        if (opt.dictionary) {
          var dict = opt.dictionary.subarray(-32768);
          var newDat = new u8(dict.length + dat.length);
          newDat.set(dict);
          newDat.set(dat, dict.length);
          dat = newDat;
          st.w = dict.length;
        }
      }
      return dflt(dat, opt.level == null ? 6 : opt.level, opt.mem == null ? st.l ? Math.ceil(Math.max(8, Math.min(13, Math.log(dat.length))) * 1.5) : 20 : 12 + opt.mem, pre, post, st);
    };
    var mrg = function(a, b) {
      var o = {};
      for (var k in a)
        o[k] = a[k];
      for (var k in b)
        o[k] = b[k];
      return o;
    };
    var wbytes = function(d, b, v) {
      for (; v; ++b)
        d[b] = v, v >>>= 8;
    };
    function deflateSync(data, opts) {
      return dopt(data, opts || {}, 0, 0);
    }
    var fltn = function(d, p, t, o) {
      for (var k in d) {
        var val = d[k], n = p + k, op = o;
        if (Array.isArray(val))
          op = mrg(o, val[1]), val = val[0];
        if (ArrayBuffer.isView(val))
          t[n] = [val, op];
        else {
          t[n += "/"] = [new u8(0), op];
          fltn(val, n, t, o);
        }
      }
    };
    var te = typeof TextEncoder != "undefined" && /* @__PURE__ */ new TextEncoder();
    var td = typeof TextDecoder != "undefined" && /* @__PURE__ */ new TextDecoder();
    var tds = 0;
    try {
      td.decode(et, { stream: true });
      tds = 1;
    } catch (e) {
    }
    function strToU8(str, latin1) {
      if (latin1) {
        var ar_1 = new u8(str.length);
        for (var i2 = 0; i2 < str.length; ++i2)
          ar_1[i2] = str.charCodeAt(i2);
        return ar_1;
      }
      if (te)
        return te.encode(str);
      var l = str.length;
      var ar = new u8(str.length + (str.length >> 1));
      var ai = 0;
      var w = function(v) {
        ar[ai++] = v;
      };
      for (var i2 = 0; i2 < l; ++i2) {
        if (ai + 5 > ar.length) {
          var n = new u8(ai + 8 + (l - i2 << 1));
          n.set(ar);
          ar = n;
        }
        var c = str.charCodeAt(i2);
        if (c < 128 || latin1)
          w(c);
        else if (c < 2048)
          w(192 | c >> 6), w(128 | c & 63);
        else if (c > 55295 && c < 57344)
          c = 65536 + (c & 1023 << 10) | str.charCodeAt(++i2) & 1023, w(240 | c >> 18), w(128 | c >> 12 & 63), w(128 | c >> 6 & 63), w(128 | c & 63);
        else
          w(224 | c >> 12), w(128 | c >> 6 & 63), w(128 | c & 63);
      }
      return slc(ar, 0, ai);
    }
    var exfl = function(ex) {
      var le = 0;
      if (ex) {
        for (var k in ex) {
          var l = ex[k].length;
          if (l > 65535)
            err(9);
          le += l + 4;
        }
      }
      return le;
    };
    var wzh = function(d, b, f, fn, u, c, ce, co) {
      var fl2 = fn.length, ex = f.extra, col = co && co.length;
      var exl = exfl(ex);
      wbytes(d, b, ce != null ? 33639248 : 67324752), b += 4;
      if (ce != null)
        d[b++] = 20, d[b++] = f.os;
      d[b] = 20, b += 2;
      d[b++] = f.flag << 1 | (c < 0 && 8), d[b++] = u && 8;
      d[b++] = f.compression & 255, d[b++] = f.compression >> 8;
      var dt = new Date(f.mtime == null ? Date.now() : f.mtime), y = dt.getFullYear() - 1980;
      if (y < 0 || y > 119)
        err(10);
      wbytes(d, b, y << 25 | dt.getMonth() + 1 << 21 | dt.getDate() << 16 | dt.getHours() << 11 | dt.getMinutes() << 5 | dt.getSeconds() >> 1), b += 4;
      if (c != -1) {
        wbytes(d, b, f.crc);
        wbytes(d, b + 4, c < 0 ? -c - 2 : c);
        wbytes(d, b + 8, f.size);
      }
      wbytes(d, b + 12, fl2);
      wbytes(d, b + 14, exl), b += 16;
      if (ce != null) {
        wbytes(d, b, col);
        wbytes(d, b + 6, f.attrs);
        wbytes(d, b + 10, ce), b += 14;
      }
      d.set(fn, b);
      b += fl2;
      if (exl) {
        for (var k in ex) {
          var exf = ex[k], l = exf.length;
          wbytes(d, b, +k);
          wbytes(d, b + 2, l);
          d.set(exf, b + 4), b += 4 + l;
        }
      }
      if (col)
        d.set(co, b), b += col;
      return b;
    };
    var wzf = function(o, b, c, d, e) {
      wbytes(o, b, 101010256);
      wbytes(o, b + 8, c);
      wbytes(o, b + 10, c);
      wbytes(o, b + 12, d);
      wbytes(o, b + 16, e);
    };
    function zipSync(data, opts) {
      if (!opts)
        opts = {};
      var r = {};
      var files = [];
      fltn(data, "", r, opts);
      var o = 0;
      var tot = 0;
      for (var fn in r) {
        var _a2 = r[fn], file = _a2[0], p = _a2[1];
        var compression = p.level == 0 ? 0 : 8;
        var f = strToU8(fn), s = f.length;
        var com = p.comment, m = com && strToU8(com), ms = m && m.length;
        var exl = exfl(p.extra);
        if (s > 65535)
          err(11);
        var d = compression ? deflateSync(file, p) : file, l = d.length;
        var c = crc();
        c.p(file);
        files.push(mrg(p, {
          size: file.length,
          crc: c.d(),
          c: d,
          f,
          m,
          u: s != fn.length || m && com.length != ms,
          o,
          compression
        }));
        o += 30 + s + exl + l;
        tot += 76 + 2 * (s + exl) + (ms || 0) + l;
      }
      var out = new u8(tot + 22), oe = o, cdl = tot - o;
      for (var i2 = 0; i2 < files.length; ++i2) {
        var f = files[i2];
        wzh(out, f.o, f, f.f, f.u, f.c.length);
        var badd = 30 + f.f.length + exfl(f.extra);
        out.set(f.c, f.o + badd);
        wzh(out, o, f, f.f, f.u, f.c.length, f.o, f.m), o += 16 + badd + (f.m ? f.m.length : 0);
      }
      wzf(out, o, files.length, cdl, oe);
      return out;
    }

    // client-src.js
    var import_jsx_runtime = require("react/jsx-runtime");
    var NS = "sessionMigrator";
    var dictionaries = {
      zh: {
        title: "\u5BFC\u5165\u4F1A\u8BDD",
        button: "\u5BFC\u5165\u4F1A\u8BDD",
        buttonTitle: "\u5BFC\u5165 DeepSeek Harness \u4F1A\u8BDD",
        close: "\u5173\u95ED",
        intro: "\u62D6\u5165\u4F1A\u8BDD ZIP\u3001session.jsonl \u6216\u5B8C\u6574\u5BFC\u51FA\u6587\u4EF6\u5939\uFF0C\u7136\u540E\u9009\u62E9\u76EE\u6807\u5DE5\u4F5C\u533A\u3002\u91CD\u590D\u4F1A\u8BDD\u4F1A\u81EA\u52A8\u514B\u9686\uFF0C\u4E0D\u4F1A\u8986\u76D6\u5DF2\u6709\u6570\u636E\u3002",
        chooseArchive: "\u9009\u62E9 ZIP / JSONL",
        chooseFolder: "\u9009\u62E9\u5BFC\u51FA\u6587\u4EF6\u5939",
        selected: "\u5DF2\u9009\u62E9 {n} \u4E2A\u6587\u4EF6",
        noneSelected: "\u5C1A\u672A\u9009\u62E9\u6587\u4EF6",
        missingSource: "\u8BF7\u5148\u9009\u62E9\u6216\u62D6\u5165\u4F1A\u8BDD\u5BFC\u51FA\u6587\u4EF6\u3002",
        importing: "\u6B63\u5728\u89E3\u6790\u5E76\u5BFC\u5165\u2026",
        progressReading: "\u6B63\u5728\u8BFB\u53D6\u6587\u4EF6\u2026",
        progressPacking: "\u6B63\u5728\u6253\u5305\u5BFC\u51FA\u6587\u4EF6\u5939\u2026",
        progressUploading: "\u6B63\u5728\u4E0A\u4F20\u5230 Harness\u2026",
        progressParsing: "\u6B63\u5728\u89E3\u6790\u4F1A\u8BDD\u65E5\u5FD7\u2026",
        progressValidating: "\u6B63\u5728\u6821\u9A8C\u4F1A\u8BDD\u6811\u2026",
        progressAttachments: "\u6B63\u5728\u6062\u590D\u9644\u4EF6\uFF08{done}/{total}\uFF09\u2026",
        progressSessions: "\u6B63\u5728\u5199\u5165\u4F1A\u8BDD\uFF08{done}/{total}\uFF09\u2026",
        dropHere: "\u91CA\u653E\u5230\u6B64\u5DE5\u4F5C\u533A",
        success: "\u5BFC\u5165\u6210\u529F",
        clone: "\u68C0\u6D4B\u5230\u91CD\u590D\u4F1A\u8BDD\uFF0C\u5DF2\u81EA\u52A8\u521B\u5EFA\u526F\u672C\u3002",
        original: "\u5DF2\u4FDD\u7559\u539F\u4F1A\u8BDD ID\u3002",
        summary: "\u5171\u5BFC\u5165 {n} \u4E2A\u4F1A\u8BDD \xB7 \u6839\u4F1A\u8BDD {id}",
        open: "\u6253\u5F00\u5BFC\u5165\u7684\u4F1A\u8BDD",
        uploadFailed: "\u5BFC\u5165\u5931\u8D25\uFF08HTTP {status}\uFF09"
      },
      en: {
        title: "Import sessions",
        button: "Import sessions",
        buttonTitle: "Import DeepSeek Harness sessions",
        close: "Close",
        intro: "Drop a session ZIP, session.jsonl, or a complete export folder, then choose the target workspace. Duplicate sessions are cloned automatically and never overwrite existing data.",
        chooseArchive: "Choose ZIP / JSONL",
        chooseFolder: "Choose export folder",
        selected: "{n} files selected",
        noneSelected: "No files selected",
        missingSource: "Choose or drop a session export first.",
        importing: "Parsing and importing\u2026",
        progressReading: "Reading files\u2026",
        progressPacking: "Packing the export folder\u2026",
        progressUploading: "Uploading to Harness\u2026",
        progressParsing: "Parsing session logs\u2026",
        progressValidating: "Validating the session tree\u2026",
        progressAttachments: "Restoring attachments ({done}/{total})\u2026",
        progressSessions: "Writing sessions ({done}/{total})\u2026",
        dropHere: "Drop into this workspace",
        success: "Import complete",
        clone: "A duplicate was detected and imported as a cloned session tree.",
        original: "Original session IDs were preserved.",
        summary: "{n} sessions imported \xB7 Root session {id}",
        open: "Open imported session",
        uploadFailed: "Import failed (HTTP {status})"
      }
    };
    var css = `
    .dsm-button{height:32px;border:1px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);border-radius:8px;padding:0 10px;cursor:pointer;font:inherit;font-size:13px}.dsm-button:hover{background:var(--dsw-alias-interactive-bg-hover)}
    .dsm-overlay{position:fixed;inset:0;z-index:2147483000;background:color-mix(in srgb,var(--dsw-alias-bg-mask,rgba(0,0,0,.62)) 82%,transparent);display:flex;align-items:center;justify-content:center;padding:24px}.dsm-panel{width:min(720px,calc(100vw - 48px));max-height:calc(100vh - 48px);overflow:auto;background:var(--dsw-alias-bg-layer-1,#181818);color:var(--dsw-alias-label-primary,#fff);border:1px solid var(--dsw-alias-border-l2,#444);border-radius:16px;box-shadow:0 24px 80px rgba(0,0,0,.35);padding:20px}.dsm-head{display:flex;align-items:center;justify-content:space-between;gap:16px}.dsm-head h2{font-size:18px;margin:0}.dsm-hint{margin:8px 0 18px;color:var(--dsw-alias-label-secondary,#aaa);font-size:13px}.dsm-actions{display:flex;gap:8px;flex-wrap:wrap}.dsm-targets{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:10px}.dsm-target{min-height:86px;text-align:left;border:1px dashed var(--dsw-alias-border-l1,#666);background:var(--dsw-alias-bg-layer-2,#222);color:inherit;border-radius:12px;padding:12px;cursor:pointer}.dsm-target:hover,.dsm-target[data-over=true]{border-color:var(--dsw-alias-state-business-primary,#4f8cff);background:color-mix(in srgb,var(--dsw-alias-state-business-primary,#4f8cff) 12%,var(--dsw-alias-bg-layer-2,#222))}.dsm-target strong,.dsm-target span{display:block}.dsm-target span{margin-top:5px;color:var(--dsw-alias-label-tertiary,#888);font-size:12px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.dsm-status{padding:20px 0;text-align:center}.dsm-progress{width:min(460px,100%);margin:18px auto 0;text-align:left}.dsm-progressLabel{display:flex;justify-content:space-between;gap:16px;margin-bottom:8px;color:var(--dsw-alias-label-secondary,#aaa);font-size:13px}.dsm-progressTrack{height:8px;overflow:hidden;border-radius:999px;background:var(--dsw-alias-bg-layer-3,#303030)}.dsm-progressFill{height:100%;border-radius:inherit;background:var(--dsw-alias-state-business-primary,#3478f6);transition:width .18s ease}.dsm-error{color:var(--dsw-alias-state-error-primary,#ff6b6b);white-space:pre-wrap}.dsm-success{color:var(--dsw-alias-label-primary,#fff)}
    `;
    function injectCss() {
      if (document.querySelector('style[data-plugin-css="dsh-session-migrator"]')) return;
      const style = document.createElement("style");
      style.dataset.pluginCss = "dsh-session-migrator";
      style.textContent = css;
      document.head.appendChild(style);
    }
    function hostBase() {
      return location.origin && location.origin !== "null" ? location.origin : "http://dsh.internal";
    }
    async function entryFiles(entry, prefix = "") {
      if (entry.isFile) return [[prefix + entry.name, await new Promise((resolve, reject) => entry.file(resolve, reject))]];
      if (!entry.isDirectory) return [];
      const reader = entry.createReader();
      const children = [];
      while (true) {
        const batch = await new Promise((resolve, reject) => reader.readEntries(resolve, reject));
        if (!batch.length) break;
        children.push(...batch);
      }
      const output = [];
      for (const child of children) output.push(...await entryFiles(child, `${prefix}${entry.name}/`));
      return output;
    }
    async function filesFromDataTransfer(transfer) {
      const entries = [...transfer.items].map((item) => item.webkitGetAsEntry?.()).filter(Boolean);
      if (entries.some((entry) => entry.isDirectory)) {
        const pairs = [];
        for (const entry of entries) pairs.push(...await entryFiles(entry));
        return pairs;
      }
      return [...transfer.files].map((file) => [file.webkitRelativePath || file.name, file]);
    }
    async function archiveFromPairs(pairs, onProgress) {
      if (pairs.length === 1 && /\.(zip|jsonl)$/i.test(pairs[0][1].name)) return pairs[0][1];
      const entries = {};
      for (let index = 0; index < pairs.length; index += 1) {
        const [path, file] = pairs[index];
        entries[path.replaceAll("\\", "/")] = new Uint8Array(await file.arrayBuffer());
        onProgress?.({ stage: "reading", percent: Math.round((index + 1) / pairs.length * 25) });
      }
      onProgress?.({ stage: "packing", percent: 30 });
      return new File([zipSync(entries, { level: 6 })], "dsh-session-folder.zip", { type: "application/zip" });
    }
    function upload(file, workspaceId, t, onProgress) {
      return new Promise((resolve, reject) => {
        const url = new URL("/api/session.import", hostBase());
        url.searchParams.set("workspaceId", workspaceId);
        url.searchParams.set("progress", "true");
        const request = new XMLHttpRequest();
        let consumed = 0;
        let finalResult;
        request.open("POST", url);
        request.setRequestHeader("content-type", "application/octet-stream");
        request.setRequestHeader("x-dsh-filename", encodeURIComponent(file.name));
        request.upload.onprogress = (event) => {
          if (event.lengthComputable) onProgress?.({ stage: "uploading", percent: 30 + Math.round(event.loaded / event.total * 30) });
        };
        request.onprogress = () => {
          const complete = request.responseText.slice(consumed).split("\n");
          consumed = request.responseText.length - complete.at(-1).length;
          for (const line of complete.slice(0, -1)) {
            if (!line) continue;
            try {
              const message = JSON.parse(line);
              if (message.type === "progress") onProgress?.(message);
              else if (message.type === "result") finalResult = message.result;
              else if (message.type === "error") reject(new Error(message.error));
            } catch (reason) {
              reject(reason);
            }
          }
        };
        request.onerror = () => reject(new Error(t("uploadFailed", { status: request.status || 0 })));
        request.onload = () => {
          request.onprogress();
          if (request.status >= 200 && request.status < 300 && finalResult) resolve(finalResult);
          else if (!finalResult) reject(new Error(t("uploadFailed", { status: request.status })));
        };
        request.send(file);
      });
    }
    function ImportApp({ ctx, wide = true, useWorkspaces, t }) {
      const [open, setOpen] = (0, import_react.useState)(false);
      const [pairs, setPairs] = (0, import_react.useState)(null);
      const [phase, setPhase] = (0, import_react.useState)("idle");
      const [error, setError] = (0, import_react.useState)("");
      const [result, setResult] = (0, import_react.useState)(null);
      const [over, setOver] = (0, import_react.useState)(null);
      const [progress, setProgress] = (0, import_react.useState)({ stage: "reading", percent: 0 });
      const fileRef = (0, import_react.useRef)(null);
      const folderRef = (0, import_react.useRef)(null);
      const workspaces = useWorkspaces((state) => state.items);
      const reset = () => {
        setPairs(null);
        setPhase("idle");
        setError("");
        setResult(null);
        setOver(null);
        setProgress({ stage: "reading", percent: 0 });
        if (fileRef.current) fileRef.current.value = "";
        if (folderRef.current) folderRef.current.value = "";
      };
      const openDialog = () => {
        reset();
        setOpen(true);
      };
      const closeDialog = () => {
        setOpen(false);
        reset();
      };
      const pickFiles = (list) => {
        const next = [...list].map((file) => [file.webkitRelativePath || file.name, file]);
        if (next.length) {
          setPairs(next);
          setOpen(true);
          setError("");
          setResult(null);
        }
      };
      const updateProgress = (next) => setProgress((current) => ({ ...current, ...next, percent: Math.max(current.percent, next.percent ?? current.percent) }));
      const importTo = async (workspaceId, sourcePairs = pairs) => {
        if (!sourcePairs?.length) {
          setError(t("missingSource"));
          return;
        }
        setPhase("importing");
        setError("");
        setResult(null);
        setOver(null);
        setProgress({ stage: "reading", percent: 2 });
        try {
          const archive = await archiveFromPairs(sourcePairs, updateProgress);
          const imported = await upload(archive, workspaceId, t, updateProgress);
          setProgress({ stage: "sessions", percent: 100, completed: imported.sessionIds.length, total: imported.sessionIds.length });
          setResult(imported);
          setPhase("done");
          await Promise.allSettled([ctx.sessions.refresh?.(), ctx.workspaces.refresh?.()]);
        } catch (reason) {
          setError(reason instanceof Error ? reason.message : String(reason));
          setPhase("idle");
        }
      };
      (0, import_react.useEffect)(() => {
        const hasFiles = (event) => [...event.dataTransfer?.types || []].includes("Files");
        const enter = (event) => {
          if (hasFiles(event)) setOpen(true);
        };
        const overEvent = (event) => {
          if (!hasFiles(event)) return;
          event.preventDefault();
          event.dataTransfer.dropEffect = "copy";
        };
        const drop = async (event) => {
          if (!hasFiles(event)) return;
          event.preventDefault();
          const target = event.target?.closest?.(".dsm-target") ?? document.elementFromPoint(event.clientX, event.clientY)?.closest?.(".dsm-target");
          try {
            const dropped = await filesFromDataTransfer(event.dataTransfer);
            setPairs(dropped);
            setOpen(true);
            setError("");
            setResult(null);
            if (target?.dataset.workspaceId) await importTo(target.dataset.workspaceId, dropped);
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : String(reason));
            setOpen(true);
          }
        };
        document.addEventListener("dragenter", enter, true);
        document.addEventListener("dragover", overEvent, true);
        document.addEventListener("drop", drop, true);
        return () => {
          document.removeEventListener("dragenter", enter, true);
          document.removeEventListener("dragover", overEvent, true);
          document.removeEventListener("drop", drop, true);
        };
      }, [pairs, t]);
      const progressKey = progress.stage === "reading" ? "progressReading" : progress.stage === "packing" ? "progressPacking" : progress.stage === "uploading" ? "progressUploading" : progress.stage === "parsing" ? "progressParsing" : progress.stage === "validated" ? "progressValidating" : progress.stage === "attachments" ? "progressAttachments" : progress.stage === "sessions" ? "progressSessions" : "importing";
      const progressText = t(progressKey, { done: progress.completed ?? 0, total: progress.total ?? 0 });
      return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dsm-button", title: t("buttonTitle"), onClick: openDialog, children: wide ? t("button") : "\u21E9" }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { ref: fileRef, hidden: true, type: "file", accept: ".zip,.jsonl,application/zip", onChange: (event) => pickFiles(event.target.files) }),
        /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", { ref: folderRef, hidden: true, type: "file", webkitdirectory: "", directory: "", multiple: true, onChange: (event) => pickFiles(event.target.files) }),
        open && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsm-overlay", onMouseDown: (event) => {
          if (event.target === event.currentTarget && phase !== "importing") closeDialog();
        }, children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsm-panel", role: "dialog", "aria-modal": "true", "aria-label": t("title"), children: [
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsm-head", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: t("title") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dsm-button", disabled: phase === "importing", onClick: closeDialog, children: t("close") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsm-hint", children: t("intro") }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsm-actions", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dsm-button", disabled: phase === "importing", onClick: () => fileRef.current?.click(), children: t("chooseArchive") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dsm-button", disabled: phase === "importing", onClick: () => folderRef.current?.click(), children: t("chooseFolder") })
          ] }),
          /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsm-hint", children: pairs?.length ? t("selected", { n: pairs.length }) : t("noneSelected") }),
          phase === "importing" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsm-status", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: t("importing") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsm-progress", children: [
              /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsm-progressLabel", children: [
                /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: progressText }),
                /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
                  progress.percent,
                  "%"
                ] })
              ] }),
              /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsm-progressTrack", children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsm-progressFill", style: { width: `${progress.percent}%` } }) })
            ] })
          ] }) : result ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { className: "dsm-status dsm-success", children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: t("success") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: result.cloned ? t("clone") : t("original") }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("summary", { n: result.sessionIds.length, id: result.rootSessionId }) }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", { className: "dsm-button", onClick: () => {
              ctx.sessions.open(result.rootSessionId);
              closeDialog();
            }, children: t("open") })
          ] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "dsm-targets", children: workspaces.map((workspace) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", { "data-workspace-id": workspace.workspaceId, className: "dsm-target", "data-over": over === workspace.workspaceId, onDragEnter: (event) => {
            event.preventDefault();
            setOver(workspace.workspaceId);
          }, onDragOver: (event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
            setOver(workspace.workspaceId);
          }, onDragLeave: (event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setOver(null);
          }, onClick: () => importTo(workspace.workspaceId), children: [
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: workspace.title }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: workspace.path }),
            /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("dropHere") })
          ] }, workspace.workspaceId)) }),
          error && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { className: "dsm-error", children: error })
        ] }) })
      ] });
    }
    var inject = ["slots", "locale", "sessions", "workspaces"];
    function apply(ctx) {
      injectCss();
      ctx.effect(() => ctx.locale.register(NS, dictionaries));
      ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({ name: "sidebar.footer.action", id: "session-migrator", order: 50, locale: NS, inject: () => ({ ctx }) }, ImportApp));
    }

    return module.exports;
  }
});
