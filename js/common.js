(() => {
  'use strict';

  /* ============================
     ユーティリティ
  ============================ */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  /* ============================
     ヘッダー高 → CSS変数へ反映（SP想定）
     - CSS側で #global-nav { top: calc(var(--header-h, 56px) + env(safe-area-inset-top)); height: calc(100dvh - (...)) }
       のように使うことを前提
  ============================ */
  const root = document.documentElement;
  const header = $('header');
  const mql = window.matchMedia('(min-width: 781px)'); // PC閾値
  const setHeaderHeightVar = () => {};
  // const setHeaderHeightVar = () => {
  //   if (!header) return;
  //   // 実寸を計測（フォントや折返しで高さが変わる可能性があるため、都度再計測）
  //   const h = Math.ceil(header.getBoundingClientRect().height) || 56;
  //   root.style.setProperty('--header-h', `${h}px`);
  // };

  // // 初期 & 変化トリガで更新
  // on(window, 'load', setHeaderHeightVar);
  // on(window, 'resize', setHeaderHeightVar, { passive: true });
  // on(window, 'orientationchange', setHeaderHeightVar);
  // mql.addEventListener?.('change', setHeaderHeightVar);
  // if (document.fonts?.ready) {
  //   document.fonts.ready.then(setHeaderHeightVar).catch(() => {});
  // }

  /* ============================
     背景スクロールロック
  ============================ */
  const body = document.body;
  let scrollYBeforeLock = 0;

  const lockScroll = () => {
    if (body.dataset.locked === '1') return;
    scrollYBeforeLock = window.scrollY || window.pageYOffset || 0;
    body.style.position = 'fixed';
    body.style.top = `-${scrollYBeforeLock}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.dataset.locked = '1';
  };

  const unlockScroll = () => {
    if (body.dataset.locked !== '1') return;
    body.style.position = '';
    body.style.top = '';
    body.style.left = '';
    body.style.right = '';
    body.style.width = '';
    body.dataset.locked = '0';
    window.scrollTo(0, scrollYBeforeLock);
  };

  /* ============================
     ハンバーガーメニュー制御
  ============================ */
  const btn = $('.hamburger');
  const nav = $('#global-nav');

  if (btn && nav) {
    const firstLink = nav.querySelector('a');

    const open = () => {
      // 開く直前に最新のヘッダー高を反映して「めり込み」を防止
      setHeaderHeightVar();

      body.classList.add('menu-open');    // CSSのclip-pathアニメ等はCSS側に委譲
      btn.setAttribute('aria-expanded', 'true');
      btn.setAttribute('aria-label', 'メニューを閉じる');
      lockScroll();                       // 背景スクロールを物理ロック

      // 初期フォーカス（アクセシビリティ）
      setTimeout(() => { firstLink && firstLink.focus(); }, 180);
    };

    const close = () => {
      body.classList.remove('menu-open');
      btn.setAttribute('aria-expanded', 'false');
      btn.setAttribute('aria-label', 'メニューを開く');
      unlockScroll();
      btn.focus();
    };

    on(btn, 'click', () => {
      body.classList.contains('menu-open') ? close() : open();
    });

    // ESCで閉じる
    on(document, 'keydown', (e) => {
      if (e.key === 'Escape' && body.classList.contains('menu-open')) {
        close();
      }
    });

    // ナビ内のリンクを押したら閉じる
    on(nav, 'click', (e) => {
      const a = e.target.closest('a');
      if (a) close();
    });

    // PC幅に切り替わったら強制クローズ
    mql.addEventListener?.('change', () => {
      if (mql.matches) close();
    });

    // オーバーレイ内のみのタッチスクロールは許可（背面へは伝播させない）
    on(nav, 'touchmove', (e) => {
      const el = e.target.closest('#global-nav');
      const canScroll = el && (el.scrollHeight > el.clientHeight);
      if (!canScroll) {
        e.preventDefault();
      }
    }, { passive: false });
  }

  /* ============================
     トップに戻るボタン制御（復活）
  ============================ */
  const toTopBtn = $('.to-top');
  if (toTopBtn) {
    const updateVisibility = () => {
      // ページ先頭以外で表示
      if (window.scrollY > 0) toTopBtn.classList.add('show');
      else toTopBtn.classList.remove('show');
    };
    on(window, 'scroll', updateVisibility, { passive: true });
    updateVisibility();

    on(toTopBtn, 'click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
