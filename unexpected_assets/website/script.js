document.addEventListener("DOMContentLoaded", async () => {
const tb = document.getElementById("tb"),
esc = s => s.replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])),
const REG = /unexpected:addcmd\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*[^,]+(?:\s*,\s*(\{[^}]*\}))?(?:\s*,\s*(\{[^}]*\}))?/g
let filter = "all"
const text = await (await fetch("https://raw.githubusercontent.com/audio-wav/unexpected-cmd/main/source")).text()
let m, i = 0
const parseTable = t =>
  t ? [...t.matchAll(/"([^"]+)"/g)].map(x => x[1]) : []

while ((m = REG.exec(text))) {
  const [_, n, d, a, u] = m
  const aliases = parseTable(a)
  const usage = parseTable(u)

  tb.innerHTML += `
  <tr data-n="${n.toLowerCase()}" data-d="${d.toLowerCase()}" data-c="0">
    <td><div class="cc"><span class="cn">${esc(n)}</span></div></td>
    <td><span class="desc">${esc(d)}</span></td>
    <td><span class="tn">${aliases.join(", ") || "—"}</span></td>
    <td><span class="tn">${usage.join(" ") || "—"}</span></td>
  </tr>`
}

document.getElementById("ct").textContent = i
const upd = a => {
  const q = document.getElementById("q").value.toLowerCase()
  let shown = 0

  ;[...tb.children].forEach((tr, i) => {
    const ok = !q || tr.dataset.n.includes(q) || tr.dataset.d.includes(q)
    const show = filter === "client" ? tr.dataset.c === "1" && ok : ok

    tr.classList.toggle("h", !show)

    if (show) {
      shown++
      if (a) {
        tr.style.animation = "none"; tr.offsetHeight
        tr.style.animation = ""; tr.style.animationDelay = i*15+"ms"
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
