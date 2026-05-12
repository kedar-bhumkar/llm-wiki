(function(){
  var el=document.getElementById('content');
  if(el&&typeof md!=='undefined'&&typeof marked!=='undefined'){
    marked.setOptions({gfm:true,breaks:false});
    el.innerHTML=marked.parse(md);
  }
  var s=document.getElementById('search');
  if(!s) return;

  // Snapshot initial open state so we can restore it when query is cleared.
  document.querySelectorAll('.sidebar details').forEach(function(det){
    det.dataset.initOpen=det.open?'1':'0';
  });

  s.addEventListener('input',function(e){
    var q=e.target.value.toLowerCase().trim();

    // Step 1: show/hide individual sidebar links.
    document.querySelectorAll('.sidebar a').forEach(function(a){
      var li=a.closest('li');
      if(li) li.style.display=(!q||a.textContent.toLowerCase().includes(q))?'':'none';
    });

    // Step 2: show/hide <details> sections and force-open those with matches.
    // Process in reverse DOM order so parents see their children's updated state.
    var allDets=Array.from(document.querySelectorAll('.sidebar details'));
    allDets.slice().reverse().forEach(function(det){
      if(!q){
        det.style.display='';
        det.open=det.dataset.initOpen==='1';
        return;
      }
      var hasVisible=Array.from(det.querySelectorAll('li')).some(function(li){
        return li.style.display!=='none';
      });
      det.style.display=hasVisible?'':'none';
      if(hasVisible) det.open=true;
    });

    // Step 3: filter concept cards on the index page.
    document.querySelectorAll('.concept-card').forEach(function(card){
      var text=(card.textContent||'').toLowerCase();
      card.style.display=(!q||text.includes(q))?'':'none';
    });

    // Step 4: filter log table rows; renumber visible rows after filtering.
    document.querySelectorAll('.log-table tbody tr').forEach(function(row){
      var text=(row.textContent||'').toLowerCase();
      row.style.display=(!q||text.includes(q))?'':'none';
    });
    if(typeof window.updateLogNumbers==='function')window.updateLogNumbers();

    // Step 5: filter concept pills; hide letter groups that become empty.
    // When query is cleared, restore the active letter filter instead of showing all groups.
    if(!q&&typeof window.applyAlphaFilter==='function'){
      window.applyAlphaFilter();
    }else{
      document.querySelectorAll('.concepts-group').forEach(function(grp){
        var pills=Array.from(grp.querySelectorAll('.concept-pill'));
        pills.forEach(function(pill){
          pill.style.display=(!q||pill.textContent.toLowerCase().includes(q))?'':'none';
        });
        grp.style.display=pills.some(function(p){return p.style.display!=='none';})?'':'none';
      });
    }
  });
})();

// Hover tooltips — show concept summary bubble when hovering wiki links.
// Reads window.wikiSummaries written by assets/summaries.js.
(function(){
  if(!window.wikiSummaries)return;
  var tip=document.createElement('div');
  tip.id='wiki-tooltip';
  tip.innerHTML='<div class="tip-title"></div><div class="tip-summary"></div>';
  document.body.appendChild(tip);
  var tTitle=tip.querySelector('.tip-title');
  var tSummary=tip.querySelector('.tip-summary');
  function pos(e){
    var x=e.clientX+14,y=e.clientY+14;
    if(x+294>window.innerWidth)x=e.clientX-298;
    if(y+90>window.innerHeight)y=e.clientY-90;
    tip.style.left=x+'px';tip.style.top=y+'px';
  }
  document.querySelectorAll('a[href]').forEach(function(a){
    var m=(a.getAttribute('href')||'').match(/([^/]+).html$/);
    if(!m)return;
    var d=window.wikiSummaries[m[1]];
    if(!d)return;
    a.addEventListener('mouseenter',function(e){
      tTitle.textContent=d.title;
      tSummary.textContent=d.summary;
      tip.style.display='block';
      pos(e);
    });
    a.addEventListener('mousemove',pos);
    a.addEventListener('mouseleave',function(){tip.style.display='none';});
  });
})();