---
layout: default
permalink: /24/
title: 24 Game
description: Make 24 with four numbers.
nav: true
nav_order: 7
twentyfour: true
---

<div class="tf-page">
  <p class="tf-help">
    Use +, −, ×, and ÷ to make <strong>24</strong>. Tap a number, then an operator, then another number.
  </p>

  <div class="tf-toolbar">
    <span class="tf-range-label">Number range</span>
    <div class="tf-range" role="group" aria-label="Number range">
      <button type="button" class="tf-range-btn" data-max="10">1–10</button>
      <button type="button" class="tf-range-btn is-active" data-max="13">1–13</button>
    </div>
  </div>

  <div class="tf-stage">
    <div class="tf-board" id="tf-board" aria-label="24 game board">
      <button type="button" class="tf-cell tf-num" data-slot="0" aria-label="Number 1"></button>
      <div class="tf-cell tf-solved" aria-live="polite">
        <span class="tf-solved-label">Solved</span>
        <span class="tf-solved-count" id="tf-solved">0</span>
      </div>
      <button type="button" class="tf-cell tf-num" data-slot="1" aria-label="Number 2"></button>
      <button type="button" class="tf-cell tf-op" data-op="0" aria-label="Add">+</button>
      <button type="button" class="tf-cell tf-undo" data-act="undo" aria-label="Undo">↶</button>
      <button type="button" class="tf-cell tf-op" data-op="3" aria-label="Divide">÷</button>
      <button type="button" class="tf-cell tf-refresh" data-act="next" aria-label="New puzzle">↻</button>
      <button type="button" class="tf-cell tf-op" data-op="1" aria-label="Subtract">−</button>
      <button type="button" class="tf-cell tf-redo" data-act="redo" aria-label="Redo">↷</button>
      <button type="button" class="tf-cell tf-op" data-op="2" aria-label="Multiply">×</button>
      <button type="button" class="tf-cell tf-num" data-slot="2" aria-label="Number 3"></button>
      <button type="button" class="tf-cell tf-hint" data-act="hint" aria-label="Hint">Hint</button>
      <button type="button" class="tf-cell tf-num" data-slot="3" aria-label="Number 4"></button>
    </div>
    <div class="tf-overlay" id="tf-overlay" hidden>
      <div class="tf-overlay-card">
        <p class="tf-overlay-title" id="tf-overlay-title">Solutions</p>
        <ul class="tf-overlay-list" id="tf-overlay-list"></ul>
        <button type="button" class="tf-overlay-close" id="tf-overlay-close">Tap to close</button>
      </div>
    </div>
  </div>

  <p class="tf-status" id="tf-status" aria-live="polite"></p>
</div>
