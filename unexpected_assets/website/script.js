document.addEventListener("DOMContentLoaded", async () => {
const tb = document.getElementById("tb"),
esc = s => s.replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])),
REG = /unexpected:addcmd\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*[^,]+,\s*(nil|\{[^}]*\})\s*,\s*(nil|\{[^}]*\})/g
let filter = "all"
const text = await (await fetch("https://raw.githubusercontent.com/audio-wav/unexpected-cmd/main/source")).text()
let m, i = 0
const parseTable = t =>
  t ? [...t.matchAll(/"([^"]+)"/g)].map(x => x[1]) : []
while ((m = REG.exec(text))) {
  let [_, rawName, d, aRaw, uRaw] = m
  const isClient = /^\[CLIENT\]/i.test(rawName)
  const n = rawName.replace(/^\[CLIENT\]\s*/i, "")
  const aliases = aRaw !== "nil" ? parseTable(aRaw) : []
  const args    = uRaw !== "nil" ? parseTable(uRaw) : []
  const badge = isClient ? `<span class="cl">client</span>` : ""
  const aliasesHTML = aliases.length
    ? `<div class="tags">${aliases.map(x=>`<span class="tag ta">${esc(x)}</span>`).join("")}</div>`
    : `<span class="tn">—</span>`
  const argsHTML = args.length
    ? `<div class="tags">${args.map(x=>`<span class="tag tg">[${esc(x)}]</span>`).join("")}</div>`
    : `<span class="tn">—</span>`
  const tr = document.createElement("tr")
  tr.dataset.n = n.toLowerCase()
  tr.dataset.d = d.toLowerCase()
  tr.dataset.a = aliases.join(" ").toLowerCase()
  tr.dataset.g = args.join(" ").toLowerCase()
  tr.dataset.c = isClient ? "1" : "0"
  tr.innerHTML = `
    <td><div class="cc"><span class="cn">${esc(n)}</span>${badge}</div></td>
    <td><span class="desc">${esc(d)}</span></td>
    <td>${aliasesHTML}</td>
    <td>${argsHTML}</td>
  `
  tb.appendChild(tr)
  i++
}
document.getElementById("ct").textContent = i
const upd = a => {
  const q = document.getElementById("q").value.toLowerCase()
  let shown = 0

  ;[...tb.children].forEach((tr, i) => {
    const ok =
      !q ||
      tr.dataset.n.includes(q) ||
      tr.dataset.d.includes(q) ||
      tr.dataset.a.includes(q) ||
      tr.dataset.g.includes(q)
    const show =
      filter === "client"
        ? tr.dataset.c === "1" && ok
        : ok

    tr.classList.toggle("h", !show)
    if (show) {
      shown++
      if (a) {
        tr.style.animation = "none"; tr.offsetHeight
        tr.style.animation = ""
        tr.style.animationDelay = i * 15 + "ms"
        tr.style.animationName = "fadeUp"
      }
    }
  })
  document.getElementById("cs").textContent = shown
  document.getElementById("es").style.display = shown ? "none" : "block"
}
document.getElementById("q").oninput = () => upd(0)
document.querySelectorAll(".fb").forEach(b =>
  b.onclick = () => {
    document.querySelectorAll(".fb").forEach(x=>x.classList.remove("on"))
    b.classList.add("on")
    filter = b.dataset.f
    upd(1)
  }
)
upd(0)
})
