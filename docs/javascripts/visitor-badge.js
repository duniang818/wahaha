(function () {
  function addVisitorBadge() {
    const copyright = document.querySelector('.md-copyright') || document.querySelector('.md-footer__inner');
    if (!copyright) return;

    // 使用固定站点地址作为计数 key，让所有页面共享同一个总计数
    const siteUrl = 'https://duniang818.github.io/wahaha/';
    const badgeUrl =
      'https://hits.seeyoufarm.com/api/count/keep/badge.svg?url=' +
      encodeURIComponent(siteUrl) +
      '&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=%E8%AE%BF%E9%97%AE&edge_flat=false';

    const span = document.createElement('span');
    span.className = 'dn-visitor-badge';
    span.style.marginLeft = '0.6em';
    span.style.verticalAlign = 'middle';
    span.innerHTML =
      '<img src="' +
      badgeUrl +
      '" alt="访问计数" loading="lazy" style="height:18px;vertical-align:middle;">';

    copyright.appendChild(span);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addVisitorBadge);
  } else {
    addVisitorBadge();
  }
})();
