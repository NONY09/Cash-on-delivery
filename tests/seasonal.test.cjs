'use strict';
const assert = require('node:assert/strict'), fs = require('node:fs'), vm = require('node:vm');
class Target {
  constructor() { this.events = new Map(); this.attrs = {}; this.classes = new Set(); this.classList = {toggle:(key,value)=>value ? this.classes.add(key) : this.classes.delete(key)}; }
  addEventListener(type,fn) { if (!this.events.has(type)) this.events.set(type,new Set()); this.events.get(type).add(fn); }
  removeEventListener(type,fn) { this.events.get(type)?.delete(fn); }
  emit(type) { [...(this.events.get(type)||[])].forEach(fn=>fn()); }
  setAttribute(name,value) { this.attrs[name]=value; }
}
function fixture(reduced = false) {
  const document = new Target(), button = new Target(), scenes = [new Target(),new Target()], motion = new Target(), window = {};
  document.querySelectorAll = ()=>[]; document.querySelector = ()=>null; document.hidden = false;
  motion.matches = reduced; window.matchMedia = ()=>motion;
  const root = {querySelectorAll:()=>scenes,querySelector:()=>button};
  let observer;
  class Observer { constructor(fn) { this.fn=fn; observer=this; } observe() {} disconnect() { this.disconnected=true; } }
  vm.runInNewContext(fs.readFileSync('seasonal.js','utf8'),{window,document,IntersectionObserver:Observer});
  const controller=window.ChegaSeasonal.mount(root);
  const enter = (index,visible)=>observer.fn([{target:scenes[index],isIntersecting:visible}]);
  return {document,button,scenes,motion,controller,observer,enter};
}
const active = scene=>scene.classes.has('holiday-motion');
let f=fixture();
assert(!active(f.scenes[0])); assert(!active(f.scenes[1]));
f.enter(0,true); assert(active(f.scenes[0])); assert(!active(f.scenes[1]),'Offscreen footer must stay still');
f.button.emit('click'); assert(!active(f.scenes[0])); assert.equal(f.button.attrs['aria-pressed'],'true');
f.enter(1,true); assert(!active(f.scenes[1]),'Manual pause persists when another scene enters');
f.button.emit('click'); assert(active(f.scenes[0])); assert(active(f.scenes[1]));
f.document.hidden=true;f.document.emit('visibilitychange'); assert(!active(f.scenes[0]));assert(!active(f.scenes[1]));
f.document.hidden=false;f.document.emit('visibilitychange');assert(active(f.scenes[0]));
f.enter(0,false);assert(!active(f.scenes[0]));assert(active(f.scenes[1]));
f.motion.matches=true;f.motion.emit('change');assert(!active(f.scenes[1]));assert(f.button.disabled);assert.equal(f.button.textContent,'Efeitos estáticos');
f.motion.matches=false;f.motion.emit('change');assert(active(f.scenes[1]));
f.controller.destroy();assert(!active(f.scenes[1]));assert(f.observer.disconnected);f.document.emit('visibilitychange');assert(!active(f.scenes[1]));
f=fixture(true);f.enter(0,true);assert(!active(f.scenes[0]));assert(f.button.disabled);
console.log('PASS: efeito somente visível, pausa manual, aba oculta, preferência de movimento reduzido e limpeza.');
