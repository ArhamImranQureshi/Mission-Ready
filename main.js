/* Mission Ready: shared site behaviour (all pages).
   - mobile menu, FAQ accordion, UI-only form demo, scroll reveal
   - scroll-driven --p progress for [data-scene] sections on sub-pages
     (the homepage runs its own scene loop inline, so this skips it) */
(function(){
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- mobile menu ---- */
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('site-menu');
  function setMenu(open){
    if(!toggle || !menu) return;
    menu.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menu-open', open);
  }
  if(toggle && menu){
    toggle.addEventListener('click', function(){ setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
    menu.addEventListener('click', function(e){ if(e.target.closest('a')) setMenu(false); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape' && menu.classList.contains('open')){ setMenu(false); toggle.focus(); } });
    matchMedia('(min-width:881px)').addEventListener('change', function(m){ if(m.matches) setMenu(false); });
  }

  /* ---- FAQ accordion ---- */
  document.querySelectorAll('.faq-q').forEach(function(btn){
    btn.addEventListener('click', function(){
      var open = btn.getAttribute('aria-expanded') === 'true';
      var panel = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', open ? 'false' : 'true');
      panel.classList.toggle('open', !open);
    });
  });

  /* ---- UI-only forms (no backend) ---- */
  document.querySelectorAll('form[data-demo]').forEach(function(form){
    var msg = form.querySelector('.form-msg');
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var bad = 0;
      form.querySelectorAll('[required]').forEach(function(f){
        var ok = f.value.trim() && (f.type !== 'email' || /^\S+@\S+\.\S+$/.test(f.value.trim()));
        f.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if(!ok) bad++;
      });
      msg.hidden = false;
      if(bad){
        msg.style.background = 'var(--surface-2)'; msg.style.color = 'var(--ink)';
        msg.textContent = 'Please complete the highlighted fields.';
        var first = form.querySelector('[aria-invalid="true"]'); if(first) first.focus();
        return;
      }
      msg.style.background = ''; msg.style.color = '';
      msg.textContent = 'Preview only: this form is not connected yet. Submissions will be wired up before launch.';
    });
    form.addEventListener('input', function(e){ if(e.target.getAttribute('aria-invalid')) e.target.setAttribute('aria-invalid','false'); });
  });

  /* ---- reveal on scroll ---- */
  var revealEls = [].slice.call(document.querySelectorAll('.reveal'));
  if(revealEls.length){
    if(reduce || !('IntersectionObserver' in window)){ revealEls.forEach(function(el){ el.classList.add('in'); }); }
    else {
      var io = new IntersectionObserver(function(es){
        es.forEach(function(en){ if(en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
      }, {rootMargin:'0px 0px -8% 0px', threshold:.08});
      revealEls.forEach(function(el){ io.observe(el); });
    }
  }

  /* ---- scroll scenes (sub-pages only; homepage has its own loop) ---- */
  if(document.getElementById('pin') || reduce) return;
  var scenes = [].slice.call(document.querySelectorAll('[data-scene]'));
  var bar = document.querySelector('.progress');
  var ticking = false;
  function clamp(v){ return v < 0 ? 0 : v > 1 ? 1 : v; }
  function update(){
    ticking = false;
    var vh = innerHeight, sy = scrollY, dh = root.scrollHeight - vh;
    if(bar) bar.style.setProperty('--doc', dh > 0 ? (sy/dh).toFixed(4) : 0);
    scenes.forEach(function(el){
      var r = el.getBoundingClientRect(), p, mode = el.dataset.scene;
      if(mode === 'exit') p = -r.top / Math.max(1, r.height);
      else if(mode === 'enter') p = (vh - r.top) / (vh * .75);
      else if(mode === 'center') p = (vh * .7 - r.top) / Math.max(1, r.height);
      else p = (vh - r.top) / (vh + r.height);
      el.style.setProperty('--p', clamp(p).toFixed(4));
    });
  }
  function onScroll(){ if(!ticking){ ticking = true; requestAnimationFrame(update); } }
  addEventListener('scroll', onScroll, {passive:true});
  addEventListener('resize', onScroll);
  update();
})();
