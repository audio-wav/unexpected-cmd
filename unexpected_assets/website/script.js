document.addEventListener("DOMContentLoaded", async () => {
  const tb = document.getElementById("tb"),
  esc = s => s.replace(/[&<>]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;"}[c])),
  REG = /unexpected:addcmd\(\s*"([^"]+)"\s*,\s*"([^"]+)"\s*,\s*function[\s\S]*?end\s*(?:,\s*(nil|\{[\s\S]*?\}))?(?:,\s*(nil|\{[\s\S]*?\}))?\s*\)/g
  let filter = "all"
  const text = await (await fetch("https://raw.githubusercontent.com/audio-wav/unexpected-cmd/main/source")).text()
  let m, i = 0
  const seen = new Set()
  const parseTable = t =>
    t ? [...t.matchAll(/"([^"]+)"/g)].map(x => x[1]) : []
  const makeRow = (name, desc, isClient, aliases, args) => {
    const tr = document.createElement("tr")
    tr.dataset.n = name.toLowerCase()
    tr.dataset.d = desc.toLowerCase()
    tr.dataset.a = aliases.join(" ").toLowerCase()
    tr.dataset.g = args.join(" ").toLowerCase()
    tr.dataset.c = isClient ? "1" : "0"
    const badge = isClient ? `<span class="cl">client</span>` : ""
    tr.innerHTML = `
      <td><div class="cc"><span class="cn">${esc(name)}</span>${badge}</div></td>
      <td><span class="desc">${esc(desc)}</span></td>
      <td>${
        aliases.length
          ? `<div class="tags">${aliases.map(x=>`<span class="tag ta">${esc(x)}</span>`).join("")}</div>`
          : `<span class="tn">—</span>`
      }</td>
      <td>${
        args.length
          ? `<div class="tags">${args.map(x=>`<span class="tag tg">[${esc(x)}]</span>`).join("")}</div>`
          : `<span class="tn">—</span>`
      }</td>
    `
    tb.appendChild(tr)
    i++
  }
  while ((m = REG.exec(text))) {
    let [_, rawName, d, aRaw, uRaw] = m
    const isClient = /^\[CLIENT\]/i.test(rawName)
    const n = rawName.replace(/^\[CLIENT\]\s*/i, "")
    const key = n.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    const aliases = (!aRaw || aRaw === "nil") ? [] : parseTable(aRaw)
    const args = (!uRaw || uRaw === "nil") ? [] : parseTable(uRaw)
    makeRow(n, d, isClient, aliases, args)
    const hasBool = /["']?(true|false)["']?/i.test(uRaw || "")
    if (hasBool && !key.startsWith("un")) {
      const unName = "un" + n
      const unKey = unName.toLowerCase()
      if (!seen.has(unKey)) {
        seen.add(unKey)
        makeRow(unName, "Disable " + n, isClient, [], [])
      }
    }
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