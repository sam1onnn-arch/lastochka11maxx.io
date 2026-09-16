/* ═══════════════════════════════════════════
   ЛаСТОчка11 · вторая версия — интерактив
   ═══════════════════════════════════════════ */
(function () {
  'use strict';

  var NB = '\u00a0';   /* неразрывный пробел */

  /* Время Сыктывкара (МСК), а не часы посетителя */
  function mskNow() {
    var n = new Date();
    return new Date(n.getTime() + n.getTimezoneOffset() * 60000 + 3 * 3600000);
  }


  /* ─────────── Сезонная полоса ───────────
     Меняется сама по месяцу. Чтобы поменять текст — правьте строки ниже. */
  var SEASONS = [
    { months: [9, 10, 11],
      title: 'Проверить машину перед зимой',
      text: 'Аккумулятор, свечи, антифриз, тормоза и' + NB + 'подвеска' + NB + '— за' + NB + 'один заезд, пока не' + NB + 'ударили морозы',
      button: 'Записаться на' + NB + 'проверку', lead: 'Проверка перед зимой' },
    { months: [12, 1, 2],
      title: 'Не' + NB + 'заводится в' + NB + 'мороз?',
      text: 'Проверим аккумулятор, стартер и' + NB + 'свечи и' + NB + 'найдём, почему машина не' + NB + 'хочет просыпаться',
      button: 'Записаться на' + NB + 'проверку', lead: 'Не заводится в мороз' },
    { months: [3, 4, 5],
      title: 'Подготовить машину к' + NB + 'отпуску',
      text: 'Тормоза, подвеска, жидкости и' + NB + 'свет' + NB + '— чтобы дальняя дорога обошлась без сюрпризов',
      button: 'Записаться на' + NB + 'проверку', lead: 'Подготовка машины к отпуску' },
    { months: [6, 7, 8],
      title: 'Жара' + NB + '— не' + NB + 'повод закипать',
      text: 'Проверим радиатор, вентилятор, помпу и' + NB + 'антифриз, чтобы двигатель не' + NB + 'закипел в' + NB + 'пробке',
      button: 'Проверить охлаждение', lead: 'Проверка системы охлаждения' }
  ];

  (function season() {
    var root = document.getElementById('season');
    if (!root) return;
    var month = mskNow().getMonth() + 1;
    var s = SEASONS.filter(function (x) { return x.months.indexOf(month) !== -1; })[0];
    if (!s) return;
    root.querySelector('[data-season="title"]').textContent = s.title;
    root.querySelector('[data-season="text"]').textContent = s.text;
    var btn = root.querySelector('[data-season="button"]');
    btn.textContent = s.button;
    btn.setAttribute('data-lead', s.lead);
  })();


  /* ─────────── «Открыто / закрыто» ───────────
     TODO: график. Ключ — день недели (0 — воскресенье), null — выходной.
     Тот же график — в разметке организации в <head>, в «Контактах» и в подвале. */
  var HOURS = { 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 19], 6: [10, 16], 0: null };
  var DAYS = ['воскресенье', 'понедельник', 'вторник', 'среду', 'четверг', 'пятницу', 'субботу'];

  (function openStatus() {
    var els = document.querySelectorAll('[data-status]');
    if (!els.length) return;

    function time(h) { return h + ':00'; }
    function nextDay(from) {
      for (var i = 1; i <= 7; i++) {
        var d = (from + i) % 7;
        if (HOURS[d]) return { day: d, hour: HOURS[d][0], shift: i };
      }
      return null;
    }

    function render() {
      var t = mskNow();
      var day = t.getDay();
      var mins = t.getHours() * 60 + t.getMinutes();
      var today = HOURS[day];
      var open = false;
      var text;

      if (today && mins >= today[0] * 60 && mins < today[1] * 60) {
        open = true;
        text = 'Открыто до' + NB + time(today[1]);
      } else if (today && mins < today[0] * 60) {
        text = 'Откроем сегодня в' + NB + time(today[0]);
      } else {
        var nx = nextDay(day);
        text = nx.shift === 1
          ? 'Откроем завтра в' + NB + time(nx.hour)
          : 'Откроем в' + NB + DAYS[nx.day] + ' в' + NB + time(nx.hour);
      }

      els.forEach(function (el) {
        el.querySelector('span').textContent = text;
        el.classList.toggle('is-open', open);
      });
    }

    render();
    setInterval(render, 60000);
  })();


  /* ─────────── Шапка: линия при прокрутке и активный раздел ─────────── */
  (function topbar() {
    var bar = document.getElementById('topbar');
    if (!bar) return;
    var links = [].slice.call(bar.querySelectorAll('.nav a'));
    var targets = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
    var heroStatus = document.querySelector('.hero__status');
    var ticking = false;

    function update() {
      bar.classList.toggle('is-scrolled', window.scrollY > 8);
      bar.classList.toggle('show-status', !heroStatus || heroStatus.getBoundingClientRect().bottom < bar.offsetHeight);
      var line = window.innerHeight * 0.4;
      var active = -1;
      targets.forEach(function (sec, i) {
        if (!sec) return;
        var r = sec.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) active = i;
      });
      links.forEach(function (a, i) { a.classList.toggle('is-active', i === active); });
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();


  /* ─────────── Мобильное меню ─────────── */
  var drawerApi = (function drawer() {
    var btn = document.getElementById('burger');
    var menu = document.getElementById('drawer');
    if (!btn || !menu) return { close: function () {} };

    function toggle(open) {
      menu.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('is-locked', open);
    }
    btn.addEventListener('click', function () { toggle(menu.hidden); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { toggle(false); });
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) toggle(false);
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > 1180 && !menu.hidden) toggle(false);
    });
    return { close: function () { toggle(false); } };
  })();


  /* ─────────── Окна: заявка и согласие ─────────── */
  var lead = document.getElementById('lead');
  var consent = document.getElementById('consent');
  var canModal = !!(lead && typeof lead.showModal === 'function');

  function openDialog(d) {
    if (!d) return;
    if (canModal) {
      d.showModal();
      document.body.classList.add('is-locked');
    } else {
      d.setAttribute('open', '');
    }
  }
  [lead, consent].forEach(function (d) {
    if (!d) return;
    d.addEventListener('close', function () {
      if (!document.querySelector('dialog[open]')) document.body.classList.remove('is-locked');
    });
    /* клик мимо окна закрывает его */
    d.addEventListener('click', function (e) { if (e.target === d) d.close(); });
    d.querySelectorAll('[data-close]').forEach(function (b) {
      b.addEventListener('click', function () {
        if (canModal) d.close(); else d.removeAttribute('open');
      });
    });
  });

  /* Текст из data-lead вписывается в «Что беспокоит».
     «Стучит подвеска» → «Стучит подвеска. », «Мототехника: » остаётся как есть */
  function topicText(topic) {
    var t = topic.replace(/\s+$/, '');
    return /[:.?!]$/.test(t) ? t + ' ' : t + '. ';
  }

  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-lead]');
    if (trigger) {
      e.preventDefault();
      drawerApi.close();
      var topic = trigger.getAttribute('data-lead');

      if (!canModal) {
        var fallback = document.querySelector('#contact .js-lead-form');
        if (topic) fallback.querySelector('textarea').value = topicText(topic);
        document.getElementById('contact').scrollIntoView();
        return;
      }

      var msg = lead.querySelector('textarea[name="message"]');
      if (topic) msg.value = topicText(topic);
      var st = lead.querySelector('.form__status');
      st.textContent = '';
      st.className = 'form__status';
      openDialog(lead);
      if (window.matchMedia('(hover: hover)').matches) lead.querySelector('input[name="name"]').focus();
      return;
    }

    if (e.target.closest('[data-consent]')) {
      e.preventDefault();
      openDialog(consent);
    }
  });


  /* ─────────── Формы заявки ─────────── */
  document.querySelectorAll('.js-lead-form').forEach(function (form) {
    var phone = form.querySelector('input[name="phone"]');
    var agree = form.querySelector('input[name="agree"]');
    var agreeErr = form.querySelector('[data-err="agree"]');
    var phoneErr = phone.closest('.field').querySelector('[data-err]');
    var status = form.querySelector('.form__status');
    var submit = form.querySelector('button[type="submit"]');
    var label = submit.textContent;

    /* маска телефона */
    phone.addEventListener('input', function () {
      var d = phone.value.replace(/\D/g, '');
      if (!d) { phone.value = ''; return; }
      if (d[0] === '8') d = '7' + d.slice(1);
      if (d[0] !== '7') d = '7' + d;
      d = d.slice(0, 11);
      var out = '+7';
      if (d.length > 1) out += ' (' + d.slice(1, 4);
      if (d.length >= 5) out += ') ' + d.slice(4, 7);
      if (d.length >= 8) out += '-' + d.slice(7, 9);
      if (d.length >= 10) out += '-' + d.slice(9, 11);
      phone.value = out;
      setPhoneErr('');
    });
    phone.addEventListener('focus', function () { if (!phone.value) phone.value = '+7 ('; });
    phone.addEventListener('blur', function () { if (phone.value.replace(/\D/g, '').length <= 1) phone.value = ''; });

    function setPhoneErr(msg) {
      phone.closest('.field').classList.toggle('has-err', !!msg);
      phoneErr.textContent = msg;
    }
    agree.addEventListener('change', function () { if (agree.checked) agreeErr.textContent = ''; });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = '';
      status.className = 'form__status';

      var ok = true;
      if (phone.value.replace(/\D/g, '').length !== 11) {
        setPhoneErr('Нужен номер целиком, чтобы перезвонить');
        ok = false;
      }
      if (!agree.checked) {
        agreeErr.textContent = 'Без согласия мы' + NB + 'не' + NB + 'сможем перезвонить';
        ok = false;
      }
      if (!ok) {
        status.textContent = 'Проверьте отмеченные поля';
        status.classList.add('is-err');
        return;
      }

      submit.disabled = true;
      submit.textContent = 'Отправляем…';
      var data = {};
      new FormData(form).forEach(function (v, k) { data[k] = v; });

      /* ─────────────────────────────────────────────────────────
         ЗАГЛУШКА ОТПРАВКИ. Заявка пока никуда не уходит.
         Подключите приёмник форм (Formspree, Web3Forms) и замените блок на:

           fetch('https://formspree.io/f/ВАШ_ID', {
             method: 'POST', headers: { 'Accept': 'application/json' }, body: new FormData(form)
           }).then(function (r) { if (!r.ok) throw new Error(); done(); })
             .catch(function () { fail(); });
         ───────────────────────────────────────────────────────── */
      console.log('Заявка:', data);
      setTimeout(done, 700);

      function done() {
        form.reset();
        submit.disabled = false;
        submit.textContent = label;
        status.className = 'form__status is-ok';
        status.textContent = 'Заявка принята. Перезвоним в' + NB + 'рабочее время и' + NB + 'подберём удобное окно.';
      }
    });
  });


  /* ─────────── До и после: ползунок ───────────
     Мышью можно щёлкнуть в любое место или тянуть. Пальцем — тянуть по горизонтали:
     вертикальный свайп остаётся прокруткой страницы. С клавиатуры — стрелками. */
  document.querySelectorAll('[data-ba]').forEach(function (frame) {
    var range = frame.querySelector('.ba__range');
    var drag = null;

    function set(v) {
      v = Math.max(0, Math.min(100, v));
      frame.style.setProperty('--pos', v + '%');
      frame.classList.toggle('hide-before', v < 12);
      frame.classList.toggle('hide-after', v > 88);
      range.value = Math.round(v);
    }
    function toPointer(e) {
      var r = frame.getBoundingClientRect();
      set((e.clientX - r.left) / r.width * 100);
    }
    /* захват нужен, чтобы тянуть и за пределами картинки; если браузер откажет — просто без него */
    function capture(id) {
      try { frame.setPointerCapture(id); } catch (err) { /* ничего страшного */ }
    }

    frame.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      drag = { id: e.pointerId, x: e.clientX, touch: e.pointerType !== 'mouse', moved: false };
      if (!drag.touch) { capture(e.pointerId); toPointer(e); }
    });
    frame.addEventListener('pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      /* палец: двигаем только после явного горизонтального жеста, чтобы касание при прокрутке не дёргало ползунок */
      if (drag.touch && !drag.moved) {
        if (Math.abs(e.clientX - drag.x) < 6) return;
        drag.moved = true;
        capture(e.pointerId);
      }
      toPointer(e);
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (type) {
      frame.addEventListener(type, function () { drag = null; });
    });
    range.addEventListener('input', function () { set(+range.value); });
    set(+range.value);
  });


  /* ─────────── Карта ───────────
     Виджет Яндекса грузится, когда блок подъезжает к экрану.
     В однофайловой версии внешние фреймы запрещены — там остаётся заглушка. */
  (function map() {
    var el = document.querySelector('[data-map]');
    if (!el || window.LASTOCHKA_SINGLE_FILE) return;

    function load() {
      var f = document.createElement('iframe');
      f.src = el.getAttribute('data-map');
      f.title = 'Карта: Сыктывкар, улица Школьная, 51';
      f.loading = 'lazy';
      el.appendChild(f);
    }
    if (!('IntersectionObserver' in window)) { load(); return; }
    var io = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) { io.disconnect(); load(); }
    }, { rootMargin: '400px 0px' });
    io.observe(el);
  })();


  /* ─────────── Год в подвале ─────────── */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = mskNow().getFullYear();
  });

})();
