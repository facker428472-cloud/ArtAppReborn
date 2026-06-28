// ============ ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ============
let userId = null;
let username = null;
let isAdmin = false;
let currentLang = 'ru';
let currentCase = 'bomj';
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
let tutorialCaseOpened = false;

// ============ ПЕРЕВОДЫ ============
const LANG = {
    'ru': {
        'welcome': 'ДОБРО ПОЖАЛОВАТЬ',
        'cases': 'КЕЙСЫ',
        'inventory': 'ИНВЕНТАРЬ',
        'pvp': 'ПВП',
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
        'find_opponent': 'НАЙТИ СОПЕРНИКА',
        'searching': 'Поиск соперника...',
        'waiting': 'Ожидание соперника...',
        'victory': 'ПОБЕДА!',
        'defeat': 'ПОРАЖЕНИЕ!',
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
        'pvp': 'PVP',
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
        'find_opponent': 'RAQIB TOPISH',
        'searching': 'Raqib qidirilmoqda...',
        'waiting': 'Raqib kutilyapti...',
        'victory': "G'ALABA!",
        'defeat': "MAG'LUBIYAT!",
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
<div class="text">2.1. Пользователь имеет право: открывать кейсы и получать скины; участвовать в PVP-битвах; получать ежедневные награды; выводить предметы при соблюдении условий; активировать промокоды; обращаться в поддержку; запрашивать возврат средств, если монеты не были потрачены с баланса.</div>
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
<div class="text">6.1. Аккаунт может быть заблокирован в случаях: создания более одного аккаунта; использования читов, ботов или багов; обмана при пополнении; оскорблений и угроз; мошенничества в PVP-битвах; перепродажи предметов вне сервиса; массового спама; нарушения любого пункта настоящего Соглашения.</div>
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
        console.log('User from Telegram:', userId, username);
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
    console.log('Login attempt:', uid, uname);
    
    // Получаем реферальный код из URL
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
        console.log('Login response:', data);
        if (data.success) {
            userId = data.user_id;
            username = data.username;
            isAdmin = data.is_admin || false;
            
            if (isAdmin) {
                const adminPanel = document.getElementById('adminPanel');
                if (adminPanel) adminPanel.style.display = 'block';
                localStorage.setItem('isAdmin', 'true');
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
            
            // Показываем модалку с рекламой канала
            setTimeout(showSubscribeModal, 2000);
        } else {
            console.error('Login failed:', data.error);
        }
    })
    .catch(err => console.error('Login error:', err));
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
        
        const colors = ['#ffd700', '#f5a623', '#e8a800', '#ff6b35', '#ff4444', '#ff8844', '#ffaa44', '#ffcc44'];
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
        avatarImg.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23ffd700"/%3E%3Ctext x="50" y="50" font-size="40" text-anchor="middle" dominant-baseline="central" fill="white" font-family="Arial"%3E👤%3C/text%3E%3C/svg%3E';
    }
}

function updateOnlineStatus() {
    const status = document.querySelector('.online-status');
    if (!status) return;
    
    fetch(`/api/miniapp_profile?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.last_activity) {
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
        document.querySelectorAll('#casesCoins, #invCoins, #profileCoins, #wheelCoins, #pvpCoins, #achCoins, #adminCoins, #topCoins, #friendsCoins, #upgradeCoins').forEach(el => {
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
        
        // Обновляем статус прайма
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
        'success': '#ffd700',
        'error': '#ff4444',
        'info': '#6a7a8e',
        'friend_request': '#ffd700',
        'achievement': '#ffd700',
        'level_up': '#ffd700'
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
                    <button onclick="acceptFriendRequestFromToast(${id})" style="padding:4px 12px;border-radius:6px;border:none;background:#ffd700;color:#0a0a0f;font-weight:600;cursor:pointer;font-size:13px;">✅</button>
                    <button onclick="rejectFriendRequestFromToast(${id})" style="padding:4px 12px;border-radius:6px;border:1px solid #ff4444;background:transparent;color:#ff4444;font-weight:600;cursor:pointer;font-size:13px;">❌</button>
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

// ============ РЕКЛАМНАЯ МОДАЛКА ============

function showSubscribeModal() {
    // Показываем раз в день
    const lastShown = localStorage.getItem('subscribe_modal_shown');
    const today = new Date().toISOString().split('T')[0];
    
    if (lastShown === today) return;
    
    localStorage.setItem('subscribe_modal_shown', today);
    
    showModal('🍄 ПОДПИШИСЬ НА КАНАЛ!', `
        <div style="text-align:center;padding:10px 0;">
            <div style="font-size:48px;margin:10px 0;">🍄</div>
            <div style="font-size:20px;font-weight:700;color:#ffd700;">ГРИБ | Халява CS2</div>
            <div style="color:#c0c0c0;font-size:14px;padding:8px 0;">
                Бесплатные кейсы, розыгрыши и халява каждый день!
            </div>
            <button class="case-btn primary" onclick="window.open('https://t.me/GRIB_FREE', '_blank')">
                📺 ПЕРЕЙТИ В КАНАЛ
            </button>
            <button class="case-btn" onclick="closeModal()" style="background:rgba(255,255,255,0.05);">
                ❌ ПРОПУСТИТЬ
            </button>
            <div style="font-size:11px;color:#6a7a8e;margin-top:8px;">
                Показывается раз в день
            </div>
        </div>
    `);
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
    
    // Проверяем рассылки
    fetch(`/api/get_broadcasts?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.broadcasts && data.broadcasts.length > 0) {
            data.broadcasts.forEach(b => {
                // Показываем как модалку, а не тост
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
            <div style="font-size:20px;font-weight:700;color:#ffd700;">Прайм-подписка</div>
            <div style="color:#c0c0c0;font-size:14px;padding:8px 0;">
                <div>💰 Цена: <strong>115 RUB</strong> в месяц</div>
                <div style="margin-top:8px;">🎁 <strong>Бесплатный кейс</strong> каждую неделю!</div>
                <div>👑 <strong>Корона</strong> в профиле</div>
                <div>⭐ <strong>Приоритетная</strong> поддержка</div>
            </div>
            <div style="color:#6a7a8e;font-size:12px;padding:8px 0;">
                Для оплаты напишите в поддержку @ArtCSbotSupp
            </div>
            <button class="case-btn primary" onclick="window.open('https://t.me/ArtCSbotSupp', '_blank')">
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
    
    // Блокируем кнопки во время обучения
    document.querySelectorAll('.card, .case-btn, .profile-btn').forEach(el => {
        el.style.pointerEvents = 'none';
        el.style.opacity = '0.5';
    });
    
    const step = steps[tutorialStep];
    showModal(step.title, `
        <div style="text-align:center;padding:10px 0;">
            <div style="font-size:16px;color:#c0c0c0;line-height:1.8;white-space:pre-wrap;padding:8px 0;">${step.text}</div>
            <button class="case-btn primary" onclick="tutorialAction('${step.action}')">
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
            // Разблокируем только кнопку "КЕЙСЫ"
            document.querySelectorAll('.card').forEach(el => {
                if (el.querySelector('.card-title')?.textContent.includes('КЕЙСЫ')) {
                    el.style.pointerEvents = 'auto';
                    el.style.opacity = '1';
                    el.style.borderColor = '#ffd700';
                    el.style.boxShadow = '0 0 30px rgba(255,215,0,0.3)';
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
            // Разблокируем кнопки продажи в инвентаре
            document.querySelectorAll('.inventory-item .btn-sell').forEach(el => {
                el.style.pointerEvents = 'auto';
                el.style.opacity = '1';
                el.style.borderColor = '#ffd700';
            });
            showToast('👆 Нажми "ПРОДАТЬ" на скине', 'info', 5000);
            break;
            
        case 'go_profile':
            const avatar = document.querySelector('.profile-btn');
            if (avatar) {
                avatar.style.pointerEvents = 'auto';
                avatar.style.opacity = '1';
                avatar.style.borderColor = '#ffd700';
                avatar.style.boxShadow = '0 0 30px rgba(255,215,0,0.3)';
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
            <div style="font-size:20px;font-weight:700;color:#ffd700;">Ты освоил ArtDrop!</div>
            <div style="color:#6a7a8e;font-size:14px;padding:8px 0;">Открывай кейсы, собирай скины и становись лучшим!</div>
            <button class="case-btn primary" onclick="closeModal();showScreen('main')">✅ НАЧАТЬ!</button>
        </div>
    `);
}

// ============ АНИМАЦИЯ КЕЙСОВ ============

class CaseAnimation {
    constructor(caseName, realItem, realPrice, callback) {
        this.caseName = caseName;
        this.realItem = realItem;
        this.realPrice = realPrice;
        this.callback = callback;
        this.skins = this.getCaseSkins();
        this.currentIndex = 0;
        this.isSpinning = true;
        this.startTime = Date.now();
        this.duration = 10000;
        this.createUI();
        this.startSpin();
    }
    
    getCaseSkins() {
        return [
            {name: "P90 | Sand Spray", price: 180, rarity: "Синий"},
            {name: "MP9 | Sand Dashed", price: 177, rarity: "Синий"},
            {name: "SCAR-20 | Zinc", price: 167, rarity: "Синий"},
            {name: "SG 553 | Night Camo", price: 162, rarity: "Синий"},
            {name: "XM1014 | Canvas Cloud", price: 160, rarity: "Синий"},
            {name: "Sticker | BLAST.tv", price: 155, rarity: "Белый"},
            {name: "MP5-SD | Dirt Drop", price: 192, rarity: "Синий"},
            {name: "Sticker | The Huns", price: 192, rarity: "Белый"},
            {name: "G3SG1 | Red Jasper", price: 185, rarity: "Синий"},
            {name: "UMP-45 | Facility Dark", price: 375, rarity: "Фиолетовый"},
            {name: "Sticker | FlameZ", price: 365, rarity: "Белый"},
            {name: "SCAR-20 | Short Ochre", price: 330, rarity: "Синий"},
            {name: "Tec-9 | Blue Blast", price: 215, rarity: "Синий"},
            {name: "Sticker | apEX", price: 442, rarity: "Белый"},
            {name: "MP9 | Slide", price: 440, rarity: "Синий"},
            {name: "UMP-45 | Mudder", price: 500, rarity: "Синий"},
            {name: "SCAR-20 | Contractor", price: 500, rarity: "Синий"},
            {name: "AUG | Sweeper", price: 477, rarity: "Фиолетовый"},
            {name: "Sticker | FURIA", price: 472, rarity: "Белый"},
            {name: "FAMAS | Palm", price: 115, rarity: "Белый"},
            {name: "Nova | Sand Dune", price: 577, rarity: "Фиолетовый"},
            {name: "MP9 | Sand Dashed", price: 577, rarity: "Синий"},
            {name: "UMP-45 | Facility Dark", price: 542, rarity: "Фиолетовый"},
            {name: "G3SG1 | Desert Storm", price: 537, rarity: "Синий"},
            {name: "AK-47 | Elite Build", price: 20000, rarity: "Розовый"},
            {name: "M4A4 | Magnesium", price: 12437, rarity: "Розовый"},
            {name: "AWP | Safari Mesh", price: 6940, rarity: "Фиолетовый"},
            {name: "Desert Eagle | Oxide Blaze", price: 10017, rarity: "Розовый"},
            {name: "SSG 08 | Fever Dream", price: 16777, rarity: "Розовый"},
            {name: "M4A1-S | Nitro", price: 16062, rarity: "Розовый"},
            {name: "Glock-18 | Coral Bloom", price: 11645, rarity: "Розовый"},
            {name: "AK-47 | Safari Mesh", price: 2497, rarity: "Фиолетовый"},
            {name: "★ Karambit | Doppler", price: 150000, rarity: "Желтый"},
            {name: "★ Butterfly | Fade", price: 200000, rarity: "Желтый"},
            {name: "★ M9 Bayonet | Marble Fade", price: 180000, rarity: "Желтый"},
        ];
    }
    
    createUI() {
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.95);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;';
        
        const caseNames = {"bomj":"🥫 КЕЙС БОМЖ","berkut":"🦅 КЕЙС БЕРКУТ","champion":"🏆 КЕЙС ЧЕМПИОН","draft":"📦 КЕЙС DRAFT","m0nesy":"🧙 КЕЙС M0NESY","donk":"💀 КЕЙС DONK"};
        const title = document.createElement('div');
        title.style.cssText = 'color:#ffd700;font-size:22px;font-weight:700;margin-bottom:20px;letter-spacing:3px;text-shadow:0 0 20px rgba(255,215,0,0.3);';
        title.textContent = caseNames[this.caseName] || 'КЕЙС';
        this.overlay.appendChild(title);
        
        this.container = document.createElement('div');
        this.container.style.cssText = 'width:85%;max-width:450px;height:90px;position:relative;overflow:hidden;margin-bottom:15px;background:rgba(255,215,0,0.03);border-radius:12px;border:1px solid rgba(255,215,0,0.08);';
        this.overlay.appendChild(this.container);
        
        this.resultFrame = document.createElement('div');
        this.resultFrame.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:120px;height:80%;border:2px solid #ffd700;border-radius:8px;z-index:5;box-shadow:0 0 30px rgba(255,215,0,0.3);background:rgba(255,215,0,0.05);';
        this.container.appendChild(this.resultFrame);
        
        this.indicator = document.createElement('div');
        this.indicator.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:2px;height:70%;background:#ffd700;z-index:6;border-radius:2px;';
        this.container.appendChild(this.indicator);
        
        this.skinsLayer = document.createElement('div');
        this.skinsLayer.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;justify-content:center;';
        this.container.appendChild(this.skinsLayer);
        
        this.currentSkinLabel = document.createElement('div');
        this.currentSkinLabel.style.cssText = 'color:#ffffff;font-size:24px;font-weight:700;text-align:center;min-height:32px;transition:opacity 0.05s;text-shadow:0 0 30px rgba(255,215,0,0.2);margin-top:10px;';
        this.overlay.appendChild(this.currentSkinLabel);
        
        this.currentPriceLabel = document.createElement('div');
        this.currentPriceLabel.style.cssText = 'color:#ffd700;font-size:18px;font-weight:600;text-align:center;min-height:28px;text-shadow:0 0 20px rgba(255,215,0,0.2);';
        this.overlay.appendChild(this.currentPriceLabel);
        
        this.skinElements = [];
        for (let i = 0; i < 7; i++) {
            const el = document.createElement('div');
            el.style.cssText = 'position:absolute;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.7);font-size:16px;font-weight:500;white-space:nowrap;opacity:0.3;transition:all 0.05s;text-shadow:0 0 10px rgba(255,215,0,0.1);';
            this.skinsLayer.appendChild(el);
            this.skinElements.push(el);
        }
        
        document.body.appendChild(this.overlay);
    }
    
    startSpin() { this.nextSkin(); }
    
    getSpeed(progress) {
        if (progress < 0.1) return 1.0;
        if (progress < 0.8) return 0.8 - (progress - 0.1) * 0.3;
        const t = (progress - 0.8) / 0.2;
        const bounce = 1 + 0.2 * Math.exp(-4 * t) * Math.cos(8 * t);
        return Math.max(0.05, bounce * (1 - t * 0.9));
    }
    
    nextSkin() {
        if (!this.isSpinning) return;
        
        const elapsed = Date.now() - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        
        const speedFactor = this.getSpeed(progress);
        const baseSpeed = 80;
        const currentSpeed = baseSpeed / Math.max(speedFactor, 0.05);
        
        this.skinsLayer.style.filter = 'blur(0px)';
        
        this.currentSkinLabel.style.transition = 'opacity 0.05s';
        this.currentSkinLabel.style.opacity = '0';
        
        setTimeout(() => {
            const idx = this.currentIndex % this.skins.length;
            const skin = this.skins[idx];
            this.currentSkinLabel.textContent = skin.name;
            this.currentPriceLabel.textContent = skin.price + ' 🪙';
            this.currentSkinLabel.style.opacity = '1';
        }, 50);
        
        for (let i = 0; i < this.skinElements.length; i++) {
            const el = this.skinElements[i];
            const idx = (this.currentIndex + i) % this.skins.length;
            const skin = this.skins[idx];
            el.textContent = `${skin.name} (${skin.price}🪙)`;
            const positions = [-65, -40, -18, 0, 18, 40, 65];
            const pos = positions[i];
            el.style.left = (50 + pos) + '%';
            el.style.transform = `translate(-50%, -50%) scale(${1 - Math.abs(pos) / 120})`;
            el.style.opacity = 0.15 + (1 - Math.abs(pos) / 70) * 0.7;
            el.style.filter = 'blur(0px)';
            
            if (pos >= -10 && pos <= 10) {
                el.style.color = '#ffd700';
                el.style.fontWeight = '700';
                el.style.textShadow = '0 0 30px rgba(255,215,0,0.5)';
                el.style.transform = `translate(-50%, -50%) scale(${1 - Math.abs(pos) / 120 + 0.1})`;
            } else {
                const rarityColors = {
                    'Белый': '#b0b0b0',
                    'Синий': '#4a7db4',
                    'Фиолетовый': '#b84ad6',
                    'Розовый': '#d64a8a',
                    'Красный': '#d64a4a',
                    'Желтый': '#ffd700'
                };
                el.style.color = rarityColors[skin.rarity] || '#ffffff';
                el.style.fontWeight = '400';
                el.style.textShadow = 'none';
                el.style.transform = `translate(-50%, -50%) scale(${1 - Math.abs(pos) / 120})`;
            }
        }
        
        this.currentIndex++;
        
        if (progress >= 1) {
            this.isSpinning = false;
            setTimeout(() => this.finish(), 300);
            return;
        }
        
        setTimeout(() => this.nextSkin(), currentSpeed);
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
            'Розовый': '#d64a8a',
            'Красный': '#d64a4a',
            'Желтый': '#ffd700'
        };
        
        const flashColor = realRarity === 'Желтый' || realRarity === 'Розовый' ? '#ffd700' : '#b84ad6';
        
        this.resultFrame.style.borderColor = flashColor;
        this.resultFrame.style.boxShadow = `0 0 60px ${flashColor}88, 0 0 120px ${flashColor}44`;
        this.resultFrame.style.background = `radial-gradient(circle, ${flashColor}22, transparent)`;
        
        this.currentSkinLabel.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        this.currentSkinLabel.textContent = this.realItem;
        this.currentSkinLabel.style.color = rarityColors[realRarity] || '#ffffff';
        this.currentSkinLabel.style.fontSize = '32px';
        this.currentSkinLabel.style.textShadow = `0 0 40px ${rarityColors[realRarity] || '#ffd700'}66`;
        
        this.currentPriceLabel.textContent = this.realPrice + ' 🪙';
        this.currentPriceLabel.style.color = '#ffd700';
        this.currentPriceLabel.style.fontSize = '22px';
        
        const flash = document.createElement('div');
        flash.style.cssText = `
            position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
            width:300px;height:300px;border-radius:50%;
            background:radial-gradient(circle, ${flashColor}88, transparent 70%);
            z-index:20;opacity:0;
            transition:all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            pointer-events:none;
        `;
        this.overlay.appendChild(flash);
        
        setTimeout(() => {
            flash.style.opacity = '1';
            flash.style.width = '800px';
            flash.style.height = '800px';
        }, 50);
        
        this.indicator.style.transition = 'opacity 0.5s ease';
        this.indicator.style.opacity = '0';
        this.resultFrame.style.transition = 'opacity 0.5s ease';
        this.resultFrame.style.opacity = '0';
        
        setTimeout(() => {
            this.overlay.style.transition = 'opacity 0.5s ease';
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                this.overlay.remove();
                if (this.callback) this.callback(this.realItem, this.realPrice);
            }, 500);
        }, 1500);
    }
}

// ============ АНИМАЦИЯ КОЛЕСА ============

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
        this.startTime = Date.now();
        this.duration = 4000;
        this.createUI();
        this.startSpin();
    }
    
    createUI() {
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.95);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;';
        
        const title = document.createElement('div');
        title.style.cssText = 'color:#ffd700;font-size:22px;font-weight:700;margin-bottom:20px;letter-spacing:3px;text-shadow:0 0 20px rgba(255,215,0,0.3);';
        title.textContent = '🎡 КОЛЕСО ФОРТУНЫ';
        this.overlay.appendChild(title);
        
        this.container = document.createElement('div');
        this.container.style.cssText = 'width:85%;max-width:450px;height:90px;position:relative;overflow:hidden;margin-bottom:15px;background:rgba(255,215,0,0.03);border-radius:12px;border:1px solid rgba(255,215,0,0.08);';
        this.overlay.appendChild(this.container);
        
        this.resultFrame = document.createElement('div');
        this.resultFrame.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:140px;height:80%;border:2px solid #ffd700;border-radius:8px;z-index:5;box-shadow:0 0 30px rgba(255,215,0,0.3);background:rgba(255,215,0,0.05);';
        this.container.appendChild(this.resultFrame);
        
        this.indicator = document.createElement('div');
        this.indicator.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:2px;height:70%;background:#ffd700;z-index:6;border-radius:2px;';
        this.container.appendChild(this.indicator);
        
        this.prizesLayer = document.createElement('div');
        this.prizesLayer.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;justify-content:center;transition:filter 0.05s;';
        this.container.appendChild(this.prizesLayer);
        
        this.currentPrizeLabel = document.createElement('div');
        this.currentPrizeLabel.style.cssText = 'color:#ffffff;font-size:28px;font-weight:700;text-align:center;min-height:36px;transition:opacity 0.05s;text-shadow:0 0 30px rgba(255,215,0,0.2);margin-top:10px;';
        this.overlay.appendChild(this.currentPrizeLabel);
        
        this.prizeElements = [];
        for (let i = 0; i < 7; i++) {
            const el = document.createElement('div');
            el.style.cssText = 'position:absolute;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.7);font-size:16px;font-weight:500;white-space:nowrap;opacity:0.3;transition:all 0.05s;';
            this.prizesLayer.appendChild(el);
            this.prizeElements.push(el);
        }
        
        document.body.appendChild(this.overlay);
    }
    
    startSpin() { this.nextPrize(); }
    
    getSpeed(progress) {
        if (progress < 0.15) return 0.6 + (progress / 0.15) * 0.4;
        if (progress < 0.7) return 1.0;
        const t = (progress - 0.7) / 0.3;
        const bounce = 1 + 0.3 * Math.exp(-5 * t) * Math.cos(10 * t);
        return Math.max(0.05, bounce * (1 - t * 0.95));
    }
    
    nextPrize() {
        if (!this.isSpinning) return;
        
        const elapsed = Date.now() - this.startTime;
        const progress = Math.min(elapsed / this.duration, 1);
        
        const speedFactor = this.getSpeed(progress);
        const baseSpeed = 65;
        const currentSpeed = baseSpeed / Math.max(speedFactor, 0.05);
        
        this.prizesLayer.style.filter = `blur(${Math.min(12, speedFactor * 8)}px)`;
        
        this.currentPrizeLabel.style.transition = 'opacity 0.05s';
        this.currentPrizeLabel.style.opacity = '0';
        
        setTimeout(() => {
            const name = this.prizes[this.currentIndex % this.prizes.length][0];
            this.currentPrizeLabel.textContent = name;
            this.currentPrizeLabel.style.opacity = '1';
        }, 20);
        
        for (let i = 0; i < this.prizeElements.length; i++) {
            const el = this.prizeElements[i];
            const idx = (this.currentIndex + i) % this.prizes.length;
            el.textContent = this.prizes[idx][0];
            const positions = [-65, -40, -18, 0, 18, 40, 65];
            const pos = positions[i];
            el.style.left = (50 + pos) + '%';
            el.style.transform = `translate(-50%, -50%) scale(${1 - Math.abs(pos) / 120})`;
            el.style.opacity = 0.15 + (1 - Math.abs(pos) / 70) * 0.7;
            el.style.filter = Math.abs(pos) > 50 ? 'blur(4px)' : 'blur(0px)';
        }
        
        this.currentIndex++;
        
        if (progress >= 1) {
            this.isSpinning = false;
            setTimeout(() => this.finish(), 300);
            return;
        }
        
        setTimeout(() => this.nextPrize(), currentSpeed);
    }
    
    finish() {
        this.prizesLayer.style.filter = 'blur(0px)';
        
        this.resultFrame.style.borderColor = '#ffd700';
        this.resultFrame.style.boxShadow = '0 0 60px #ffd70088, 0 0 120px #ffd70044';
        
        let displayName = this.realPrize.name || this.realPrize;
        if (typeof this.realPrize === 'string') displayName = this.realPrize;
        if (this.realPrize.type === 'coins') displayName = `${this.realPrize.value} 🪙`;
        if (this.realPrize.type === 'discount') displayName = `${this.realPrize.value}% скидка`;
        
        this.currentPrizeLabel.style.transition = 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)';
        this.currentPrizeLabel.textContent = displayName;
        this.currentPrizeLabel.style.color = '#ffd700';
        this.currentPrizeLabel.style.fontSize = '40px';
        this.currentPrizeLabel.style.textShadow = '0 0 60px rgba(255,215,0,0.5)';
        
        const flash = document.createElement('div');
        flash.style.cssText = `
            position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
            width:300px;height:300px;border-radius:50%;
            background:radial-gradient(circle, #ffd70088, transparent 70%);
            z-index:20;opacity:0;
            transition:all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            pointer-events:none;
        `;
        this.overlay.appendChild(flash);
        
        setTimeout(() => {
            flash.style.opacity = '1';
            flash.style.width = '800px';
            flash.style.height = '800px';
        }, 50);
        
        this.indicator.style.transition = 'opacity 0.5s ease';
        this.indicator.style.opacity = '0';
        this.resultFrame.style.transition = 'opacity 0.5s ease';
        this.resultFrame.style.opacity = '0';
        
        setTimeout(() => {
            this.overlay.style.transition = 'opacity 0.5s ease';
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                this.overlay.remove();
                if (this.callback) this.callback(this.realPrize);
            }, 500);
        }, 1500);
    }
}

// ============ АНИМАЦИЯ АПГРЕЙДА ============

class UpgradeAnimation {
    constructor(success, callback) {
        this.success = success;
        this.callback = callback;
        this.createUI();
    }
    
    createUI() {
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.92);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;';
        
        const title = document.createElement('div');
        title.style.cssText = 'color:#6a7a8e;font-size:18px;font-weight:600;margin-bottom:20px;letter-spacing:2px;';
        title.textContent = '⬆️ АПГРЕЙД';
        this.overlay.appendChild(title);
        
        this.resultLabel = document.createElement('div');
        this.resultLabel.style.cssText = 'font-size:100px;font-weight:900;text-align:center;transition:all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);text-shadow:0 0 60px rgba(255,215,0,0.3);';
        this.resultLabel.textContent = this.success ? 'UP' : 'LOSE';
        this.overlay.appendChild(this.resultLabel);
        
        this.statusLabel = document.createElement('div');
        this.statusLabel.style.cssText = 'color:#ffffff;font-size:24px;font-weight:600;text-align:center;margin-top:15px;transition:all 0.5s ease;';
        this.statusLabel.textContent = this.success ? '✅ УСПЕШНО!' : '💔 НЕ УДАЛОСЬ';
        this.overlay.appendChild(this.statusLabel);
        
        document.body.appendChild(this.overlay);
        
        setTimeout(() => {
            this.resultLabel.style.transform = 'scale(1.5)';
            this.resultLabel.style.color = this.success ? '#ffd700' : '#ff4444';
            this.resultLabel.style.textShadow = this.success ? 
                '0 0 100px rgba(255,215,0,0.5)' : '0 0 100px rgba(255,68,68,0.5)';
            this.statusLabel.style.color = this.success ? '#ffd700' : '#ff4444';
        }, 300);
        
        setTimeout(() => {
            this.overlay.style.transition = 'opacity 0.5s ease';
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                this.overlay.remove();
                if (this.callback) this.callback();
            }, 500);
        }, 2000);
    }
}

// ============ ОСТАЛЬНЫЕ ФУНКЦИИ (КЕЙСЫ, ИНВЕНТАРЬ, ПРОФИЛЬ, КОЛЕСО, ТОП, ДРУЗЬЯ, АЧИВКИ, АПГРЕЙД, АДМИН) ============

// КЕЙСЫ
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
                const realItem = data.item;
                const realPrice = data.price;
                
                const anim = new CaseAnimation(caseName, realItem, realPrice, (item, price) => {
                    showModal('🎉 УСПЕХ!', `
                        <div style="text-align:center;padding:10px 0;">
                            <div style="font-size:40px;margin:10px 0;">🎉</div>
                            <div style="font-size:20px;font-weight:700;color:#ffd700;">ВЫПАЛО!</div>
                            <div style="font-size:18px;font-weight:600;padding:8px 0;">${item}</div>
                            <div style="font-size:16px;color:#ffd700;">${price} 🪙</div>
                            <div style="display:flex;flex-direction:column;gap:8px;margin-top:16px;">
                                <button class="case-btn" onclick="closeModal();openCase('${caseName}',${price})" style="background:rgba(255,215,0,0.15);">🔄 ЕЩЁ</button>
                                <button class="case-btn primary" onclick="closeModal();loadInventory();loadBalance();">✅ В ИНВЕНТАРЬ</button>
                                <button class="case-btn" onclick="sellItemFromResult('${item}', ${price})" style="background:#ffd700;color:#0a0a0a;">💰 ПРОДАТЬ СРАЗУ</button>
                            </div>
                        </div>
                    `);
                    loadBalance();
                    if (tutorialActive && tutorialCaseOpened) {
                        tutorialStep = 2;
                        setTimeout(showTutorialStep, 500);
                    }
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

// ИНВЕНТАРЬ
function loadInventory() {
    const list = document.getElementById('inventoryList');
    if (!list) return;
    list.innerHTML = '<div class="loading">⏳ Загрузка...</div>';
    selectedItems.clear();
    selectMode = false;
    
    const sellSelectedBtn = document.getElementById('sellSelectedBtn');
    if (sellSelectedBtn) sellSelectedBtn.style.display = 'none';
    
    fetch(`/api/miniapp_inventory?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.items && data.items.length > 0) {
            let html = '';
            let total = 0;
            
            html += `
                <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:12px;">
                    <button class="case-btn" onclick="toggleSelectMode()" id="selectModeBtn" style="flex:1;min-width:80px;padding:10px;margin:0;background:rgba(255,215,0,0.1);">✅ ВЫБРАТЬ</button>
                    <button class="case-btn primary" onclick="sellSelected()" id="sellSelectedBtn" style="flex:1;min-width:80px;padding:10px;margin:0;display:none;">💰 ПРОДАТЬ ВЫБРАННЫЕ</button>
                    <button class="case-btn" onclick="sellAll()" style="flex:1;min-width:80px;padding:10px;margin:0;background:rgba(255,215,0,0.1);">💰 ПРОДАТЬ ВСЁ</button>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding-bottom:10px;" id="inventoryGrid">
            `;
            
            data.items.forEach(item => {
                const isPending = item.withdraw_status === 'pending';
                const isSelected = selectedItems.has(item.id);
                total += item.price;
                
                html += `
                    <div class="inventory-item" style="border-color:${isPending ? '#ff6b6b' : isSelected ? '#ffd700' : 'rgba(255,215,0,0.06)'};flex-direction:column;align-items:stretch;padding:10px;position:relative;">
                        ${!isPending ? `
                            <div style="position:absolute;top:6px;left:6px;">
                                <input type="checkbox" class="item-checkbox" data-id="${item.id}" style="width:18px;height:18px;accent-color:#ffd700;display:none;cursor:pointer;">
                            </div>
                        ` : ''}
                        <div style="font-size:13px;font-weight:500;color:#e0e0e0;padding-right:20px;">${item.name}</div>
                        <div style="font-size:12px;color:#ffd700;font-weight:600;">${item.price} 🪙</div>
                        ${isPending ? '<div style="font-size:10px;color:#ff6b6b;">⏳ Вывод (24ч)</div>' : ''}
                        <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap;">
                            ${!isPending ? `<button class="btn-sell" onclick="sellItem(${item.id}, ${item.price})" style="flex:1;padding:4px 8px;font-size:11px;">${t('sell')}</button>` : ''}
                            ${!isPending ? `<button class="btn-withdraw" onclick="withdrawItem(${item.id}, '${item.name}', ${item.price})" style="flex:1;padding:4px 8px;font-size:11px;">${t('withdraw')}</button>` : ''}
                            ${isPending ? '<button class="btn-withdraw" style="opacity:0.5;cursor:not-allowed;flex:1;padding:4px 8px;font-size:11px;">⏳</button>' : ''}
                        </div>
                    </div>
                `;
            });
            
            html += `</div>`;
            list.innerHTML = html;
            
            if (data.items.length > 0 && !selectMode) {
                document.querySelectorAll('.item-checkbox').forEach(el => el.style.display = 'none');
            }
            
            updateCheckboxes();
            
            if (tutorialActive && tutorialStep === 3) {
                setTimeout(() => {
                    tutorialStep = 4;
                    showTutorialStep();
                }, 1000);
            }
            
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
            el.style.borderColor = 'rgba(255,215,0,0.06)';
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
                this.closest('.inventory-item').style.borderColor = '#ffd700';
            } else {
                selectedItems.delete(id);
                this.closest('.inventory-item').style.borderColor = 'rgba(255,215,0,0.06)';
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
            if (tutorialActive && tutorialStep === 4) {
                tutorialStep = 5;
                setTimeout(showTutorialStep, 500);
            }
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

// ВЫВОД
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
                <div style="font-size:18px;font-weight:600;color:#ffd700;">${name}</div>
                <div style="color:#6a7a8e;font-size:14px;padding:8px 0;">${price} 🪙</div>
                <div style="color:#ff4444;font-size:16px;font-weight:700;padding:12px 0;background:rgba(255,0,0,0.1);border-radius:8px;border:1px solid rgba(255,0,0,0.2);">⚠️ ДЛЯ ВЫВОДА ОБЯЗАТЕЛЬНО НАПИШИ В ПОДДЕРЖКУ СО СКРИНОМ ДАННОГО ОКНА</div>
                <div style="color:#6a7a8e;font-size:13px;padding:8px 0;">Введите Steam Trade Link</div>
                <input type="text" id="tradeLinkInput" placeholder="Steam Trade Link" style="width:100%;padding:12px;border:2px solid #ffd700;border-radius:12px;font-size:14px;margin:10px 0;background:rgba(0,0,0,0.3);color:#fff;">
                <button class="case-btn primary" onclick="sendWithdrawRequest(${itemId}, '${name}', ${price})">📤 ОТПРАВИТЬ</button>
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
            showToast('✅ Заявка на вывод создана! У вас 24 часа для подтверждения.', 'success', 8000);
            showModal('✅ ЗАЯВКА ОТПРАВЛЕНА!', `
                <div style="text-align:center;">
                    <div style="font-size:20px;font-weight:700;color:#ffd700;">✅ Заявка создана!</div>
                    <div style="color:#6a7a8e;font-size:14px;padding:8px 0;">У вас есть 24 часа для подтверждения.<br><br><strong>Не забудьте заскринить этот таймер!</strong></div>
                    <div style="background:rgba(0,0,0,0.3);padding:12px;border-radius:12px;margin:10px 0;border:1px solid #ffd700;">⏱️ <span id="withdrawTimer">24:00:00</span></div>
                    <div style="color:#ff4444;font-size:14px;font-weight:700;padding:8px 0;">📌 ДЛЯ ВЫВОДА ОБЯЗАТЕЛЬНО НАПИШИ В ПОДДЕРЖКУ СО СКРИНОМ ЭТОГО ОКНА</div>
                    <div style="color:#6a7a8e;font-size:14px;padding:8px 0;">Предмет: ${name} (${price} 🪙)</div>
                    <button class="case-btn primary" onclick="contactAdmin('${name}', ${price})">📩 ${t('contact_admin')}</button>
                    <button class="case-btn" onclick="closeModal();loadInventory();loadBalance();">✅ ОК</button>
                </div>
            `);
            startWithdrawTimer(24 * 60 * 60);
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
        const hours = Math.floor(remaining / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const secs = remaining % 60;
        timerElement.textContent = `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
        remaining--;
        if (remaining < 0) {
            clearInterval(interval);
            timerElement.textContent = '⏰ ВРЕМЯ ВЫШЛО';
        }
    }, 1000);
}

function contactAdmin(itemName, itemPrice) {
    window.open('https://t.me/ArtCSbotSupp', '_blank');
    closeModal();
}

function checkWithdrawStatus() {
    fetch(`/api/withdraw_check?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.active && data.active.length > 0) {
            console.log('Active withdraws:', data.active);
        }
    })
    .catch(() => {});
}

// ПРОФИЛЬ
function loadProfile() {
    const content = document.getElementById('profileContent');
    if (!content) return;
    content.innerHTML = '<div class="loading">⏳ Загрузка...</div>';
    if (!userId) {
        content.innerHTML = '<div style="text-align:center;color:#ff4444;">Пожалуйста, войдите</div>';
        return;
    }
    fetch(`/api/miniapp_profile?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            content.innerHTML = `<div style="text-align:center;color:#ff4444;">Ошибка: ${data.error}</div>`;
            return;
        }
        const isAdminUser = data.is_admin || false;
        const isFrozen = data.is_frozen || 0;
        const isPrime = data.is_prime || false;
        const primeBadge = isPrime ? '👑 ' : '';
        
        content.innerHTML = `
            <div style="text-align:center;font-size:32px;font-weight:700;color:#ffd700;padding:8px 0;">${primeBadge}${data.username || username} ${isAdminUser ? '✅ 👑' : ''}</div>
            <div style="text-align:center;font-size:14px;color:#6a7a8e;padding:4px 0;">${isPrime ? '👑 Прайм-подписка активна' : ''}</div>
            <div style="text-align:center;font-size:14px;color:#6a7a8e;padding:4px 0;">${isAdminUser ? '⭐ Подтверждённый аккаунт' : ''}</div>
            <div style="text-align:center;font-size:16px;color:#ff4444;padding:4px 0;font-weight:700;">${isFrozen ? '❄️ АККАУНТ ЗАМОРОЖЕН' : ''}</div>
            <div class="profile-field"><span class="label">🆔 Telegram ID</span><span class="value">${userId}</span></div>
            <div style="text-align:center;font-size:24px;font-weight:700;color:#ffd700;padding:4px 0;">${data.coins || 0} 🪙</div>
            <div class="profile-field"><span class="label">⭐ Уровень</span><span class="value">${data.level || 1}</span></div>
            <div class="profile-field"><span class="label">📊 Опыт</span><span class="value">${data.exp || 0}/${(data.level || 1) * 1000}</span></div>
            <div class="profile-field"><span class="label">🏆 Побед</span><span class="value">${data.wins || 0}</span></div>
            <div class="profile-field"><span class="label">💔 Поражений</span><span class="value">${data.losses || 0}</span></div>
            <div class="profile-field"><span class="label">👥 Рефералов</span><span class="value">${data.referrals || 0}</span></div>
            <div class="profile-field"><span class="label">💰 Депозит</span><span class="value">${data.total_deposit || 0} RUB</span></div>
            <div class="profile-field"><span class="label">📅 Стрик</span><span class="value">${data.daily_streak || 0} дней</span></div>
            <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">
                <button class="case-btn" onclick="showDeposit()">💳 ПОПОЛНИТЬ</button>
                <button class="case-btn" onclick="showReferral()">🔗 РЕФЕРАЛЬНАЯ ССЫЛКА</button>
                <button class="case-btn" onclick="showSupport()">🆘 ПОДДЕРЖКА</button>
                <button class="case-btn" onclick="subscribePrime()" style="border-color:#ffd700;">👑 ПРАЙМ-ПОДПИСКА</button>
                <button class="case-btn" onclick="showLanguageSettings()">🌐 ЯЗЫК</button>
                <button class="case-btn" onclick="showTerms()">📜 ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ</button>
                <button class="case-btn" onclick="logout()">🚪 ВЫХОД</button>
            </div>
        `;
        if (isAdminUser) {
            const adminPanel = document.getElementById('adminPanel');
            if (adminPanel) adminPanel.style.display = 'block';
        }
        if (tutorialActive && tutorialStep === 5) {
            tutorialStep = 6;
            setTimeout(showTutorialStep, 1000);
        }
    })
    .catch(err => {
        console.error('Profile error:', err);
        content.innerHTML = '<div style="text-align:center;color:#ff4444;">❌ Ошибка соединения</div>';
    });
}

function showTerms() {
    showModal('📜 ПОЛЬЗОВАТЕЛЬСКОЕ СОГЛАШЕНИЕ', `
        <div style="max-height:400px;overflow-y:auto;padding:10px 0;font-size:13px;color:#c0c0c0;line-height:1.8;text-align:left;">
            ${TERMS_TEXT}
        </div>
        <button class="case-btn primary" onclick="closeModal()" style="margin-top:10px;">✅ ЗАКРЫТЬ</button>
    `);
}

// ЯЗЫК
function showLanguageSettings() {
    showModal('🌐 ЯЗЫК / TIL', `
        <div style="display:flex;flex-direction:column;gap:10px;padding:10px 0;">
            <button class="case-btn primary" onclick="setLanguage('ru')">🇷🇺 Русский</button>
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
            <div style="color:#ffd700;padding:8px 0;">💱 Курс: 25000 🪙 = 115 RUB</div>
            <div style="color:#6a7a8e;font-size:14px;">📌 После перевода отправьте чек в поддержку</div>
            <button class="case-btn primary" onclick="closeModal()">✅ ОК</button>
        </div>
    `);
}

function showReferral() {
    const link = `https://artappreb.onrender.com?ref=${userId}`;
    showModal('🔗 РЕФЕРАЛЬНАЯ ССЫЛКА', `
        <div style="text-align:center;">
            <div style="word-break:break-all;font-size:14px;padding:8px;background:rgba(0,0,0,0.3);border-radius:8px;border:1px solid #ffd700;">${link}</div>
            <div style="color:#6a7a8e;font-size:12px;padding:4px 0;">💰 Пригласивший: +5000 🪙</div>
            <div style="color:#6a7a8e;font-size:12px;padding:4px 0;">💰 Новый игрок: +3000 🪙 (сверх стартовых 500)</div>
            <button class="case-btn primary" onclick="copyText('${link}')">📋 КОПИРОВАТЬ</button>
            <button class="case-btn" onclick="closeModal()">❌ ЗАКРЫТЬ</button>
        </div>
    `);
}

function showSupport() {
    showModal('🆘 ПОДДЕРЖКА', `
        <div style="text-align:center;">
            <div style="padding:8px 0;">📩 Контакты: @ArtCSbotSupp</div>
            <button class="case-btn primary" onclick="window.open('https://t.me/ArtCSbotSupp','_blank')">📩 НАПИСАТЬ</button>
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

// КОЛЕСО
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
            const realPrize = data.result;
            
            new WheelAnimation(realPrize, (result) => {
                let msg = '';
                if (result.type === 'coins') msg = `🎉 Вы выиграли ${result.value} 🪙!`;
                else if (result.type === 'discount') msg = `🎉 Вы выиграли ${result.value}% скидку!`;
                showToast(msg, 'success', 8000);
                showModal('🎡 КОЛЕСО', `<div style="text-align:center;font-size:24px;color:#ffd700;">${msg}</div>`);
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

// ТОП
function loadTopPlayers() {
    const list = document.getElementById('topList');
    const userPlace = document.getElementById('userPlace');
    if (!list) return;
    
    list.innerHTML = '<div class="loading">⏳ Загрузка...</div>';
    
    fetch(`/api/top_players?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        let html = '';
        
        if (data.top && data.top.length > 0) {
            data.top.forEach((p, index) => {
                const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index+1}.`;
                const isYou = p.id == userId;
                html += `
                    <div class="inventory-item" style="${isYou ? 'border-color:#ffd700;background:rgba(255,215,0,0.05);' : ''}">
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
                <div style="font-weight:700;color:#ffd700;padding:8px 0;">📍 ТВОЁ МЕСТО: #${u.place}</div>
                <div class="inventory-item" style="border-color:#ffd700;background:rgba(255,215,0,0.05);">
                    <span><strong>${u.username}</strong></span>
                    <span>🪙 ${u.coins}</span>
                    <span>👥 ${u.referrals}</span>
                    <span>📦 ${u.items}</span>
                    <span>💳 ${u.deposit} RUB</span>
                </div>
            `;
        } else if (data.user) {
            userPlace.innerHTML = `<div style="text-align:center;color:#6a7a8e;padding:8px 0;">⚠️ Ты ещё не в рейтинге</div>`;
        } else {
            userPlace.innerHTML = `<div style="text-align:center;color:#6a7a8e;padding:8px 0;">⚠️ Ты ещё не в рейтинге</div>`;
        }
    })
    .catch(() => {
        list.innerHTML = '<div style="text-align:center;color:#ff4444;padding:30px 0;">❌ Ошибка загрузки</div>';
    });
}

// ДРУЗЬЯ
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
                                `<button class="btn-sell" onclick="sendFriendRequest(${u.id})">➕</button>` : ''}
                            ${u.request_sent ? '<span style="color:#ffd700;">⏳ Отправлено</span>' : ''}
                            ${u.request_received ? `<button class="btn-sell" onclick="acceptFriendRequest(${u.id})">✅ Принять</button>` : ''}
                            ${u.is_friend ? `<button class="btn-withdraw" onclick="removeFriend(${u.id})" style="border-color:#ff4444;color:#ff4444;">❌</button>` : ''}
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
            showToast(`✅ ${data.username || 'Пользователь'} теперь в друзьях!`, 'success', 5000);
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
                        <button class="btn-withdraw" onclick="window.open('tg://resolve?domain=${f.username}','_blank')" style="border-color:#ffd700;">💬</button>
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
                            <button class="btn-sell" onclick="acceptFriendRequest(${r.id})">✅</button>
                            <button class="btn-withdraw" onclick="rejectFriendRequest(${r.id})" style="border-color:#ff4444;color:#ff4444;">❌</button>
                        </div>
                    </div>
                `;
            });
            requestsList.innerHTML = html;
        } else {
            requestsList.innerHTML = '<div style="color:#6a7a8e;padding:8px 0;">📩 Нет заявок</div>';
        }
        if (tutorialActive && tutorialStep === 6) {
            tutorialStep = 7;
            setTimeout(showTutorialStep, 500);
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
            let html = '<div style="font-weight:700;color:#ffd700;padding:8px 0;">📦 ИНВЕНТАРЬ ДРУГА:</div>';
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

// АЧИВКИ
function loadAchievements() {
    const list = document.getElementById('achievementsList');
    if (!list) return;
    list.innerHTML = '<div class="loading">⏳ Загрузка...</div>';
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
                            <span style="color:#ffd700;">+${ach.reward} 🪙</span>
                        </div>
                        <div style="font-size:12px;color:#6a7a8e;">${ach.description}</div>
                        <div style="background:rgba(255,255,255,0.05);border-radius:8px;height:6px;overflow:hidden;">
                            <div style="background:${ach.done ? '#ffd700' : 'rgba(255,215,0,0.3)'};width:${percent}%;height:100%;border-radius:8px;transition:width 0.5s;"></div>
                        </div>
                        <div style="display:flex;justify-content:space-between;align-items:center;">
                            <div style="font-size:11px;color:#6a7a8e;">${progress}/${target}</div>
                            ${ach.done && !isClaimed ? `<button class="btn-sell" onclick="claimAchievement(${ach.id})">💰 ПОЛУЧИТЬ</button>` : ''}
                            ${isClaimed ? '<span style="color:#6a7a8e;font-size:11px;">✅ Получено</span>' : ''}
                        </div>
                    </div>
                `;
            });
            // Кнопка "Получить все"
            const hasUnclaimed = data.achievements.some(a => a.done && !a.claimed);
            if (hasUnclaimed) {
                html = `
                    <button class="case-btn primary" onclick="claimAllAchievements()" style="margin-bottom:12px;">🎁 ПОЛУЧИТЬ ВСЕ</button>
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
            <input type="text" id="promoInput" placeholder="Введите код" style="width:100%;padding:12px;border:2px solid #ffd700;border-radius:12px;font-size:16px;margin:10px 0;background:rgba(0,0,0,0.3);color:#fff;">
            <button class="case-btn primary" onclick="activatePromo()">🎫 АКТИВИРОВАТЬ</button>
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
    
    let html = '<div style="font-weight:700;color:#ffd700;padding:8px 0;">📦 ВЫБЕРИ ПРЕДМЕТ:</div>';
    upgradeItems.forEach(item => {
        html += `
            <div class="inventory-item" onclick="setSource(${item.id}, '${item.name}', ${item.price})">
                <span>${item.name}</span>
                <span style="color:#ffd700;">${item.price} 🪙</span>
            </div>
        `;
    });
    html += `<button class="case-btn" onclick="closeModal()">❌ ОТМЕНА</button>`;
    
    showModal('⬇️ ВХОД', html);
}

function setSource(id, name, price) {
    selectedSource = {id, name, price};
    closeModal();
    
    const slot = document.getElementById('sourceSlot');
    slot.innerHTML = `
        <div class="item-name">${name}</div>
        <div class="item-price">${price} 🪙</div>
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
    
    let html = '<div style="font-weight:700;color:#ffd700;padding:8px 0;">🎯 ВЫБЕРИ ЦЕЛЬ:</div>';
    targets.slice(0, 20).forEach(target => {
        const diff = target.price - selectedSource.price;
        const chance = Math.max(5, 95 - (diff / selectedSource.price) * 50);
        const color = chance > 60 ? '#ffd700' : chance > 30 ? '#ffd700' : '#ff4444';
        html += `
            <div class="inventory-item" onclick="setTarget('${target.name}', ${target.price})">
                <span>${target.name}</span>
                <span style="color:${color};">${target.price} 🪙 (${Math.round(chance)}%)</span>
            </div>
        `;
    });
    html += `<button class="case-btn" onclick="closeModal()">❌ ОТМЕНА</button>`;
    
    showModal('⬆️ ВЫХОД', html);
}

function setTarget(name, price) {
    selectedTarget = {name, price};
    closeModal();
    
    const slot = document.getElementById('targetSlot');
    slot.innerHTML = `
        <div class="item-name">${name}</div>
        <div class="item-price">${price} 🪙</div>
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
            riskEl.style.color = risk === 'ВЫСОКИЙ' ? '#ff4444' : risk === 'СРЕДНИЙ' ? '#ffd700' : '#ffd700';
            
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
            const success = data.upgraded;
            
            new UpgradeAnimation(success, () => {
                if (success) {
                    showToast(`🎉 Апгрейд успешен! +${data.target_name} (${data.target_price} 🪙)`, 'success', 8000);
                    showModal('🎉 АПГРЕЙД УСПЕШЕН!', `
                        <div style="text-align:center;padding:10px 0;">
                            <div style="font-size:48px;margin:10px 0;">🎉</div>
                            <div style="font-size:20px;font-weight:700;color:#ffd700;">${data.target_name}</div>
                            <div style="font-size:16px;color:#ffd700;">+${data.target_price} 🪙</div>
                            <div style="color:#6a7a8e;font-size:14px;">Шанс: ${data.chance}% | Ролл: ${data.roll}%</div>
                            <button class="case-btn primary" onclick="closeModal();loadBalance();loadInventory();loadUpgradeItems();">✅ ОК</button>
                        </div>
                    `);
                } else {
                    showToast(`💔 Апгрейд не удался! Предмет сгорел (-${data.lost_item} 🪙)`, 'error', 6000);
                    showModal('💔 АПГРЕЙД НЕ УДАЛСЯ', `
                        <div style="text-align:center;padding:10px 0;">
                            <div style="font-size:48px;margin:10px 0;">💔</div>
                            <div style="font-size:18px;font-weight:700;color:#ff4444;">Предмет сгорел!</div>
                            <div style="color:#6a7a8e;font-size:14px;">Шанс: ${data.chance}% | Ролл: ${data.roll}%</div>
                            <button class="case-btn primary" onclick="closeModal();loadBalance();loadInventory();loadUpgradeItems();">✅ ОК</button>
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
                <div style="font-size:18px;font-weight:700;color:#ffd700;">ВХОД В АДМИН-ПАНЕЛЬ</div>
                <div style="color:#6a7a8e;font-size:14px;padding:8px 0;">Введите пароль для доступа</div>
                <input type="password" id="adminPasswordInput" placeholder="Введите пароль" 
                    style="width:100%;padding:14px;border:2px solid #ffd700;border-radius:12px;font-size:16px;
                    margin:10px 0;background:rgba(0,0,0,0.3);color:#fff;text-align:center;">
                <button class="case-btn primary" onclick="verifyAdminPassword()">🔓 ВОЙТИ</button>
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
            <button class="case-btn" onclick="adminGivePrime()">💎 Выдать Prime</button>
            <button class="case-btn" onclick="adminRemovePrime()">💎 Забрать Prime</button>
            <button class="case-btn" onclick="adminBan()">🔨 Забанить</button>
            <button class="case-btn" onclick="adminUnban()">🔓 Разбанить</button>
            <button class="case-btn" onclick="adminFreeze()">❄️ Заморозить</button>
            <button class="case-btn" onclick="adminUnfreeze()">🔥 Разморозить</button>
            <button class="case-btn" onclick="adminDeleteUser()">❌ Удалить пользователя</button>
            <button class="case-btn" onclick="adminBroadcast()">📢 Массовая рассылка</button>
            <button class="case-btn" onclick="adminPersonalBroadcast()">📨 Личная рассылка</button>
            <button class="case-btn" onclick="adminTogglePVP()">⚔️ Вкл/Выкл PVP</button>
            <button class="case-btn" onclick="adminToggleWithdraw()">📤 Вкл/Выкл вывод</button>
            <button class="case-btn" onclick="adminToggleWheel()">🎡 Вкл/Выкл колесо</button>
            <button class="case-btn" onclick="adminToggleAchievements()">🏆 Вкл/Выкл ачивки</button>
            <button class="case-btn" onclick="adminToggleQuiz()">📚 Вкл/Выкл викторину</button>
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

// ============ АДМИН-ФУНКЦИИ ============

function adminUsers() {
    fetch('/api/admin/users')
    .then(res => res.json())
    .then(data => {
        let html = '<div style="font-weight:700;color:#ffd700;padding:8px 0;">👥 ИГРОКИ (ID, Имя, Монеты, Уровень):</div>';
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
        let html = '<div style="font-weight:700;color:#ffd700;padding:8px 0;">🔍 РЕЗУЛЬТАТЫ:</div>';
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
            <div style="font-weight:700;color:#ffd700;padding:8px 0;">👤 ПРОФИЛЬ ${data.username} (ID: ${data.id}):</div>
            <div>💰 Монет: ${data.coins}</div><div>⭐ Уровень: ${data.level}</div>
            <div>📊 Опыт: ${data.exp}</div><div>🏆 Побед: ${data.wins}</div>
            <div>💔 Поражений: ${data.losses}</div><div>💳 Депозит: ${data.deposit} RUB</div>
            <div>📤 Выведено: ${data.withdrawn}</div><div>👥 Рефералов: ${data.referred_by}</div>
            <div>🔐 Prime: ${data.prime_expires || 'Нет'}</div>
            <div>🔨 Забанен: ${data.is_banned ? 'Да' : 'Нет'}</div>
            <div>❄️ Заморожен: ${data.is_frozen ? 'Да' : 'Нет'}</div>
            <div style="color:#6a7a8e;font-size:12px;margin-top:8px;">Причина бана: ${data.ban_reason || 'Нет'}</div>
        `;
    });
}

function adminViewInventory() {
    const uid = prompt('Введите ID пользователя:');
    if (!uid) return;
    fetch(`/api/admin/view_inventory/${parseInt(uid)}`)
    .then(res => res.json())
    .then(data => {
        let html = `<div style="font-weight:700;color:#ffd700;padding:8px 0;">📦 ИНВЕНТАРЬ игрока ${uid}:</div>`;
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
        let html = `<div style="font-weight:700;color:#ffd700;padding:8px 0;">📜 ИСТОРИЯ ПОПОЛНЕНИЙ игрока ${uid}:</div>`;
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
        let html = '<div style="font-weight:700;color:#ffd700;padding:8px 0;">🎫 ПРОМОКОДЫ:</div>';
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
        let html = '<div style="font-weight:700;color:#ffd700;padding:8px 0;">📤 ЗАЯВКИ НА ВЫВОД:</div>';
        if (data.requests && data.requests.length > 0) {
            data.requests.slice(0, 20).forEach(r => {
                html += `<div class="inventory-item"><span>${r.username} (ID:${r.user_id})</span><span>${r.item}</span><span>${r.price} 🪙</span></div>`;
            });
        } else {
            html += '<div style="text-align:center;color:#6a7a8e;padding:12px 0;">Нет заявок</div>';
        }
        document.getElementById('adminInfo').innerHTML = html;
    });
}

function adminAcceptWithdraw() {
    const rid = prompt('Введите ID заявки:');
    if (!rid) return;
    if (!confirm('Принять заявку?')) return;
    fetch('/api/admin/accept_withdraw', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({request_id:parseInt(rid)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Принято!' : '❌ Ошибка');
}

function adminRejectWithdraw() {
    const rid = prompt('Введите ID заявки:');
    if (!rid) return;
    if (!confirm('Отклонить заявку?')) return;
    fetch('/api/admin/reject_withdraw', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({request_id:parseInt(rid)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Отклонено!' : '❌ Ошибка');
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
                <div style="color:#ffd700;padding:8px 0;">✅ Рассылка отправлена ${data.count} пользователям!</div>
                <div style="color:#6a7a8e;font-size:13px;padding:4px 0;">Текст: "${msg}"</div>
            `;
            showToast(`📢 Рассылка отправлена ${data.count} пользователям!`, 'success', 5000);
        } else {
            document.getElementById('adminInfo').innerHTML = `<div style="color:#ff4444;">❌ Ошибка: ${data.error || 'Не удалось отправить'}</div>`;
        }
    })
    .catch(() => document.getElementById('adminInfo').innerHTML = '<div style="color:#ff4444;">❌ Ошибка соединения</div>');
}

function adminPersonalBroadcast() { 
    showAdminConfirm('Введите ID игрока', 'Введите текст сообщения', (uid, msg) => {
        if (!msg) return;
        if (!confirm(`Отправить личное сообщение пользователю ${uid}?\n\nТекст: "${msg}"`)) return;
        fetch('/api/admin/personal_broadcast', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({user_id: parseInt(uid), message: msg})
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                document.getElementById('adminInfo').innerHTML = `
                    <div style="color:#ffd700;padding:8px 0;">✅ Личное сообщение отправлено пользователю ${uid}!</div>
                    <div style="color:#6a7a8e;font-size:13px;padding:4px 0;">Текст: "${msg}"</div>
                `;
                showToast(`📨 Личное сообщение отправлено пользователю ${uid}`, 'success', 5000);
            } else {
                document.getElementById('adminInfo').innerHTML = `<div style="color:#ff4444;">❌ Ошибка: ${data.error || 'Не удалось отправить'}</div>`;
            }
        })
        .catch(() => document.getElementById('adminInfo').innerHTML = '<div style="color:#ff4444;">❌ Ошибка соединения</div>');
    });
}

function adminTogglePVP() {
    fetch('/api/admin/toggle_pvp', {method:'POST'})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? `✅ PVP ${data.enabled ? 'включён' : 'выключен'}` : '❌ Ошибка');
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

function adminToggleQuiz() {
    fetch('/api/admin/toggle_quiz', {method:'POST'})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? `✅ Викторина ${data.enabled ? 'включена' : 'выключена'}` : '❌ Ошибка');
}

function adminToggleReferrals() {
    fetch('/api/admin/toggle_referrals', {method:'POST'})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? `✅ Рефералы ${data.enabled ? 'включены' : 'выключены'}` : '❌ Ошибка');
}

function adminActiveUsers() {
    fetch('/api/admin/active_users')
    .then(res => res.json())
    .then(data => {
        let html = '<div style="font-weight:700;color:#ffd700;padding:8px 0;">🟢 АКТИВНЫЕ ИГРОКИ (10 мин):</div>';
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
        let html = '<div style="font-weight:700;color:#ffd700;padding:8px 0;">💰 ТОП МОНЕТ:</div>';
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
        let html = '<div style="font-weight:700;color:#ffd700;padding:8px 0;">⭐ ТОП УРОВНЕЙ:</div>';
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
            <div style="font-weight:700;color:#ffd700;padding:8px 0;">📊 СТАТИСТИКА:</div>
            <div>👥 Игроков: ${data.total_users}</div>
            <div>💰 Всего монет: ${data.total_coins}</div>
            <div>📦 Предметов: ${data.total_items}</div>
            <div>💳 Депозитов: ${data.total_deposit} RUB</div>
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
