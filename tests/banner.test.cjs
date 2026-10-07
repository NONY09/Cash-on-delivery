'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync('banner.js', 'utf8');
class Target {
  constructor() { this.events = new Map(); this.attrs = {}; this.dataset = {}; }
  addEventListener(type, fn) { if (!this.events.has(type)) this.events.set(type, new Set()); this.events.get(type).add(fn); }
  removeEventListener(type, fn) { this.events.get(type)?.delete(fn); }
  emit(type, detail = {}) { [...(this.events.get(type) || [])].forEach(fn => fn(detail)); }
  setAttribute(name, value) { this.attrs[name] = value; }
  hasAttribute(name) { return name in this.attrs; }
  closest() { return this; }
}
function fixture(reduced = false) {
  const window = new Target(), document = new Target(), root = new Target(), track = new Target(), pause = new Target();
  const slides = [new Target(), new Target()], dots = [new Target(), new Target()];
  slides.forEach((slide, i) => { slide.dataset.bannerTitle = `Destaque ${i}`; });
  dots.forEach((dot, i) => { dot.attrs['data-banner-index'] = ''; dot.dataset.bannerIndex = String(i); });
  pause.attrs['data-banner-pause'] = '';
  const count = {}, status = {}, motion = new Target(), timers = new Map();
  motion.matches = reduced; document.hidden = false; document.activeElement = null; root.hovered = false;
  root.contains = target => target === root || target === track || target === pause || dots.includes(target) || slides.includes(target);
  root.matches = () => root.hovered;
  root.querySelector = selector => ({ '.banner-track': track, '[data-banner-pause]': pause, '.banner-count': count, '.banner-status': status })[selector];
  root.querySelectorAll = selector => selector === '.banner-panel' ? slides : dots;
  track.clientWidth = 1000; track.scrollLeft = 0;
  track.scrollTo = options => { track.scrollLeft = options.left; track.emit('scroll'); };
  let serial = 0;
  window.matchMedia = () => motion;
  window.setTimeout = fn => { const id = ++serial; timers.set(id, fn); return id; };
  window.clearTimeout = id => timers.delete(id);
  let observer;
  class Observer { constructor(fn) { this.fn = fn; observer = this; } observe() {} disconnect() { this.disconnected = true; } }
  vm.runInNewContext(source, { window, document, IntersectionObserver: Observer });
  const controller = window.ChegaBanner.mount(root);
  const tick = () => { const [id, fn] = [...timers][0]; timers.delete(id); fn(); };
  return { window, document, root, track, pause, slides, dots, count, status, motion, timers, controller, tick, observer };
}
let f = fixture();
assert.equal(f.timers.size, 1); assert.equal(f.slides[1].inert, true);
f.tick(); assert.equal(f.track.scrollLeft, 1000); assert.equal(f.slides[0].inert, true);
f.tick(); assert.equal(f.track.scrollLeft, 0);
f.root.emit('focusin'); assert.equal(f.timers.size, 0);
f.document.activeElement = f.slides[0]; f.root.emit('mouseleave'); assert.equal(f.timers.size, 0, 'Focused slide must not advance');
f.document.activeElement = null; f.root.emit('focusout', { relatedTarget: null }); assert.equal(f.timers.size, 1);
f.document.hidden = true; f.document.emit('visibilitychange'); assert.equal(f.timers.size, 0);
f.document.hidden = false; f.document.emit('visibilitychange'); assert.equal(f.timers.size, 1);
f.observer.fn([{ isIntersecting: false }]); assert.equal(f.timers.size, 0);
f.observer.fn([{ isIntersecting: true }]); assert.equal(f.timers.size, 1);
f.root.emit('click', { target: f.dots[1] }); assert.equal(f.track.scrollLeft, 1000); assert.equal(f.timers.size, 0); assert.match(f.status.textContent, /2 de 2/);
f.root.emit('mouseleave'); assert.equal(f.timers.size, 0, 'Manual navigation stays paused');
f.root.emit('click', { target: f.pause }); assert.equal(f.timers.size, 1);
f.track.emit('pointerdown'); f.track.scrollLeft = 0; f.track.emit('scroll'); assert.equal(f.timers.size, 0); assert.equal(f.slides[0].inert, false);
f.root.emit('click', { target: f.pause }); assert.equal(f.timers.size, 1);
f.controller.destroy(); assert.equal(f.timers.size, 0); assert.equal(f.observer.disconnected, true);
f.document.emit('visibilitychange'); f.root.emit('mouseleave'); assert.equal(f.timers.size, 0, 'Route cleanup must remove listeners');
f = fixture(true); assert.equal(f.timers.size, 0); assert.equal(f.pause.disabled, true); assert.equal(f.pause.textContent, 'Manual');
f.root.emit('click', { target: f.dots[1] }); assert.equal(f.track.scrollLeft, 1000); assert.equal(f.timers.size, 0);
f = fixture(); f.motion.matches = true; f.motion.emit('change'); assert.equal(f.timers.size, 0);
assert.match(fs.readFileSync('index.html', 'utf8'), /<script defer src="banner\.js"><\/script>/);
assert.match(fs.readFileSync('app.js', 'utf8'), /bannerController\?\.destroy\(\)/);
console.log('PASS: giro e retorno, foco, aba oculta, fora da tela, pausa após toque, movimento reduzido e limpeza de rota.');
