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

  document.querySelectorAll('[data-disclosure-control]').forEach(button=>button.addEventListener('click',()=>{
    const details=[...document.querySelectorAll('details[data-review-cover]')];
    const shouldOpen=details.some(item=>!item.open);
    details.forEach(item=>item.open=shouldOpen);
    button.textContent=shouldOpen?'표지 모두 접기':'표지 모두 펼치기';
    button.setAttribute('aria-pressed',String(shouldOpen));
  }));

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
