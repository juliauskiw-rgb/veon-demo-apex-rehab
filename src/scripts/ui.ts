// Small progressive enhancements. Everything works as plain links and visible content without this script.
const mqPhone = window.matchMedia("(max-width: 47.99rem)");
const mqDesktop = window.matchMedia("(min-width: 75rem)");

/* ---------- menu (below desktop) ---------- */
const burger = document.querySelector<HTMLButtonElement>("[data-burger]");
const nav = document.querySelector<HTMLElement>("[data-nav]");
const mbar = document.querySelector<HTMLElement>("[data-mbar]");

function setMenu(open: boolean) {
  if (!burger || !nav) return;
  burger.setAttribute("aria-expanded", String(open));
  burger.setAttribute("aria-label", open ? "Закрити меню" : "Відкрити меню");
  nav.classList.toggle("is-open", open);
  mbar?.classList.toggle("is-hidden", open);
}
burger?.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
nav?.addEventListener("click", (e) => {
  if ((e.target as HTMLElement).closest("a")) setMenu(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && burger?.getAttribute("aria-expanded") === "true") {
    setMenu(false);
    burger.focus();
  }
});
mqDesktop.addEventListener("change", () => setMenu(false));

/* ---------- "Записатися" → channel sheet ---------- */
const sheet = document.querySelector<HTMLDialogElement>("[data-sheet]");
if (sheet && typeof sheet.showModal === "function") {
  let opener: HTMLElement | null = null;
  document.querySelectorAll<HTMLAnchorElement>("[data-book]").forEach((a) => {
    a.setAttribute("aria-haspopup", "dialog");
    a.addEventListener("click", (e) => {
      e.preventDefault();
      opener = a;
      setMenu(false);
      sheet.classList.toggle("is-write", a.dataset.book === "write");
      sheet.showModal();
    });
  });
  sheet.querySelector("[data-sheet-close]")?.addEventListener("click", () => sheet.close());
  sheet.addEventListener("click", (e) => { if (e.target === sheet) sheet.close(); });
  sheet.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => sheet.close()));
  sheet.addEventListener("close", () => opener?.focus());
}

/* ---------- conditions: accordion on phones, all fields open on wider screens ---------- */
const toggles = Array.from(document.querySelectorAll<HTMLButtonElement>("[data-acc]"));
function panelOf(btn: HTMLButtonElement) { return document.getElementById(btn.getAttribute("aria-controls") || ""); }
function setAcc(btn: HTMLButtonElement, open: boolean) {
  btn.setAttribute("aria-expanded", String(open));
  const p = panelOf(btn);
  if (p) p.hidden = !open;
}
function syncAcc() {
  toggles.forEach((b, i) => {
    if (mqPhone.matches) { b.disabled = false; setAcc(b, i === 0); }
    else { setAcc(b, true); b.disabled = true; }
  });
}
toggles.forEach((b) => b.addEventListener("click", () => setAcc(b, b.getAttribute("aria-expanded") !== "true")));
if (toggles.length) { syncAcc(); mqPhone.addEventListener("change", syncAcc); }

/* ---------- prices: tabs ---------- */
document.querySelectorAll<HTMLElement>("[data-tabs]").forEach((root) => {
  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[role="tab"]'));
  const panels = tabs.map((t) => document.getElementById(t.getAttribute("aria-controls") || "")!);
  root.classList.add("is-tabbed");
  function select(i: number, focus = false) {
    tabs.forEach((t, j) => {
      const on = i === j;
      t.setAttribute("aria-selected", String(on));
      t.tabIndex = on ? 0 : -1;
      panels[j].hidden = !on;
    });
    if (focus) tabs[i].focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => select(i));
    t.addEventListener("keydown", (e) => {
      const k = e.key;
      if (k === "ArrowRight" || k === "ArrowLeft" || k === "Home" || k === "End") {
        e.preventDefault();
        const n = k === "Home" ? 0 : k === "End" ? tabs.length - 1 : (i + (k === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
        select(n, true);
      }
    });
  });
  select(0);
  // jump from "Після травм і операцій" straight to the courses tab
  document.querySelectorAll<HTMLAnchorElement>(`a[href="#${root.id}"][data-tab]`).forEach((a) => {
    a.addEventListener("click", () => {
      const i = tabs.findIndex((t) => t.id === a.dataset.tab);
      if (i >= 0) select(i);
    });
  });
});

/* ---------- hero direction links open their field in the phone accordion ---------- */
document.querySelectorAll<HTMLAnchorElement>('a[href^="#cond-"]').forEach((a) => {
  a.addEventListener("click", () => {
    const id = a.getAttribute("href")!.slice(1);
    const btn = document.querySelector<HTMLButtonElement>(`#${id} [data-acc]`);
    if (btn && mqPhone.matches) setAcc(btn, true);
  });
});

/* ---------- "Розділ у розробці": the hint also opens on tap / click ---------- */
const futures = document.querySelectorAll<HTMLElement>("[data-future]");
futures.forEach((el, i) => {
  const note = el.querySelector<HTMLElement>(".future-link__note");
  if (note) {
    note.id = note.id || `future-note-${i}`;
    el.setAttribute("aria-describedby", note.id);
  }
  el.addEventListener("click", (e) => {
    e.stopPropagation();
    const was = el.classList.contains("is-tip");
    futures.forEach((f) => f.classList.remove("is-tip"));
    if (!was) el.classList.add("is-tip");
  });
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); el.click(); }
  });
});
document.addEventListener("click", () => futures.forEach((f) => f.classList.remove("is-tip")));
