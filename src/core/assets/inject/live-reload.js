(function() {
  window.__live_server_log__ = [];

  const storageKeyIsThisFirstTime = 'IsThisFirstTime_Log_From_LiveServer++';
  const { DiffDOM } = diffDOM;
  const dd = new DiffDOM({
    trimNodeTextValue: true
  });
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
      const { action, data } = res;
      if (action === 'refreshcss') return refreshCSS();
      if (action === 'reload') return fullBrowserReload();
      if (action === 'hot') return updateDOM(data.dom);
      if (action === 'partial-reload') return fullHTMLRerender(data.dom);
    };

    socket.onopen = event => {
      log(event);
      socket.send(JSON.stringify({ watchList: getWatchList() }));
      if (!sessionStorage.getItem(storageKeyIsThisFirstTime)) {
        console.log('Live Server++: connected!');
        sessionStorage.setItem(storageKeyIsThisFirstTime, true);
      }
    };

    socket.onerror = event => {
      log(event);
      console.log(`Live Server++: Opps! Can't able to connect.`);
    };
  });

  function getWatchList() {
    return [window.location.pathname];
  }

  function updateDOM(html) {
    tryOneOf(onDemandHTMLRender, fullHTMLRerender, fullBrowserReload)(html);
  }

  function fullHTMLRerender(html) {
    const body = bodyRegex.exec(html)[0];
    const template = document.createElement('body');
    template.innerHTML = body;
    document.body.replaceWith(template);
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

  function tryOneOf(...fns) {
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

  // THIS FUNCTION IS MODIFIED FROM `https://www.npmjs.com/package/live-server`
  function refreshCSS() {
    const sheets = [].slice.call(document.getElementsByTagName('link'));
    const head = document.getElementsByTagName('head')[0];
    for (let i = 0; i < sheets.length; ++i) {
      const elem = sheets[i];

      const href = elem.getAttribute('href');
      if (!href || href.startsWith('http')) continue;

      const parent = elem.parentElement || head;
      parent.removeChild(elem);
      const rel = elem.rel;
      if (
        (href && typeof rel != 'string') ||
        rel.length == 0 ||
        rel.toLowerCase() == 'stylesheet'
      ) {
        const url = href.replace(/(&|\?)_cacheOverride=\d+/, '');
        elem.setAttribute(
          'href',
          url +
            (url.indexOf('?') >= 0 ? '&' : '?') +
            '_cacheOverride=' +
            new Date().valueOf()
        );
      }
      parent.appendChild(elem);
    }
  }

  function refreshJS() {
    const links = [...document.querySelectorAll('script[src]')].filter(e => {
      if (!e.getAttribute || e.getAttribute('data-live-server-ignore'))
        return false;
      const src = e.getAttribute('src') || '';
      return !src.startsWith('http'); // Target links are local scripts
    });
    const body = document.querySelector('body');
    for (let i = 0; i < links.length; ++i) {
      const link = links[i];
      const parent = link.parentElement || body;
      parent.removeChild(link);

      setTimeout(() => {
        const src = link.getAttribute('src');
        const newLink = document.createElement('script');
        link.getAttributeNames().forEach(name => {
          newLink.setAttribute(name, link.getAttribute(name));
        });

        if (src) {
          var url = src.replace(/(&|\?)_cacheOverride=\d+/, '');
          newLink.src =
            url +
            (url.indexOf('?') >= 0 ? '&' : '?') +
            '_cacheOverride=' +
            new Date().valueOf();
        }

        parent.appendChild(newLink);
      }, 50);
    }
  }
})();
