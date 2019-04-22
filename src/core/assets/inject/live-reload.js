(function() {
  window.__live_server_log__ = [];

  const { DiffDOM } = diffDOM;
  const dd = new DiffDOM({});
  const bodyRegex = /<body>*>((.|[\n\r])*)<\/body>/im; // https://stackoverflow.com/a/3642850/6120338
  const log = (...args) => window.__live_server_log__.push(...args);

  window.addEventListener('DOMContentLoaded', () => {
    if (!('WebSocket' in window)) {
      return console.error(
        'Upgrade your browser. This Browser is NOT supported WebSocket for Live-Reloading.'
      );
    }

    const protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
    const address = protocol + window.location.host + '/_ws_lspp';
    const socket = new WebSocket(address);
    socket.onmessage = function(msg) {
      const res = JSON.parse(msg.data);
      if (res.action === 'refreshcss') return refreshCSS();
      if (res.action === 'reload') return fullBrowserReload();
      if (res.action === 'hot') {
        if (!res.data) return fullBrowserReload();
        if (!isSameUrl(res.data.fileName, location.pathname)) return;
        if (res.data.dom) updateDOM(res.data.dom);
      }
    };

    if (!sessionStorage.getItem('IsThisFirstTime_Log_From_LiveServer++')) {
      console.log('Live reload enabled.');
      sessionStorage.setItem('IsThisFirstTime_Log_From_LiveServer++', true);
    }
  });

  function updateDOM(html) {
    applyOneOf(onDemandHTMLRender, fullHTMLRerender, fullBrowserReload)(html);
  }

  function fullHTMLRerender(html) {
    const body = bodyRegex.exec(html)[0];
    const template = document.createElement('body');
    template.innerHTML = body;
    document.body.replaceWith(template);
    template.style.visibility = '';
  }

  function onDemandHTMLRender(html) {
    const newBody = bodyRegex.exec(html)[0];
    const diff = dd.diff(document.body, newBody);
    const result = dd.apply(document.body, diff);
    if (!result) throw "Can't able to update DOM";
  }

  function fullBrowserReload() {
    window.location.reload();
  }

  function applyOneOf(...fns) {
    return (...args) => {
      for (let i = 0; i < fns.length; i++) {
        const fn = fns[i];
        try {
          fn(...args);
          break;
        } catch (error) {
          log(error);
        }
      }
    };
  }

  function isSameUrl(url1, url2) {
    if (!url1 || url1 === '/') url1 = 'index.html';
    if (!url2 || url2 === '/') url2 = 'index.html';

    if (url1.startsWith('/')) url1 = url1.substr(1);
    if (url2.startsWith('/')) url2 = url2.substr(1);

    return url1 === url2;
  }

  function refreshCSS() {
    var sheets = [].slice.call(document.getElementsByTagName('link'));
    var head = document.getElementsByTagName('head')[0];
    for (var i = 0; i < sheets.length; ++i) {
      var elem = sheets[i];
      var parent = elem.parentElement || head;
      parent.removeChild(elem);
      var rel = elem.rel;
      if (
        (elem.href && typeof rel != 'string') ||
        rel.length == 0 ||
        rel.toLowerCase() == 'stylesheet'
      ) {
        var url = elem.href.replace(/(&|\?)_cacheOverride=\d+/, '');
        elem.href =
          url +
          (url.indexOf('?') >= 0 ? '&' : '?') +
          '_cacheOverride=' +
          new Date().valueOf();
      }
      parent.appendChild(elem);
    }
  }
})();
