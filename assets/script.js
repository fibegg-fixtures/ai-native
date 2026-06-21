/*
 * faq.fibe.gg — page behavior
 *
 *   1. Stamp the current year in the footer.
 *   2. Mobile drawer: open/close + ESC + click-outside.
 *   3. Query terminals: each FAQ types its question ($ …) as it scrolls into
 *      view, then an "Ask" button on the > _ prompt types out the answer.
 *      Progressive enhancement over the markdown-built content — with JS off,
 *      questions and answers are simply shown (see .qterm CSS fallback).
 */

(() => {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onReady = (fn) =>
    document.readyState === "loading"
      ? document.addEventListener("DOMContentLoaded", fn, { once: true })
      : fn();

  onReady(() => {
    // ── 1. Footer year ────────────────────────────────────────────
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // ── 2. Mobile drawer ──────────────────────────────────────────
    const drawer = document.querySelector("[data-drawer]");
    const drawerToggle = document.querySelector("[data-drawer-toggle]");
    if (drawer && drawerToggle) {
      const openDrawer = () => {
        drawer.hidden = false;
        drawerToggle.setAttribute("aria-expanded", "true");
        document.body.classList.add("is-drawer-open");
      };
      const closeDrawer = () => {
        drawer.hidden = true;
        drawerToggle.setAttribute("aria-expanded", "false");
        document.body.classList.remove("is-drawer-open");
      };
      drawerToggle.addEventListener("click", () =>
        drawer.hidden ? openDrawer() : closeDrawer()
      );
      drawer.addEventListener("click", (e) => {
        const t = e.target;
        if (t instanceof Element && t.closest("[data-drawer-close]")) closeDrawer();
        else if (t instanceof Element && t.closest("a")) closeDrawer();
      });
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !drawer.hidden) {
          closeDrawer();
          drawerToggle.focus();
        }
      });
    }

    // ── Active-section highlight (scroll-spy) ─────────────────────
    const secLinks = Array.from(
      document.querySelectorAll(".nav__sec-link, .drawer__link")
    ).filter((a) => (a.getAttribute("href") || "").startsWith("#"));
    const spied = secLinks
      .map((a) => document.getElementById(a.getAttribute("href").slice(1)))
      .filter((el, i, arr) => el && arr.indexOf(el) === i);
    if (spied.length && "IntersectionObserver" in window) {
      const setActive = (id) =>
        secLinks.forEach((a) =>
          a.classList.toggle("is-active", a.getAttribute("href") === "#" + id)
        );
      const spy = new IntersectionObserver(
        (entries) =>
          entries.forEach((e) => {
            if (e.isIntersecting) setActive(e.target.id);
          }),
        { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
      );
      spied.forEach((el) => spy.observe(el));
    }

    // ── 3. Query terminals ────────────────────────────────────────
    const terminals = Array.from(document.querySelectorAll("[data-qterm]"));

    // Type `text` into `el` one chunk at a time. Returns a fn that fast-
    // forwards to the end (used to let a click skip a long answer).
    const typeInto = (el, text, { speed = 28, chunk = 1, done } = {}) => {
      let i = 0;
      let timer = 0;
      let finished = false;
      const finish = () => {
        if (finished) return;
        finished = true;
        clearTimeout(timer);
        el.textContent = text;
        if (done) done();
      };
      const tick = () => {
        if (finished) return;
        i = Math.min(text.length, i + chunk);
        el.textContent = text.slice(0, i);
        if (i < text.length) timer = setTimeout(tick, speed);
        else finish();
      };
      tick();
      return finish;
    };

    // Build a readable plain-text version of the answer for the typing pass
    // (paragraphs separated by blank lines, list items as "- " lines). The
    // formatted HTML (.qterm__a) is swapped in once typing completes.
    const answerPlain = (aEl) =>
      Array.from(aEl.children)
        .map((node) =>
          node.tagName === "UL"
            ? Array.from(node.querySelectorAll("li"))
                .map((li) => "- " + li.textContent.replace(/\s+/g, " ").trim())
                .join("\n")
            : node.textContent.replace(/\s+/g, " ").trim()
        )
        .filter(Boolean)
        .join("\n\n");

    terminals.forEach((term) => {
      const qEl = term.querySelector(".qterm__q");
      const aEl = term.querySelector(".qterm__a");
      const typedEl = term.querySelector(".qterm__typed");
      const askBtn = term.querySelector("[data-ask]");      // the "y" key
      const dismissBtn = term.querySelector("[data-dismiss]"); // the "n" key
      if (!qEl || !aEl || !typedEl || !askBtn) return;

      const question = qEl.textContent.trim();
      const answerText = answerPlain(aEl);
      const answerLinks = Array.from(aEl.querySelectorAll("a"));

      term.classList.add("is-enhanced");
      term.setAttribute("tabindex", "0"); // the section itself is selectable
      // Hidden answer links shouldn't be in the tab order until revealed.
      answerLinks.forEach((a) => a.setAttribute("tabindex", "-1"));

      // "y" / Enter → reveal. Guarded so click, Enter and repeats are all safe.
      const reveal = () => {
        if (term.classList.contains("is-open") || term.classList.contains("is-typing-a")) return;
        term.classList.remove("is-ready", "is-dismissed");
        const open = () => {
          term.classList.add("is-open");
          answerLinks.forEach((a) => a.removeAttribute("tabindex")); // now reachable
        };
        if (reduceMotion) {
          open();
          return;
        }
        term.classList.add("is-typing-a");
        const finish = () => {
          term.classList.remove("is-typing-a");
          open();
        };
        const skip = typeInto(typedEl, answerText, {
          speed: 16,
          chunk: Math.max(1, Math.round(answerText.length / 140)),
          done: finish,
        });
        // Once it gets going, a click anywhere on the terminal completes it.
        const onClick = () => {
          skip();
          term.removeEventListener("click", onClick);
        };
        setTimeout(() => term.addEventListener("click", onClick), 60);
      };

      // "n" / Escape → toggle the dimmed "dismissed" state. Non-destructive.
      const dismiss = () => {
        const dismissed = term.classList.toggle("is-dismissed");
        term.classList.toggle("is-ready", !dismissed);
      };

      askBtn.addEventListener("click", reveal);
      if (dismissBtn) {
        dismissBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          dismiss();
        });
      }

      // Keyboard: Enter shows the answer on the selected (focused) section;
      // Escape dismisses the prompt.
      term.addEventListener("keydown", (e) => {
        if (
          e.key === "Enter" &&
          (term.classList.contains("is-ready") || term.classList.contains("is-dismissed"))
        ) {
          e.preventDefault();
          reveal();
        } else if (e.key === "Escape" && term.classList.contains("is-ready")) {
          dismiss();
        }
      });

      // Reduced motion: no typing — show the question + prompt immediately.
      if (reduceMotion) {
        term.classList.add("is-ready");
        return;
      }

      // Type the question, then expose the > show answer? [y/n] prompt.
      qEl.textContent = "";
      const typeQuestion = () => {
        term.classList.add("is-typing-q");
        typeInto(qEl, question, {
          speed: 30,
          done: () => {
            term.classList.remove("is-typing-q");
            term.classList.add("is-ready");
          },
        });
      };

      if ("IntersectionObserver" in window) {
        const io = new IntersectionObserver(
          (entries) => {
            entries.forEach((e) => {
              if (e.isIntersecting) {
                io.unobserve(term);
                typeQuestion();
              }
            });
          },
          { threshold: 0.4, rootMargin: "0px 0px -10% 0px" }
        );
        io.observe(term);
      } else {
        typeQuestion();
      }
    });
  });
})();
