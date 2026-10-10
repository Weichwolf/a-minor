AM.scorePDF = (() => {
  let ready;
  const script = src => new Promise((resolve,reject) => {
    const el = document.createElement('script');
    el.src = src;
    el.onload = resolve;
    el.onerror = () => { el.remove(); reject(Error('PDF library unavailable')); };
    document.head.append(el);
  });
  function engine() {
    if (!ready) ready = (async () => {
      if (!window.pdfMake) await script('assets/vendor/pdfmake/pdfmake.min.js');
      await script('assets/vendor/pdfmake/vfs_fonts.js');
      return window.pdfMake;
    })().catch(error => { ready = undefined; throw error; });
    return ready;
  }
  function notation(svg) {
    const copy = svg.cloneNode(true), originals = [svg,...svg.querySelectorAll('*')], copies = [copy,...copy.querySelectorAll('*')];
    const properties = ['fill','fill-opacity','stroke','stroke-width','stroke-opacity','stroke-linecap','stroke-linejoin','stroke-dasharray','font-size','font-weight','font-style','text-anchor'];
    originals.forEach((el,i) => {
      const style = getComputedStyle(el), clone = copies[i];
      for (const property of properties) clone.setAttribute(property,style.getPropertyValue(property));
      if (el.localName === 'text' || el.localName === 'tspan') clone.setAttribute('font-family','DejaVuSans');
      clone.removeAttribute('class');
      clone.removeAttribute('style');
    });
    copy.setAttribute('xmlns','http://www.w3.org/2000/svg');
    copy.setAttribute('width',svg.viewBox.baseVal.width);
    copy.setAttribute('height',svg.viewBox.baseVal.height);
    return new XMLSerializer().serializeToString(copy);
  }
  async function download(target,{title,description,form,filename}) {
    const sections = [...target.querySelectorAll('.rep-section')].map(el => ({
      title:el.querySelector('h2').textContent.trim(),svg:notation(el.querySelector('svg.score'))
    }));
    if (sections.length !== 3) throw Error('Expected three ABC sections');
    const url = location.href;
    const pdf = await engine();
    const blob = await pdf.createPdf({
      pageSize:'A4',pageMargins:[34,34,34,34],
      info:{title,author:'a-minor',subject:url},
      defaultStyle:{font:'DejaVuSans',fontSize:10},
      content:[
        {text:title,fontSize:16,bold:true,link:url,margin:[0,0,0,6]},
        {text:description,color:'#555555',margin:[0,0,0,6]},
        {text:form,fontSize:9,color:'#555555',margin:[0,0,0,14]},
        ...sections.map(section => ({unbreakable:true,stack:[
          {text:section.title,fontSize:11,bold:true,margin:[0,0,0,4]},
          {svg:section.svg,fit:[527,190]}
        ],margin:[0,0,0,12]}))
      ]
    }).getBlob();
    const href = URL.createObjectURL(blob), a = document.createElement('a');
    a.href = href; a.download = filename;
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(href),30000);
  }
  return {download};
})();
