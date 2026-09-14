(()=>{
  const normalize=value=>(value||'').toLocaleLowerCase('ko').normalize('NFKC').trim();
  const updateEmpty=(scope,visible)=>{const empty=scope.querySelector('[data-empty]');if(empty)empty.dataset.visible=String(visible===0)};

  document.querySelectorAll('[data-filter-group]').forEach(group=>{
    const scope=group.closest('main')||document;
    const items=[...scope.querySelectorAll('[data-filter-item]')];
    const search=scope.querySelector('[data-search]');
    const count=scope.querySelector('[data-result-count]');
    let active='all';
    const apply=()=>{
      const query=normalize(search?.value);
      let visible=0;
      items.forEach(item=>{
        const kinds=(item.dataset.kind||'').split(/\s+/);
        const haystack=normalize(item.dataset.search||item.textContent);
        const show=(active==='all'||kinds.includes(active))&&(!query||haystack.includes(query));
        item.hidden=!show;if(show)visible++;
      });
      if(count)count.textContent=`${visible} / ${items.length}`;
      updateEmpty(scope,visible);
    };
    group.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
      active=button.dataset.filter;
      group.querySelectorAll('[data-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));
      apply();
    }));
    search?.addEventListener('input',apply);
    apply();
  });

  document.querySelectorAll('[data-preview-toggle]').forEach(entry=>{
    const button=entry.querySelector('[data-cover-toggle]');
    const cover=entry.querySelector('.media-body');
    if(!button||!cover)return;
    button.addEventListener('click',()=>{
      const expanded=button.getAttribute('aria-expanded')!=='true';
      button.setAttribute('aria-expanded',String(expanded));
      button.textContent=expanded?'표지 닫기 −':'표지 보기 +';
      cover.hidden=!expanded;
    });
  });

  document.querySelectorAll('[data-disclosure-control]').forEach(button=>{
    const details=[...document.querySelectorAll('details[data-review-cover]')];
    const setOpen=open=>{
      details.forEach(item=>item.open=open);
      button.textContent=open?'표지 모두 접기':'표지 모두 펼치기';
      button.setAttribute('aria-pressed',String(open));
    };
    setOpen(true);
    window.addEventListener('pageshow',()=>setOpen(true));
    button.addEventListener('click',()=>setOpen(details.some(item=>!item.open)));
  });

  const graphSearch=document.querySelector('[data-graph-search]');
  if(graphSearch){
    const nodes=[...document.querySelectorAll('.node')];
    const results=[...document.querySelectorAll('.search-result')];
    const applyGraph=()=>{
      const query=normalize(graphSearch.value);
      nodes.forEach(node=>{const match=!query||normalize(node.dataset.search||node.textContent).includes(query);node.style.opacity=match?'1':'.16';});
      let visible=0;
      results.forEach(item=>{const show=!query||normalize(item.dataset.search||item.textContent).includes(query);item.hidden=!show;if(show)visible++});
      const count=document.querySelector('[data-graph-count]');if(count)count.textContent=`${visible} records`;
      const empty=document.querySelector('[data-graph-empty]');if(empty)empty.dataset.visible=String(visible===0);
    };
    graphSearch.addEventListener('input',applyGraph);applyGraph();
  }

  document.addEventListener('keydown',event=>{
    if((event.metaKey||event.ctrlKey)&&event.key.toLowerCase()==='k'){
      const input=document.querySelector('[data-search],[data-graph-search]');
      if(input){event.preventDefault();input.focus();}
    }
  });
})();
