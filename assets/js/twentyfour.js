(() => {
  const OPS = ["+", "−", "×", "÷"];
  const STORAGE_KEY = "zhiqi-24-solved";
  const FALLBACK_HANDS = [
    [1, 3, 4, 6],
    [8, 3, 3, 8],
    [5, 5, 5, 1],
    [2, 5, 7, 8],
    [1, 6, 6, 8],
    [2, 3, 4, 12],
    [4, 4, 7, 13],
  ];

  const gcd = (a, b) => {
    a = Math.abs(Math.trunc(a));
    b = Math.abs(Math.trunc(b));
    while (b) {
      const t = a % b;
      a = b;
      b = t;
    }
    return a || 1;
  };

  const frac = (n, d = 1) => {
    n = Math.trunc(n);
    d = Math.trunc(d);
    if (d === 0) return null;
    if (d < 0) {
      n = -n;
      d = -d;
    }
    const g = gcd(n, d);
    return { n: n / g, d: d / g };
  };

  const fadd = (a, b) => frac(a.n * b.d + b.n * a.d, a.d * b.d);
  const fsub = (a, b) => frac(a.n * b.d - b.n * a.d, a.d * b.d);
  const fmul = (a, b) => frac(a.n * b.n, a.d * b.d);
  const fdiv = (a, b) => (b.n === 0 ? null : frac(a.n * b.d, a.d * b.n));

  const applyOp = (a, op, b) => {
    if (op === 0) return fadd(a, b);
    if (op === 1) return fsub(a, b);
    if (op === 2) return fmul(a, b);
    return fdiv(a, b);
  };

  const is24 = (f) => f && f.n === 24 * f.d;

  const fmt = (f) => {
    if (!f) return "";
    if (f.d === 1) return String(f.n);
    const sign = f.n < 0 ? "−" : "";
    return `${sign}${Math.abs(f.n)}/${f.d}`;
  };

  const fmtHtml = (f) => {
    if (!f) return "";
    if (f.d === 1) return String(f.n);
    const sign = f.n < 0 ? "−" : "";
    return `${sign}<span class="tf-frac"><span class="num">${Math.abs(f.n)}</span><span class="den">${f.d}</span></span>`;
  };

  const shuffle = (items) => {
    const arr = items.slice();
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const cloneState = (state) => ({
    values: state.values.map((v) => (v ? { n: v.n, d: v.d } : null)),
    focus: state.focus,
    op: state.op,
  });

  const liveCount = (values) => values.filter(Boolean).length;

  const solveExprs = (nums) => {
    const sols = [];
    const seen = new Set();

    const rec = (items) => {
      if (items.length === 1) {
        if (is24(items[0].val)) sols.push(items[0].expr);
        return;
      }
      const key = items
        .map((x) => `${x.val.n}/${x.val.d}`)
        .sort()
        .join(",");
      if (seen.has(key)) return;
      seen.add(key);

      for (let i = 0; i < items.length; i += 1) {
        for (let j = 0; j < items.length; j += 1) {
          if (i === j) continue;
          for (let op = 0; op < 4; op += 1) {
            const val = applyOp(items[i].val, op, items[j].val);
            if (!val) continue;
            const expr = `(${items[i].expr}${OPS[op]}${items[j].expr})`;
            const next = [];
            for (let k = 0; k < items.length; k += 1) {
              if (k !== i && k !== j) next.push(items[k]);
            }
            next.push({ val, expr });
            rec(next);
          }
        }
      }
    };

    rec(nums.map((n) => ({ val: frac(n), expr: String(n) })));
    return [...new Set(sols)].slice(0, 12);
  };

  const randomPuzzle = (maxN) => {
    for (let tries = 0; tries < 400; tries += 1) {
      const nums = shuffle(Array.from({ length: 4 }, () => 1 + Math.floor(Math.random() * maxN)));
      const sols = solveExprs(nums);
      if (sols.length) return { nums, sols };
    }
    for (const hand of shuffle(FALLBACK_HANDS)) {
      if (hand.some((n) => n > maxN)) continue;
      const nums = shuffle(hand);
      const sols = solveExprs(nums);
      if (sols.length) return { nums, sols };
    }
    const nums = shuffle([1, 3, 4, 6]);
    return { nums, sols: solveExprs(nums) };
  };

  const board = document.getElementById("tf-board");
  if (!board) return;

  const numBtns = [...board.querySelectorAll(".tf-num")];
  const opBtns = [...board.querySelectorAll(".tf-op")];
  const undoBtn = board.querySelector(".tf-undo");
  const redoBtn = board.querySelector(".tf-redo");
  const hintBtn = board.querySelector(".tf-hint");
  const nextBtn = board.querySelector(".tf-refresh");
  const overlay = document.getElementById("tf-overlay");
  const overlayTitle = document.getElementById("tf-overlay-title");
  const overlayList = document.getElementById("tf-overlay-list");
  const overlayClose = document.getElementById("tf-overlay-close");
  const solvedEl = document.getElementById("tf-solved");
  const statusEl = document.getElementById("tf-status");
  const rangeBtns = [...document.querySelectorAll(".tf-range-btn")];

  let maxN = 13;
  let puzzle = { nums: [1, 3, 4, 6], sols: [] };
  let values = [null, null, null, null];
  let focus = -1;
  let op = -1;
  let past = [];
  let future = [];
  let locked = false;
  let solved = Number(localStorage.getItem(STORAGE_KEY) || 0);

  const setStatus = (text) => {
    statusEl.textContent = text || "";
  };

  const pushPast = () => {
    past.push({
      values: values.map((v) => (v ? { n: v.n, d: v.d } : null)),
      focus,
      op,
    });
    future = [];
  };

  const render = () => {
    solvedEl.textContent = String(solved);
    const remaining = liveCount(values);
    numBtns.forEach((btn, i) => {
      const val = values[i];
      btn.classList.toggle("is-empty", !val);
      btn.classList.toggle("is-focus", i === focus && !!val);
      btn.classList.toggle("is-fail", remaining === 1 && val && !is24(val));
      btn.classList.toggle("is-win", remaining === 1 && is24(val));
      btn.innerHTML = val ? fmtHtml(val) : "";
      btn.title = val ? fmt(val) : "";
    });
    opBtns.forEach((btn) => {
      btn.classList.toggle("is-focus", Number(btn.dataset.op) === op);
    });
    undoBtn.classList.toggle("is-disabled", past.length === 0 && op < 0);
    redoBtn.classList.toggle("is-disabled", future.length === 0);
  };

  const maybeFinish = () => {
    const remaining = values.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
    if (remaining.length !== 1) return;
    const last = values[remaining[0]];
    if (is24(last)) {
      locked = true;
      setStatus("That's 24. Next puzzle!");
      solved += 1;
      localStorage.setItem(STORAGE_KEY, String(solved));
      window.setTimeout(() => {
        locked = false;
        newPuzzle();
      }, 700);
    } else {
      setStatus("Not 24 yet. Undo and try again.");
    }
  };

  const clickNum = (slot) => {
    if (locked || !values[slot]) return;
    if (focus === slot) return;
    if (op < 0 || focus < 0 || !values[focus]) {
      focus = slot;
      render();
      return;
    }
    if (op === 3 && values[slot].n === 0) {
      setStatus("Can't divide by zero.");
      return;
    }
    const result = applyOp(values[focus], op, values[slot]);
    if (!result) return;
    pushPast();
    values[slot] = result;
    values[focus] = null;
    focus = slot;
    op = -1;
    setStatus("");
    render();
    maybeFinish();
  };

  const clickOp = (opId) => {
    if (locked || focus < 0 || !values[focus] || liveCount(values) < 2) return;
    op = opId;
    render();
  };

  const undo = () => {
    if (locked) return;
    if (op >= 0) {
      op = -1;
      render();
      return;
    }
    if (!past.length) return;
    future.push(cloneState({ values, focus, op }));
    const prev = past.pop();
    values = prev.values;
    focus = prev.focus;
    op = prev.op;
    setStatus("");
    render();
  };

  const redo = () => {
    if (locked || !future.length) return;
    past.push(cloneState({ values, focus, op }));
    const next = future.pop();
    values = next.values;
    focus = next.focus;
    op = next.op;
    setStatus("");
    render();
    maybeFinish();
  };

  const showOverlay = (title, lines) => {
    overlayTitle.textContent = title;
    overlayList.innerHTML = "";
    lines.forEach((line) => {
      const li = document.createElement("li");
      li.textContent = line;
      overlayList.appendChild(li);
    });
    overlay.hidden = false;
  };

  const hideOverlay = () => {
    overlay.hidden = true;
  };

  const hint = () => {
    if (locked) return;
    const lines = puzzle.sols.length ? puzzle.sols : ["No solution found for this puzzle."];
    showOverlay(`${puzzle.nums.join(", ")}`, lines);
  };

  const newPuzzle = () => {
    hideOverlay();
    puzzle = randomPuzzle(maxN);
    if (!puzzle.sols.length) {
      setStatus("Couldn't generate a puzzle. Retrying…");
      puzzle = randomPuzzle(maxN);
    }
    values = puzzle.nums.map((n) => frac(n));
    focus = -1;
    op = -1;
    past = [];
    future = [];
    locked = false;
    setStatus("");
    render();
  };

  numBtns.forEach((btn) => {
    btn.addEventListener("click", () => clickNum(Number(btn.dataset.slot)));
  });
  opBtns.forEach((btn) => {
    btn.addEventListener("click", () => clickOp(Number(btn.dataset.op)));
  });
  undoBtn.addEventListener("click", undo);
  redoBtn.addEventListener("click", redo);
  hintBtn.addEventListener("click", hint);
  nextBtn.addEventListener("click", newPuzzle);
  overlayClose.addEventListener("click", hideOverlay);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) hideOverlay();
  });
  rangeBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      maxN = Number(btn.dataset.max);
      rangeBtns.forEach((b) => b.classList.toggle("is-active", b === btn));
      newPuzzle();
    });
  });

  newPuzzle();
})();
