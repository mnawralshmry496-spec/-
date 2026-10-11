'use strict';

/*
 * مشروع دار الذوق — JavaScript
 * --------------------------------------------------
 * مسؤوليات هذا الملف:
 * 1. قراءة إعدادات المطعم وعرضها في الصفحة.
 * 2. إنشاء قائمة الطعام والتصنيفات.
 * 3. إدارة السلة والكميات والمجموع.
 * 4. تجهيز الطلب وفتحه في WhatsApp.
 * 5. إدارة قائمة الهاتف والحركات البصرية.
 *
 * لتغيير الاسم والأسعار والصور، عدّل config/config.js بدل هذا الملف.
 */

(() => {
    /* ==================================================
       01 — أدوات عامة ومتغيرات الموقع
       ================================================== */

    // اختصارات للعثور على عنصر واحد أو مجموعة عناصر.
    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    // حالة السلة والتصنيف المحدد ومؤقت رسالة التأكيد.
    let cart = [];
    let activeCategory = 'الكل';
    let toastTimer;
    let revealObserver = null;

    // تنسيق السعر بالدينار العراقي.
    function money(amount) {
        return `${Number(amount).toLocaleString('en-US')} د.ع`;
    }

    // تغيير النص فقط إذا كان العنصر موجودًا.
    function setText(selector, value) {
        const element = $(selector);

        if (element && value !== undefined && value !== null) {
            element.textContent = value;
        }
    }

    // إعداد رابط التواصل، وإرجاعه إلى قسم التواصل إذا لم يتوفر رابط.
    function setLink(selector, url) {
        const link = $(selector);
        if (!link) return;

        if (url) {
            link.href = url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
        } else {
            link.href = '#contact';
            link.removeAttribute('target');
            link.removeAttribute('rel');
        }
    }

    // رسالة صغيرة تظهر للمستخدم ثم تختفي تلقائيًا.
    function showToast(message) {
        const toast = $('#toast');
        if (!toast) return;

        toast.textContent = message;
        toast.classList.add('show');

        window.clearTimeout(toastTimer);
        toastTimer = window.setTimeout(() => {
            toast.classList.remove('show');
        }, 2600);
    }

    // تحويل رقم WhatsApp إلى أرقام فقط.
    function normalizeWhatsApp(value) {
        return String(value || '').replace(/\D/g, '');
    }


    /* ==================================================
       02 — معلومات المطعم والصورة الرئيسية
       ================================================== */

    function setupSiteInfo() {
        // بيانات تظهر في أكثر من مكان في الصفحة.
        document.title = `مطعم ${CONFIG.name}`;
        setText('#brandName', CONFIG.name);
        setText('#footerName', CONFIG.name);
        setText('#bottomName', CONFIG.name);
        setText('#footerPhone', CONFIG.phone);
        setText('#footerAddress', CONFIG.address);
        setText('#openingHours', CONFIG.hours);
        setText('#year', new Date().getFullYear());

        // النصوص الأساسية. يسمح CONFIG.heroTitle باستخدام <br> و<span> للتنسيق.
        const heroTitle = $('#heroTitle');
        if (heroTitle && CONFIG.heroTitle) {
            heroTitle.innerHTML = CONFIG.heroTitle;
        }

        setText('#heroText', CONFIG.heroText);
        setText('#aboutText', CONFIG.about);

        // روابط حسابات المطعم.
        setLink('#facebookLink', CONFIG.social?.facebook);
        setLink('#instagramLink', CONFIG.social?.instagram);
        setLink('#tiktokLink', CONFIG.social?.tiktok);

        // إظهار رابط WhatsApp فقط إذا كان الرقم مضبوطًا.
        const whatsapp = normalizeWhatsApp(CONFIG.whatsapp);
        const whatsappLink = $('#whatsappLink');
        const isWhatsAppConfigured =
            whatsapp.length >= 10 &&
            whatsapp.length <= 15 &&
            !String(CONFIG.whatsapp).includes('X');

        if (whatsappLink && isWhatsAppConfigured) {
            whatsappLink.href = `https://wa.me/${whatsapp}`;
            whatsappLink.target = '_blank';
            whatsappLink.rel = 'noopener noreferrer';
        } else if (whatsappLink) {
            whatsappLink.href = '#contact';
        }

        // اختيار الطبق المميز من الإعدادات وعرض اسمه وسعره وصورته.
        const featuredItem = MENU.find((item) => item.id === CONFIG.featuredId) || MENU[0];

        if (!featuredItem) return;

        setText('#featuredName', featuredItem.name);
        setText('#featuredPrice', money(featuredItem.price));

        const heroImage = $('#heroImage');
        if (heroImage && featuredItem.image) {
            heroImage.src = featuredItem.image;
            heroImage.alt = featuredItem.name;
            addImageFallback(heroImage, featuredItem.emoji);
        }
    }

    // إذا لم تُحمّل صورة، نعرض رمزًا بديلًا بدل المساحة الفارغة.
    function addImageFallback(image, emoji) {
        image.addEventListener('error', () => {
            const parent = image.parentElement;
            if (!parent || parent.dataset.fallbackApplied === 'true') return;

            parent.dataset.fallbackApplied = 'true';
            image.remove();

            const fallback = document.createElement('div');
            fallback.className = 'image-fallback';
            fallback.textContent = emoji || '🍽️';
            fallback.setAttribute('aria-label', 'صورة غير متاحة');
            parent.appendChild(fallback);
        }, { once: true });
    }


    /* ==================================================
       03 — تصنيفات الطعام وبطاقات الأصناف
       ================================================== */

    function renderFilters() {
        const filters = $('#filters');
        const categories = ['الكل', ...new Set(MENU.map((item) => item.cat))];

        filters.replaceChildren();

        categories.forEach((category) => {
            const button = document.createElement('button');
            const isActive = category === activeCategory;

            button.type = 'button';
            button.className = `filter-button${isActive ? ' active' : ''}`;
            button.textContent = category;
            button.setAttribute('aria-pressed', String(isActive));

            button.addEventListener('click', () => {
                activeCategory = category;
                renderFilters();
                renderMenu();
            });

            filters.appendChild(button);
        });
    }

    function renderMenu() {
        const grid = $('#menuGrid');
        const items = activeCategory === 'الكل'
            ? MENU
            : MENU.filter((item) => item.cat === activeCategory);

        // إزالة البطاقات القديمة قبل رسم الأصناف المطلوبة.
        grid.replaceChildren();

        if (items.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'menu-empty';
            emptyMessage.textContent = 'ماكو أصناف ضمن هذا التصنيف حاليًا.';
            grid.appendChild(emptyMessage);
            return;
        }

        items.forEach((item, index) => {
            const card = document.createElement('article');
            card.className = 'menu-card reveal';
            card.style.setProperty('--delay', `${(index % 3) * 80}ms`);

            // صورة الطبق ووسم التصنيف.
            const imageWrap = document.createElement('div');
            imageWrap.className = 'menu-card-image';

            const image = document.createElement('img');
            image.src = item.image || '';
            image.alt = item.name;
            image.loading = 'lazy';
            image.decoding = 'async';
            image.dataset.fallbackEmoji = item.emoji;
            addImageFallback(image, item.emoji);
            imageWrap.appendChild(image);

            const categoryTag = document.createElement('span');
            categoryTag.className = 'food-tag';
            categoryTag.textContent = item.cat;
            imageWrap.appendChild(categoryTag);

            // اسم الطبق وسعره والوصف.
            const content = document.createElement('div');
            content.className = 'menu-card-content';

            const heading = document.createElement('div');
            heading.className = 'menu-card-heading';

            const name = document.createElement('h3');
            name.textContent = item.name;

            const price = document.createElement('strong');
            price.className = 'food-price';
            price.textContent = money(item.price);
            heading.append(name, price);

            const description = document.createElement('p');
            description.textContent = item.desc;

            // زر الإضافة إلى السلة.
            const actions = document.createElement('div');
            actions.className = 'menu-card-footer';

            const note = document.createElement('span');
            note.className = 'fresh-note';
            note.textContent = 'طعم مميز';

            const addButton = document.createElement('button');
            addButton.type = 'button';
            addButton.className = 'add-button';
            addButton.innerHTML = '<span aria-hidden="true">+</span> أضف للسلة';
            addButton.addEventListener('click', () => addToCart(item.id));

            actions.append(note, addButton);
            content.append(heading, description, actions);
            card.append(imageWrap, content);
            grid.appendChild(card);
        });

        // تطبيق حركة الظهور على البطاقات المنشأة حديثًا.
        observeRevealElements(grid);
    }


    /* ==================================================
       04 — إدارة السلة والكميات والمجموع
       ================================================== */

    function addToCart(id) {
        const product = MENU.find((item) => item.id === id);
        if (!product) return;

        const existingItem = cart.find((item) => item.id === id);

        if (existingItem) {
            existingItem.qty += 1;
        } else {
            cart.push({ ...product, qty: 1 });
        }

        updateCart();
        showToast(`تمت إضافة ${product.name} إلى السلة`);
    }

    function changeQuantity(id, amount) {
        const item = cart.find((entry) => entry.id === id);
        if (!item) return;

        item.qty += amount;

        // حذف الصنف عندما تصبح كميته صفرًا.
        if (item.qty <= 0) {
            cart = cart.filter((entry) => entry.id !== id);
        }

        updateCart();
    }

    function updateCart() {
        const itemCount = cart.reduce((sum, item) => sum + item.qty, 0);
        const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

        setText('#cartCount', itemCount);
        setText('#total', money(total));

        const itemsContainer = $('#cartItems');
        itemsContainer.replaceChildren();

        // حالة السلة الفارغة.
        if (cart.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'cart-empty';
            empty.innerHTML = [
                '<span aria-hidden="true">🛍️</span>',
                '<h3>السلة بعدها فارغة</h3>',
                '<p>اختار الوجبات اللي تعجبك من القائمة.</p>',
                '<a class="button button-primary" href="#menu" data-close-cart>تصفح القائمة</a>'
            ].join('');

            itemsContainer.appendChild(empty);
            return;
        }

        // إنشاء صف لكل صنف مضاف إلى السلة.
        cart.forEach((item) => {
            const row = document.createElement('article');
            row.className = 'cart-item';

            const thumbnail = document.createElement('div');
            thumbnail.className = 'cart-item-thumb';

            const image = document.createElement('img');
            image.src = item.image || '';
            image.alt = '';
            image.loading = 'lazy';
            image.dataset.fallbackEmoji = item.emoji;
            addImageFallback(image, item.emoji);
            thumbnail.appendChild(image);

            const details = document.createElement('div');
            details.className = 'cart-item-details';

            const heading = document.createElement('h3');
            heading.textContent = item.name;

            const price = document.createElement('span');
            price.className = 'cart-item-price';
            price.textContent = money(item.price * item.qty);
            details.append(heading, price);

            // زرا تقليل الكمية وزيادتها.
            const controls = document.createElement('div');
            controls.className = 'quantity-control';

            const minusButton = document.createElement('button');
            minusButton.type = 'button';
            minusButton.textContent = '−';
            minusButton.setAttribute('aria-label', `تقليل كمية ${item.name}`);
            minusButton.addEventListener('click', () => changeQuantity(item.id, -1));

            const quantity = document.createElement('span');
            quantity.textContent = item.qty;

            const plusButton = document.createElement('button');
            plusButton.type = 'button';
            plusButton.textContent = '+';
            plusButton.setAttribute('aria-label', `زيادة كمية ${item.name}`);
            plusButton.addEventListener('click', () => changeQuantity(item.id, 1));

            controls.append(minusButton, quantity, plusButton);
            row.append(thumbnail, details, controls);
            itemsContainer.appendChild(row);
        });
    }

    function openCart() {
        updateCart();

        const modal = $('#cartModal');
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('modal-open');
        $('#closeCart').focus();
    }

    function closeCart() {
        const modal = $('#cartModal');
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('modal-open');
        $('#openCart').focus();
    }

    function setupCartEvents() {
        $('#openCart').addEventListener('click', openCart);
        $('#closeCart').addEventListener('click', closeCart);

        // إغلاق السلة عند الضغط على الخلفية أو رابط تصفح القائمة.
        $('#cartModal').addEventListener('click', (event) => {
            const closeTarget = event.target.closest('[data-close-cart]');
            const clickedBackdrop = event.target.classList.contains('modal-backdrop');

            if (closeTarget || clickedBackdrop) {
                closeCart();
            }
        });

        // زر إكمال الطلب ينقل المستخدم إلى نموذج بيانات الطلب.
        $('#checkoutButton').addEventListener('click', () => {
            closeCart();
            $('#contact').scrollIntoView({ behavior: 'smooth', block: 'start' });
            window.setTimeout(() => {
                $('#customer').focus({ preventScroll: true });
            }, 400);
        });
    }


    /* ==================================================
       05 — تجهيز رسالة الطلب وفتح WhatsApp
       ================================================== */

    function sendOrder(event) {
        event.preventDefault();

        // لا يمكن إنشاء طلب من دون أصناف.
        if (cart.length === 0) {
            setText('#formMessage', 'أضف صنفًا واحدًا على الأقل إلى السلة أولًا.');
            showToast('السلة فارغة. أضف وجبتك أولًا.');
            return;
        }

        // قراءة بيانات العميل من النموذج.
        const name = $('#customer').value.trim();
        const phone = $('#customerPhone').value.trim();
        const address = $('#customerAddress').value.trim();

        if (!name || !phone || !address) {
            setText('#formMessage', 'يرجى إكمال جميع معلومات الطلب.');
            return;
        }

        // منع فتح WhatsApp قبل ضبط رقم المطعم الحقيقي.
        const whatsapp = normalizeWhatsApp(CONFIG.whatsapp);
        const validWhatsApp =
            whatsapp.length >= 10 &&
            whatsapp.length <= 15 &&
            !String(CONFIG.whatsapp).includes('X');

        if (!validWhatsApp) {
            setText(
                '#formMessage',
                'قبل استقبال الطلبات، ضع رقم واتساب المطعم الحقيقي في config/config.js.'
            );
            showToast('رقم واتساب المطعم يحتاج إلى إعداد.');
            return;
        }

        // إعداد قائمة الأصناف والإجمالي.
        const orderLines = cart.map((item) => (
            `• ${item.name} × ${item.qty} — ${money(item.price * item.qty)}`
        ));
        const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

        // بناء الرسالة في أسطر منفصلة ثم ترميزها للرابط.
        const message = [
            `طلب جديد من ${CONFIG.name}`,
            '',
            ...orderLines,
            '',
            `المجموع: ${money(total)}`,
            '',
            `الاسم: ${name}`,
            `رقم الهاتف: ${phone}`,
            `العنوان: ${address}`
        ].join('\n');

        const whatsappURL = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
        const whatsappWindow = window.open(whatsappURL, '_blank');

        // تحسين أمان النافذة الجديدة، مع بديل إذا منع المتصفح فتحها.
        if (whatsappWindow) {
            whatsappWindow.opener = null;
        } else {
            window.location.href = whatsappURL;
        }

        setText(
            '#formMessage',
            'تم تجهيز الطلب؛ راجع الرسالة في واتساب قبل إرسالها للمطعم.'
        );
    }


    /* ==================================================
       06 — قائمة الهاتف
       ================================================== */

    function closeMobileMenu() {
        const toggle = $('#menuToggle');
        const nav = $('#siteNav');
        if (!toggle || !nav) return;

        nav.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'فتح القائمة');
    }

    function setupMobileMenu() {
        const toggle = $('#menuToggle');
        const nav = $('#siteNav');
        if (!toggle || !nav) return;

        toggle.addEventListener('click', () => {
            const isOpen = nav.classList.toggle('open');
            toggle.classList.toggle('active', isOpen);
            toggle.setAttribute('aria-expanded', String(isOpen));
            toggle.setAttribute('aria-label', isOpen ? 'إغلاق القائمة' : 'فتح القائمة');
        });

        $$('#siteNav a').forEach((link) => {
            link.addEventListener('click', closeMobileMenu);
        });

        // زر Escape يغلق القائمة أو السلة المفتوحة.
        document.addEventListener('keydown', (event) => {
            if (event.key !== 'Escape') return;

            closeMobileMenu();

            if ($('#cartModal').classList.contains('open')) {
                closeCart();
            }
        });
    }


    /* ==================================================
       07 — حركات الظهور عند التمرير
       ================================================== */

    function setupReveal() {
        // احترام إعدادات تقليل الحركة في الجهاز.
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            $$('.reveal').forEach((element) => element.classList.add('is-visible'));
            return;
        }

        // لا نستخدم مراقبة التمرير إذا كان المتصفح لا يدعمها.
        if (!('IntersectionObserver' in window)) {
            $$('.reveal').forEach((element) => element.classList.add('is-visible'));
            return;
        }

        revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;

                entry.target.classList.add('is-visible');
                revealObserver.unobserve(entry.target);
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -30px 0px'
        });

        observeRevealElements(document);
    }

    // تُستخدم أيضًا عند إعادة بناء بطاقات الطعام بعد تغيير التصنيف.
    function observeRevealElements(root) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            $$('.reveal', root).forEach((element) => element.classList.add('is-visible'));
            return;
        }

        if (!revealObserver) {
            $$('.reveal', root).forEach((element) => element.classList.add('is-visible'));
            return;
        }

        $$('.reveal:not(.is-visible)', root).forEach((element) => {
            revealObserver.observe(element);
        });
    }


    /* ==================================================
       08 — تشغيل الموقع وربط الأحداث
       ================================================== */

    function init() {
        setupSiteInfo();
        setupReveal();
        renderFilters();
        renderMenu();
        updateCart();
        setupMobileMenu();
        setupCartEvents();

        // ربط النموذج بدالة إرسال الطلب.
        $('#orderForm').addEventListener('submit', sendOrder);
    }

    // الانتظار حتى يكتمل بناء HTML قبل استخدام عناصر الصفحة.
    document.addEventListener('DOMContentLoaded', init);
})();
