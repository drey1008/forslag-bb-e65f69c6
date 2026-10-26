/* Barnets Bedste: lille, hurtigt script uden sporing */
(function(){
  var d=document, root=d.documentElement;
  root.classList.remove('no-js'); root.classList.add('js');
  // Gør links brugbare, når filerne åbnes direkte fra computeren
  if(location.protocol==='file:'){ d.querySelectorAll('a[href]').forEach(function(a){ var h=a.getAttribute('href'); if(!/^(https?:|mailto:|tel:|#)/.test(h) && /\/(#.*)?$/.test(h)){ a.setAttribute('href',h.replace(/\/(#.*)?$/,'/index.html$1')); } }); }
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobilmenu
  var t=d.querySelector('.nav-toggle'), nav=d.getElementById('hovedmenu');
  if(t&&nav){
    t.addEventListener('click',function(){
      var open=nav.classList.toggle('is-open');
      t.setAttribute('aria-expanded',open);
      t.querySelector('.nav-toggle__label').textContent=open?'Luk':'Menu';
    });
    d.addEventListener('keydown',function(e){ if(e.key==='Escape'&&nav.classList.contains('is-open')){t.click();t.focus();} });
  }

  // Scroll-animationer
  var els=d.querySelectorAll('.reveal');
  if(!reduce && 'IntersectionObserver' in window){
    var io=new IntersectionObserver(function(entries){
      entries.forEach(function(en){ if(en.isIntersecting){en.target.classList.add('is-visible');io.unobserve(en.target);} });
    },{rootMargin:'0px 0px -8% 0px',threshold:.12});
    els.forEach(function(el){io.observe(el);});
  } else { els.forEach(function(el){el.classList.add('is-visible');}); }

  // Blød parallax på store billeder
  var px=d.querySelectorAll('.parallax img');
  if(!reduce && px.length){
    var ticking=false;
    var run=function(){
      var vh=window.innerHeight;
      px.forEach(function(img){
        var r=img.parentElement.getBoundingClientRect();
        if(r.bottom<0||r.top>vh) return;
        var p=(r.top+r.height/2-vh/2)/vh;
        img.style.transform='translate3d(0,'+(p*-40).toFixed(1)+'px,0) scale(1.12)';
      });
      ticking=false;
    };
    window.addEventListener('scroll',function(){ if(!ticking){ticking=true;requestAnimationFrame(run);} },{passive:true});
    run();
  }

  // Kontaktformular
  var f=d.getElementById('kontaktformular');
  if(f){
    var map={mistrivsel:'Foredrag: Vejen hjem fra mistrivsel',skolestress:'Foredrag: Vejen hjem fra skolestress','min-vej-hjem':'Foredrag: Min vej hjem'};
    var q=new URLSearchParams(location.search).get('emne'); if(q&&map[q]) f.querySelector('#emne').value=map[q];
    var status=f.querySelector('.form__status');
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var ok=true;
      f.querySelectorAll('[required]').forEach(function(inp){
        var err=d.getElementById(inp.id+'-fejl'); var bad=!inp.checkValidity();
        inp.setAttribute('aria-invalid',bad?'true':'false');
        if(err) err.textContent=bad?(inp.type==='email'?'Skriv en gyldig e-mailadresse.':'Dette felt skal udfyldes.'):'';
        if(bad&&ok){ok=false;inp.focus();}
      });
      if(!ok) return;
      if(f.querySelector('.hp input').value) return;
      var data=new FormData(f), endpoint=f.getAttribute('action')||'';
      status.className='form__status';
      if(endpoint.indexOf('[')===0||endpoint===''){
        // Ingen formular-tjeneste koblet på endnu: åbn mailprogram med udfyldt besked
        var lines=[]; data.forEach(function(v,k){ if(k.charAt(0)!=='_'&&v) lines.push(k+': '+v); });
        window.location.href='mailto:'+f.dataset.mailto+'?subject='+encodeURIComponent('Henvendelse fra barnetsbedste.dk')+'&body='+encodeURIComponent(lines.join('\n'));
        status.textContent='Dit mailprogram åbner nu med din besked. Tryk send, så er den på vej.';
        status.classList.add('is-ok'); return;
      }
      fetch(endpoint,{method:'POST',body:data,headers:{'Accept':'application/json'}}).then(function(r){
        if(!r.ok) throw 0;
        f.reset(); status.textContent='Tak for din besked. Jeg vender tilbage hurtigst muligt.'; status.classList.add('is-ok');
      }).catch(function(){
        status.innerHTML='Beskeden kunne ikke sendes lige nu. Skriv direkte til <a href="mailto:'+f.dataset.mailto+'">'+f.dataset.mailto+'</a>.'; status.classList.add('is-err');
      });
    });
  }
})();
