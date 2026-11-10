(function(){
  var $=function(s){return document.querySelector(s)};

  /* ===== بحث وفلترة ===== */
  var grid=$('#grid');
  if(grid){
    var cards=[].slice.call(grid.children);
    var q=$('#q'),cond=$('#f-cond'),brand=$('#f-brand'),max=$('#f-max'),sort=$('#f-sort');
    var norm=function(s){return (s||'').toLowerCase().replace(/[\u064B-\u065F]/g,'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي').trim()};
    function apply(){
      var t=norm(q.value).split(/\s+/).filter(Boolean),m=parseFloat(max.value),n=0;
      cards.forEach(function(c){
        var ok=t.every(function(w){return norm(c.dataset.title).indexOf(w)>-1})
          &&(!cond.value||c.dataset.cond===cond.value)
          &&(!brand.value||c.dataset.brand===brand.value)
          &&(isNaN(m)||parseFloat(c.dataset.price)<=m);
        c.hidden=!ok; if(ok)n++;
      });
      var list=cards.slice();
      if(sort.value){list.sort(function(a,b){var d=a.dataset.price-b.dataset.price;return sort.value==='asc'?d:-d})}
      list.forEach(function(c){grid.appendChild(c)});
      $('#count').textContent=n; $('#empty').hidden=n>0;
    }
    [q,max].forEach(function(e){e.addEventListener('input',apply)});
    [cond,brand,sort].forEach(function(e){e.addEventListener('change',apply)});
    $('#f-reset').addEventListener('click',function(){q.value=max.value=cond.value=brand.value=sort.value='';apply()});
  }

  /* ===== معرض الصور ===== */
  var slides=$('#slides');
  if(slides){
    var imgs=[].slice.call(slides.children),tbox=$('#thumbs'),thumbs=[].slice.call(tbox.children),counter=$('#counter');
    var rtl=function(){return getComputedStyle(slides).direction==='rtl'};
    var cur=0;
    function mark(i){
      cur=i;
      thumbs.forEach(function(t,k){t.classList.toggle('on',k===i)});
      counter.textContent=(i+1)+' / '+imgs.length;
      var t=thumbs[i],bb=tbox.getBoundingClientRect(),r=t.getBoundingClientRect();
      if(r.left<bb.left)tbox.scrollBy({left:r.left-bb.left-8,behavior:'smooth'});
      else if(r.right>bb.right)tbox.scrollBy({left:r.right-bb.right+8,behavior:'smooth'});
    }
    function go(i,smooth){
      slides.scrollTo({left:(rtl()?-1:1)*i*slides.clientWidth,behavior:smooth===false?'auto':'smooth'});
    }
    var tm;slides.addEventListener('scroll',function(){clearTimeout(tm);tm=setTimeout(function(){
      var w=slides.clientWidth||1;mark(Math.min(imgs.length-1,Math.max(0,Math.round(Math.abs(slides.scrollLeft)/w))))},60)});
    thumbs.forEach(function(t,i){t.addEventListener('click',function(){go(i)})});
    mark(0);

    /* التكبير بملء الشاشة: يُضاف مباشرة إلى body ليكون دائماً بمقاس الشاشة */
    var lb=document.createElement('div');lb.className='lightbox';lb.hidden=true;
    lb.innerHTML='<button type="button" class="lb-close" aria-label="close">\u2715</button>'+
      '<button type="button" class="lb-btn lb-left" aria-label="left">\u2039</button>'+
      '<button type="button" class="lb-btn lb-right" aria-label="right">\u203A</button>'+
      '<span class="lb-count"></span><img alt="">';
    document.body.appendChild(lb);
    var lbi=lb.querySelector('img'),lbc=lb.querySelector('.lb-count'),li=0;
    function show(i){
      li=(i+imgs.length)%imgs.length;
      lbi.src=imgs[li].dataset.full||imgs[li].querySelector('img').src;
      lbc.textContent=(li+1)+' / '+imgs.length;
    }
    function open(i){show(i);lb.hidden=false;document.body.style.overflow='hidden'}
    function close(){lb.hidden=true;document.body.style.overflow='';go(li,false)}
    function step(d){show(li+d)}
    var next=function(){step(1)},prev=function(){step(-1)};
    imgs.forEach(function(im,i){im.addEventListener('click',function(){open(i)})});
    lb.querySelector('.lb-close').addEventListener('click',close);
    lb.querySelector('.lb-left').addEventListener('click',function(e){e.stopPropagation();(document.documentElement.dir==='rtl'?next:prev)()});
    lb.querySelector('.lb-right').addEventListener('click',function(e){e.stopPropagation();(document.documentElement.dir==='rtl'?prev:next)()});
    lb.addEventListener('click',function(e){if(e.target===lb||e.target===lbi)close()});
    document.addEventListener('keydown',function(e){
      if(lb.hidden)return;
      if(e.key==='Escape')close();
      var r=document.documentElement.dir==='rtl';
      if(e.key==='ArrowLeft')(r?next:prev)();
      if(e.key==='ArrowRight')(r?prev:next)();
    });
    var x0=null;
    lb.addEventListener('touchstart',function(e){x0=e.touches[0].clientX},{passive:true});
    lb.addEventListener('touchend',function(e){
      if(x0===null)return;var dx=e.changedTouches[0].clientX-x0;x0=null;
      if(Math.abs(dx)>50){var r=document.documentElement.dir==='rtl';((dx<0)!==r?next:prev)()}
    },{passive:true});
  }

  /* ===== مشاركة ===== */
  var sh=$('#share');
  if(sh){sh.addEventListener('click',function(){
    if(navigator.share){navigator.share({title:sh.dataset.title,url:location.href})}
    else if(navigator.clipboard){navigator.clipboard.writeText(location.href).then(function(){sh.textContent=sh.dataset.msg})}
  })}

  /* ===== حاسبة القسط ===== */
  var calc=$('#calc');
  if(calc){
    var price=parseFloat(calc.dataset.price),cur=calc.dataset.cur;
    function run(){
      var d=+$('#c-down').value,y=+$('#c-years').value,r=parseFloat($('#c-rate').value)||0;
      $('#c-down-v').textContent=d;
      var loan=price*(1-d/100),total=loan*(1+(r/100)*y),mo=total/(y*12);
      $('#c-out').textContent=Math.round(mo).toLocaleString()+' '+cur;
    }
    ['c-down','c-years','c-rate'].forEach(function(id){document.getElementById(id).addEventListener('input',run)});
    run();
  }
})();
