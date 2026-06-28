// ============ ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ============
let userId = null;
let username = null;
let isAdmin = false;
let currentLang = 'ru';
let pvpCaseIndex = 0;
let pvpCases = [
    {name: 'bomj', label: '🥫 BOMJ (500)', price: 500},
    {name: 'berkut', label: '🦅 BERKUT (1500)', price: 1500},
    {name: 'champion', label: '🏆 CHAMPION (5000)', price: 5000},
    {name: 'draft', label: '📦 DRAFT (7000)', price: 7000},
    {name: 'm0nesy', label: '🧙 M0NESY (10000)', price: 10000},
    {name: 'donk', label: '💀 DONK (15000)', price: 15000}
];
let tg = window.Telegram ? window.Telegram.WebApp : null;
let dailyRewardClaimed = false;
let dailyRewardDay = 0;
let termsTimer = 10;
let termsInterval = null;
let selectedSource = null;
let selectedTarget = null;
let upgradeItems = [];
let toastContainer = null;
let selectedItems = new Set();
let selectMode = false;
let tutorialStep = 0;
let tutorialActive = false;

// ============ ПЕРЕВОДЫ ============
const LANG = {
    'ru': {
        'welcome': 'ДОБРО ПОЖАЛОВАТЬ',
        'cases': 'КЕЙСЫ',
        'inventory': 'ИНВЕНТАРЬ',
        'wheel': 'КОЛЕСО',
        'profile': 'ПРОФИЛЬ',
        'achievements': 'ДОСТИЖЕНИЯ',
        'promo': 'ПРОМОКОД',
        'admin': 'АДМИН ПАНЕЛЬ',
        'back': 'НАЗАД',
        'daily': 'ЕЖЕДНЕВНАЯ НАГРАДА',
        'deposit': 'ПОПОЛНИТЬ',
        'referral': 'РЕФЕРАЛЬНАЯ ССЫЛКА',
        'support': 'ПОДДЕРЖКА',
        'logout': 'ВЫХОД',
        'select_case': 'ВЫБЕРИ КЕЙС',
        'spins_left': 'Прокруток сегодня',
        'spin': 'КРУТНУТЬ',
        'sell': 'ПРОДАТЬ',
        'sell_all': 'ПРОДАТЬ ВСЁ',
        'withdraw': 'ВЫВЕСТИ',
        'withdraw_request': 'ЗАЯВКА НА ВЫВОД',
        'contact_admin': 'ПЕРЕЙТИ В ЧАТ С АДМИНОМ',
        'copied': 'СКОПИРОВАНО!',
        'error': 'ОШИБКА',
        'success': 'УСПЕХ!',
        'promo_enter': 'ВВЕДИТЕ ПРОМОКОД',
        'promo_activate': 'АКТИВИРОВАТЬ',
        'promo_invalid': 'Неверный промокод',
        'promo_used': 'Промокод использован',
        'promo_success': 'Промокод активирован! +',
        'coins': 'монет',
        'level': 'Уровень',
        'xp': 'Опыт',
        'wins': 'Побед',
        'losses': 'Поражений',
        'referrals': 'Рефералов',
        'frozen': '❄️ АККАУНТ ЗАМОРОЖЕН',
        'daily_reward': 'Забрать награду',
        'day': 'День'
    },
    'uz': {
        'welcome': 'XUSH KELIBSIZ',
        'cases': 'KASSALAR',
        'inventory': 'INVENTAR',
        'wheel': "G'ILDIRAK",
        'profile': 'PROFIL',
        'achievements': 'YUTUQLAR',
        'promo': 'PROMO KOD',
        'admin': 'ADMIN PANEL',
        'back': 'ORQAGA',
        'daily': "KUNLIK SOVG'A",
        'deposit': 'DEPOZIT',
        'referral': 'REFERRAL LINK',
        'support': 'YORDAM',
        'logout': 'CHIQISH',
        'select_case': 'KASSANI TANLANG',
        'spins_left': "Bugungi aylanishlar",
        'spin': 'AYLANTIRISH',
        'sell': 'SOTISH',
        'sell_all': 'HAMMASINI SOTISH',
        'withdraw': 'YECHIB OLISH',
        'withdraw_request': "YECHIB OLISH SO'ROVI",
        'contact_admin': 'ADMIN BILAN BOGLANISH',
        'copied': 'NUSXALANDI!',
        'error': 'XATO',
        'success': 'TABRIKLAYMIZ!',
        'promo_enter': 'PROMO KODNI KIRITING',
        'promo_activate': 'FAOLLASHTIRISH',
        'promo_invalid': "Noto'g'ri promo kod",
        'promo_used': 'Promo kod ishlatilgan',
        'promo_success': 'Promo kod faollashtirildi! +',
        'coins': 'tanga',
        'level': 'Daraja',
        'xp': 'Tajriba',
        'wins': "G'alabalar",
        'losses': "Mag'lubiyatlar",
        'referrals': 'Referallar',
        'frozen': '❄️ AKKAUNT MUZLATILDI',
        'daily_reward': "Sovg'ani olish",
        'day': 'Kun'
    }
};

function t(key) {
    return LANG[currentLang][key] || key;
}

// ============ ТЕКСТ СОГЛАШЕНИЯ ============
const TERMS_TEXT = `
<div class="section-title">1. ОБЩИЕ ПОЛОЖЕНИЯ</div>
<div class="text">1.1. Настоящее Соглашение регулирует отношения между ArtDrop (далее – «Администрация») и пользователем (далее – «Пользователь») при использовании сервиса ArtDrop.</div>
<div class="text">1.2. Используя сервис, Пользователь подтверждает, что полностью ознакомлен с условиями Соглашения и принимает их без исключений.</div>
<div class="text">1.3. Администрация оставляет за собой право изменять Соглашение в любое время. Изменения вступают в силу с момента публикации в канале @ARTCSSKINS.</div>
<div class="text">1.4. Продолжая использовать сервис после изменений, Пользователь автоматически принимает новую редакцию.</div>
<div class="section-title">2. ПРАВА И ОБЯЗАННОСТИ ПОЛЬЗОВАТЕЛЯ</div>
<div class="text">2.1. Пользователь имеет право: открывать кейсы и получать скины; получать ежедневные награды; выводить предметы при соблюдении условий; активировать промокоды; обращаться в поддержку; запрашивать возврат средств, если монеты не были потрачены с баланса.</div>
<div class="text">2.2. Пользователь обязуется: использовать сервис только в личных целях; не передавать свой аккаунт третьим лицам; не использовать читы, баги, ботов или другие средства для нечестной игры; не создавать более одного аккаунта (мультиаккаунтинг запрещён); не оскорблять других пользователей и администрацию; не распространять спам, рекламу и вредоносные ссылки; не обманывать при пополнении (фальшивые чеки, фейковые платежи); не перепродавать предметы из сервиса вне платформы; не злоупотреблять обращениями в поддержку.</div>
<div class="section-title">3. ПРАВА И ОБЯЗАННОСТИ АДМИНИСТРАЦИИ</div>
<div class="text">3.1. Администрация обязуется: предоставлять доступ к сервису 24/7 (за исключением технических работ); обрабатывать заявки на вывод в установленные сроки; отвечать на запросы поддержки в рабочее время; обеспечивать сохранность данных пользователей в соответствии с политикой конфиденциальности.</div>
<div class="text">3.2. Администрация имеет право: изменять баланс пользователя в случаях технической ошибки, мошенничества, использования багов в свою пользу или по решению администрации при нарушении правил; удалять или изменять предметы в инвентаре при обнаружении ошибок системы или по решению администрации в особых случаях; блокировать аккаунты за нарушение правил; ограничивать функционал для отдельных пользователей; возвращать предметы или монеты при технических сбоях.</div>
<div class="text">3.3. Администрация НЕ несёт ответственности за потерю предметов по вине пользователя; задержки в работе сервиса по независящим причинам; убытки, связанные с использованием сервиса.</div>
<div class="section-title">4. ВОЗВРАТ СРЕДСТВ</div>
<div class="text">4.1. Пользователь имеет право запросить возврат средств, если внесённые монеты не были потрачены с баланса.</div>
<div class="text">4.2. Для возврата необходимо: обратиться в поддержку @ArtCSbotSupp; предоставить доказательства пополнения (чек, скриншот); подтвердить, что монеты не были использованы.</div>
<div class="text">4.3. Администрация рассматривает заявку на возврат в течение 7 рабочих дней.</div>
<div class="text">4.4. Возврат осуществляется только на ту же карту/счёт, с которого было произведено пополнение.</div>
<div class="text">4.5. Возврат НЕ осуществляется, если монеты были полностью или частично потрачены.</div>
<div class="section-title">5. ВЫВОД ПРЕДМЕТОВ</div>
<div class="text">5.1. Для вывода предмета необходимо: предмет должен находиться в инвентаре; заявка рассматривается в установленные сроки; при успешном выводе предмет удаляется из инвентаря.</div>
<div class="text">5.2. Администрация может отклонить заявку на вывод в случае подозрения на мошенничество, технической ошибки или несоответствия правилам.</div>
<div class="section-title">6. ПРИЧИНЫ БЛОКИРОВКИ</div>
<div class="text">6.1. Аккаунт может быть заблокирован в случаях: создания более одного аккаунта; использования читов, ботов или багов; обмана при пополнении; оскорблений и угроз; перепродажи предметов вне сервиса; массового спама; нарушения любого пункта настоящего Соглашения.</div>
<div class="text">6.2. Администрация оставляет за собой право: применять штрафы (от 5000 до 50000 монет); временно замораживать аккаунт (от 7 до 30 дней); удалять аккаунт без возможности восстановления; добавлять пользователя в чёрный список всех проектов.</div>
<div class="section-title">7. ПОПОЛНЕНИЕ БАЛАНСА</div>
<div class="text">7.1. Пополнение баланса производится добровольно.</div>
<div class="text">7.2. Средства, внесённые на баланс, не подлежат возврату, за исключением случая, описанного в разделе 4 настоящего Соглашения.</div>
<div class="text">7.3. Администрация не несёт ответственности за задержки при пополнении.</div>
<div class="text">7.4. Курс монет устанавливается администрацией и может меняться.</div>
<div class="section-title">8. ПЕРСОНАЛЬНЫЕ ДАННЫЕ</div>
<div class="text">8.1. Пользователь даёт согласие на обработку своих персональных данных (Telegram ID, имя пользователя) для работы сервиса.</div>
<div class="text">8.2. Данные не передаются третьим лицам, за исключением случаев, предусмотренных законодательством.</div>
<div class="text">8.3. Пользователь имеет право удалить свои данные, обратившись в поддержку.</div>
<div class="section-title">9. ИСПОЛЬЗОВАНИЕ ПРОМОКОДОВ</div>
<div class="text">9.1. Промокоды можно активировать только один раз на один аккаунт.</div>
<div class="text">9.2. Администрация оставляет за собой право отменять награду по промокоду в случае нарушения условий.</div>
<div class="text">9.3. Срок действия промокода ограничен (если не указано иное).</div>
<div class="section-title">10. ОБРАТНАЯ СВЯЗЬ</div>
<div class="text">10.1. Все вопросы и жалобы принимаются через поддержку: @ArtCSbotSupp.</div>
<div class="text">10.2. Ответы на вопросы предоставляются в течение 24 часов (в рабочее время).</div>
<div class="text">10.3. Пользователь обязуется не злоупотреблять обращениями в поддержку.</div>
<div class="section-title">11. ИЗМЕНЕНИЯ И ОБНОВЛЕНИЯ</div>
<div class="text">11.1. Администрация регулярно обновляет сервис, добавляя новые функции и исправляя ошибки.</div>
<div class="text">11.2. О крупных обновлениях администрация уведомляет в канале @ARTCSSKINS.</div>
<div class="text">11.3. Пользователь соглашается с тем, что сервис может временно не работать во время обновлений.</div>
<div class="section-title">12. ПРОЧИЕ УСЛОВИЯ</div>
<div class="text">12.1. Настоящее Соглашение вступает в силу с момента первого использования сервиса.</div>
<div class="text">12.2. Соглашение действует бессрочно до его расторжения одной из сторон.</div>
<div class="text">12.3. Все споры решаются путём переговоров через поддержку.</div>
<div class="text">12.4. Во всём остальном, что не урегулировано Соглашением, стороны руководствуются действующим законодательством РФ.</div>
<div class="section-title">13. АДМИНИСТРАЦИЯ</div>
<div class="text">Наименование: ArtDrop</div>
<div class="text">Сайт: https://artappreb.onrender.com</div>
<div class="text">Канал: @ARTCSSKINS</div>
<div class="text">Поддержка: @ArtCSbotSupp</div>
<div style="margin-top:15px;padding:12px;background:rgba(255,0,0,0.05);border-radius:8px;border:1px solid rgba(255,0,0,0.15);color:#ff6b6b;font-weight:700;text-align:center;">
⚠️ НАРУШЕНИЕ ЛЮБОГО ПУНКТА ВЛЕЧЁТ ЗА СОБОЙ ОТВЕТСТВЕННОСТЬ, ВПЛОТЬ ДО УДАЛЕНИЯ АККАУНТА.
</div>
<div style="text-align:center;color:#6a7a8e;font-size:12px;margin-top:10px;">Дата последнего обновления: 20.06.2026</div>
`;

// ============ ТАЙМЕР ДЛЯ СОГЛАШЕНИЯ ============
function startTermsTimer() {
    const btn = document.getElementById('termsButton');
    const countdown = document.getElementById('termsCountdown');
    const checkbox = document.getElementById('termsCheckbox');
    
    if (!btn) return;
    
    termsTimer = 10;
    btn.disabled = true;
    btn.textContent = `⏳ ПОДОЖДИТЕ ${termsTimer} СЕКУНД`;
    if (checkbox) checkbox.disabled = true;
    
    if (termsInterval) clearInterval(termsInterval);
    
    termsInterval = setInterval(() => {
        termsTimer--;
        if (countdown) countdown.textContent = termsTimer;
        btn.textContent = `⏳ ПОДОЖДИТЕ ${termsTimer} СЕКУНД`;
        
        if (termsTimer <= 0) {
            clearInterval(termsInterval);
            btn.disabled = false;
            btn.textContent = '✅ ПРОДОЛЖИТЬ';
            if (checkbox) checkbox.disabled = false;
            const timerDiv = document.getElementById('termsTimer');
            if (timerDiv) timerDiv.style.display = 'none';
        }
    }, 1000);
}

function toggleTermsButton() {
    const checkbox = document.getElementById('termsCheckbox');
    const btn = document.getElementById('termsButton');
    if (termsTimer <= 0 && btn) {
        btn.disabled = !checkbox.checked;
    }
}

function acceptTerms() {
    const checkbox = document.getElementById('termsCheckbox');
    if (!checkbox || !checkbox.checked) {
        showModal('❌ Ошибка', 'Поставьте галочку, чтобы продолжить');
        return;
    }
    if (termsTimer > 0) {
        showModal('❌ Ошибка', `Подождите ещё ${termsTimer} секунд`);
        return;
    }
    
    const neverShow = document.getElementById('termsNeverShow');
    if (neverShow && neverShow.checked) {
        localStorage.setItem('artdrop_terms_hidden', 'true');
    }
    
    localStorage.setItem('terms_accepted', 'true');
    if (termsInterval) clearInterval(termsInterval);
    
    showMainScreen();
}

function showMainScreen() {
    const termsScreen = document.getElementById('terms-screen');
    const mainScreen = document.getElementById('main-screen');
    if (termsScreen) {
        termsScreen.style.display = 'none';
        termsScreen.classList.remove('active');
    }
    if (mainScreen) {
        mainScreen.style.display = 'block';
        mainScreen.classList.add('active');
    }
}

// ============ ИНИЦИАЛИЗАЦИЯ ============
document.addEventListener('DOMContentLoaded', function() {
    const termsContent = document.getElementById('termsContent');
    if (termsContent) termsContent.innerHTML = TERMS_TEXT;
    
    const termsHidden = localStorage.getItem('artdrop_terms_hidden');
    const accepted = localStorage.getItem('terms_accepted');
    
    const termsScreen = document.getElementById('terms-screen');
    const mainScreen = document.getElementById('main-screen');
    
    if (termsHidden === 'true' || accepted) {
        if (termsScreen) {
            termsScreen.style.display = 'none';
            termsScreen.classList.remove('active');
        }
        if (mainScreen) {
            mainScreen.style.display = 'block';
            mainScreen.classList.add('active');
        }
    } else {
        if (termsScreen) {
            termsScreen.style.display = 'flex';
            termsScreen.classList.add('active');
            setTimeout(startTermsTimer, 500);
        }
        if (mainScreen) mainScreen.style.display = 'none';
    }
    
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        userId = user.id;
        username = user.username || user.first_name || 'player';
    } else {
        console.warn('Telegram WebApp not available, using test mode');
        userId = 12345;
        username = 'test_user';
    }
    
    const savedLang = localStorage.getItem('artdrop_lang');
    if (savedLang) currentLang = savedLang;
    
    loginOrRegister(userId, username);
    updateLanguage();
});

function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key) el.textContent = t(key);
    });
}

function loginOrRegister(uid, uname) {
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');
    
    fetch('/api/miniapp_login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            user_id: uid,
            username: uname,
            ref_code: refCode
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            userId = data.user_id;
            username = data.username;
            isAdmin = data.is_admin || false;
            
            if (isAdmin) {
                const adminPanel = document.getElementById('adminPanel');
                if (adminPanel) adminPanel.style.display = 'block';
                localStorage.setItem('isAdmin', 'true');
                checkAdminStatus();
            }
            
            loadUserAvatar();
            loadBalance();
            checkDailyReward();
            checkWithdrawStatus();
            checkNotifications();
            loadRecentDrops();
            checkPrimeStatus();
            
            setTimeout(() => startTutorial(), 1500);
            setInterval(updateOnlineStatus, 30000);
            setInterval(checkNotifications, 10000);
            
            setTimeout(showYouTubeModal, 2000);
        } else {
            console.error('Login failed:', data.error);
        }
    })
    .catch(err => console.error('Login error:', err));
}

// ============ РЕКЛАМА YOUTUBE ГРИБ ============
function showYouTubeModal() {
    showModal('🍄 ГРИБ | Халява CS2', `
        <div style="text-align:center;padding:10px 0;">
            <div style="font-size:48px;margin:10px 0;">📺</div>
            <div style="font-size:20px;font-weight:700;color:#ff00ff;">ГРИБ — 129 тыс. подписчиков</div>
            <div style="color:#c0c0c0;font-size:14px;padding:8px 0;">
                Лучшая халява CS2!<br>
                Бесплатные кейсы, розыгрыши и инвестиции!
            </div>
            <button class="case-btn primary" onclick="window.open('https://www.youtube.com/@GRIB', '_blank')" style="background:#ff0044;border-color:#ff0044;">
                📺 ПЕРЕЙТИ НА КАНАЛ
            </button>
            <button class="case-btn" onclick="closeModal()" style="background:rgba(255,255,255,0.05);">
                ❌ ПРОПУСТИТЬ
            </button>
        </div>
    `);
}

// ============ АВАТАРКА ============
function loadUserAvatar() {
    const avatarImg = document.getElementById('userAvatar');
    if (!avatarImg) return;
    
    if (tg && tg.initDataUnsafe && tg.initDataUnsafe.user) {
        const user = tg.initDataUnsafe.user;
        
        if (user.photo_url) {
            avatarImg.src = user.photo_url;
            return;
        }
        
        const username = user.username || user.first_name || 'U';
        const firstLetter = username.charAt(0).toUpperCase();
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d');
        
        const colors = ['#ff00ff', '#ff0044', '#ff0066', '#cc00ff', '#9900ff', '#ff3388'];
        const colorIndex = username.length % colors.length;
        ctx.fillStyle = colors[colorIndex];
        ctx.fillRect(0, 0, 100, 100);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 50px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(firstLetter, 50, 55);
        
        avatarImg.src = canvas.toDataURL('image/png');
    } else {
        avatarImg.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ff00ff"/%3E%3Ctext x="50" y="50" font-size="40" text-anchor="middle" dominant-baseline="central" fill="white" font-family="Arial"%3E👤%3C/text%3E%3C/svg%3E';
    }
}

function updateOnlineStatus() {
    fetch(`/api/miniapp_profile?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        // Обновляем аватар
        const status = document.querySelector('.online-status');
        if (status && data.last_activity) {
            const lastActive = new Date(data.last_activity);
            const now = new Date();
            const diff = (now - lastActive) / 1000;
            if (diff < 120) {
                status.classList.add('online');
            } else {
                status.classList.remove('online');
            }
        }
    })
    .catch(() => {});
}

function checkAdminStatus() {
    fetch(`/api/admin/admin_status?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.is_admin && data.pending_withdrawals > 0) {
            setTimeout(() => {
                showModal('👑 УВЕДОМЛЕНИЕ АДМИНА', `
                    <div style="text-align:center;padding:10px 0;">
                        <div style="font-size:48px;margin:10px 0;">📋</div>
                        <div style="font-size:18px;font-weight:700;color:#ff00ff;">За время вашего отсутствия</div>
                        <div style="font-size:36px;font-weight:700;color:#ff0044;margin:10px 0;">${data.pending_withdrawals}</div>
                        <div style="color:#c0c0c0;font-size:14px;">новых заявок на вывод</div>
                        <button class="case-btn primary" onclick="closeModal();showScreen('admin')" style="background:#ff0044;border-color:#ff0044;">📋 ПЕРЕЙТИ К ЗАЯВКАМ</button>
                    </div>
                `);
            }, 3000);
        }
    })
    .catch(() => {});
}

// ============ ЗАГРУЗКА ДРОПОВ ============
function loadRecentDrops() {
    fetch('/api/recent_drops')
    .then(res => res.json())
    .then(data => {
        const track = document.getElementById('marqueeTrack');
        if (!track) return;
        
        if (data.drops && data.drops.length > 0) {
            track.innerHTML = '';
            for (let repeat = 0; repeat < 2; repeat++) {
                data.drops.forEach(drop => {
                    const item = document.createElement('div');
                    item.className = 'marquee-item';
                    
                    const avatar = document.createElement('div');
                    avatar.className = 'marquee-avatar';
                    avatar.style.backgroundColor = drop.avatar_color;
                    avatar.textContent = drop.avatar_letter;
                    
                    const name = document.createElement('span');
                    name.className = 'marquee-item-name';
                    name.textContent = drop.item_name;
                    
                    const price = document.createElement('span');
                    price.className = 'marquee-item-price';
                    price.textContent = `${drop.item_price}🪙`;
                    
                    item.appendChild(avatar);
                    item.appendChild(name);
                    item.appendChild(price);
                    track.appendChild(item);
                });
            }
        } else {
            track.innerHTML = '<div class="marquee-loading">🎁 Скоро здесь будут дропы...</div>';
        }
    })
    .catch(() => {
        const track = document.getElementById('marqueeTrack');
        if (track) track.innerHTML = '<div class="marquee-loading">⏳ Ошибка загрузки дропов</div>';
    });
}

function loadBalance() {
    if (!userId) {
        console.error('No userId for balance');
        return;
    }
    
    fetch(`/api/miniapp_profile?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        const coins = data.coins || 0;
        const isFrozen = data.is_frozen || 0;
        const level = data.level || 1;
        const isPrime = data.is_prime || false;
        
        document.querySelectorAll('.balance span:last-child').forEach(el => {
            el.textContent = coins;
        });
        document.querySelectorAll('#casesCoins, #invCoins, #profileCoins, #wheelCoins, #achCoins, #adminCoins, #topCoins, #friendsCoins, #upgradeCoins').forEach(el => {
            if (el) el.textContent = coins;
        });
        
        const frozenWarning = document.getElementById('frozenWarning');
        if (frozenWarning) {
            frozenWarning.style.display = isFrozen ? 'block' : 'none';
        }
        
        const currentLevel = localStorage.getItem('lastLevel');
        if (currentLevel && parseInt(currentLevel) < level) {
            showToast(`🎉 Новый уровень! Ты достиг ${level} уровня! 🎉`, 'success', 10000);
        }
        localStorage.setItem('lastLevel', level.toString());
        
        if (isPrime) {
            document.querySelectorAll('.prime-badge').forEach(el => el.style.display = 'inline');
        }
    })
    .catch(err => console.error('Balance error:', err));
}

function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(el => {
        el.classList.remove('active');
        el.style.display = 'none';
    });
    
    const target = document.getElementById(screen + '-screen');
    if (target) {
        target.style.display = 'block';
        target.classList.add('active');
        window.scrollTo(0, 0);
    }
    
    if (screen === 'inventory') loadInventory();
    if (screen === 'profile') loadProfile();
    if (screen === 'achievements') loadAchievements();
    if (screen === 'cases') loadCases();
    if (screen === 'admin') loadAdminPanel();
    if (screen === 'wheel') loadWheelStatus();
    if (screen === 'promo') showPromoModal();
    if (screen === 'daily') claimDailyReward();
    if (screen === 'top') loadTopPlayers();
    if (screen === 'friends') loadFriends();
    if (screen === 'upgrade') loadUpgradeItems();
    
    if (tg) tg.HapticFeedback.impactOccurred('light');
}

function closeModal() {
    const modal = document.getElementById('modal');
    if (modal) modal.classList.remove('active');
}

function showModal(title, content) {
    const modalBody = document.getElementById('modalBody');
    if (modalBody) {
        modalBody.innerHTML = `<div class="modal-title">${title}</div>${content}`;
    }
    const modal = document.getElementById('modal');
    if (modal) modal.classList.add('active');
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============ СИСТЕМА УВЕДОМЛЕНИЙ (TOAST) ============
function showToast(message, type = 'info', duration = 10000) {
    if (!toastContainer) {
        const div = document.createElement('div');
        div.id = 'toastContainer';
        div.style.cssText = 'position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:99999;width:90%;max-width:400px;display:flex;flex-direction:column;gap:8px;pointer-events:none;';
        document.body.appendChild(div);
        toastContainer = div;
    }
    
    const toast = document.createElement('div');
    
    const colors = {
        'success': '#ff00ff',
        'error': '#ff0044',
        'info': '#6a7a8e',
        'friend_request': '#ff00ff',
        'achievement': '#ff00ff',
        'level_up': '#ff00ff'
    };
    
    toast.style.cssText = `
        background: rgba(10,10,15,0.95);
        border: 1px solid ${colors[type] || '#6a7a8e'};
        border-radius: 12px;
        padding: 12px 16px;
        color: #ffffff;
        font-size: 14px;
        backdrop-filter: blur(10px);
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
        transform: translateY(-30px);
        opacity: 0;
        transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        pointer-events: auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        max-width: 100%;
        word-break: break-word;
    `;
    
    const icons = {
        'success': '✅',
        'error': '❌',
        'info': 'ℹ️',
        'friend_request': '👥',
        'achievement': '🏅',
        'level_up': '⭐'
    };
    
    toast.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;flex:1;">
            <span style="font-size:20px;">${icons[type] || '📢'}</span>
            <span style="flex:1;">${message}</span>
        </div>
        <button onclick="this.parentElement.remove()" style="background:none;border:none;color:#6a7a8e;font-size:18px;cursor:pointer;padding:0 4px;">✕</button>
    `;
    
    if (type === 'friend_request' && message.includes('хочет добавить')) {
        const friendId = message.match(/id:(\d+)/);
        if (friendId) {
            const id = friendId[1];
            toast.innerHTML = `
                <div style="display:flex;align-items:center;gap:8px;flex:1;">
                    <span style="font-size:20px;">👥</span>
                    <span>${message.replace(/id:\d+/, '').trim()}</span>
                </div>
                <div style="display:flex;gap:6px;">
                    <button onclick="acceptFriendRequestFromToast(${id})" style="padding:4px 12px;border-radius:6px;border:none;background:#ff00ff;color:#0a0a0f;font-weight:600;cursor:pointer;font-size:13px;">✅</button>
                    <button onclick="rejectFriendRequestFromToast(${id})" style="padding:4px 12px;border-radius:6px;border:1px solid #ff0044;background:transparent;color:#ff0044;font-weight:600;cursor:pointer;font-size:13px;">❌</button>
                </div>
            `;
        }
    }
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 10);
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.transform = 'translateY(-30px)';
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 500);
        }
    }, duration);
}

function acceptFriendRequestFromToast(friendId) {
    fetch('/api/accept_friend', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: userId, friend_id: friendId})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast('✅ Друг добавлен!', 'success', 5000);
            loadFriends();
            loadBalance();
        }
    });
    document.querySelectorAll('#toastContainer > div').forEach(el => el.remove());
}

function rejectFriendRequestFromToast(friendId) {
    fetch('/api/reject_friend', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: userId, friend_id: friendId})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast('❌ Заявка отклонена', 'info', 3000);
            loadFriends();
        }
    });
    document.querySelectorAll('#toastContainer > div').forEach(el => el.remove());
}

// ============ ПРОВЕРКА УВЕДОМЛЕНИЙ ============
function checkNotifications() {
    if (!userId) return;
    
    fetch(`/api/miniapp_profile?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.unlocked_achievement) {
            showToast(`🏅 Ты получил достижение! Зайди в раздел "Достижения" чтобы забрать награду!`, 'achievement', 10000);
        }
        
        const currentLevel = localStorage.getItem('lastLevel');
        if (currentLevel && parseInt(currentLevel) < (data.level || 1)) {
            showToast(`⭐ Новый уровень! Ты достиг ${data.level} уровня! +100 🪙`, 'level_up', 10000);
        }
        localStorage.setItem('lastLevel', (data.level || 1).toString());
    })
    .catch(() => {});
    
    fetch(`/api/get_broadcasts?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.broadcasts && data.broadcasts.length > 0) {
            data.broadcasts.forEach(b => {
                showModal('📢 РАССЫЛКА', `
                    <div style="padding:10px 0;text-align:center;">
                        <div style="font-size:16px;color:#c0c0c0;line-height:1.6;white-space:pre-wrap;padding:8px 0;">${b.message}</div>
                        <button class="case-btn primary" onclick="closeModal()">✅ ЗАКРЫТЬ</button>
                    </div>
                `);
                fetch('/api/mark_broadcast_read', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({user_id: userId, broadcast_id: b.id})
                });
            });
        }
    })
    .catch(() => {});
}

// ============ ПРАЙМ-ПОДПИСКА ============
function checkPrimeStatus() {
    fetch(`/api/prime/status?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.is_prime) {
            document.querySelectorAll('.prime-badge').forEach(el => el.style.display = 'inline');
        }
    })
    .catch(() => {});
}

function subscribePrime() {
    showModal('👑 ПРАЙМ-ПОДПИСКА', `
        <div style="text-align:center;padding:10px 0;">
            <div style="font-size:48px;margin:10px 0;">👑</div>
            <div style="font-size:20px;font-weight:700;color:#ff00ff;">Прайм-подписка</div>
            <div style="color:#c0c0c0;font-size:14px;padding:8px 0;">
                <div>💰 Цена: <strong>115 RUB</strong> в месяц</div>
                <div style="margin-top:8px;">🎁 <strong>Бесплатный кейс</strong> каждую неделю!</div>
                <div>👑 <strong>Корона</strong> в профиле</div>
                <div>⭐ <strong>Приоритетная</strong> поддержка</div>
            </div>
            <div style="color:#6a7a8e;font-size:12px;padding:8px 0;">
                Для оплаты напишите в поддержку @ArtCSbotSupp
            </div>
            <button class="case-btn primary" onclick="window.open('https://t.me/ArtCSbotSupp', '_blank')" style="background:#ff00ff;border-color:#ff00ff;">
                📩 НАПИСАТЬ В ПОДДЕРЖКУ
            </button>
            <button class="case-btn" onclick="closeModal()">❌ ЗАКРЫТЬ</button>
        </div>
    `);
}

// ============ ОБУЧЕНИЕ ============
function startTutorial() {
    const onboarded = localStorage.getItem('artdrop_onboarded');
    if (onboarded === 'true') return;
    
    tutorialActive = true;
    tutorialStep = 0;
    showTutorialStep();
}

function showTutorialStep() {
    const steps = [
        {
            title: '👋 ДОБРО ПОЖАЛОВАТЬ!',
            text: 'Это ArtDrop — кейс-открыватор в Telegram!\n\nДавай я покажу тебе, как всё работает.',
            action: 'next'
        },
        {
            title: '🎁 ОТКРОЙ КЕЙС!',
            text: 'Нажми на карточку "КЕЙСЫ", затем на кнопку "🥫 BOMJ" — это самый дешёвый кейс.',
            action: 'open_cases'
        },
        {
            title: '📦 ПОСМОТРИ СКИН!',
            text: 'Отлично! Ты получил скин. Теперь зайди в инвентарь, чтобы посмотреть его.',
            action: 'go_inventory'
        },
        {
            title: '💰 ПРОДАЙ СКИН!',
            text: 'Нажми "ПРОДАТЬ" рядом со скином, чтобы получить монеты.',
            action: 'sell_item'
        },
        {
            title: '👤 ПРОФИЛЬ',
            text: 'Нажми на аватарку в правом верхнем углу, чтобы посмотреть свой профиль.',
            action: 'go_profile'
        },
        {
            title: '🎉 ТЫ ГОТОВ!',
            text: 'Теперь ты знаешь основы ArtDrop!\n\nУдачи! 🚀',
            action: 'finish'
        }
    ];
    
    document.querySelectorAll('.card, .case-btn, .profile-btn').forEach(el => {
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.5';
    });
    
    const step = steps[tutorialStep];
    showModal(step.title, `
        <div style="text-align:center;padding:10px 0;">
            <div style="font-size:16px;color:#c0c0c0;line-height:1.8;white-space:pre-wrap;padding:8px 0;">${step.text}</div>
            <button class="case-btn primary" onclick="tutorialAction('${step.action}')" style="background:#ff00ff;border-color:#ff00ff;">
                ${tutorialStep === steps.length - 1 ? '✅ НАЧАТЬ ИГРУ!' : '➡️ ДАЛЕЕ'}
            </button>
            <button class="case-btn" onclick="skipTutorial()" style="background:rgba(255,255,255,0.05);">
                ⏭️ ПРОПУСТИТЬ
            </button>
        </div>
    `);
}

function tutorialAction(action) {
    closeModal();
    
    switch(action) {
        case 'open_cases':
            document.querySelectorAll('.card').forEach(el => {
                if (el.querySelector('.card-title')?.textContent.includes('КЕЙСЫ')) {
                    el.style.pointerEvents = 'auto';
                    el.style.opacity = '1';
                    el.style.borderColor = '#ff00ff';
                    el.style.boxShadow = '0 0 30px rgba(255,0,255,0.3)';
                }
            });
            showToast('👆 Нажми на карточку "КЕЙСЫ"', 'info', 5000);
            break;
            
        case 'go_inventory':
            showScreen('inventory');
            setTimeout(() => {
                tutorialStep = 3;
                setTimeout(showTutorialStep, 500);
            }, 1000);
            break;
            
        case 'sell_item':
            document.querySelectorAll('.inventory-item .btn-sell').forEach(el => {
                el.style.pointerEvents = 'auto';
                el.style.opacity = '1';
                el.style.borderColor = '#ff00ff';
            });
            showToast('👆 Нажми "ПРОДАТЬ" на скине', 'info', 5000);
            break;
            
        case 'go_profile':
            const avatar = document.querySelector('.profile-btn');
            if (avatar) {
                avatar.style.pointerEvents = 'auto';
                avatar.style.opacity = '1';
                avatar.style.borderColor = '#ff00ff';
                avatar.style.boxShadow = '0 0 30px rgba(255,0,255,0.3)';
            }
            showToast('👆 Нажми на аватарку', 'info', 5000);
            break;
            
        case 'finish':
        case 'next':
        default:
            tutorialStep++;
            if (tutorialStep >= 6) {
                finishTutorial();
            } else {
                setTimeout(showTutorialStep, 500);
            }
            break;
    }
}

function skipTutorial() {
    closeModal();
    finishTutorial();
}

function finishTutorial() {
    tutorialActive = false;
    localStorage.setItem('artdrop_onboarded', 'true');
    
    document.querySelectorAll('.card, .case-btn, .profile-btn').forEach(el => {
        el.style.pointerEvents = 'auto';
        el.style.opacity = '1';
        el.style.borderColor = '';
        el.style.boxShadow = '';
    });
    
    showModal('🎉 ТЫ ГОТОВ!', `
        <div style="text-align:center;padding:10px 0;">
            <div style="font-size:40px;margin:10px 0;">🚀</div>
            <div style="font-size:20px;font-weight:700;color:#ff00ff;">Ты освоил ArtDrop!</div>
            <div style="color:#6a7a8e;font-size:14px;padding:8px 0;">Открывай кейсы, собирай скины и становись лучшим!</div>
            <button class="case-btn primary" onclick="closeModal();showScreen('main')" style="background:#ff00ff;border-color:#ff00ff;">✅ НАЧАТЬ!</button>
        </div>
    `);
}

// ============ ПЛАВНАЯ АНИМАЦИЯ КЕЙСОВ ============
class CaseAnimation {
    constructor(caseName, realItem, realPrice, callback) {
        this.caseName = caseName;
        this.realItem = realItem;
        this.realPrice = realPrice;
        this.callback = callback;
        this.skins = this.getCaseSkins();
        this.currentIndex = 0;
        this.isSpinning = true;
        this.startTime = performance.now();
        this.duration = 4000;
        this.maxSpeed = 120;
        this.minSpeed = 60;
        this.lastUpdate = 0;
        this.createUI();
        requestAnimationFrame((t) => this.animate(t));
    }
    
    getCaseSkins() {
        return [
            {name: "P90 | Sand Spray (BS)", price: 180, rarity: "Синий"},
            {name: "MP9 | Sand Dashed (FT)", price: 177, rarity: "Синий"},
            {name: "SCAR-20 | Zinc (BS)", price: 167, rarity: "Синий"},
            {name: "SG 553 | Night Camo (BS)", price: 162, rarity: "Синий"},
            {name: "XM1014 | Canvas Cloud (MW)", price: 160, rarity: "Синий"},
            {name: "Sticker | BLAST.tv", price: 155, rarity: "Белый"},
            {name: "MP5-SD | Dirt Drop", price: 192, rarity: "Синий"},
            {name: "Sticker | The Huns", price: 192, rarity: "Белый"},
            {name: "G3SG1 | Red Jasper (BS)", price: 185, rarity: "Синий"},
            {name: "UMP-45 | Facility Dark (FT)", price: 375, rarity: "Фиолетовый"},
            {name: "Sticker | FlameZ", price: 365, rarity: "Белый"},
            {name: "SCAR-20 | Short Ochre (MW)", price: 330, rarity: "Синий"},
            {name: "Tec-9 | Blue Blast (BS)", price: 215, rarity: "Синий"},
            {name: "Sticker | apEX", price: 442, rarity: "Белый"},
            {name: "MP9 | Slide (FT)", price: 440, rarity: "Синий"},
            {name: "UMP-45 | Mudder (FT)", price: 500, rarity: "Синий"},
            {name: "SCAR-20 | Contractor (FT)", price: 500, rarity: "Синий"},
            {name: "AUG | Sweeper", price: 477, rarity: "Фиолетовый"},
            {name: "Sticker | FURIA", price: 472, rarity: "Белый"},
            {name: "FAMAS | Palm (FT)", price: 115, rarity: "Белый"},
            {name: "Nova | Sand Dune", price: 577, rarity: "Фиолетовый"},
            {name: "MP9 | Sand Dashed (MW)", price: 577, rarity: "Синий"},
            {name: "UMP-45 | Facility Dark (MW)", price: 542, rarity: "Фиолетовый"},
            {name: "G3SG1 | Desert Storm (BS)", price: 537, rarity: "Синий"},
            {name: "AK-47 | Elite Build (MW)", price: 20000, rarity: "Розовый"},
            {name: "M4A4 | Magnesium (MW)", price: 12437, rarity: "Розовый"},
            {name: "AWP | Safari Mesh (MW)", price: 6940, rarity: "Фиолетовый"},
            {name: "Desert Eagle | Oxide Blaze (FN)", price: 10017, rarity: "Розовый"},
            {name: "SSG 08 | Fever Dream (FT)", price: 16777, rarity: "Розовый"},
            {name: "M4A1-S | Nitro (FT)", price: 16062, rarity: "Розовый"},
            {name: "Glock-18 | Coral Bloom (FT)", price: 11645, rarity: "Розовый"},
            {name: "AK-47 | Safari Mesh (WW)", price: 2497, rarity: "Фиолетовый"},
            {name: "★ Karambit | Doppler", price: 150000, rarity: "Желтый"},
            {name: "★ Butterfly | Fade", price: 200000, rarity: "Желтый"},
            {name: "★ M9 Bayonet | Marble Fade", price: 180000, rarity: "Желтый"},
        ];
    }
    
    createUI() {
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(10,10,20,0.98);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;';
        
        const caseNames = {"bomj":"🥫 КЕЙС БОМЖ","berkut":"🦅 КЕЙС БЕРКУТ","champion":"🏆 КЕЙС ЧЕМПИОН","draft":"📦 КЕЙС DRAFT","m0nesy":"🧙 КЕЙС M0NESY","donk":"💀 КЕЙС DONK"};
        const title = document.createElement('div');
        title.style.cssText = 'color:#ff00ff;font-size:22px;font-weight:700;margin-bottom:20px;letter-spacing:3px;text-shadow:0 0 20px rgba(255,0,255,0.3);';
        title.textContent = caseNames[this.caseName] || 'КЕЙС';
        this.overlay.appendChild(title);
        
        this.container = document.createElement('div');
        this.container.style.cssText = 'width:85%;max-width:450px;height:90px;position:relative;overflow:hidden;margin-bottom:15px;background:rgba(255,0,255,0.03);border-radius:12px;border:1px solid rgba(255,0,255,0.08);';
        this.overlay.appendChild(this.container);
        
        this.resultFrame = document.createElement('div');
        this.resultFrame.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:140px;height:80%;border:2px solid #ff00ff;border-radius:8px;z-index:5;box-shadow:0 0 30px rgba(255,0,255,0.3);background:rgba(255,0,255,0.05);';
        this.container.appendChild(this.resultFrame);
        
        this.skinsLayer = document.createElement('div');
        this.skinsLayer.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;justify-content:center;';
        this.container.appendChild(this.skinsLayer);
        
        this.currentSkinLabel = document.createElement('div');
        this.currentSkinLabel.style.cssText = 'color:#ffffff;font-size:24px;font-weight:700;text-align:center;min-height:32px;margin-top:10px;text-shadow:0 0 30px rgba(255,0,255,0.2);';
        this.overlay.appendChild(this.currentSkinLabel);
        
        this.currentPriceLabel = document.createElement('div');
        this.currentPriceLabel.style.cssText = 'color:#ff00ff;font-size:18px;font-weight:600;text-align:center;min-height:28px;';
        this.overlay.appendChild(this.currentPriceLabel);
        
        this.skinElements = [];
        for (let i = 0; i < 7; i++) {
            const el = document.createElement('div');
            el.style.cssText = 'position:absolute;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.7);font-size:16px;font-weight:500;white-space:nowrap;opacity:0.3;transition:transform 0.1s ease-out, opacity 0.1s ease-out, color 0.1s ease-out;';
            this.skinsLayer.appendChild(el);
            this.skinElements.push(el);
        }
        
        document.body.appendChild(this.overlay);
    }
    
    getSpeed(progress) {
        return this.maxSpeed - (this.maxSpeed - this.minSpeed) * Math.pow(progress, 2);
    }
    
    animate(timestamp) {
        if (!this.isSpinning) return;
        
        const elapsed = timestamp - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        
        const currentSpeed = this.getSpeed(progress);
        const shouldUpdate = (timestamp - this.lastUpdate) > (1000 / currentSpeed) || progress >= 1;
        
        if (shouldUpdate) {
            this.lastUpdate = timestamp;
            this.currentIndex++;
            this.render(progress);
        }
        
        if (progress >= 1) {
            this.isSpinning = false;
            setTimeout(() => this.finish(), 800);
            return;
        }
        
        requestAnimationFrame((t) => this.animate(t));
    }
    
    render(progress) {
        const idx = this.currentIndex % this.skins.length;
        const skin = this.skins[idx];
        
        this.currentSkinLabel.style.transition = 'opacity 0.15s ease-out';
        this.currentSkinLabel.style.opacity = '0';
        
        setTimeout(() => {
            this.currentSkinLabel.textContent = skin.name;
            this.currentSkinLabel.style.opacity = '1';
        }, 80);
        
        this.currentPriceLabel.textContent = skin.price + ' 🪙';
        
        const blurAmount = Math.max(0, (1 - progress) * 6);
        this.skinsLayer.style.filter = `blur(${blurAmount}px)`;
        
        for (let i = 0; i < this.skinElements.length; i++) {
            const el = this.skinElements[i];
            const offset = (this.currentIndex + i) % this.skins.length;
            const s = this.skins[offset];
            el.textContent = `${s.name} (${s.price}🪙)`;
            const positions = [-65, -40, -18, 0, 18, 40, 65];
            const pos = positions[i];
            el.style.left = (50 + pos) + '%';
            el.style.transform = `translate(-50%, -50%) scale(${1 - Math.abs(pos) / 120})`;
            el.style.opacity = 0.15 + (1 - Math.abs(pos) / 70) * 0.7;
            
            if (Math.abs(pos) < 10) {
                el.style.color = '#ff00ff';
                el.style.fontWeight = '700';
                el.style.textShadow = '0 0 30px rgba(255,0,255,0.5)';
                el.style.transform = `translate(-50%, -50%) scale(${1 - Math.abs(pos) / 120 + 0.1})`;
            } else {
                const rarityColors = {
                    'Белый': '#b0b0b0',
                    'Синий': '#4a7db4',
                    'Фиолетовый': '#b84ad6',
                    'Розовый': '#ff00ff',
                    'Красный': '#ff0044',
                    'Желтый': '#ffd700'
                };
                el.style.color = rarityColors[s.rarity] || '#ffffff';
                el.style.fontWeight = '400';
                el.style.textShadow = 'none';
            }
        }
    }
    
    finish() {
        this.skinsLayer.style.filter = 'blur(0px)';
        
        let realRarity = 'Синий';
        for (const skin of this.skins) {
            if (skin.name === this.realItem) {
                realRarity = skin.rarity;
                break;
            }
        }
        
        const rarityColors = {
            'Белый': '#b0b0b0',
            'Синий': '#4a7db4',
            'Фиолетовый': '#b84ad6',
            'Розовый': '#ff00ff',
            'Красный': '#ff0044',
            'Желтый': '#ffd700'
        };
        
        const flashColor = realRarity === 'Желтый' || realRarity === 'Розовый' ? '#ff00ff' : '#ff0044';
        
        this.resultFrame.style.borderColor = flashColor;
        this.resultFrame.style.boxShadow = `0 0 60px ${flashColor}88, 0 0 120px ${flashColor}44`;
        this.resultFrame.style.background = `radial-gradient(circle, ${flashColor}22, transparent)`;
        
        this.currentSkinLabel.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        this.currentSkinLabel.textContent = this.realItem;
        this.currentSkinLabel.style.color = rarityColors[realRarity] || '#ffffff';
        this.currentSkinLabel.style.fontSize = '32px';
        this.currentSkinLabel.style.textShadow = `0 0 40px ${rarityColors[realRarity] || '#ff00ff'}66`;
        
        this.currentPriceLabel.textContent = this.realPrice + ' 🪙';
        this.currentPriceLabel.style.color = '#ffd700';
        this.currentPriceLabel.style.fontSize = '22px';
        
        const flash = document.createElement('div');
        flash.style.cssText = `
            position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
            width:300px;height:300px;border-radius:50%;
            background:radial-gradient(circle, ${flashColor}88, transparent 70%);
            z-index:20;opacity:0;
            transition:all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
            pointer-events:none;
        `;
        this.overlay.appendChild(flash);
        
        requestAnimationFrame(() => {
            flash.style.opacity = '1';
            flash.style.width = '800px';
            flash.style.height = '800px';
        });
        
        setTimeout(() => {
            this.overlay.style.transition = 'opacity 0.5s ease';
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                this.overlay.remove();
                if (this.callback) this.callback(this.realItem, this.realPrice);
            }, 500);
        }, 2000);
    }
}

// ============ ПЛАВНАЯ АНИМАЦИЯ КОЛЕСА ============
class WheelAnimation {
    constructor(realPrize, callback) {
        this.realPrize = realPrize;
        this.callback = callback;
        this.prizes = [
            ["50 🪙", 50, "coins"], ["100 🪙", 100, "coins"],
            ["150 🪙", 150, "coins"], ["200 🪙", 200, "coins"],
            ["300 🪙", 300, "coins"], ["500 🪙", 500, "coins"],
            ["750 🪙", 750, "coins"], ["1000 🪙", 1000, "coins"],
            ["5% 🏷️", 5, "discount"], ["10% 🏷️", 10, "discount"],
            ["15% 🏷️", 15, "discount"], ["25% 🏷️", 25, "discount"]
        ];
        this.currentIndex = 0;
        this.isSpinning = true;
        this.startTime = performance.now();
        this.duration = 4000;
        this.maxSpeed = 120;
        this.minSpeed = 60;
        this.lastUpdate = 0;
        this.createUI();
        requestAnimationFrame((t) => this.animate(t));
    }
    
    createUI() {
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(10,10,20,0.98);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;';
        
        const title = document.createElement('div');
        title.style.cssText = 'color:#ff00ff;font-size:22px;font-weight:700;margin-bottom:20px;letter-spacing:3px;text-shadow:0 0 20px rgba(255,0,255,0.3);';
        title.textContent = '🎡 КОЛЕСО ФОРТУНЫ';
        this.overlay.appendChild(title);
        
        this.container = document.createElement('div');
        this.container.style.cssText = 'width:85%;max-width:450px;height:90px;position:relative;overflow:hidden;margin-bottom:15px;background:rgba(255,0,255,0.03);border-radius:12px;border:1px solid rgba(255,0,255,0.08);';
        this.overlay.appendChild(this.container);
        
        this.resultFrame = document.createElement('div');
        this.resultFrame.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:160px;height:80%;border:2px solid #ff00ff;border-radius:8px;z-index:5;box-shadow:0 0 30px rgba(255,0,255,0.3);background:rgba(255,0,255,0.05);';
        this.container.appendChild(this.resultFrame);
        
        this.prizesLayer = document.createElement('div');
        this.prizesLayer.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;justify-content:center;';
        this.container.appendChild(this.prizesLayer);
        
        this.currentPrizeLabel = document.createElement('div');
        this.currentPrizeLabel.style.cssText = 'color:#ffffff;font-size:28px;font-weight:700;text-align:center;min-height:36px;margin-top:10px;text-shadow:0 0 30px rgba(255,0,255,0.2);';
        this.overlay.appendChild(this.currentPrizeLabel);
        
        this.prizeElements = [];
        for (let i = 0; i < 7; i++) {
            const el = document.createElement('div');
            el.style.cssText = 'position:absolute;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.7);font-size:16px;font-weight:500;white-space:nowrap;opacity:0.3;transition:transform 0.1s ease-out, opacity 0.1s ease-out;';
            this.prizesLayer.appendChild(el);
            this.prizeElements.push(el);
        }
        
        document.body.appendChild(this.overlay);
    }
    
    getSpeed(progress) {
        return this.maxSpeed - (this.maxSpeed - this.minSpeed) * Math.pow(progress, 2);
    }
    
    animate(timestamp) {
        if (!this.isSpinning) return;
        
        const elapsed = timestamp - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        
        const currentSpeed = this.getSpeed(progress);
        const shouldUpdate = (timestamp - this.lastUpdate) > (1000 / currentSpeed) || progress >= 1;
        
        if (shouldUpdate) {
            this.lastUpdate = timestamp;
            this.currentIndex++;
            this.render(progress);
        }
        
        if (progress >= 1) {
            this.isSpinning = false;
            setTimeout(() => this.finish(), 800);
            return;
        }
        
        requestAnimationFrame((t) => this.animate(t));
    }
    
    render(progress) {
        const name = this.prizes[this.currentIndex % this.prizes.length][0];
        
        this.currentPrizeLabel.style.transition = 'opacity 0.15s ease-out';
        this.currentPrizeLabel.style.opacity = '0';
        
        setTimeout(() => {
            this.currentPrizeLabel.textContent = name;
            this.currentPrizeLabel.style.opacity = '1';
        }, 80);
        
        const blurAmount = Math.max(0, (1 - progress) * 4);
        this.prizesLayer.style.filter = `blur(${blurAmount}px)`;
        
        for (let i = 0; i < this.prizeElements.length; i++) {
            const el = this.prizeElements[i];
            const idx = (this.currentIndex + i) % this.prizes.length;
            el.textContent = this.prizes[idx][0];
            const positions = [-65, -40, -18, 0, 18, 40, 65];
            const pos = positions[i];
            el.style.left = (50 + pos) + '%';
            el.style.transform = `translate(-50%, -50%) scale(${1 - Math.abs(pos) / 120})`;
            el.style.opacity = 0.15 + (1 - Math.abs(pos) / 70) * 0.7;
        }
    }
    
    finish() {
        this.prizesLayer.style.filter = 'blur(0px)';
        
        let displayName = '';
        if (this.realPrize.type === 'coins') displayName = `${this.realPrize.value} 🪙`;
        else if (this.realPrize.type === 'discount') displayName = `${this.realPrize.value}% скидка`;
        
        this.currentPrizeLabel.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        this.currentPrizeLabel.textContent = displayName;
        this.currentPrizeLabel.style.color = '#ff00ff';
        this.currentPrizeLabel.style.fontSize = '40px';
        this.currentPrizeLabel.style.textShadow = '0 0 60px rgba(255,0,255,0.5)';
        
        const flash = document.createElement('div');
        flash.style.cssText = `
            position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
            width:300px;height:300px;border-radius:50%;
            background:radial-gradient(circle, #ff00ff88, transparent 70%);
            z-index:20;opacity:0;
            transition:all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
            pointer-events:none;
        `;
        this.overlay.appendChild(flash);
        
        requestAnimationFrame(() => {
            flash.style.opacity = '1';
            flash.style.width = '800px';
            flash.style.height = '800px';
        });
        
        setTimeout(() => {
            this.overlay.style.transition = 'opacity 0.5s ease';
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                this.overlay.remove();
                if (this.callback) this.callback(this.realPrize);
            }, 500);
        }, 2000);
    }
}

// ============ ПЛАВНАЯ АНИМАЦИЯ АПГРЕЙДА ============
class UpgradeAnimation {
    constructor(success, callback) {
        this.success = success;
        this.callback = callback;
        this.createUI();
    }
    
    createUI() {
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(10,10,20,0.98);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;';
        
        const bgGradient = this.success ? 
            'radial-gradient(circle at center, rgba(255,0,255,0.2), transparent 70%)' :
            'radial-gradient(circle at center, rgba(255,0,68,0.2), transparent 70%)';
        this.overlay.style.background = bgGradient;
        
        const title = document.createElement('div');
        title.style.cssText = 'color:#6a7a8e;font-size:18px;font-weight:600;margin-bottom:20px;letter-spacing:2px;';
        title.textContent = '⬆️ АПГРЕЙД';
        this.overlay.appendChild(title);
        
        this.resultLabel = document.createElement('div');
        this.resultLabel.style.cssText = 'font-size:100px;font-weight:900;text-align:center;transition:all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);text-shadow:0 0 60px rgba(255,0,255,0.3);';
        this.resultLabel.textContent = this.success ? 'UP' : 'LOSE';
        this.overlay.appendChild(this.resultLabel);
        
        this.statusLabel = document.createElement('div');
        this.statusLabel.style.cssText = 'color:#ffffff;font-size:24px;font-weight:600;text-align:center;margin-top:15px;transition:all 0.5s ease;';
        this.statusLabel.textContent = this.success ? '✅ УСПЕШНО!' : '💔 НЕ УДАЛОСЬ';
        this.overlay.appendChild(this.statusLabel);
        
        document.body.appendChild(this.overlay);
        
        // Анимация появления
        requestAnimationFrame(() => {
            this.resultLabel.style.transform = 'scale(1.5)';
            this.resultLabel.style.color = this.success ? '#ff00ff' : '#ff0044';
            this.resultLabel.style.textShadow = this.success ? 
                '0 0 100px rgba(255,0,255,0.5)' : '0 0 100px rgba(255,0,68,0.5)';
            this.statusLabel.style.color = this.success ? '#ff00ff' : '#ff0044';
        });
        
        // Частицы
        for (let i = 0; i < 20; i++) {
            this.createParticle();
        }
        
        setTimeout(() => {
            this.overlay.style.transition = 'opacity 0.5s ease';
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                this.overlay.remove();
                if (this.callback) this.callback();
            }, 500);
        }, 2500);
    }
    
    createParticle() {
        const particle = document.createElement('div');
        const size = randomInt(4, 12);
        const x = randomInt(0, window.innerWidth);
        const y = randomInt(0, window.innerHeight);
        const duration = randomInt(1000, 3000);
        const delay = randomInt(0, 500);
        const color = this.success ? '#ff00ff' : '#ff0044';
        
        particle.style.cssText = `
            position:absolute;
            width:${size}px;
            height:${size}px;
            background:${color};
            border-radius:50%;
            left:${x}px;
            top:${y}px;
            opacity:0;
            animation:particleFade ${duration}ms ${delay}ms ease-out forwards;
            pointer-events:none;
        `;
        
        if (!document.getElementById('particle-style')) {
            const style = document.createElement('style');
            style.id = 'particle-style';
            style.textContent = `
                @keyframes particleFade {
                    0% { opacity: 1; transform: translate(0, 0) scale(1); }
                    100% { opacity: 0; transform: translate(${randomInt(-100, 100)}px, ${randomInt(-100, 100)}px) scale(0); }
                }
            `;
            document.head.appendChild(style);
        }
        
        this.overlay.appendChild(particle);
    }
}

// ============ КЕЙСЫ ============
function loadCases() {
    const list = document.getElementById('casesList');
    if (!list) return;
    list.innerHTML = `
        <button class="case-btn" onclick="openCase('bomj', 500)"><div style="font-weight:700;">🥫 BOMJ</div><div style="font-size:14px;color:#6a7a8e;">500 🪙</div></button>
        <button class="case-btn" onclick="openCase('berkut', 1500)"><div style="font-weight:700;">🦅 BERKUT</div><div style="font-size:14px;color:#6a7a8e;">1500 🪙</div></button>
        <button class="case-btn" onclick="openCase('champion', 5000)"><div style="font-weight:700;">🏆 CHAMPION</div><div style="font-size:14px;color:#6a7a8e;">5000 🪙</div></button>
        <button class="case-btn" onclick="openCase('draft', 7000)"><div style="font-weight:700;">📦 DRAFT</div><div style="font-size:14px;color:#6a7a8e;">7000 🪙</div></button>
        <button class="case-btn" onclick="openCase('m0nesy', 10000)"><div style="font-weight:700;">🧙 M0NESY</div><div style="font-size:14px;color:#6a7a8e;">10000 🪙</div></button>
        <button class="case-btn" onclick="openCase('donk', 15000)"><div style="font-weight:700;">💀 DONK</div><div style="font-size:14px;color:#6a7a8e;">15000 🪙</div></button>
    `;
}

function openCase(caseName, price) {
    if (tg) tg.HapticFeedback.impactOccurred('medium');
    
    fetch(`/api/miniapp_profile?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.is_frozen) {
            showModal('❌ ЗАМОРОЖЕН', 'Аккаунт заморожен из-за отрицательного баланса');
            return;
        }
        if (data.coins < price) {
            showModal('❌ ОШИБКА', `Нужно ${price} 🪙, у вас ${data.coins}`);
            return;
        }
        
        fetch('/api/miniapp_open_case', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user_id: userId, case_name: caseName})
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                new CaseAnimation(caseName, data.item, data.price, (item, price) => {
                    showModal('🎉 УСПЕХ!', `
                        <div style="text-align:center;padding:10px 0;">
                            <div style="font-size:40px;margin:10px 0;">🎉</div>
                            <div style="font-size:20px;font-weight:700;color:#ff00ff;">ВЫПАЛО!</div>
                            <div style="font-size:18px;font-weight:600;padding:8px 0;">${item}</div>
                            <div style="font-size:16px;color:#ffd700;">${price} 🪙</div>
                            <div style="display:flex;flex-direction:column;gap:8px;margin-top:16px;">
                                <button class="case-btn" onclick="closeModal();openCase('${caseName}',${price})" style="background:rgba(255,0,255,0.15);">🔄 ЕЩЁ</button>
                                <button class="case-btn primary" onclick="closeModal();loadInventory();loadBalance();">✅ В ИНВЕНТАРЬ</button>
                                <button class="case-btn" onclick="sellItemFromResult('${item.replace(/'/g, "\\'")}', ${price})" style="background:#ff00ff;color:#0a0a0a;">💰 ПРОДАТЬ СРАЗУ</button>
                            </div>
                        </div>
                    `);
                    loadBalance();
                });
            } else {
                showModal('❌ ОШИБКА', data.error || 'Не удалось открыть');
            }
        });
    });
}

function sellItemFromResult(itemName, itemPrice) {
    if (!confirm(`Продать "${itemName}" за ${itemPrice} 🪙?`)) return;
    
    fetch(`/api/miniapp_inventory?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.items && data.items.length > 0) {
            const found = data.items.find(i => i.name === itemName && i.price === itemPrice && i.withdraw_status !== 'pending');
            if (found) {
                sellItem(found.id, found.price);
            } else {
                showModal('❌ ОШИБКА', 'Предмет не найден в инвентаре');
            }
        }
    });
}

// ============ ИНВЕНТАРЬ ============
function loadInventory() {
    const list = document.getElementById('inventoryList');
    if (!list) return;
    list.innerHTML = '<div class="loading" style="text-align:center;color:#6a7a8e;padding:30px 0;">⏳ Загрузка...</div>';
    selectedItems.clear();
    selectMode = false;
    
    const sellSelectedBtn = document.getElementById('sellSelectedBtn');
    if (sellSelectedBtn) sellSelectedBtn.style.display = 'none';
    
    fetch(`/api/miniapp_inventory?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.items && data.items.length > 0) {
            let html = '';
            
            html += `
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
                    <button class="case-btn" onclick="toggleSelectMode()" id="selectModeBtn" style="flex:1;min-width:80px;padding:10px;margin:0;background:rgba(255,0,255,0.1);">✅ ВЫБРАТЬ</button>
                    <button class="case-btn primary" onclick="sellSelected()" id="sellSelectedBtn" style="flex:1;min-width:80px;padding:10px;margin:0;display:none;">💰 ПРОДАТЬ ВЫБРАННЫЕ</button>
                    <button class="case-btn" onclick="sellAll()" style="flex:1;min-width:80px;padding:10px;margin:0;background:rgba(255,0,255,0.1);">💰 ПРОДАТЬ ВСЁ</button>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding-bottom:10px;" id="inventoryGrid">
            `;
            
            data.items.forEach(item => {
                const isPending = item.withdraw_status === 'pending';
                const isSelected = selectedItems.has(item.id);
                
                html += `
                    <div class="inventory-item" style="border-color:${isPending ? '#ff0044' : isSelected ? '#ff00ff' : 'rgba(255,0,255,0.06)'};flex-direction:column;align-items:stretch;padding:10px;position:relative;">
                        ${!isPending ? `
                            <div style="position:absolute;top:6px;left:6px;">
                                <input type="checkbox" class="item-checkbox" data-id="${item.id}" style="width:18px;height:18px;accent-color:#ff00ff;display:none;cursor:pointer;">
                            </div>
                        ` : ''}
                        <div style="font-size:13px;font-weight:500;color:#e0e0e0;padding-right:20px;">${item.name}</div>
                        <div style="font-size:12px;color:#ff00ff;font-weight:600;">${item.price} 🪙</div>
                        ${isPending ? '<div style="font-size:10px;color:#ff0044;">⏳ Вывод (24ч)</div>' : ''}
                        <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">
                            ${!isPending ? `<button class="btn-sell" onclick="sellItem(${item.id}, ${item.price})" style="flex:1;padding:4px 8px;font-size:11px;">${t('sell')}</button>` : ''}
                            ${!isPending ? `<button class="btn-withdraw" onclick="withdrawItem(${item.id}, '${item.name.replace(/'/g, "\\'")}', ${item.price})" style="flex:1;padding:4px 8px;font-size:11px;">${t('withdraw')}</button>` : ''}
                            ${isPending ? '<button class="btn-withdraw" style="opacity:0.5;cursor:not-allowed;flex:1;padding:4px 8px;font-size:11px;">⏳</button>' : ''}
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
            list.innerHTML = html;
            
            if (!selectMode) {
                document.querySelectorAll('.item-checkbox').forEach(el => el.style.display = 'none');
            }
            
            updateCheckboxes();
            
        } else {
            list.innerHTML = '<div style="text-align:center;color:#6a7a8e;padding:30px 0;">📭 Нет предметов! Откройте кейсы!</div>';
        }
    })
    .catch(() => list.innerHTML = '<div style="text-align:center;color:#ff4444;padding:30px 0;">❌ Ошибка соединения</div>');
}

function toggleSelectMode() {
    selectMode = !selectMode;
    const checkboxes = document.querySelectorAll('.item-checkbox');
    const btn = document.getElementById('selectModeBtn');
    const sellBtn = document.getElementById('sellSelectedBtn');
    
    if (selectMode) {
        checkboxes.forEach(el => el.style.display = 'block');
        if (btn) btn.textContent = '❌ ОТМЕНИТЬ ВЫБОР';
        if (sellBtn) sellBtn.style.display = 'block';
        showToast('✅ Выберите предметы для продажи', 'info', 3000);
    } else {
        checkboxes.forEach(el => el.style.display = 'none');
        selectedItems.clear();
        if (btn) btn.textContent = '✅ ВЫБРАТЬ';
        if (sellBtn) sellBtn.style.display = 'none';
        document.querySelectorAll('.inventory-item').forEach(el => {
            el.style.borderColor = 'rgba(255,0,255,0.06)';
        });
    }
}

function updateCheckboxes() {
    document.querySelectorAll('.item-checkbox').forEach(el => {
        el.checked = selectedItems.has(parseInt(el.dataset.id));
        el.onchange = function() {
            const id = parseInt(this.dataset.id);
            if (this.checked) {
                selectedItems.add(id);
                this.closest('.inventory-item').style.borderColor = '#ff00ff';
            } else {
                selectedItems.delete(id);
                this.closest('.inventory-item').style.borderColor = 'rgba(255,0,255,0.06)';
            }
            updateSellSelectedBtn();
        };
    });
    updateSellSelectedBtn();
}

function updateSellSelectedBtn() {
    const sellBtn = document.getElementById('sellSelectedBtn');
    if (sellBtn) {
        const count = selectedItems.size;
        if (count > 0) {
            sellBtn.textContent = `💰 ПРОДАТЬ ВЫБРАННЫЕ (${count})`;
            sellBtn.style.display = 'block';
        } else {
            sellBtn.textContent = '💰 ПРОДАТЬ ВЫБРАННЫЕ';
            sellBtn.style.display = 'none';
        }
    }
}

function sellSelected() {
    if (selectedItems.size === 0) {
        showModal('❌ ОШИБКА', 'Выберите предметы для продажи');
        return;
    }
    
    const count = selectedItems.size;
    if (!confirm(`Продать ${count} выбранных предметов?`)) return;
    
    let sold = 0;
    let totalPrice = 0;
    const itemsToSell = Array.from(selectedItems);
    
    itemsToSell.forEach((id, index) => {
        fetch('/api/miniapp_sell_item', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user_id: userId, item_id: id})
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                sold++;
                totalPrice += data.price;
            }
            if (index === itemsToSell.length - 1) {
                loadBalance();
                loadInventory();
                showToast(`💰 Продано ${sold} предметов на ${totalPrice} 🪙`, 'success', 5000);
                selectedItems.clear();
                document.getElementById('sellSelectedBtn').style.display = 'none';
                document.getElementById('selectModeBtn').textContent = '✅ ВЫБРАТЬ';
                selectMode = false;
            }
        });
    });
}

function sellItem(itemId, price) {
    if (!confirm(`Продать этот предмет за ${price} 🪙?`)) return;
    if (tg) tg.HapticFeedback.impactOccurred('light');
    fetch('/api/miniapp_sell_item', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: userId, item_id: itemId})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            loadBalance();
            loadInventory();
            showToast(`💰 Продано! +${price} 🪙`, 'success', 5000);
        } else {
            showModal('❌ ОШИБКА', data.error || 'Не удалось продать');
        }
    });
}

function sellAll() {
    if (!confirm('Продать все предметы?')) return;
    if (tg) tg.HapticFeedback.impactOccurred('medium');
    fetch('/api/miniapp_sell_all', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: userId})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            loadBalance();
            loadInventory();
            showToast(`💰 Продано всё! +${data.total} 🪙 за ${data.count} предметов`, 'success', 6000);
        } else {
            showModal('❌ ОШИБКА', data.error || 'Не удалось продать');
        }
    });
}

// ============ ВЫВОД ============
function withdrawItem(itemId, name, price) {
    fetch(`/api/miniapp_profile?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.is_frozen) {
            showModal('❌ ЗАМОРОЖЕН', 'Аккаунт заморожен из-за отрицательного баланса');
            return;
        }
        showModal('📤 ВЫВОД', `
            <div style="text-align:center;padding:10px 0;">
                <div style="font-size:18px;font-weight:600;color:#ff00ff;">${name}</div>
                <div style="color:#6a7a8e;font-size:14px;padding:8px 0;">${price} 🪙</div>
                <div style="color:#ff4444;font-size:16px;font-weight:700;padding:12px 0;background:rgba(255,0,0,0.1);border-radius:8px;border:1px solid rgba(255,0,0,0.2);">⚠️ Это защита от мультиаккаунтов. В других ботах привязка по Trade URL, а у нас если хочешь несколько аккаунтов — плати.</div>
                <div style="color:#6a7a8e;font-size:13px;padding:8px 0;">Введите Steam Trade Link</div>
                <input type="text" id="tradeLinkInput" placeholder="Steam Trade Link" style="width:100%;padding:12px;border:2px solid #ff00ff;border-radius:12px;font-size:14px;margin:10px 0;background:rgba(0,0,0,0.3);color:#fff;">
                <button class="case-btn primary" onclick="sendWithdrawRequest(${itemId}, '${name.replace(/'/g, "\\'")}', ${price})" style="background:#ff00ff;border-color:#ff00ff;">📤 ОТПРАВИТЬ</button>
                <button class="case-btn" onclick="closeModal()">❌ ОТМЕНА</button>
            </div>
        `);
    });
}

function sendWithdrawRequest(itemId, name, price) {
    const tradeLink = document.getElementById('tradeLinkInput');
    if (!tradeLink || !tradeLink.value) {
        showModal('❌ ОШИБКА', 'Введите Steam Trade Link');
        return;
    }
    fetch('/api/withdraw_request', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: userId, item_id: itemId, trade_link: tradeLink.value})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            closeModal();
            showModal('📤 ЗАЯВКА ОТПРАВЛЕНА', `
                <div style="text-align:center;">
                    <div style="font-size:20px;font-weight:700;color:#ff00ff;">✅ Заявка создана!</div>
                    <div style="color:#6a7a8e;font-size:14px;padding:8px 0;">ID заявки: <strong>${data.request_id}</strong></div>
                    <div style="color:#6a7a8e;font-size:14px;padding:8px 0;">У вас есть 7 дней для подтверждения.</div>
                    <div style="background:rgba(0,0,0,0.3);padding:12px;border-radius:12px;margin:10px 0;border:1px solid #ff00ff;">
                        ⏱️ <span id="withdrawTimer">7d 00:00:00</span>
                    </div>
                    <div style="color:#6a7a8e;font-size:14px;padding:8px 0;">Предмет: ${name} (${price} 🪙)</div>
                    <button class="case-btn primary" onclick="closeModal()" style="background:#ff00ff;border-color:#ff00ff;">✅ ОК</button>
                </div>
            `);
            startWithdrawTimer(7 * 24 * 60 * 60);
            loadInventory();
            loadBalance();
        } else {
            showModal('❌ ОШИБКА', data.error);
        }
    })
    .catch(() => showModal('❌ ОШИБКА', 'Ошибка соединения'));
}

function startWithdrawTimer(seconds) {
    let remaining = seconds;
    const timerElement = document.getElementById('withdrawTimer');
    if (!timerElement) return;
    const interval = setInterval(() => {
        const days = Math.floor(remaining / 86400);
        const hours = Math.floor((remaining % 86400) / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const secs = remaining % 60;
        timerElement.textContent = `${days}d ${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
        remaining--;
        if (remaining < 0) {
            clearInterval(interval);
            timerElement.textContent = '⏰ ВРЕМЯ ВЫШЛО';
        }
    }, 1000);
}

function checkWithdrawStatus() {
    fetch(`/api/withdraw_status?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.requests && data.requests.length > 0) {
            data.requests.forEach(r => {
                if (r.status === 'approved') {
                    showModal('📤 ЗАЯВКА ПРИНЯТА', `
                        <div style="text-align:center;">
                            <div style="font-size:20px;font-weight:700;color:#ff00ff;">✅ Заявка принята!</div>
                            <div style="font-size:16px;color:#c0c0c0;padding:8px 0;">${r.item_name} (${r.item_price} 🪙)</div>
                            <div style="font-size:14px;color:#6a7a8e;">Ожидайте, пока с вами свяжется поддержка.</div>
                            <button class="case-btn primary" onclick="closeModal()" style="background:#ff00ff;border-color:#ff00ff;">✅ ОК</button>
                        </div>
                    `);
                }
                if (r.status === 'completed') {
                    showModal('📤 ЗАЯВКА ОБРАБОТАНА', `
                        <div style="text-align:center;">
                            <div style="font-size:20px;font-weight:700;color:#ff00ff;">✅ Заявка обработана!</div>
                            <div style="font-size:16px;color:#c0c0c0;padding:8px 0;">${r.item_name} (${r.item_price} 🪙)</div>
                            <div style="font-size:14px;color:#6a7a8e;">Зайдите в Steam и примите заявку.</div>
                            <button class="case-btn primary" onclick="closeModal()" style="background:#ff00ff;border-color:#ff00ff;">✅ ОК</button>
                        </div>
                    `);
                }
            });
        }
    })
    .catch(() => {});
}

// ============ ПРОФИЛЬ ============
function loadProfile() {
    const content = document.getElementById('profileContent');
    if (!content) return;
    content.innerHTML = '<div class="loading" style="text-align:center;color:#6a7a8e;padding:30px 0;">⏳ Загрузка...</div>';
    if (!userId) {
        content.innerHTML = '<div style="text-align:center;color:#ff4444;padding:30px 0;">Пожалуйста, войдите</div>';
        return;
    }
    fetch(`/api/miniapp_profile?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            content.innerHTML = `<div style="text-align:center;color:#ff4444;padding:30px 0;">Ошибка: ${data.error}</div>`;
            return;
        }
        const isAdminUser = data.is_admin || false;
        const isFrozen = data.is_frozen || 0;
        const isPrime = data.is_prime || false;
        const primeBadge = isPrime ? '👑 ' : '';
        
        content.innerHTML = `
            <div style="text-align:center;font-size:32px;font-weight:700;color:#ff00ff;padding:8px 0;">${primeBadge}${data.username || username} ${isAdminUser ? '✅ 👑' : ''}</div>
            <div style="text-align:center;font-size:14px;color:#6a7a8e;padding:4px 0;">${isPrime ? '👑 Прайм-подписка активна' : ''}</div>
            <div style="text-align:center;font-size:14px;color:#6a7a8e;padding:4px 0;">${isAdminUser ? '⭐ Подтверждённый аккаунт' : ''}</div>
            <div style="text-align:center;font-size:16px;color:#ff4444;padding:4px 0;font-weight:700;">${isFrozen ? '❄️ АККАУНТ ЗАМОРОЖЕН' : ''}</div>
            <div class="profile-field"><span class="label">🆔 Telegram ID</span><span class="value">${userId}</span></div>
            <div style="text-align:center;font-size:24px;font-weight:700;color:#ffd700;padding:4px 0;">${data.coins || 0} 🪙</div>
            <div class="profile-field"><span class="label">⭐ Уровень</span><span class="value">${data.level || 1}</span></div>
            <div class="profile-field"><span class="label">📊 Опыт</span><span class="value">${data.exp || 0}/${(data.level || 1) * 1000}</span></div>
            <div class="profile-field"><span class="label">👥 Рефералов</span><span class="value">${data.referrals || 0}</span></div>
            <div class="profile-field"><span class="label">💰 Депозит</span><span class="value">${data.total_deposit || 0} RUB</span></div>
            <div class="profile-field"><span class="label">📅 Стрик</span><span class="value">${data.daily_streak || 0} дней</span></div>
            <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">
                <button class="case-btn" onclick="showDeposit()">💳 ПОПОЛНИТЬ</button>
                <button class="case-btn" onclick="showReferral()">🔗 РЕФЕРАЛЬНАЯ ССЫЛКА</button>
                <button class="case-btn" onclick="showSupport()">🆘 ПОДДЕРЖКА</button>
                <button class="case-btn" onclick="subscribePrime()" style="border-color:#ff00ff;">👑 ПРАЙМ-ПОДПИСКА</button>
                <button class="case-btn" onclick="showLanguageSettings()">🌐 ЯЗЫК</button>
                <button class="case-btn" onclick="showTerms()">📜 ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ</button>
                <button class="case-btn" onclick="logout()">🚪 ВЫХОД</button>
            </div>
        `;
        if (isAdminUser) {
            const adminPanel = document.getElementById('adminPanel');
            if (adminPanel) adminPanel.style.display = 'block';
        }
    })
    .catch(err => {
        console.error('Profile error:', err);
        content.innerHTML = '<div style="text-align:center;color:#ff4444;padding:30px 0;">❌ Ошибка соединения</div>';
    });
}

function showTerms() {
    showModal('📜 ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ', `
        <div style="max-height:400px;overflow-y:auto;padding:10px 0;font-size:13px;color:#c0c0c0;line-height:1.8;text-align:left;">
            ${TERMS_TEXT}
        </div>
        <button class="case-btn primary" onclick="closeModal()" style="background:#ff00ff;border-color:#ff00ff;">✅ ЗАКРЫТЬ</button>
    `);
}

// ============ ЯЗЫК ============
function showLanguageSettings() {
    showModal('🌐 ЯЗЫК / TIL', `
        <div style="display:flex;flex-direction:column;gap:10px;padding:10px 0;">
            <button class="case-btn primary" onclick="setLanguage('ru')" style="background:#ff00ff;border-color:#ff00ff;">🇷🇺 Русский</button>
            <button class="case-btn" onclick="setLanguage('uz')">🇺🇿 O'zbek</button>
            <button class="case-btn" onclick="closeModal()">❌ ЗАКРЫТЬ</button>
        </div>
    `);
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('artdrop_lang', lang);
    updateLanguage();
    closeModal();
    showModal('✅ ГОТОВО!', `Язык изменён на ${lang === 'ru' ? 'Русский' : "O'zbek"}`);
}

function showDeposit() {
    showModal('💳 ПОПОЛНЕНИЕ', `
        <div style="text-align:center;">
            <div>📱 Телефон: +7-911-971-41-08</div>
            <div>👤 Получатель: Аэлита.С.</div>
            <div style="color:#ff00ff;padding:8px 0;">💱 Курс: 25000 🪙 = 115 RUB</div>
            <div style="color:#6a7a8e;font-size:14px;">📌 После перевода отправьте чек в поддержку</div>
            <button class="case-btn primary" onclick="closeModal()" style="background:#ff00ff;border-color:#ff00ff;">✅ ОК</button>
        </div>
    `);
}

function showReferral() {
    const link = `https://artappreb.onrender.com?ref=${userId}`;
    showModal('🔗 РЕФЕРАЛЬНАЯ ССЫЛКА', `
        <div style="text-align:center;">
            <div style="word-break:break-all;font-size:14px;padding:8px;background:rgba(0,0,0,0.3);border-radius:8px;border:1px solid #ff00ff;">${link}</div>
            <div style="color:#6a7a8e;font-size:12px;padding:4px 0;">💰 Пригласивший: +5000 🪙</div>
            <div style="color:#6a7a8e;font-size:12px;padding:4px 0;">💰 Новый игрок: +3000 🪙 (сверх стартовых 500)</div>
            <button class="case-btn primary" onclick="copyText('${link}')" style="background:#ff00ff;border-color:#ff00ff;">📋 КОПИРОВАТЬ</button>
            <button class="case-btn" onclick="closeModal()">❌ ЗАКРЫТЬ</button>
        </div>
    `);
}

function showSupport() {
    showModal('🆘 ПОДДЕРЖКА', `
        <div style="text-align:center;">
            <div style="padding:8px 0;">📩 Контакты: @ArtCSbotSupp</div>
            <button class="case-btn primary" onclick="window.open('https://t.me/ArtCSbotSupp','_blank')" style="background:#ff00ff;border-color:#ff00ff;">📩 НАПИСАТЬ</button>
            <button class="case-btn" onclick="closeModal()">❌ ЗАКРЫТЬ</button>
        </div>
    `);
}

function copyText(text) {
    if (navigator.clipboard) navigator.clipboard.writeText(text);
    if (tg) tg.HapticFeedback.impactOccurred('light');
    closeModal();
    showModal('✅ СКОПИРОВАНО!', 'Ссылка скопирована в буфер обмена');
}

function logout() {
    if (tg) tg.close();
    else window.location.href = '/';
}

// ============ КОЛЕСО ============
function loadWheelStatus() {
    fetch(`/api/miniapp_profile?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        const status = document.getElementById('wheelStatus');
        if (status) status.textContent = `🎡 ${t('spins_left')}: ${data.wheel_spins || 0}`;
    });
}

function spinWheel() {
    const btn = document.getElementById('spinBtn');
    btn.disabled = true;
    btn.textContent = '⏳ КРУТИМ...';
    if (tg) tg.HapticFeedback.impactOccurred('medium');
    fetch('/api/miniapp_wheel', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: userId})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            new WheelAnimation(data.result, (result) => {
                let msg = '';
                if (result.type === 'coins') msg = `🎉 Вы выиграли ${result.value} 🪙!`;
                else if (result.type === 'discount') msg = `🎉 Вы выиграли ${result.value}% скидку!`;
                showToast(msg, 'success', 8000);
                showModal('🎡 КОЛЕСО', `<div style="text-align:center;font-size:24px;color:#ff00ff;padding:20px;">${msg}</div>`);
                loadBalance();
                loadWheelStatus();
                btn.disabled = false;
                btn.textContent = '🎡 КРУТНУТЬ';
            });
        } else {
            showModal('❌ ОШИБКА', data.error || 'Не удалось крутить');
            btn.disabled = false;
            btn.textContent = '🎡 КРУТНУТЬ';
        }
    })
    .catch(() => {
        btn.disabled = false;
        btn.textContent = '🎡 КРУТНУТЬ';
        showModal('❌ ОШИБКА', 'Ошибка соединения');
    });
}

// ============ ТОП ============
function loadTopPlayers() {
    const list = document.getElementById('topList');
    const userPlace = document.getElementById('userPlace');
    if (!list) return;
    
    list.innerHTML = '<div style="text-align:center;color:#6a7a8e;padding:30px 0;">⏳ Загрузка...</div>';
    
    fetch(`/api/top_players?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        let html = '';
        
        if (data.top && data.top.length > 0) {
            data.top.forEach((p, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index+1}.`;
                const isYou = p.id == userId;
                html += `
                    <div class="inventory-item" style="${isYou ? 'border-color:#ff00ff;background:rgba(255,0,255,0.05);' : ''}">
                        <span><strong>${medal}</strong> ${p.username} ${isYou ? '👈' : ''}</span>
                        <span>🪙 ${p.coins}</span>
                        <span>👥 ${p.referrals}</span>
                        <span>📦 ${p.items}</span>
                        <span>💳 ${p.deposit} RUB</span>
                    </div>
                `;
            });
        } else {
            html = '<div style="text-align:center;color:#6a7a8e;padding:30px 0;">🏆 Нет игроков в топе</div>';
        }
        list.innerHTML = html;
        
        if (data.user && data.user.place > 0) {
            const u = data.user;
            userPlace.innerHTML = `
                <div style="font-weight:700;color:#ff00ff;padding:8px 0;">📍 ТВОЁ МЕСТО: #${u.place}</div>
                <div class="inventory-item" style="border-color:#ff00ff;background:rgba(255,0,255,0.05);">
                    <span><strong>${u.username}</strong></span>
                    <span>🪙 ${u.coins}</span>
                    <span>👥 ${u.referrals}</span>
                    <span>📦 ${u.items}</span>
                    <span>💳 ${u.deposit} RUB</span>
                </div>
            `;
        } else {
            userPlace.innerHTML = '<div style="text-align:center;color:#6a7a8e;padding:8px 0;">⚠️ Ты ещё не в рейтинге</div>';
        }
    })
    .catch(() => {
        list.innerHTML = '<div style="text-align:center;color:#ff4444;padding:30px 0;">❌ Ошибка загрузки</div>';
    });
}

// ============ ДРУЗЬЯ ============
function searchFriends() {
    const input = document.getElementById('friendSearchInput');
    const results = document.getElementById('friendSearchResults');
    if (!input || !input.value) {
        results.innerHTML = '<div style="color:#6a7a8e;padding:8px 0;">Введите ID или имя</div>';
        return;
    }
    
    results.innerHTML = '<div style="color:#6a7a8e;padding:8px 0;">⏳ Поиск...</div>';
    
    fetch(`/api/search_user?user_id=${userId}&search_id=${encodeURIComponent(input.value)}`)
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            results.innerHTML = `<div style="color:#ff4444;padding:8px 0;">❌ ${data.error}</div>`;
            return;
        }
        
        if (data.users && data.users.length > 0) {
            let html = '';
            data.users.forEach(u => {
                const status = u.is_online ? '🟢 Онлайн' : '⚪ Офлайн';
                html += `
                    <div class="inventory-item">
                        <span><strong>${u.username}</strong> (${status})</span>
                        <span>🪙 ${u.coins} ⭐${u.level}</span>
                        <span>${u.is_friend ? '✅ В друзьях' : ''}</span>
                        <div>
                            ${!u.is_friend && !u.request_sent && !u.request_received && u.id != userId ? 
                                `<button class="btn-sell" onclick="sendFriendRequest(${u.id})" style="background:#ff00ff;color:#0a0a0a;">➕</button>` : ''}
                            ${u.request_sent ? '<span style="color:#ffd700;">⏳ Отправлено</span>' : ''}
                            ${u.request_received ? `<button class="btn-sell" onclick="acceptFriendRequest(${u.id})" style="background:#ff00ff;color:#0a0a0a;">✅ Принять</button>` : ''}
                            ${u.is_friend ? `<button class="btn-withdraw" onclick="removeFriend(${u.id})" style="border-color:#ff0044;color:#ff0044;">❌</button>` : ''}
                            ${u.id == userId ? '👤 Это вы' : ''}
                        </div>
                    </div>
                `;
            });
            results.innerHTML = html;
        } else {
            results.innerHTML = '<div style="color:#6a7a8e;padding:8px 0;">Пользователь не найден</div>';
        }
    })
    .catch(() => {
        results.innerHTML = '<div style="color:#ff4444;padding:8px 0;">❌ Ошибка соединения</div>';
    });
}

function sendFriendRequest(friendId) {
    fetch('/api/send_friend_request', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: userId, friend_id: friendId})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast('✅ Заявка в друзья отправлена!', 'success', 5000);
            searchFriends();
        } else {
            showModal('❌ ОШИБКА', data.error);
        }
    });
}

function acceptFriendRequest(friendId) {
    fetch('/api/accept_friend', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: userId, friend_id: friendId})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast('✅ Пользователь теперь в друзьях!', 'success', 5000);
            searchFriends();
            loadFriends();
        } else {
            showModal('❌ ОШИБКА', data.error);
        }
    });
}

function removeFriend(friendId) {
    if (!confirm('Удалить друга?')) return;
    fetch('/api/remove_friend', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: userId, friend_id: friendId})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast('❌ Друг удалён', 'info', 3000);
            searchFriends();
            loadFriends();
        } else {
            showModal('❌ ОШИБКА', data.error);
        }
    });
}

function loadFriends() {
    const list = document.getElementById('friendsList');
    const requestsList = document.getElementById('friendRequests');
    if (!list) return;
    
    list.innerHTML = '<div style="color:#6a7a8e;padding:8px 0;">⏳ Загрузка...</div>';
    requestsList.innerHTML = '';
    
    fetch(`/api/get_friends?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.friends && data.friends.length > 0) {
            let html = '';
            data.friends.forEach(f => {
                const status = f.is_online ? '🟢 Онлайн' : '⚪ Офлайн';
                html += `
                    <div class="inventory-item">
                        <span><strong>${f.username}</strong> (${status})</span>
                        <span>🪙 ${f.coins} ⭐${f.level}</span>
                        <span>📦 ${f.items_count}</span>
                        <button class="btn-withdraw" onclick="viewFriendInventory(${f.id})">👁️</button>
                        <button class="btn-withdraw" onclick="window.open('tg://resolve?domain=${f.username}','_blank')" style="border-color:#ff00ff;">💬</button>
                    </div>
                `;
            });
            list.innerHTML = html;
        } else {
            list.innerHTML = '<div style="color:#6a7a8e;padding:8px 0;">👥 Нет друзей. Добавьте кого-нибудь!</div>';
        }
        
        if (data.requests && data.requests.length > 0) {
            let html = '';
            data.requests.forEach(r => {
                html += `
                    <div class="inventory-item">
                        <span><strong>${r.username}</strong></span>
                        <span>🪙 ${r.coins} ⭐${r.level}</span>
                        <div>
                            <button class="btn-sell" onclick="acceptFriendRequest(${r.id})" style="background:#ff00ff;color:#0a0a0a;">✅</button>
                            <button class="btn-withdraw" onclick="rejectFriendRequest(${r.id})" style="border-color:#ff0044;color:#ff0044;">❌</button>
                        </div>
                    </div>
                `;
            });
            requestsList.innerHTML = html;
        } else {
            requestsList.innerHTML = '<div style="color:#6a7a8e;padding:8px 0;">📩 Нет заявок</div>';
        }
    })
    .catch(() => {
        list.innerHTML = '<div style="color:#ff4444;padding:8px 0;">❌ Ошибка загрузки</div>';
    });
}

function rejectFriendRequest(friendId) {
    fetch('/api/reject_friend', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: userId, friend_id: friendId})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            loadFriends();
        }
    });
}

function viewFriendInventory(friendId) {
    fetch(`/api/admin/view_inventory/${friendId}`)
    .then(res => res.json())
    .then(data => {
        if (data.items && data.items.length > 0) {
            let html = '<div style="font-weight:700;color:#ff00ff;padding:8px 0;">📦 ИНВЕНТАРЬ ДРУГА:</div>';
            data.items.slice(0, 20).forEach(item => {
                html += `<div class="inventory-item"><span>${item.name}</span><span>${item.price} 🪙</span></div>`;
            });
            showModal('👁️ ИНВЕНТАРЬ', html);
        } else {
            showModal('📭 ПУСТО', 'У друга пустой инвентарь');
        }
    })
    .catch(() => showModal('❌ ОШИБКА', 'Не удалось загрузить инвентарь'));
}

// ============ АЧИВКИ ============
function loadAchievements() {
    const list = document.getElementById('achievementsList');
    if (!list) return;
    list.innerHTML = '<div style="text-align:center;color:#6a7a8e;padding:30px 0;">⏳ Загрузка...</div>';
    fetch(`/api/achievements?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.achievements && data.achievements.length > 0) {
            let html = '';
            data.achievements.forEach(ach => {
                const progress = ach.progress || 0;
                const target = ach.target || 100;
                const percent = Math.min((progress / target) * 100, 100);
                const isClaimed = ach.claimed || false;
                html += `
                    <div class="inventory-item" style="flex-direction:column;align-items:stretch;gap:4px;">
                        <div style="display:flex;justify-content:space-between;">
                            <span>${ach.done ? '✅' : '🔒'} ${ach.name}</span>
                            <span style="color:#ff00ff;">+${ach.reward} 🪙</span>
                        </div>
                        <div style="font-size:12px;color:#6a7a8e;">${ach.description}</div>
                        <div style="background:rgba(255,255,255,0.05);border-radius:8px;height:6px;overflow:hidden;">
                            <div style="background:${ach.done ? '#ff00ff' : 'rgba(255,0,255,0.3)'};width:${percent}%;height:100%;border-radius:8px;transition:width 0.5s;"></div>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div style="font-size:11px;color:#6a7a8e;">${progress}/${target}</div>
                            ${ach.done && !isClaimed ? `<button class="btn-sell" onclick="claimAchievement(${ach.id})" style="background:#ff00ff;color:#0a0a0a;">💰 ПОЛУЧИТЬ</button>` : ''}
                            ${isClaimed ? '<span style="color:#6a7a8e;font-size:11px;">✅ Получено</span>' : ''}
                        </div>
                    </div>
                `;
            });
            const hasUnclaimed = data.achievements.some(a => a.done && !a.claimed);
            if (hasUnclaimed) {
                html = `
                    <button class="case-btn primary" onclick="claimAllAchievements()" style="margin-bottom:12px;background:#ff00ff;border-color:#ff00ff;">🎁 ПОЛУЧИТЬ ВСЕ</button>
                    ${html}
                `;
            }
            list.innerHTML = html;
        } else {
            list.innerHTML = '<div style="text-align:center;color:#6a7a8e;padding:30px 0;">🏅 Нет достижений</div>';
        }
    })
    .catch(() => list.innerHTML = '<div style="text-align:center;color:#ff4444;padding:30px 0;">❌ Ошибка соединения</div>');
}

function claimAchievement(achId) {
    fetch('/api/claim_achievement', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: userId, achievement_id: achId})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast(`🎉 Получено ${data.reward} 🪙!`, 'success', 5000);
            loadBalance();
            loadAchievements();
        } else {
            showModal('❌ ОШИБКА', data.error || 'Не удалось получить награду');
        }
    });
}

function claimAllAchievements() {
    fetch('/api/claim_all_achievements', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: userId})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            showToast(`🎉 Получено ${data.total} 🪙 за ${data.count} достижений!`, 'success', 6000);
            loadBalance();
            loadAchievements();
        } else {
            showModal('❌ ОШИБКА', data.error || 'Не удалось получить награды');
        }
    });
}

// ============ ЕЖЕДНЕВНАЯ НАГРАДА ============
function checkDailyReward() {
    fetch(`/api/miniapp_profile?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.daily_reward_day) {
            dailyRewardDay = data.daily_reward_day;
            const lastDate = data.daily_reward_last;
            const today = new Date().toISOString().split('T')[0];
            dailyRewardClaimed = (lastDate === today);
        }
        updateDailyButton();
    })
    .catch(() => {});
}

function updateDailyButton() {
    const btn = document.getElementById('dailyRewardBtn');
    if (!btn) return;
    if (dailyRewardClaimed) {
        btn.innerHTML = '<div class="card-icon">✅</div><div class="card-title">НАГРАДА ПОЛУЧЕНА</div><div class="card-sub">Возвращайтесь завтра</div>';
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
    } else {
        const rewards = {1:500,2:750,3:1000,4:1250,5:1500,6:2500,7:3000};
        const day = dailyRewardDay || 0;
        const nextDay = day + 1 > 7 ? 1 : day + 1;
        const reward = rewards[nextDay] || 500;
        btn.innerHTML = `<div class="card-icon">🎁</div><div class="card-title">ДЕНЬ ${nextDay} — ${reward} 🪙</div><div class="card-sub">Заберите награду</div>`;
        btn.style.opacity = '1';
        btn.style.pointerEvents = 'auto';
    }
}

function claimDailyReward() {
    if (dailyRewardClaimed) {
        showModal('❌ УЖЕ ПОЛУЧЕНО', 'Вы уже получили награду сегодня');
        return;
    }
    fetch('/api/daily_reward', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: userId})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            dailyRewardClaimed = true;
            const rewards = {1:500,2:750,3:1000,4:1250,5:1500,6:2500,7:3000};
            const day = data.day;
            const reward = rewards[day] || 500;
            const bonus = data.bonus || 0;
            let msg = `День ${day} — +${reward} 🪙`;
            if (bonus > 0) msg += `\n🎉 Бонус за 30 дней: +${bonus} 🪙!`;
            showToast(`🎁 Ежедневная награда! ${msg}`, 'success', 8000);
            loadBalance();
            updateDailyButton();
        } else {
            showModal('❌ ОШИБКА', data.error || 'Не удалось получить награду');
        }
    })
    .catch(() => showModal('❌ ОШИБКА', 'Ошибка соединения'));
}

// ============ ПРОМОКОДЫ ============
function showPromoModal() {
    showModal('🎫 ПРОМОКОД', `
        <div style="text-align:center;padding:10px 0;">
            <div style="color:#6a7a8e;font-size:14px;padding:8px 0;">Введите промокод</div>
            <input type="text" id="promoInput" placeholder="Введите код" style="width:100%;padding:12px;border:2px solid #ff00ff;border-radius:12px;font-size:16px;margin:10px 0;background:rgba(0,0,0,0.3);color:#fff;">
            <button class="case-btn primary" onclick="activatePromo()" style="background:#ff00ff;border-color:#ff00ff;">🎫 АКТИВИРОВАТЬ</button>
            <button class="case-btn" onclick="closeModal()">❌ ЗАКРЫТЬ</button>
        </div>
    `);
}

function activatePromo() {
    const input = document.getElementById('promoInput');
    if (!input || !input.value) {
        showModal('❌ ОШИБКА', 'Введите промокод');
        return;
    }
    fetch('/api/promo_activate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: userId, code: input.value})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            closeModal();
            showToast(`🎫 Промокод активирован! +${data.reward} 🪙`, 'success', 6000);
            loadBalance();
        } else {
            showModal('❌ ОШИБКА', data.error);
        }
    })
    .catch(() => showModal('❌ ОШИБКА', 'Ошибка соединения'));
}

// ============ АПГРЕЙД ============
function loadUpgradeItems() {
    fetch(`/api/upgrade_items?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.items) {
            upgradeItems = data.items;
        }
    });
    
    selectedSource = null;
    selectedTarget = null;
    document.getElementById('sourceSlot').innerHTML = '<div style="color:#6a7a8e;font-size:14px;">Выберите предмет</div>';
    document.getElementById('sourceSlot').classList.remove('active');
    document.getElementById('targetSlot').innerHTML = '<div style="color:#6a7a8e;font-size:14px;">Выберите цель</div>';
    document.getElementById('targetSlot').classList.remove('active');
    document.getElementById('upgradeInfo').style.display = 'none';
    document.getElementById('upgradeBtn').disabled = true;
}

function selectSourceItem() {
    if (upgradeItems.length === 0) {
        showModal('📭 НЕТ ПРЕДМЕТОВ', 'У вас нет предметов для апгрейда (нужно от 1000 🪙)');
        return;
    }
    
    let html = '<div style="font-weight:700;color:#ff00ff;padding:8px 0;">📦 ВЫБЕРИ ПРЕДМЕТ:</div>';
    upgradeItems.forEach(item => {
        html += `
            <div class="inventory-item" onclick="setSource(${item.id}, '${item.name.replace(/'/g, "\\'")}', ${item.price})" style="cursor:pointer;">
                <span>${item.name}</span>
                <span style="color:#ff00ff;">${item.price} 🪙</span>
            </div>
        `;
    });
    html += '<button class="case-btn" onclick="closeModal()">❌ ОТМЕНА</button>';
    
    showModal('⬇️ ВХОД', html);
}

function setSource(id, name, price) {
    selectedSource = {id, name, price};
    closeModal();
    
    const slot = document.getElementById('sourceSlot');
    slot.innerHTML = `
        <div style="font-size:15px;font-weight:600;color:#e0e0e0;">${name}</div>
        <div style="font-size:13px;color:#ff00ff;font-weight:600;">${price} 🪙</div>
    `;
    slot.classList.add('active');
    
    calculateUpgrade();
    loadBalance();
}

function selectTargetItem() {
    if (!selectedSource) {
        showModal('❌ ОШИБКА', 'Сначала выберите предмет входа');
        return;
    }
    
    const targets = [
        {name: 'P250 | Cassette (FT)', price: 2125},
        {name: 'USP-S | PC-GRN (MW)', price: 3547},
        {name: 'AK-47 | Elite Build (MW)', price: 20000},
        {name: 'M4A4 | Magnesium (MW)', price: 12437},
        {name: 'AWP | Safari Mesh (MW)', price: 6940},
        {name: 'Desert Eagle | Oxide Blaze (FN)', price: 10017},
        {name: 'SSG 08 | Fever Dream (FT)', price: 16777},
        {name: 'M4A1-S | Nitro (FT)', price: 16062},
        {name: 'Glock-18 | Coral Bloom (FT)', price: 11645},
        {name: 'AK-47 | Safari Mesh (WW)', price: 2497},
    ].filter(t => t.price > selectedSource.price);
    
    if (targets.length === 0) {
        showModal('❌ НЕТ ЦЕЛЕЙ', 'Нет доступных целей для апгрейда');
        return;
    }
    
    let html = '<div style="font-weight:700;color:#ff00ff;padding:8px 0;">🎯 ВЫБЕРИ ЦЕЛЬ:</div>';
    targets.slice(0, 20).forEach(target => {
        const diff = target.price - selectedSource.price;
        const chance = Math.max(5, 95 - (diff / selectedSource.price) * 50);
        const color = chance > 60 ? '#ff00ff' : chance > 30 ? '#ff00ff' : '#ff0044';
        html += `
            <div class="inventory-item" onclick="setTarget('${target.name.replace(/'/g, "\\'")}', ${target.price})" style="cursor:pointer;">
                <span>${target.name}</span>
                <span style="color:${color};">${target.price} 🪙 (${Math.round(chance)}%)</span>
            </div>
        `;
    });
    html += '<button class="case-btn" onclick="closeModal()">❌ ОТМЕНА</button>';
    
    showModal('⬆️ ВЫХОД', html);
}

function setTarget(name, price) {
    selectedTarget = {name, price};
    closeModal();
    
    const slot = document.getElementById('targetSlot');
    slot.innerHTML = `
        <div style="font-size:15px;font-weight:600;color:#e0e0e0;">${name}</div>
        <div style="font-size:13px;color:#ff00ff;font-weight:600;">${price} 🪙</div>
    `;
    slot.classList.add('active');
    
    calculateUpgrade();
}

function calculateUpgrade() {
    if (!selectedSource || !selectedTarget) return;
    
    fetch('/api/upgrade_calculate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            source_id: selectedSource.id,
            target_price: selectedTarget.price
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            document.getElementById('upgradeInfo').style.display = 'block';
            document.getElementById('upgradeChance').textContent = data.chance + '%';
            document.getElementById('upgradeCoeff').textContent = data.coefficient + 'x';
            document.getElementById('upgradeProfit').textContent = '+' + data.profit + ' 🪙';
            
            const riskEl = document.getElementById('upgradeRisk');
            const risk = data.risk;
            riskEl.textContent = risk;
            riskEl.style.color = risk === 'ВЫСОКИЙ' ? '#ff0044' : risk === 'СРЕДНИЙ' ? '#ff00ff' : '#ff00ff';
            
            document.getElementById('upgradeBtn').disabled = false;
        }
    });
}

function executeUpgrade() {
    if (!selectedSource || !selectedTarget) return;
    
    const btn = document.getElementById('upgradeBtn');
    btn.disabled = true;
    btn.textContent = '⏳ АПГРЕЙД...';
    
    if (tg) tg.HapticFeedback.impactOccurred('heavy');
    
    fetch('/api/upgrade_execute', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            user_id: userId,
            source_id: selectedSource.id,
            target_name: selectedTarget.name,
            target_price: selectedTarget.price
        })
    })
    .then(res => res.json())
    .then(data => {
        btn.disabled = false;
        btn.textContent = '⬆️ АПГРЕЙД';
        
        if (data.success) {
            new UpgradeAnimation(data.upgraded, () => {
                if (data.upgraded) {
                    showToast(`🎉 Апгрейд успешен! +${data.target_name} (${data.target_price} 🪙)`, 'success', 8000);
                    showModal('🎉 АПГРЕЙД УСПЕШЕН!', `
                        <div style="text-align:center;padding:10px 0;">
                            <div style="font-size:48px;margin:10px 0;">🎉</div>
                            <div style="font-size:20px;font-weight:700;color:#ff00ff;">${data.target_name}</div>
                            <div style="font-size:16px;color:#ffd700;">+${data.target_price} 🪙</div>
                            <div style="color:#6a7a8e;font-size:14px;">Шанс: ${data.chance}% | Ролл: ${data.roll}%</div>
                            <button class="case-btn primary" onclick="closeModal();loadBalance();loadInventory();loadUpgradeItems();" style="background:#ff00ff;border-color:#ff00ff;">✅ ОК</button>
                        </div>
                    `);
                } else {
                    showToast(`💔 Апгрейд не удался! Предмет сгорел (-${data.lost_item} 🪙)`, 'error', 6000);
                    showModal('💔 АПГРЕЙД НЕ УДАЛСЯ', `
                        <div style="text-align:center;padding:10px 0;">
                            <div style="font-size:48px;margin:10px 0;">💔</div>
                            <div style="font-size:18px;font-weight:700;color:#ff0044;">Предмет сгорел!</div>
                            <div style="color:#6a7a8e;font-size:14px;">Шанс: ${data.chance}% | Ролл: ${data.roll}%</div>
                            <button class="case-btn primary" onclick="closeModal();loadBalance();loadInventory();loadUpgradeItems();" style="background:#ff00ff;border-color:#ff00ff;">✅ ОК</button>
                        </div>
                    `);
                }
                loadBalance();
            });
        } else {
            showModal('❌ ОШИБКА', data.error || 'Не удалось выполнить апгрейд');
            loadBalance();
        }
    })
    .catch(() => {
        btn.disabled = false;
        btn.textContent = '⬆️ АПГРЕЙД';
        showModal('❌ ОШИБКА', 'Ошибка соединения');
    });
}

// ============ АДМИН-ПАНЕЛЬ ============
function loadAdminPanel() {
    const content = document.getElementById('adminContent');
    if (!content) return;
    
    const adminAccess = sessionStorage.getItem('adminAccess') === 'true';
    
    if (!adminAccess) {
        content.innerHTML = `
            <div style="text-align:center;padding:20px 0;">
                <div style="font-size:48px;margin:10px 0;">🔐</div>
                <div style="font-size:18px;font-weight:700;color:#ff00ff;">ВХОД В АДМИН-ПАНЕЛЬ</div>
                <div style="color:#6a7a8e;font-size:14px;padding:8px 0;">Введите пароль для доступа</div>
                <input type="password" id="adminPasswordInput" placeholder="Введите пароль" 
                    style="width:100%;padding:14px;border:2px solid #ff00ff;border-radius:12px;font-size:16px;
                    margin:10px 0;background:rgba(0,0,0,0.3);color:#fff;text-align:center;">
                <button class="case-btn primary" onclick="verifyAdminPassword()" style="background:#ff00ff;border-color:#ff00ff;">🔓 ВОЙТИ</button>
                <div id="adminLoginError" style="color:#ff4444;font-size:14px;padding:8px 0;display:none;"></div>
            </div>
        `;
        return;
    }
    
    showAdminPanelContent(content);
}

function verifyAdminPassword() {
    const input = document.getElementById('adminPasswordInput');
    const error = document.getElementById('adminLoginError');
    
    if (!input || !input.value) {
        error.textContent = '❌ Введите пароль';
        error.style.display = 'block';
        return;
    }
    
    error.style.display = 'none';
    
    fetch('/api/admin_verify', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            user_id: userId,
            password: input.value
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            sessionStorage.setItem('adminAccess', 'true');
            showModal('✅ ДОСТУП РАЗРЕШЁН!', data.message);
            loadAdminPanel();
        } else {
            error.textContent = '❌ ' + data.error;
            error.style.display = 'block';
        }
    })
    .catch(() => {
        error.textContent = '❌ Ошибка соединения';
        error.style.display = 'block';
    });
}

function showAdminPanelContent(content) {
    content.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:6px;padding-bottom:20px;">
            <button class="case-btn" onclick="adminUsers()">👥 Список игроков</button>
            <button class="case-btn" onclick="adminFindUser()">🔍 Найти игрока</button>
            <button class="case-btn" onclick="adminViewProfile()">👤 Просмотр профиля</button>
            <button class="case-btn" onclick="adminViewInventory()">📦 Инвентарь игрока</button>
            <button class="case-btn" onclick="adminDepositHistory()">📜 История пополнений</button>
            <button class="case-btn" onclick="adminGiveCoins()">💰 Выдать монеты</button>
            <button class="case-btn" onclick="adminRemoveCoins()">💸 Списать монеты</button>
            <button class="case-btn" onclick="adminRemoveDeposit()">💸 Списать пополнение</button>
            <button class="case-btn" onclick="adminSimulateDeposit()">💵 Симуляция пополнения</button>
            <button class="case-btn" onclick="adminSetCoinRate()">📊 Установить курс</button>
            <button class="case-btn" onclick="adminGiveXP()">⭐ Выдать XP</button>
            <button class="case-btn" onclick="adminRemoveXP()">⭐ Забрать XP</button>
            <button class="case-btn" onclick="adminGiveLevel()">📈 Выдать уровень</button>
            <button class="case-btn" onclick="adminRemoveLevel()">📉 Забрать уровень</button>
            <button class="case-btn" onclick="adminResetProgress()">🔄 Обнулить прогресс</button>
            <button class="case-btn" onclick="adminResetWinrate()">📉 Сброс винрейта</button>
            <button class="case-btn" onclick="adminGiveItem()">🎁 Выдать предмет</button>
            <button class="case-btn" onclick="adminRemoveItem()">🗑️ Удалить предмет</button>
            <button class="case-btn" onclick="adminForceRemoveItem()">🗑️ Удалить предмет (принудительно)</button>
            <button class="case-btn" onclick="adminGiveCase()">📦 Выдать кейс</button>
            <button class="case-btn" onclick="adminResetInventory()">🗑️ Сброс инвентаря</button>
            <button class="case-btn" onclick="adminSetCasePrice()">💲 Цена кейса</button>
            <button class="case-btn" onclick="adminSetCaseChance()">🎲 Шанс кейса</button>
            <button class="case-btn" onclick="adminToggleCase()">🔘 Вкл/Выкл кейс</button>
            <button class="case-btn" onclick="adminGiveSpins()">🎡 Выдать прокрутки</button>
            <button class="case-btn" onclick="adminGiveDiscount()">🏷️ Выдать скидку</button>
            <button class="case-btn" onclick="adminCreatePromo()">🎫 Создать промокод</button>
            <button class="case-btn" onclick="adminDeactivatePromo()">🚫 Деактивировать промо</button>
            <button class="case-btn" onclick="adminPromoStats()">📊 Статистика промокодов</button>
            <button class="case-btn" onclick="adminWithdrawals()">📤 Заявки на вывод</button>
            <button class="case-btn" onclick="adminAcceptWithdraw()">✅ Принять заявку</button>
            <button class="case-btn" onclick="adminRejectWithdraw()">❌ Отклонить заявку</button>
            <button class="case-btn" onclick="adminCompleteWithdraw()">✅ Подтвердить исполнение</button>
            <button class="case-btn" onclick="adminBulkAcceptWithdraw()">📦 Принять выбранные</button>
            <button class="case-btn" onclick="adminBulkRejectWithdraw()">📦 Отклонить выбранные</button>
            <button class="case-btn" onclick="adminGivePrime()">💎 Выдать Prime</button>
            <button class="case-btn" onclick="adminRemovePrime()">💎 Забрать Prime</button>
            <button class="case-btn" onclick="adminBan()">🔨 Забанить</button>
            <button class="case-btn" onclick="adminUnban()">🔓 Разбанить</button>
            <button class="case-btn" onclick="adminFreeze()">❄️ Заморозить</button>
            <button class="case-btn" onclick="adminUnfreeze()">🔥 Разморозить</button>
            <button class="case-btn" onclick="adminDeleteUser()">❌ Удалить пользователя</button>
            <button class="case-btn" onclick="adminBroadcast()">📢 Массовая рассылка</button>
            <button class="case-btn" onclick="adminToggleWithdraw()">📤 Вкл/Выкл вывод</button>
            <button class="case-btn" onclick="adminToggleWheel()">🎡 Вкл/Выкл колесо</button>
            <button class="case-btn" onclick="adminToggleAchievements()">🏆 Вкл/Выкл ачивки</button>
            <button class="case-btn" onclick="adminToggleReferrals()">👥 Вкл/Выкл рефералов</button>
            <button class="case-btn" onclick="adminActiveUsers()">🟢 Активные игроки</button>
            <button class="case-btn" onclick="adminTopCoins()">💰 Топ монет</button>
            <button class="case-btn" onclick="adminTopLevel()">⭐ Топ уровней</button>
            <button class="case-btn" onclick="adminStats()">📊 Статистика</button>
            <button class="case-btn" onclick="adminExportCSV()">📁 Экспорт CSV</button>
            <button class="case-btn" onclick="adminResetTradeLink()">🔗 Сброс трейд-ссылки</button>
            <button class="case-btn" onclick="adminRestart()">🔁 Перезагрузить сервер</button>
            <button class="case-btn" onclick="adminChangePassword()">🔑 Сменить пароль</button>
            <button class="case-btn" onclick="sessionStorage.removeItem('adminAccess');loadAdminPanel();">🚪 Выйти из админки</button>
        </div>
        <div id="adminInfo" style="margin-top:12px;color:#6a7a8e;font-size:13px;max-height:400px;overflow-y:auto;"></div>
    `;
}

function adminChangePassword() {
    showModal('🔑 СМЕНА ПАРОЛЯ', `
        <div style="padding:10px 0;">
            <div style="color:#6a7a8e;font-size:14px;padding:4px 0;">Старый пароль</div>
            <input type="password" id="oldPassInput" placeholder="Введите старый пароль" 
                style="width:100%;padding:12px;border:2px solid #ff00ff;border-radius:12px;font-size:14px;margin:6px 0;background:rgba(0,0,0,0.3);color:#fff;">
            <div style="color:#6a7a8e;font-size:14px;padding:4px 0;">Новый пароль</div>
            <input type="password" id="newPassInput" placeholder="Введите новый пароль" 
                style="width:100%;padding:12px;border:2px solid #ff00ff;border-radius:12px;font-size:14px;margin:6px 0;background:rgba(0,0,0,0.3);color:#fff;">
            <button class="case-btn primary" onclick="submitPasswordChange()" style="background:#ff00ff;border-color:#ff00ff;">🔑 СМЕНИТЬ</button>
            <button class="case-btn" onclick="closeModal()">❌ ОТМЕНА</button>
        </div>
    `);
}

function submitPasswordChange() {
    const oldPass = document.getElementById('oldPassInput');
    const newPass = document.getElementById('newPassInput');
    
    if (!oldPass || !oldPass.value || !newPass || !newPass.value) {
        showModal('❌ ОШИБКА', 'Заполните оба поля');
        return;
    }
    
    fetch('/api/admin_change_password', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            user_id: userId,
            old_password: oldPass.value,
            new_password: newPass.value
        })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            closeModal();
            showModal('✅ ПАРОЛЬ ИЗМЕНЁН!', data.message);
        } else {
            showModal('❌ ОШИБКА', data.error);
        }
    })
    .catch(() => showModal('❌ ОШИБКА', 'Ошибка соединения'));
}

// ============ АДМИН-ФУНКЦИИ ============
function adminUsers() {
    fetch('/api/admin/users')
    .then(res => res.json())
    .then(data => {
        let html = '<div style="font-weight:700;color:#ff00ff;padding:8px 0;">👥 ИГРОКИ (ID, Имя, Монеты, Уровень):</div>';
        if (data.users && data.users.length > 0) {
            data.users.forEach(u => {
                html += `<div class="inventory-item"><span><strong>${u.id}</strong> | ${u.username} ${u.is_frozen ? '❄️' : ''} ${u.is_banned ? '🚫' : ''}</span><span>${u.coins} 🪙</span><span>⭐ Lv.${u.level}</span></div>`;
            });
        } else {
            html += '<div style="text-align:center;color:#6a7a8e;padding:12px 0;">Нет игроков</div>';
        }
        document.getElementById('adminInfo').innerHTML = html;
    })
    .catch(() => document.getElementById('adminInfo').innerHTML = '<div style="text-align:center;color:#ff4444;">❌ Ошибка загрузки</div>');
}

function adminFindUser() {
    const username = prompt('Введите имя пользователя (или его часть):');
    if (!username) return;
    fetch(`/api/admin/find_user?username=${encodeURIComponent(username)}`)
    .then(res => res.json())
    .then(data => {
        let html = '<div style="font-weight:700;color:#ff00ff;padding:8px 0;">🔍 РЕЗУЛЬТАТЫ:</div>';
        if (data.users && data.users.length > 0) {
            data.users.forEach(u => {
                html += `<div class="inventory-item"><span><strong>${u.id}</strong> | ${u.username}</span><span>${u.coins} 🪙</span><span>⭐ Lv.${u.level}</span></div>`;
            });
        } else {
            html += '<div style="text-align:center;color:#6a7a8e;padding:12px 0;">Пользователи не найдены</div>';
        }
        document.getElementById('adminInfo').innerHTML = html;
    });
}

function adminViewProfile() {
    const uid = prompt('Введите ID пользователя:');
    if (!uid) return;
    fetch(`/api/admin/view_profile/${parseInt(uid)}`)
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            document.getElementById('adminInfo').textContent = '❌ ' + data.error;
            return;
        }
        document.getElementById('adminInfo').innerHTML = `
            <div style="font-weight:700;color:#ff00ff;padding:8px 0;">👤 ПРОФИЛЬ ${data.username} (ID: ${data.id}):</div>
            <div>💰 Монет: ${data.coins}</div><div>⭐ Уровень: ${data.level}</div>
            <div>📊 Опыт: ${data.exp}</div><div>👥 Рефералов: ${data.referred_by}</div>
            <div>💳 Депозит: ${data.deposit} RUB</div>
            <div>📤 Выведено: ${data.withdrawn}</div>
            <div>🔐 Prime: ${data.prime_expires || 'Нет'}</div>
            <div>🔨 Забанен: ${data.is_banned ? 'Да' : 'Нет'}</div>
            <div>❄️ Заморожен: ${data.is_frozen ? 'Да' : 'Нет'}</div>
        `;
    });
}

function adminViewInventory() {
    const uid = prompt('Введите ID пользователя:');
    if (!uid) return;
    fetch(`/api/admin/view_inventory/${parseInt(uid)}`)
    .then(res => res.json())
    .then(data => {
        let html = `<div style="font-weight:700;color:#ff00ff;padding:8px 0;">📦 ИНВЕНТАРЬ игрока ${uid}:</div>`;
        if (data.items && data.items.length > 0) {
            data.items.slice(0, 30).forEach(i => {
                html += `<div class="inventory-item"><span>${i.name}</span><span>${i.price} 🪙</span></div>`;
            });
        } else {
            html += '<div style="text-align:center;color:#6a7a8e;padding:12px 0;">Инвентарь пуст</div>';
        }
        document.getElementById('adminInfo').innerHTML = html;
    });
}

function adminDepositHistory() {
    const uid = prompt('Введите ID пользователя:');
    if (!uid) return;
    fetch(`/api/admin/deposit_history/${parseInt(uid)}`)
    .then(res => res.json())
    .then(data => {
        let html = `<div style="font-weight:700;color:#ff00ff;padding:8px 0;">📜 ИСТОРИЯ ПОПОЛНЕНИЙ игрока ${uid}:</div>`;
        if (data.deposits && data.deposits.length > 0) {
            data.deposits.slice(0, 20).forEach(d => {
                html += `<div class="inventory-item"><span>${d.amount} RUB</span><span>скидка: ${d.discount}%</span><span>${d.date}</span></div>`;
            });
        } else {
            html += '<div style="text-align:center;color:#6a7a8e;padding:12px 0;">История пуста</div>';
        }
        document.getElementById('adminInfo').innerHTML = html;
    });
}

function showAdminConfirm(idPrompt, valuePrompt, callback) {
    const uid = prompt(idPrompt);
    if (!uid) return;
    fetch(`/api/admin/get_user_by_id/${parseInt(uid)}`)
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            document.getElementById('adminInfo').textContent = '❌ Пользователь не найден';
            return;
        }
        const confirmMsg = `👤 Найден пользователь: ${data.username} (ID: ${data.id})\n💰 Монет: ${data.coins}\n⭐ Уровень: ${data.level}\n${data.is_frozen ? '❄️ Заморожен' : '✅ Активен'} | ${data.is_banned ? '🚫 Забанен' : '✅ Не забанен'}\n\nПродолжить?`;
        if (!confirm(confirmMsg)) return;
        if (valuePrompt) {
            const value = prompt(valuePrompt);
            if (value === null) return;
            callback(uid, value);
        } else {
            callback(uid);
        }
    })
    .catch(() => document.getElementById('adminInfo').textContent = '❌ Ошибка проверки пользователя');
}

function adminGiveCoins() { showAdminConfirm('Введите ID игрока', 'Введите сумму', (uid, amount) => {
    fetch('/api/admin/give_coins', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid), amount:parseInt(amount)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка');
}); }

function adminRemoveCoins() { showAdminConfirm('Введите ID игрока', 'Введите сумму', (uid, amount) => {
    fetch('/api/admin/remove_coins', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid), amount:parseInt(amount)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка');
}); }

function adminRemoveDeposit() { showAdminConfirm('Введите ID игрока', 'Введите сумму (RUB)', (uid, amount) => {
    fetch('/api/admin/remove_deposit', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid), amount:parseInt(amount)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка');
}); }

function adminSimulateDeposit() { showAdminConfirm('Введите ID игрока', 'Введите сумму (RUB)', (uid, amount) => {
    const discount = prompt('Введите скидку %:');
    if (discount === null) return;
    fetch('/api/admin/simulate_deposit', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid), amount:parseInt(amount), discount:parseInt(discount)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? `✅ Готово! +${data.coins} 🪙` : '❌ Ошибка');
}); }

function adminSetCoinRate() {
    const rate = prompt('Введите курс (1 RUB = X монет):');
    if (!rate) return;
    fetch('/api/admin/set_coin_rate', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({rate:parseInt(rate)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка');
}

function adminGiveXP() { showAdminConfirm('Введите ID игрока', 'Введите количество XP', (uid, xp) => {
    fetch('/api/admin/give_xp', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid), xp:parseInt(xp)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка');
}); }

function adminRemoveXP() { showAdminConfirm('Введите ID игрока', 'Введите количество XP', (uid, xp) => {
    fetch('/api/admin/remove_xp', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid), xp:parseInt(xp)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка');
}); }

function adminGiveLevel() { showAdminConfirm('Введите ID игрока', 'Введите уровень', (uid, level) => {
    fetch('/api/admin/give_level', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid), level:parseInt(level)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка');
}); }

function adminRemoveLevel() { showAdminConfirm('Введите ID игрока', '', (uid) => {
    fetch('/api/admin/remove_level', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка');
}); }

function adminResetProgress() { showAdminConfirm('Введите ID игрока', '', (uid) => {
    if (!confirm('Обнулить прогресс? ВСЕ ДАННЫЕ БУДУТ УДАЛЕНЫ!')) return;
    fetch('/api/admin/reset_progress', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка');
}); }

function adminResetWinrate() { showAdminConfirm('Введите ID игрока', '', (uid) => {
    fetch('/api/admin/reset_winrate', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка');
}); }

function adminGiveItem() { showAdminConfirm('Введите ID игрока', 'Введите название предмета', (uid, name) => {
    const price = prompt('Введите цену:');
    if (price === null) return;
    fetch('/api/admin/give_item', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid), item_name:name, item_price:parseInt(price)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка');
}); }

function adminRemoveItem() {
    const iid = prompt('Введите ID предмета:');
    if (!iid) return;
    fetch('/api/admin/remove_item', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({item_id:parseInt(iid)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка');
}

function adminForceRemoveItem() {
    const iid = prompt('Введите ID предмета:');
    if (!iid) return;
    if (!confirm('Удалить предмет принудительно?')) return;
    fetch('/api/admin/force_remove_item', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({item_id:parseInt(iid)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка');
}

function adminGiveCase() { showAdminConfirm('Введите ID игрока', 'Введите кейс (bomj/berkut/champion/draft/m0nesy/donk)', (uid, caseName) => {
    fetch('/api/admin/give_case', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid), case_name:caseName})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? `✅ Готово! ${data.item} (${data.price} 🪙)` : '❌ Ошибка');
}); }

function adminResetInventory() { showAdminConfirm('Введите ID игрока', '', (uid) => {
    if (!confirm('Удалить все предметы?')) return;
    fetch('/api/admin/reset_inventory', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка');
}); }

function adminSetCasePrice() {
    const caseName = prompt('Введите кейс (bomj/berkut/champion/draft/m0nesy/donk):');
    if (!caseName) return;
    const price = prompt('Введите новую цену:');
    if (!price) return;
    fetch('/api/admin/set_case_price', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({case_name:caseName, price:parseInt(price)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка');
}

function adminSetCaseChance() {
    const caseName = prompt('Введите кейс (bomj/berkut/champion/draft/m0nesy/donk):');
    if (!caseName) return;
    const chance = prompt('Введите шанс джекпота %:');
    if (!chance) return;
    fetch('/api/admin/set_case_chance', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({case_name:caseName, jackpot_chance:parseFloat(chance)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка');
}

function adminToggleCase() {
    const caseName = prompt('Введите кейс (bomj/berkut/champion/draft/m0nesy/donk):');
    if (!caseName) return;
    fetch('/api/admin/toggle_case', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({case_name:caseName})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? `✅ Кейс ${data.is_active ? 'включён' : 'выключен'}` : '❌ Ошибка');
}

function adminGiveSpins() { showAdminConfirm('Введите ID игрока', 'Введите количество прокруток', (uid, spins) => {
    fetch('/api/admin/give_spins', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid), spins:parseInt(spins)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка');
}); }

function adminGiveDiscount() { showAdminConfirm('Введите ID игрока', 'Введите скидку % (5,10,15,25)', (uid, discount) => {
    fetch('/api/admin/give_discount', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid), discount:parseInt(discount)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка');
}); }

function adminCreatePromo() {
    const code = prompt('Введите желаемый код промокода (буквы и цифры, без пробелов):');
    if (!code) return;
    const reward = prompt('Введите награду (монеты):');
    if (!reward) return;
    const uses = prompt('Введите количество использований:');
    if (!uses) return;
    fetch('/api/admin/create_promo', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:code, reward:parseInt(reward), uses:parseInt(uses)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? `✅ Промокод создан: ${code} (награда: ${reward} 🪙, использований: ${uses})` : '❌ Ошибка');
}

function adminDeactivatePromo() {
    const code = prompt('Введите код промокода:');
    if (!code) return;
    fetch('/api/admin/deactivate_promo', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({code:code})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Деактивирован!' : '❌ Ошибка');
}

function adminPromoStats() {
    fetch('/api/admin/promo_stats')
    .then(res => res.json())
    .then(data => {
        let html = '<div style="font-weight:700;color:#ff00ff;padding:8px 0;">🎫 ПРОМОКОДЫ:</div>';
        if (data.promos && data.promos.length > 0) {
            data.promos.slice(0, 20).forEach(p => {
                html += `<div class="inventory-item"><span>${p.code}</span><span>${p.reward} 🪙</span><span>осталось: ${p.uses_left}</span></div>`;
            });
        } else {
            html += '<div style="text-align:center;color:#6a7a8e;padding:12px 0;">Нет промокодов</div>';
        }
        document.getElementById('adminInfo').innerHTML = html;
    });
}

function adminWithdrawals() {
    fetch('/api/admin/withdraw_requests')
    .then(res => res.json())
    .then(data => {
        let html = '<div style="font-weight:700;color:#ff00ff;padding:8px 0;">📤 ЗАЯВКИ НА ВЫВОД:</div>';
        if (data.requests && data.requests.length > 0) {
            data.requests.forEach(r => {
                const statusColors = {
                    'pending': '#ffd700',
                    'approved': '#ff00ff',
                    'completed': '#00ff00',
                    'rejected': '#ff0044'
                };
                const statusTexts = {
                    'pending': '⏳ Ожидает',
                    'approved': '✅ Принята',
                    'completed': '✅ Обработана',
                    'rejected': '❌ Отклонена'
                };
                const isSelected = window.selectedWithdrawals && window.selectedWithdrawals.includes(r.request_id);
                html += `
                    <div class="inventory-item" style="border-color:${isSelected ? '#ff00ff' : 'rgba(255,0,255,0.06)'};">
                        <span><strong>${r.request_id}</strong> | ${r.username} (ID:${r.user_id})</span>
                        <span>${r.item}</span>
                        <span>${r.price} 🪙</span>
                        <span style="color:${statusColors[r.status] || '#6a7a8e'};">${statusTexts[r.status] || r.status}</span>
                        <div style="display:flex;gap:4px;flex-wrap:wrap;">
                            <input type="checkbox" class="withdraw-checkbox" data-id="${r.request_id}" ${isSelected ? 'checked' : ''}>
                            ${r.status === 'pending' ? `<button class="btn-sell" onclick="adminAcceptWithdraw('${r.request_id}')" style="background:#ff00ff;">✅</button>` : ''}
                            ${r.status === 'pending' ? `<button class="btn-withdraw" onclick="adminRejectWithdraw('${r.request_id}')" style="border-color:#ff0044;color:#ff0044;">❌</button>` : ''}
                            ${r.status === 'approved' ? `<button class="btn-sell" onclick="adminCompleteWithdraw('${r.request_id}')" style="background:#00ff00;color:#000;">✅</button>` : ''}
                        </div>
                    </div>
                `;
            });
            html = `
                <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap;">
                    <button class="case-btn primary" onclick="bulkAcceptWithdraw()" style="background:#ff00ff;border-color:#ff00ff;flex:1;">✅ Принять выбранные</button>
                    <button class="case-btn" onclick="bulkRejectWithdraw()" style="background:#ff0044;border-color:#ff0044;flex:1;color:#fff;">❌ Отклонить выбранные</button>
                    <button class="case-btn" onclick="clearWithdrawSelection()" style="background:rgba(255,255,255,0.05);flex:0.5;">Снять выделение</button>
                </div>
                ${html}
            `;
            setTimeout(() => {
                document.querySelectorAll('.withdraw-checkbox').forEach(el => {
                    el.onchange = function() {
                        if (!window.selectedWithdrawals) window.selectedWithdrawals = [];
                        const id = this.dataset.id;
                        if (this.checked) {
                            if (!window.selectedWithdrawals.includes(id)) window.selectedWithdrawals.push(id);
                        } else {
                            window.selectedWithdrawals = window.selectedWithdrawals.filter(x => x !== id);
                        }
                    };
                });
            }, 100);
        } else {
            html += '<div style="text-align:center;color:#6a7a8e;padding:12px 0;">Нет заявок</div>';
        }
        document.getElementById('adminInfo').innerHTML = html;
    });
}

function adminAcceptWithdraw(requestId) {
    if (!confirm(`Принять заявку ${requestId}?`)) return;
    fetch('/api/admin/accept_withdraw', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({request_id: requestId})})
    .then(res => res.json()).then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Принято!' : '❌ Ошибка';
        if (data.success) adminWithdrawals();
    });
}

function adminCompleteWithdraw(requestId) {
    if (!confirm(`Подтвердить исполнение заявки ${requestId}?`)) return;
    fetch('/api/admin/complete_withdraw', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({request_id: requestId})})
    .then(res => res.json()).then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Исполнено!' : '❌ Ошибка';
        if (data.success) adminWithdrawals();
    });
}

function adminRejectWithdraw(requestId) {
    if (!confirm(`Отклонить заявку ${requestId}?`)) return;
    fetch('/api/admin/reject_withdraw', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({request_id: requestId})})
    .then(res => res.json()).then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Отклонено!' : '❌ Ошибка';
        if (data.success) adminWithdrawals();
    });
}

function bulkAcceptWithdraw() {
    if (!window.selectedWithdrawals || window.selectedWithdrawals.length === 0) {
        showModal('❌ Ошибка', 'Выберите заявки для массового принятия');
        return;
    }
    if (!confirm(`Принять ${window.selectedWithdrawals.length} заявок?`)) return;
    fetch('/api/admin/bulk_accept_withdraw', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({request_ids: window.selectedWithdrawals})})
    .then(res => res.json()).then(data => {
        document.getElementById('adminInfo').textContent = data.success ? `✅ Принято ${data.count} заявок!` : '❌ Ошибка';
        if (data.success) {
            window.selectedWithdrawals = [];
            adminWithdrawals();
        }
    });
}

function bulkRejectWithdraw() {
    if (!window.selectedWithdrawals || window.selectedWithdrawals.length === 0) {
        showModal('❌ Ошибка', 'Выберите заявки для массового отклонения');
        return;
    }
    if (!confirm(`Отклонить ${window.selectedWithdrawals.length} заявок?`)) return;
    fetch('/api/admin/bulk_reject_withdraw', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({request_ids: window.selectedWithdrawals})})
    .then(res => res.json()).then(data => {
        document.getElementById('adminInfo').textContent = data.success ? `✅ Отклонено ${data.count} заявок!` : '❌ Ошибка';
        if (data.success) {
            window.selectedWithdrawals = [];
            adminWithdrawals();
        }
    });
}

function clearWithdrawSelection() {
    window.selectedWithdrawals = [];
    document.querySelectorAll('.withdraw-checkbox').forEach(el => el.checked = false);
    adminWithdrawals();
}

function adminGivePrime() { showAdminConfirm('Введите ID игрока', '', (uid) => {
    fetch('/api/admin/give_prime', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Prime выдан!' : '❌ Ошибка');
}); }

function adminRemovePrime() { showAdminConfirm('Введите ID игрока', '', (uid) => {
    fetch('/api/admin/remove_prime', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Prime забран!' : '❌ Ошибка');
}); }

function adminBan() { showAdminConfirm('Введите ID игрока', 'Введите причину', (uid, reason) => {
    fetch('/api/admin/ban_user', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid), reason:reason})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Забанен!' : '❌ Ошибка');
}); }

function adminUnban() { showAdminConfirm('Введите ID игрока', '', (uid) => {
    fetch('/api/admin/unban_user', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Разбанен!' : '❌ Ошибка');
}); }

function adminFreeze() { showAdminConfirm('Введите ID игрока', '', (uid) => {
    fetch('/api/admin/freeze_user', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Заморожен!' : '❌ Ошибка');
}); }

function adminUnfreeze() { showAdminConfirm('Введите ID игрока', '', (uid) => {
    fetch('/api/admin/unfreeze_user', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Разморожен!' : '❌ Ошибка');
}); }

function adminDeleteUser() { showAdminConfirm('Введите ID игрока', '', (uid) => {
    if (!confirm('Удалить пользователя? ВСЕ ДАННЫЕ БУДУТ УДАЛЕНЫ НАВСЕГДА!')) return;
    fetch('/api/admin/delete_user', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Пользователь удалён!' : '❌ Ошибка');
}); }

function adminBroadcast() {
    const msg = prompt('📢 Введите текст рассылки:');
    if (!msg) return;
    if (!confirm(`Отправить рассылку всем пользователям?\n\nТекст: "${msg}"`)) return;
    fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: msg})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            document.getElementById('adminInfo').innerHTML = `
                <div style="color:#ff00ff;padding:8px 0;">✅ Рассылка отправлена ${data.count} пользователям!</div>
                <div style="color:#6a7a8e;font-size:13px;padding:4px 0;">Текст: "${msg}"</div>
            `;
            showToast(`📢 Рассылка отправлена ${data.count} пользователям!`, 'success', 5000);
        } else {
            document.getElementById('adminInfo').innerHTML = `<div style="color:#ff4444;">❌ Ошибка: ${data.error || 'Не удалось отправить'}</div>`;
        }
    })
    .catch(() => document.getElementById('adminInfo').innerHTML = '<div style="color:#ff4444;">❌ Ошибка соединения</div>');
}

function adminToggleWithdraw() {
    fetch('/api/admin/toggle_withdraw', {method:'POST'})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? `✅ Вывод ${data.enabled ? 'включён' : 'выключен'}` : '❌ Ошибка');
}

function adminToggleWheel() {
    fetch('/api/admin/toggle_wheel', {method:'POST'})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? `✅ Колесо ${data.enabled ? 'включено' : 'выключено'}` : '❌ Ошибка');
}

function adminToggleAchievements() {
    fetch('/api/admin/toggle_achievements', {method:'POST'})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? `✅ Ачивки ${data.enabled ? 'включены' : 'выключены'}` : '❌ Ошибка');
}

function adminToggleReferrals() {
    fetch('/api/admin/toggle_referrals', {method:'POST'})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? `✅ Рефералы ${data.enabled ? 'включены' : 'выключены'}` : '❌ Ошибка');
}

function adminActiveUsers() {
    fetch('/api/admin/active_users')
    .then(res => res.json())
    .then(data => {
        let html = '<div style="font-weight:700;color:#ff00ff;padding:8px 0;">🟢 АКТИВНЫЕ ИГРОКИ (10 мин):</div>';
        if (data.users && data.users.length > 0) {
            data.users.slice(0, 30).forEach(u => {
                html += `<div class="inventory-item"><span><strong>${u.id}</strong> | ${u.username}</span><span>${u.last_activity}</span></div>`;
            });
        } else {
            html += '<div style="text-align:center;color:#6a7a8e;padding:12px 0;">Нет активных игроков</div>';
        }
        document.getElementById('adminInfo').innerHTML = html;
    });
}

function adminTopCoins() {
    fetch('/api/admin/top_coins')
    .then(res => res.json())
    .then(data => {
        let html = '<div style="font-weight:700;color:#ff00ff;padding:8px 0;">💰 ТОП МОНЕТ:</div>';
        data.users.forEach((u, i) => {
            html += `<div class="inventory-item"><span>${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`} ${u.username} (ID:${u.id})</span><span>${u.coins} 🪙</span></div>`;
        });
        document.getElementById('adminInfo').innerHTML = html;
    });
}

function adminTopLevel() {
    fetch('/api/admin/top_level')
    .then(res => res.json())
    .then(data => {
        let html = '<div style="font-weight:700;color:#ff00ff;padding:8px 0;">⭐ ТОП УРОВНЕЙ:</div>';
        data.users.forEach((u, i) => {
            html += `<div class="inventory-item"><span>${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`} ${u.username} (ID:${u.id})</span><span>⭐ ${u.level}</span></div>`;
        });
        document.getElementById('adminInfo').innerHTML = html;
    });
}

function adminStats() {
    fetch('/api/admin/stats')
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').innerHTML = `
            <div style="font-weight:700;color:#ff00ff;padding:8px 0;">📊 СТАТИСТИКА:</div>
            <div>👥 Игроков: ${data.total_users}</div>
            <div>💰 Всего монет: ${data.total_coins}</div>
            <div>📦 Предметов: ${data.total_items}</div>
            <div>💳 Депозитов: ${data.total_deposit} RUB</div>
            <div>📤 Выведено: ${data.total_withdrawn} RUB</div>
        `;
    });
}

function adminExportCSV() {
    window.open('/api/admin/export_users_csv', '_blank');
    document.getElementById('adminInfo').textContent = '📁 CSV файл скачан!';
}

function adminResetTradeLink() { showAdminConfirm('Введите ID игрока', '', (uid) => {
    fetch('/api/admin/reset_tradelink', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка');
}); }

function adminRestart() {
    if (!confirm('Перезагрузить сервер?')) return;
    fetch('/api/admin/restart', {method:'POST'})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = '🔄 Сервер перезагружается...');
}
