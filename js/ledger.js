(()=>{
  'use strict';
  const normalize=v=>String(v||'').toLocaleLowerCase('ko').normalize('NFKC').trim();
  const setPreview=(entry,expanded)=>{
    const b=entry.querySelector('[data-cover-toggle]'), body=entry.querySelector('.media-body');
    if(!b||!body)return; entry.open=expanded; body.hidden=!expanded;
    b.setAttribute('aria-expanded',String(expanded)); b.textContent=expanded?'표지 닫기 −':'표지 보기 +';
  };
  const ledger=document.querySelector('[data-sort-ledger]');
  if(ledger){[...ledger.children].sort((a,b)=>{const ad=Date.parse(a.dataset.date||'')||0,bd=Date.parse(b.dataset.date||'')||0;return bd-ad}).forEach(el=>ledger.appendChild(el));}
  const reviewGrid=document.querySelector('.review-archive-grid');
  if(reviewGrid){[...reviewGrid.children].sort((a,b)=>Number(b.dataset.rating||0)-Number(a.dataset.rating||0)+0||Number(b.dataset.writing==='true')-Number(a.dataset.writing==='true')).forEach(el=>reviewGrid.appendChild(el));}
  document.querySelectorAll('[data-review-filters]').forEach(controls=>{
    const scope=controls.closest('main')||document,items=[...scope.querySelectorAll('[data-filter-item]')],active={kind:'all',status:'all'};
    const apply=()=>{let visible=0;items.forEach(item=>{const showKind=active.kind==='all'||item.dataset.kind===active.kind,showStatus=active.status==='all'||item.dataset.status===active.status,show=showKind&&showStatus;item.hidden=!show;if(show)visible++;});const empty=scope.querySelector('[data-empty]');if(empty)empty.dataset.visible=String(visible===0);};
    controls.querySelectorAll('[data-review-filter-group]').forEach(group=>{const key=group.dataset.reviewFilterGroup;group.querySelectorAll('[data-review-filter]').forEach(button=>button.addEventListener('click',()=>{const selected=button.dataset.reviewFilter;if(key==='status'&&active.status===selected){active.status='all';button.setAttribute('aria-pressed','false');}else{active[key]=selected;group.querySelectorAll('[data-review-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));}apply();}));});apply();
  });
  document.querySelectorAll('[data-filter-group]').forEach(group=>{
    const scope=group.closest('main')||document, items=[...scope.querySelectorAll('[data-filter-item]')], count=scope.querySelector('[data-result-count]');
    let active='all';
    const apply=()=>{let visible=0;items.forEach(item=>{const show=active==='all'||(item.dataset.kind||'').split(/\s+/).includes(active);item.hidden=!show;if(show)visible++;});
      if(scope.classList.contains('home'))items.filter(i=>i.dataset.kind==='review').forEach(i=>setPreview(i,active==='review'));
      if(count)count.textContent=`${visible} / ${items.length}`;const empty=scope.querySelector('[data-empty]');if(empty)empty.dataset.visible=String(visible===0);
    };
    group.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{active=button.dataset.filter;group.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));apply();}));apply();
  });
  document.querySelectorAll('[data-preview-toggle]').forEach(entry=>{const b=entry.querySelector('[data-cover-toggle]');if(b)b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setPreview(entry,b.getAttribute('aria-expanded')!=='true');});});
  document.querySelectorAll('[data-catalog]').forEach(catalog=>{const scope=catalog.closest('main'),input=scope.querySelector('[data-catalog-search]'),count=scope.querySelector('[data-catalog-count]'),items=[...catalog.querySelectorAll('[data-catalog-item]')],empty=scope.querySelector('[data-catalog-empty]');if(!input)return;const apply=()=>{const q=normalize(input.value);let n=0;items.forEach(i=>{const show=!q||normalize(i.dataset.search).includes(q);i.hidden=!show;if(show)n++;});if(count)count.textContent=`${n} / ${items.length}`;if(empty)empty.dataset.visible=String(n===0)};input.addEventListener('input',apply);apply();});
  let records=[],loaded=false,restoreFocus=null;
  const overlay=document.createElement('div');overlay.className='search-overlay';overlay.hidden=true;overlay.innerHTML='<section class="search-dialog" role="dialog" aria-modal="true" aria-labelledby="global-search-title"><header class="search-dialog-head"><div><p class="eyebrow">public archives</p><h2 id="global-search-title">전체 기록 검색</h2></div><button type="button" class="search-close" data-search-close aria-label="검색 닫기">닫기 <kbd>Esc</kbd></button></header><label class="global-search-field"><span>Wiki, Review, Post에서 찾기</span><input type="search" data-global-search placeholder="제목, 저자, 요약, 태그" autocomplete="off"></label><p class="global-search-count" data-global-search-count aria-live="polite"></p><div class="global-search-results" data-global-search-results></div></section>';document.body.appendChild(overlay);
  const input=overlay.querySelector('[data-global-search]'),results=overlay.querySelector('[data-global-search-results]'),resultCount=overlay.querySelector('[data-global-search-count]');
  const render=()=>{const q=normalize(input.value),found=records.filter(r=>!q||normalize(`${r.title} ${r.summary} ${Array.isArray(r.tags)?r.tags.join(' '):r.tags||''}`).includes(q)).slice(0,q?40:12);results.replaceChildren();found.forEach(r=>{const a=document.createElement('a');a.className='global-search-result';a.href=r.url;if(/^https?:/.test(r.url)){a.target='_blank';a.rel='noopener noreferrer'}const kind=document.createElement('span');kind.className='kind';kind.textContent=r.type;const copy=document.createElement('span');copy.className='global-search-copy';const title=document.createElement('strong');title.textContent=r.title;const meta=document.createElement('small');meta.textContent=[r.summary,r.updated].filter(Boolean).join(' · ');copy.append(title,meta);a.append(kind,copy);results.append(a)});resultCount.textContent=q?`${found.length} results`:`최근 기록 ${found.length}개`;if(!found.length){const p=document.createElement('p');p.className='search-empty';p.textContent='일치하는 기록이 없습니다.';results.append(p)}};
  const load=()=>loaded?Promise.resolve():fetch('/search-index.json').then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(data=>{records=(Array.isArray(data)?data:[]).sort((a,b)=>(Date.parse(b.updated||'')||0)-(Date.parse(a.updated||'')||0));loaded=true});
  const open=trigger=>{restoreFocus=trigger||document.activeElement;overlay.hidden=false;document.body.classList.add('search-open');input.value='';resultCount.textContent='불러오는 중…';results.replaceChildren();load().then(render).catch(()=>{resultCount.textContent='검색 인덱스를 불러오지 못했습니다.'});setTimeout(()=>input.focus(),0)};
  const close=()=>{overlay.hidden=true;document.body.classList.remove('search-open');restoreFocus?.focus?.()};
  document.querySelectorAll('[data-search-open]').forEach(b=>b.addEventListener('click',()=>open(b)));overlay.querySelector('[data-search-close]').addEventListener('click',close);overlay.addEventListener('click',e=>{if(e.target===overlay)close()});input.addEventListener('input',render);document.addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();overlay.hidden?open():close()}else if(e.key==='Escape'&&!overlay.hidden){e.preventDefault();close()}});
})();
