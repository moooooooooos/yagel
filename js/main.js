/**
 * Апарт-отель «Ягельный» (г. Новый Уренгой)
 * Главный скрипт интерактивности (Vanilla JS)
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Мобильное меню ---
  const burger = document.querySelector('.header__burger');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileOverlay = document.querySelector('.mobile-nav__overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav__link');

  const toggleMenu = () => {
    burger?.classList.toggle('active');
    mobileNav?.classList.toggle('active');
    mobileOverlay?.classList.toggle('active');
    document.body.style.overflow = mobileNav?.classList.contains('active') ? 'hidden' : '';
  };

  burger?.addEventListener('click', toggleMenu);
  mobileOverlay?.addEventListener('click', toggleMenu);
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (mobileNav?.classList.contains('active')) toggleMenu();
    });
  });

  // --- 2. Плавный скролл к секциям ---
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId.startsWith('#') || targetId.length <= 1) return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // --- 2.1. Логика премиального виджета бронирования и TravelLine (Quiet Luxury) ---
  const dateInInput = document.getElementById('date-in');
  const dateOutInput = document.getElementById('date-out');
  const displayValIn = document.getElementById('bw-val-in');
  const displayValOut = document.getElementById('bw-val-out');
  const displayNights = document.getElementById('bw-nights-text');
  const cellCheckin = document.getElementById('cell-checkin');
  const cellCheckout = document.getElementById('cell-checkout');
  const bsDates = document.getElementById('bs-dates');

  const datesPopover = document.getElementById('dates-popover');
  const dpStepHint = document.getElementById('dp-step-hint');
  const dpPrevMonth = document.getElementById('dp-prev-month');
  const dpNextMonth = document.getElementById('dp-next-month');
  const dpCalendarsContainer = document.getElementById('dp-calendars-container');
  const dpSummaryDates = document.getElementById('dp-summary-dates');
  const dpSummaryNights = document.getElementById('dp-summary-nights');
  const dpApplyBtn = document.getElementById('dp-apply-btn');

  const bsGuests = document.getElementById('bs-guests');
  const guestsPopover = document.getElementById('guests-popover');
  const valGuests = document.getElementById('bw-val-guests');
  const valCategory = document.getElementById('bw-val-category');
  const categorySelect = document.getElementById('bw-category-select');
  const applyGuestsBtn = document.getElementById('btn-guests-apply');

  const btnAdultsMinus = document.getElementById('btn-adults-minus');
  const btnAdultsPlus = document.getElementById('btn-adults-plus');
  const valAdults = document.getElementById('val-adults');

  const btnKidsMinus = document.getElementById('btn-kids-minus');
  const btnKidsPlus = document.getElementById('btn-kids-plus');
  const valKids = document.getElementById('val-kids');

  const searchRoomsBtn = document.getElementById('bw-submit-btn');

  let adultsCount = 2;
  let kidsCount = 0;

  const monthNamesRu = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'];
  const fullMonthNamesRu = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];
  const dayNamesRu = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  const weekDaysShort = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  function formatDateDisplay(d) {
    return `${d.getDate()} ${monthNamesRu[d.getMonth()]}, ${dayNamesRu[d.getDay()]}`;
  }

  function formatISODate(d) {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getPluralNights(n) {
    if (n % 10 === 1 && n % 100 !== 11) return `${n} ночь`;
    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return `${n} ночи`;
    return `${n} ночей`;
  }

  function getPluralGuests(n) {
    if (n % 10 === 1 && n % 100 !== 11) return `${n} гость`;
    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return `${n} гостя`;
    return `${n} гостей`;
  }

  // Сегодняшняя дата и даты по умолчанию (завтра и послезавтра)
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let selectedIn = new Date(today);
  selectedIn.setDate(today.getDate() + 1);
  let selectedOut = new Date(selectedIn);
  selectedOut.setDate(selectedIn.getDate() + 1);

  let viewYear = today.getFullYear();
  let viewMonth = today.getMonth(); // 0..11
  let selectingTarget = 'checkin'; // 'checkin' | 'checkout'
  let hoverDate = null;

  function updateWidgetDisplay() {
    if (dateInInput) dateInInput.value = formatISODate(selectedIn);
    if (dateOutInput) dateOutInput.value = formatISODate(selectedOut);
    if (displayValIn) displayValIn.textContent = formatDateDisplay(selectedIn);
    if (displayValOut) displayValOut.textContent = formatDateDisplay(selectedOut);

    const diffMs = selectedOut.getTime() - selectedIn.getTime();
    const nights = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
    if (displayNights) displayNights.textContent = getPluralNights(nights);

    if (dpSummaryDates) {
      dpSummaryDates.textContent = `${selectedIn.getDate()} ${monthNamesRu[selectedIn.getMonth()]} – ${selectedOut.getDate()} ${monthNamesRu[selectedOut.getMonth()]}`;
    }
    if (dpSummaryNights) {
      dpSummaryNights.textContent = `${getPluralNights(nights)} в апарт-отеле`;
    }
  }

  // Кэш сгенерированных элементов дней для мгновенного обновления подсветки без уничтожения DOM
  let renderedDayItems = [];

  function updateDaysVisuals() {
    const startMs = selectedIn ? selectedIn.getTime() : null;
    const endMs = selectedOut ? selectedOut.getTime() : null;
    const hoverMs = (selectingTarget === 'checkout' && hoverDate && selectedIn && hoverDate > selectedIn)
      ? hoverDate.getTime()
      : null;

    const effectiveEndMs = hoverMs || endMs;

    renderedDayItems.forEach(({ el, time }) => {
      el.classList.remove('dp-day--range-start', 'dp-day--range-end', 'dp-day--hover-end', 'dp-day--in-range');

      if (!startMs) return;

      const isStart = time === startMs;
      const isEnd = hoverMs ? (time === hoverMs) : (time === endMs);
      const inBetween = effectiveEndMs && time > startMs && time < effectiveEndMs;

      if (isStart) {
        el.classList.add('dp-day--range-start');
      }
      if (isEnd) {
        if (hoverMs && time === hoverMs) {
          el.classList.add('dp-day--hover-end');
        } else {
          el.classList.add('dp-day--range-end');
        }
      }
      if (inBetween) {
        el.classList.add('dp-day--in-range');
      }
    });

    // Живая подсказка дат в футере календаря
    if (dpSummaryDates && dpSummaryNights && selectedIn) {
      const activeEnd = (hoverDate && hoverDate > selectedIn) ? hoverDate : selectedOut;
      if (activeEnd) {
        const diffMs = activeEnd.getTime() - selectedIn.getTime();
        const nights = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
        dpSummaryDates.textContent = `${selectedIn.getDate()} ${monthNamesRu[selectedIn.getMonth()]} – ${activeEnd.getDate()} ${monthNamesRu[activeEnd.getMonth()]}`;
        dpSummaryNights.textContent = `${getPluralNights(nights)} в апарт-отеле`;
      }
    }
  }

  function renderCalendars() {
    if (!dpCalendarsContainer) return;
    dpCalendarsContainer.innerHTML = '';
    renderedDayItems = [];

    const isMobile = window.innerWidth <= 600;
    const monthsToShow = isMobile ? 1 : 2;

    for (let m = 0; m < monthsToShow; m++) {
      let mYear = viewYear;
      let mMonth = viewMonth + m;
      if (mMonth > 11) {
        mYear += Math.floor(mMonth / 12);
        mMonth = mMonth % 12;
      }

      const monthDiv = document.createElement('div');
      monthDiv.className = 'dp-month';

      const nameDiv = document.createElement('div');
      nameDiv.className = 'dp-month__name';
      nameDiv.textContent = `${fullMonthNamesRu[mMonth]} ${mYear}`;
      monthDiv.appendChild(nameDiv);

      const weekdaysDiv = document.createElement('div');
      weekdaysDiv.className = 'dp-weekdays';
      weekDaysShort.forEach(w => {
        const wDiv = document.createElement('div');
        wDiv.className = 'dp-weekday';
        wDiv.textContent = w;
        weekdaysDiv.appendChild(wDiv);
      });
      monthDiv.appendChild(weekdaysDiv);

      const daysDiv = document.createElement('div');
      daysDiv.className = 'dp-days';

      const firstDay = new Date(mYear, mMonth, 1);
      let startDayOfWeek = firstDay.getDay() - 1;
      if (startDayOfWeek < 0) startDayOfWeek = 6;

      for (let i = 0; i < startDayOfWeek; i++) {
        const empty = document.createElement('div');
        daysDiv.appendChild(empty);
      }

      const daysInMonth = new Date(mYear, mMonth + 1, 0).getDate();
      for (let d = 1; d <= daysInMonth; d++) {
        const currentD = new Date(mYear, mMonth, d);
        const dayEl = document.createElement('div');
        dayEl.className = 'dp-day';
        dayEl.textContent = d;

        const isPast = currentD < today;
        if (isPast) {
          dayEl.classList.add('dp-day--disabled');
        } else {
          const isToday = currentD.getTime() === today.getTime();
          if (isToday) dayEl.classList.add('dp-day--today');

          renderedDayItems.push({
            el: dayEl,
            date: currentD,
            time: currentD.getTime()
          });

          // Наведение мыши: ТОЛЬКО обновляет классы, не уничтожая DOM!
          dayEl.addEventListener('mouseenter', () => {
            if (selectingTarget === 'checkout' && currentD > selectedIn) {
              hoverDate = currentD;
              updateDaysVisuals();
            }
          });

          // Клик по дате
          dayEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (selectingTarget === 'checkin') {
              selectedIn = currentD;
              if (selectedOut <= selectedIn) {
                selectedOut = new Date(selectedIn);
                selectedOut.setDate(selectedIn.getDate() + 1);
              }
              selectingTarget = 'checkout';
              if (dpStepHint) dpStepHint.textContent = 'Теперь выберите дату выезда';
              cellCheckin?.classList.remove('active');
              cellCheckout?.classList.add('active');
            } else {
              // selectingTarget === 'checkout'
              if (currentD > selectedIn) {
                selectedOut = currentD;
                selectingTarget = 'checkin';
                if (dpStepHint) dpStepHint.textContent = 'Даты выбраны';
                cellCheckin?.classList.remove('active');
                cellCheckout?.classList.remove('active');
                setTimeout(() => closeDatesPopover(), 350);
              } else {
                // Кликнули на дату раньше или равную заезду - переключаем заезд на эту дату
                selectedIn = currentD;
                selectedOut = new Date(selectedIn);
                selectedOut.setDate(selectedIn.getDate() + 1);
                selectingTarget = 'checkout';
                if (dpStepHint) dpStepHint.textContent = 'Теперь выберите дату выезда';
                cellCheckin?.classList.remove('active');
                cellCheckout?.classList.add('active');
              }
            }
            hoverDate = null;
            updateWidgetDisplay();
            updateDaysVisuals();
          });
        }

        daysDiv.appendChild(dayEl);
      }

      monthDiv.appendChild(daysDiv);
      dpCalendarsContainer.appendChild(monthDiv);
    }

    // Первичное применение подсветки
    updateDaysVisuals();
  }

  // Сброс ховера при уходе курсора с календаря
  dpCalendarsContainer?.addEventListener('mouseleave', () => {
    if (hoverDate) {
      hoverDate = null;
      updateDaysVisuals();
    }
  });

  function openDatesPopover(mode = 'checkin') {
    selectingTarget = mode;
    hoverDate = null;
    if (dpStepHint) {
      dpStepHint.textContent = mode === 'checkin' ? 'Кликните на дату заезда' : 'Кликните на дату выезда';
    }
    cellCheckin?.classList.toggle('active', mode === 'checkin');
    cellCheckout?.classList.toggle('active', mode === 'checkout');
    datesPopover?.classList.add('active');
    renderCalendars();

    setTimeout(() => {
      if (datesPopover?.classList.contains('active')) {
        const rect = datesPopover.getBoundingClientRect();
        if (rect.bottom > window.innerHeight) {
          window.scrollBy({ top: rect.bottom - window.innerHeight + 30, behavior: 'smooth' });
        }
      }
    }, 60);
  }

  function closeDatesPopover() {
    datesPopover?.classList.remove('active');
    cellCheckin?.classList.remove('active');
    cellCheckout?.classList.remove('active');
    hoverDate = null;
  }

  cellCheckin?.addEventListener('click', (e) => {
    e.stopPropagation();
    guestsPopover?.classList.remove('active');
    bsGuests?.classList.remove('active');
    if (datesPopover?.classList.contains('active') && selectingTarget === 'checkin') {
      closeDatesPopover();
    } else {
      openDatesPopover('checkin');
    }
  });

  cellCheckout?.addEventListener('click', (e) => {
    e.stopPropagation();
    guestsPopover?.classList.remove('active');
    bsGuests?.classList.remove('active');
    if (datesPopover?.classList.contains('active') && selectingTarget === 'checkout') {
      closeDatesPopover();
    } else {
      openDatesPopover('checkout');
    }
  });

  dpPrevMonth?.addEventListener('click', (e) => {
    e.stopPropagation();
    viewMonth--;
    if (viewMonth < 0) {
      viewMonth = 11;
      viewYear--;
    }
    renderCalendars();
  });

  dpNextMonth?.addEventListener('click', (e) => {
    e.stopPropagation();
    viewMonth++;
    if (viewMonth > 11) {
      viewMonth = 0;
      viewYear++;
    }
    renderCalendars();
  });

  dpApplyBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    closeDatesPopover();
  });

  document.querySelectorAll('.dp-preset-chip').forEach(chip => {
    chip.addEventListener('click', (e) => {
      e.stopPropagation();
      document.querySelectorAll('.dp-preset-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const preset = chip.getAttribute('data-preset');
      if (preset === 'weekend') {
        const d = new Date(today);
        const day = d.getDay();
        const diff = (5 - day + 7) % 7 || 7;
        d.setDate(d.getDate() + diff);
        selectedIn = d;
        selectedOut = new Date(selectedIn);
        selectedOut.setDate(selectedIn.getDate() + 2);
      } else {
        const n = parseInt(preset, 10) || 1;
        selectedOut = new Date(selectedIn);
        selectedOut.setDate(selectedIn.getDate() + n);
      }
      selectingTarget = 'checkin';
      updateWidgetDisplay();
      renderCalendars();
    });
  });

  document.addEventListener('click', (e) => {
    if (datesPopover && !datesPopover.contains(e.target) && !bsDates?.contains(e.target)) {
      closeDatesPopover();
    }
  });

  // Управление гостями и категорией
  function updateGuestsDisplay() {
    const total = adultsCount + kidsCount;
    if (valGuests) valGuests.textContent = `${getPluralGuests(total)} · 1 номер`;
    if (valAdults) valAdults.textContent = adultsCount;
    if (valKids) valKids.textContent = kidsCount;

    if (btnAdultsMinus) btnAdultsMinus.disabled = adultsCount <= 1;
    if (btnAdultsPlus) btnAdultsPlus.disabled = adultsCount >= 5;
    if (btnKidsMinus) btnKidsMinus.disabled = kidsCount <= 0;
    if (btnKidsPlus) btnKidsPlus.disabled = kidsCount >= 4;
  }

  bsGuests?.addEventListener('click', (e) => {
    if (!guestsPopover?.contains(e.target)) {
      closeDatesPopover();
      const isActive = guestsPopover?.classList.toggle('active');
      bsGuests?.classList.toggle('active', isActive);
      bsGuests?.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    }
  });

  document.addEventListener('click', (e) => {
    if (bsGuests && !bsGuests.contains(e.target)) {
      guestsPopover?.classList.remove('active');
      bsGuests?.classList.remove('active');
      bsGuests?.setAttribute('aria-expanded', 'false');
    }
  });

  btnAdultsMinus?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (adultsCount > 1) {
      adultsCount--;
      updateGuestsDisplay();
    }
  });

  btnAdultsPlus?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (adultsCount < 5) {
      adultsCount++;
      updateGuestsDisplay();
    }
  });

  btnKidsMinus?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (kidsCount > 0) {
      kidsCount--;
      updateGuestsDisplay();
    }
  });

  btnKidsPlus?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (kidsCount < 4) {
      kidsCount++;
      updateGuestsDisplay();
    }
  });

  categorySelect?.addEventListener('change', () => {
    const selectedText = categorySelect.options[categorySelect.selectedIndex].text.split('(')[0].trim();
    if (valCategory) {
      valCategory.textContent = categorySelect.value ? selectedText : 'Все категории';
    }
  });

  applyGuestsBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    guestsPopover?.classList.remove('active');
    bsGuests?.classList.remove('active');
    bsGuests?.setAttribute('aria-expanded', 'false');
  });

  // Первичная инициализация дат виджета
  updateWidgetDisplay();

  // --- Официальный модуль бронирования и оплаты TravelLine ---
  function openTravelLine(options = {}) {
    let query = '?tl-booking-open=true';
    const dIn = options.dateIn || (dateInInput ? dateInInput.value : formatISODate(selectedIn));
    const dOut = options.dateOut || (dateOutInput ? dateOutInput.value : formatISODate(selectedOut));

    if (dIn) {
      query += `&date=${encodeURIComponent(dIn)}`;
    }
    if (dIn && dOut) {
      const inD = new Date(dIn);
      const outD = new Date(dOut);
      if (!isNaN(inD.getTime()) && !isNaN(outD.getTime())) {
        const nights = Math.max(1, Math.round((outD - inD) / (1000 * 60 * 60 * 24)));
        query += `&nights=${nights}`;
      }
    }
    const adults = options.adults !== undefined ? options.adults : adultsCount;
    query += `&adults=${adults}`;

    const kids = options.children !== undefined ? options.children : kidsCount;
    if (kids > 0) {
      query += `&children=${kids}`;
    }

    const roomId = options.roomId !== undefined ? options.roomId : (categorySelect?.value || '');
    if (roomId) {
      if (roomId === 'standard_single' || roomId === '314795') query += '&room-type=314795';
      else if (roomId === 'standard_double' || roomId === '314796') query += '&room-type=314796';
      else if (roomId === 'standard' || roomId.includes('314795,314796')) query += '&room-type=314795,314796';
      else if (roomId === 'comfort' || roomId.includes('314798')) query += '&room-type=314798';
      else if (roomId === 'suite' || roomId.includes('317310')) query += '&room-type=317310';
      else query += `&room-type=${encodeURIComponent(roomId)}`;
    }

    // Триггер официального перехватчика TravelLine loader.js
    const trigger = document.getElementById('tl-booking-trigger');
    if (trigger) {
      trigger.href = query;
      trigger.click();
    } else {
      const a = document.createElement('a');
      a.href = query;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => a.remove(), 250);
    }
  }

  // Клик по кнопке «Найти номер»
  searchRoomsBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    openTravelLine({
      dateIn: dateInInput?.value,
      dateOut: dateOutInput?.value,
      adults: adultsCount,
      children: kidsCount,
      roomId: categorySelect?.value || ''
    });
  });

  // Все кнопки с data-tl-booking-open и data-tl-room на сайте
  document.querySelectorAll('[data-tl-room]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const roomId = btn.getAttribute('data-tl-room');
      openTravelLine({
        roomId,
        dateIn: dateInInput?.value,
        dateOut: dateOutInput?.value,
        adults: adultsCount,
        children: kidsCount
      });
    });
  });

  document.querySelectorAll('[data-tl-booking-open]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openTravelLine({
        dateIn: dateInInput?.value,
        dateOut: dateOutInput?.value,
        adults: adultsCount,
        children: kidsCount
      });
    });
  });

  // Экспорт функции в глобальную область видимости
  window.openTravelLine = openTravelLine;
  window.openLuxuryCheckout = function(options = {}) {
    openTravelLine(options);
  };

  // --- 4. Просмотрщик фото (Lightbox) строго с реальными фото ---
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');

  let currentGallery = [];
  let currentIndex = 0;

  function openLightbox(images, startIndex = 0) {
    if (!images || !images.length) return;
    currentGallery = images;
    currentIndex = startIndex;
    updateLightbox();
    lightbox?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox?.classList.remove('active');
    document.body.style.overflow = '';
  }

  function updateLightbox() {
    if (!currentGallery[currentIndex] || !lightboxImg) return;
    lightboxImg.src = currentGallery[currentIndex];
  }

  function nextImage() {
    currentIndex = (currentIndex + 1) % currentGallery.length;
    updateLightbox();
  }

  function prevImage() {
    currentIndex = (currentIndex - 1 + currentGallery.length) % currentGallery.length;
    updateLightbox();
  }

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxPrev?.addEventListener('click', prevImage);
  lightboxNext?.addEventListener('click', nextImage);

  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox?.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextImage();
    if (e.key === 'ArrowLeft') prevImage();
  });

  // Клик по фото в галерее интерьера
  const galleryCells = Array.from(document.querySelectorAll('.gallery-cell'));
  const galleryImages = galleryCells.map(c => c.getAttribute('data-full-img') || c.querySelector('img')?.src);

  galleryCells.forEach((cell, index) => {
    cell.addEventListener('click', () => {
      openLightbox(galleryImages, index);
    });
  });

  // Реальные фото номеров и зон отдыха
  const roomGalleries = {
    standard_single: [
      'assets/images/web/rooms/standard_single.jpg',
      'assets/images/web/rooms/standard_single_desk.jpg',
      'assets/images/web/rooms/standard_bath.jpg'
    ],
    standard_double: [
      'assets/images/web/rooms/standard_double.jpg',
      'assets/images/web/rooms/standard_2.jpg',
      'assets/images/web/rooms/standard_desk.jpg',
      'assets/images/web/rooms/standard_bath.jpg'
    ],
    standard: [
      'assets/images/web/rooms/standard_single.jpg',
      'assets/images/web/rooms/standard_double.jpg',
      'assets/images/web/rooms/standard_2.jpg',
      'assets/images/web/rooms/standard_bath.jpg'
    ],
    comfort: [
      'assets/images/web/rooms/comfort_main.jpg',
      'assets/images/web/rooms/comfort_side.jpg',
      'assets/images/web/rooms/comfort_kitchen.jpg',
      'assets/images/web/rooms/comfort_panorama.jpg',
      'assets/images/web/rooms/comfort_tea_desk.jpg',
      'assets/images/web/rooms/comfort_bath.jpg'
    ],
    suite: [
      'assets/images/web/rooms/suite_main.jpg',
      'assets/images/web/rooms/suite_bedroom.jpg',
      'assets/images/web/rooms/suite_panorama.jpg',
      'assets/images/web/rooms/suite_living.jpg',
      'assets/images/web/rooms/suite_bath.jpg'
    ],
    sauna: [
      'assets/images/web/facilities/sauna_lounge.jpg',
      'assets/images/web/facilities/sauna_green_wall.jpg',
      'assets/images/web/facilities/sauna_steam.jpg',
      'assets/images/web/facilities/sauna_benches.jpg',
      'assets/images/web/facilities/sauna_shower.jpg'
    ],
    cafe: [
      'assets/images/web/facilities/cafe_main.jpg',
      'assets/images/web/facilities/cafe_dining.jpg',
      'assets/images/web/facilities/cafe_coffee.jpg'
    ],
    gym: [
      'assets/images/web/facilities/gym_main.jpg',
      'assets/images/web/facilities/gym_cardio.jpg'
    ]
  };

  document.querySelectorAll('[data-room-gallery]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const roomType = btn.getAttribute('data-room-gallery');
      if (roomGalleries[roomType]) {
        openLightbox(roomGalleries[roomType], 0);
      }
    });
  });

  // --- Видеотур по апарт-отелю ---
  const hotelVideo = document.getElementById('hotel-presentation-video');
  const videoOverlay = document.getElementById('video-poster-overlay');
  const videoPlayBtn = document.getElementById('video-play-btn');

  function startVideo() {
    if (!hotelVideo) return;
    if (videoOverlay) videoOverlay.classList.add('is-hidden');
    hotelVideo.play().catch(e => {
      console.log('Video play error:', e);
    });
  }

  if (videoOverlay) {
    videoOverlay.addEventListener('click', startVideo);
  }
  if (videoPlayBtn) {
    videoPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      startVideo();
    });
  }

  if (hotelVideo) {
    hotelVideo.addEventListener('ended', () => {
      if (videoOverlay) videoOverlay.classList.remove('is-hidden');
    });
  }


});

// Уведомление о cookie: показываем, пока посетитель его не закрыл
(function () {
  const banner = document.getElementById('cookie-banner');
  const acceptBtn = document.getElementById('cookie-accept');
  if (!banner || !acceptBtn) return;

  const STORAGE_KEY = 'yagel-cookie-notice';
  let accepted = false;
  try { accepted = localStorage.getItem(STORAGE_KEY) === '1'; } catch (e) {}
  if (!accepted) banner.hidden = false;

  acceptBtn.addEventListener('click', () => {
    banner.hidden = true;
    try { localStorage.setItem(STORAGE_KEY, '1'); } catch (e) {}
  });
})();
