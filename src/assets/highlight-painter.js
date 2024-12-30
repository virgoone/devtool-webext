"use strict"
;(() => {
  var h = ["pos", "color", "radius"],
    g = (e, l) => {
      let n = e.get(l)
      return typeof n != "string" ? n?.[0] : n
    }
  function f(e) {
    return `${e[0].toUpperCase()}${e.slice(1)}`
  }
  function m(e) {
    let l = [],
      n = h.reduce((r, c) => ((r[c] = `--${e}${f(c)}`), l.push(r[c]), r), {})
    return class {
      static get inputProperties() {
        return l
      }
      paint(r, c, p) {
        let u = g(p, n.pos)?.split(",").map(Number),
          o = +(g(p, n.radius) || 4),
          y = g(p, n.color),
          P = u
            ? new Array(u.length / 4)
                .fill(0)
                .map((S, s) => u.slice(s * 4, s * 4 + 4))
            : []
        if (u && y) {
          r.fillStyle = y
          for (let S of P) {
            r.save()
            let [s, t, a, i] = S
            a < 2 * o && (o = a / 2),
              i < 2 * o && (o = i / 2),
              r.beginPath(),
              r.moveTo(s + o, t),
              r.arcTo(s + a, t, s + a, t + i, o),
              r.arcTo(s + a, t + i, s, t + i, o),
              r.arcTo(s, t + i, s, t, o),
              r.arcTo(s, t, s + a, t, o),
              r.closePath(),
              r.fill(),
              r.restore()
          }
        }
      }
    }
  }
  "registerPaint" in globalThis &&
    ["highlightSentence", "highlightWord"].forEach((e) => {
      globalThis.registerPaint(e, m(e))
    })
})()
