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
    {name: 'draft', label: '📦 DRAFT (7000)', price: 7000}
];
let tg = window.Telegram ? window.Telegram.WebApp : null;
let dailyRewardClaimed = false;
let dailyRewardDay = 0;
let termsTimer = 10;
let termsInterval = null;
let selectedSource = null;
let selectedTarget = null;
let upgradeItems = [];
let isFirstLaunch = false;

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
⚠️ НАРУШЕНИЕ ЛЮБОГО ПУНКТА ВЛЕЧЁТ ЗА СОБОЙ ОТВЕТСТВЕННОСТЬ, ВПЛОТЬ ДО УДАЛЕНИЯ АКАУНТА.
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
    
    localStorage.setItem('terms_accepted', 'true');
    const termsScreen = document.getElementById('terms-screen');
    const mainScreen = document.getElementById('main-screen');
    if (termsScreen) termsScreen.style.display = 'none';
    if (mainScreen) {
        mainScreen.style.display = 'block';
        mainScreen.classList.add('active');
    }
    
    if (termsInterval) clearInterval(termsInterval);
}

// ============ ИНИЦИАЛИЗАЦИЯ ============
document.addEventListener('DOMContentLoaded', function() {
    const termsContent = document.getElementById('termsContent');
    if (termsContent) termsContent.innerHTML = TERMS_TEXT;
    
    const accepted = localStorage.getItem('terms_accepted');
    const termsScreen = document.getElementById('terms-screen');
    const mainScreen = document.getElementById('main-screen');
    
    if (accepted) {
        if (termsScreen) termsScreen.style.display = 'none';
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
    
    fetch('/api/miniapp_login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: uid, username: uname})
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
            
            // === ЗАПУСКАЕМ ОБУЧЕНИЕ ===
            setTimeout(() => startOnboarding(), 1500);
            
            // Обновляем онлайн-статус каждые 30 секунд
            setInterval(updateOnlineStatus, 30000);
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
        
        const colors = ['#00d4ff', '#ff6b6b', '#ffd700', '#6bff6b', '#ff6bff', '#6b6bff', '#ff8844', '#44ff88'];
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
        avatarImg.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%2300d4ff"/%3E%3Ctext x="50" y="50" font-size="40" text-anchor="middle" dominant-baseline="central" fill="white" font-family="Arial"%3E👤%3C/text%3E%3C/svg%3E';
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

function loadBalance() {
    if (!userId) {
        console.error('No userId for balance');
        return;
    }
    
    fetch(`/api/miniapp_profile?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        console.log('Balance data:', data);
        const coins = data.coins || 0;
        const isFrozen = data.is_frozen || 0;
        
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

// ============ ОБУЧЕНИЕ (ОНБОРДИНГ) ============

function startOnboarding() {
    const onboarded = localStorage.getItem('artdrop_onboarded');
    if (onboarded === 'true') return;
    
    // Не показываем обучение, если уже есть модалка
    const modal = document.getElementById('modal');
    if (modal && modal.classList.contains('active')) return;
    
    showOnboardingStep(1);
}

function showOnboardingStep(step) {
    const steps = [
        {
            title: '👋 ДОБРО ПОЖАЛОВАТЬ!',
            content: 'Это ArtDrop — лучший кейс-открыватор в Telegram!\n\nЗдесь ты можешь открывать кейсы, получать скины, участвовать в PVP и многое другое!',
            btn: '➡️ ДАЛЕЕ'
        },
        {
            title: '🪙 КАК ЗАРАБОТАТЬ?',
            content: '• Открывай кейсы → получай скины\n• Продавай скины → получай монеты\n• Крути колесо → выигрывай бонусы\n• Забирай ежедневную награду\n• Приглашай друзей → получай бонусы!',
            btn: '➡️ ДАЛЕЕ'
        },
        {
            title: '🎁 КАК ОТКРЫВАТЬ КЕЙСЫ?',
            content: 'Выбери кейс на главном экране, нажми "Открыть" и смотри анимацию!\n\nЧем дороже кейс — тем круче скины могут выпасть!',
            btn: '➡️ ДАЛЕЕ'
        },
        {
            title: '📦 ЧТО ДЕЛАТЬ СО СКИНАМИ?',
            content: '• Продать → получить монеты\n• Вывести → получить скин на аккаунт\n• Апгрейдить → рискнуть и получить более дорогой скин!',
            btn: '➡️ ДАЛЕЕ'
        },
        {
            title: '👥 ДРУЗЬЯ И ТОП',
            content: 'Добавляй друзей, смотри их инвентарь и статус онлайн.\n\nСоревнуйся в ТОПе игроков по монетам, рефералам и предметам!',
            btn: '➡️ ДАЛЕЕ'
        },
        {
            title: '⬆️ АПГРЕЙД',
            content: 'Выбери предмет → выбери цель → смотри шанс!\n\nЕсли повезёт — получишь дорогой скин. Если нет — предмет сгорает. Рискни!',
            btn: '➡️ ДАЛЕЕ'
        },
        {
            title: '🏆 ДОСТИЖЕНИЯ',
            content: 'За выполнение целей ты получаешь награды!\n\n50 достижений ждут тебя — становись легендой ArtDrop!',
            btn: '✅ НАЧАТЬ ИГРУ!'
        }
    ];
    
    const skipBtn = step < steps.length ? 
        `<button class="case-btn" onclick="skipOnboarding()" style="margin-top:8px;background:rgba(255,255,255,0.05);">⏭️ ПРОПУСТИТЬ</button>` : '';
    
    showModal(steps[step-1].title, `
        <div style="text-align:center;padding:10px 0;">
            <div style="font-size:16px;color:#c0c0c0;line-height:1.8;text-align:left;white-space:pre-wrap;padding:8px 0;">${steps[step-1].content}</div>
            <button class="case-btn primary" onclick="nextOnboardingStep(${step})" style="margin-top:8px;">${steps[step-1].btn}</button>
            ${skipBtn}
        </div>
    `);
}

function nextOnboardingStep(step) {
    const totalSteps = 7;
    if (step >= totalSteps) {
        finishOnboarding();
        return;
    }
    closeModal();
    setTimeout(() => showOnboardingStep(step + 1), 300);
}

function skipOnboarding() {
    closeModal();
    finishOnboarding();
}

function finishOnboarding() {
    localStorage.setItem('artdrop_onboarded', 'true');
    showModal('🎉 ГОТОВО!', `
        <div style="text-align:center;padding:10px 0;">
            <div style="font-size:40px;margin:10px 0;">🚀</div>
            <div style="font-size:20px;font-weight:700;color:#00d4ff;">Ты готов к игре!</div>
            <div style="color:#6a7a8e;font-size:14px;padding:8px 0;">Открывай кейсы, собирай скины и становись лучшим!</div>
            <button class="case-btn primary" onclick="closeModal()">✅ НАЧАТЬ!</button>
        </div>
    `);
}

// ============ АНИМАЦИИ КЕЙСОВ (ПЛАВНЫЕ + СИНХРОНИЗАЦИЯ) ============
class CaseAnimation {
    constructor(caseName, realItem, realPrice, callback) {
        this.caseName = caseName;
        this.realItem = realItem;
        this.realPrice = realPrice;
        this.callback = callback;
        this.skins = this.getCaseSkins();
        this.currentIndex = 0;
        this.isSpinning = true;
        this.stopAt = randomInt(18, 35);
        this.resultItem = null;
        this.resultPrice = 0;
        this.maxSpeed = 180;
        this.minSpeed = 60;
        this.currentSpeed = this.maxSpeed;
        this.createUI();
        this.startSpin();
    }
    
    getCaseSkins() {
        return [
            ["P90 | Sand Spray", 180], ["MP9 | Sand Dashed", 177],
            ["SCAR-20 | Zinc", 167], ["SG 553 | Night Camo", 162],
            ["XM1014 | Canvas Cloud", 160], ["Sticker | BLAST.tv", 155],
            ["MP5-SD | Dirt Drop", 192], ["Sticker | The Huns", 192],
            ["G3SG1 | Red Jasper", 185], ["UMP-45 | Facility Dark", 375],
            ["Sticker | FlameZ", 365], ["SCAR-20 | Short Ochre", 330],
            ["Tec-9 | Blue Blast", 215], ["Sticker | apEX", 442],
            ["MP9 | Slide", 440], ["UMP-45 | Mudder", 500],
            ["SCAR-20 | Contractor", 500], ["AUG | Sweeper", 477],
            ["Sticker | FURIA", 472], ["FAMAS | Palm", 115],
            ["Nova | Sand Dune", 577], ["MP9 | Sand Dashed", 577],
            ["UMP-45 | Facility Dark", 542], ["G3SG1 | Desert Storm", 537]
        ];
    }
    
    createUI() {
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.95);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;';
        
        const caseNames = {"bomj":"🥫 КЕЙС БОМЖ","berkut":"🦅 КЕЙС БЕРКУТ","champion":"🏆 КЕЙС ЧЕМПИОН","draft":"📦 КЕЙС DRAFT"};
        const title = document.createElement('div');
        title.style.cssText = 'color:#00d4ff;font-size:22px;font-weight:700;margin-bottom:30px;letter-spacing:3px;text-shadow:0 0 20px rgba(0,212,255,0.3);';
        title.textContent = caseNames[this.caseName] || 'КЕЙС';
        this.overlay.appendChild(title);
        
        this.container = document.createElement('div');
        this.container.style.cssText = 'width:85%;max-width:450px;height:90px;position:relative;overflow:hidden;margin-bottom:15px;background:rgba(0,212,255,0.03);border-radius:12px;border:1px solid rgba(0,212,255,0.08);';
        this.overlay.appendChild(this.container);
        
        this.indicator = document.createElement('div');
        this.indicator.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:3px;height:80%;background:#00d4ff;z-index:10;border-radius:4px;box-shadow:0 0 30px rgba(0,212,255,0.7);';
        this.container.appendChild(this.indicator);
        
        this.skinsLayer = document.createElement('div');
        this.skinsLayer.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;justify-content:center;';
        this.container.appendChild(this.skinsLayer);
        
        this.currentSkinLabel = document.createElement('div');
        this.currentSkinLabel.style.cssText = 'color:#ffffff;font-size:28px;font-weight:700;text-align:center;min-height:40px;transition:all 0.3s ease;text-shadow:0 0 30px rgba(0,212,255,0.2);margin-top:10px;';
        this.overlay.appendChild(this.currentSkinLabel);
        
        this.currentPriceLabel = document.createElement('div');
        this.currentPriceLabel.style.cssText = 'color:#00d4ff;font-size:20px;font-weight:600;text-align:center;min-height:30px;text-shadow:0 0 20px rgba(0,212,255,0.2);';
        this.overlay.appendChild(this.currentPriceLabel);
        
        document.body.appendChild(this.overlay);
        
        this.skinElements = [];
        for (let i = 0; i < 5; i++) {
            const el = document.createElement('div');
            el.style.cssText = 'position:absolute;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.6);font-size:18px;font-weight:500;white-space:nowrap;opacity:0.2;transition:all 0.3s cubic-bezier(0.25,0.1,0.25,1);text-shadow:0 0 10px rgba(0,212,255,0.1);';
            this.skinsLayer.appendChild(el);
            this.skinElements.push(el);
        }
    }
    
    startSpin() { this.nextSkin(); }
    
    nextSkin() {
        if (!this.isSpinning) return;
        
        this.currentSkinLabel.style.transition = 'opacity 0.15s ease';
        this.currentSkinLabel.style.opacity = '0';
        
        setTimeout(() => {
            const name = this.skins[this.currentIndex % this.skins.length][0];
            const price = this.skins[this.currentIndex % this.skins.length][1];
            this.resultItem = name;
            this.resultPrice = price;
            this.currentSkinLabel.textContent = name;
            this.currentPriceLabel.textContent = price + ' 🪙';
            this.currentSkinLabel.style.opacity = '1';
        }, 150);
        
        const progress = Math.min(this.currentIndex / this.stopAt, 1);
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
        this.currentSpeed = this.maxSpeed - (this.maxSpeed - this.minSpeed) * easeOutCubic(progress);
        
        for (let i = 0; i < this.skinElements.length; i++) {
            const el = this.skinElements[i];
            const idx = (this.currentIndex + i) % this.skins.length;
            const skinName = this.skins[idx][0];
            const skinPrice = this.skins[idx][1];
            el.textContent = `${skinName} (${skinPrice}🪙)`;
            const positions = [-55, -28, 0, 28, 55];
            const pos = positions[i];
            el.style.left = (50 + pos) + '%';
            el.style.transform = `translate(-50%, -50%) scale(${1 - Math.abs(pos) / 100})`;
            el.style.opacity = 0.2 + (1 - Math.abs(pos) / 60) * 0.6;
            el.style.filter = Math.abs(pos) > 40 ? 'blur(3px)' : 'blur(0px)';
        }
        this.currentIndex++;
        if (this.currentIndex >= this.stopAt) {
            this.isSpinning = false;
            setTimeout(() => this.finish(), 700);
            return;
        }
        setTimeout(() => this.nextSkin(), this.currentSpeed);
    }
    
    finish() {
        // === ПОДМЕНЯЕМ НА РЕАЛЬНЫЙ РЕЗУЛЬТАТ ===
        this.currentSkinLabel.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        this.currentSkinLabel.textContent = this.realItem;
        this.currentSkinLabel.style.color = '#ffd700';
        this.currentSkinLabel.style.fontSize = '42px';
        this.currentPriceLabel.textContent = this.realPrice + ' 🪙';
        this.currentPriceLabel.style.color = '#ffd700';
        this.currentPriceLabel.style.fontSize = '24px';
        
        this.indicator.style.transition = 'opacity 0.5s ease';
        this.indicator.style.opacity = '0';
        
        setTimeout(() => {
            this.overlay.style.transition = 'opacity 0.4s ease';
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                this.overlay.remove();
                if (this.callback) this.callback(this.realItem, this.realPrice);
            }, 400);
        }, 1200);
    }
}

// ============ АНИМАЦИЯ КОЛЕСА (СИНХРОНИЗАЦИЯ) ============
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
        this.stopAt = randomInt(22, 38);
        this.result = null;
        this.maxSpeed = 160;
        this.minSpeed = 50;
        this.currentSpeed = this.maxSpeed;
        this.createUI();
        this.startSpin();
    }
    
    createUI() {
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.95);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;overflow:hidden;';
        const title = document.createElement('div');
        title.style.cssText = 'color:#00d4ff;font-size:22px;font-weight:700;margin-bottom:30px;letter-spacing:3px;text-shadow:0 0 20px rgba(0,212,255,0.3);';
        title.textContent = '🎡 КОЛЕСО ФОРТУНЫ';
        this.overlay.appendChild(title);
        this.container = document.createElement('div');
        this.container.style.cssText = 'width:85%;max-width:450px;height:90px;position:relative;overflow:hidden;margin-bottom:15px;background:rgba(0,212,255,0.03);border-radius:12px;border:1px solid rgba(0,212,255,0.08);';
        this.overlay.appendChild(this.container);
        this.indicator = document.createElement('div');
        this.indicator.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:3px;height:80%;background:#00d4ff;z-index:10;border-radius:4px;box-shadow:0 0 30px rgba(0,212,255,0.7);';
        this.container.appendChild(this.indicator);
        this.prizesLayer = document.createElement('div');
        this.prizesLayer.style.cssText = 'position:absolute;top:0;left:0;right:0;bottom:0;display:flex;flex-direction:column;justify-content:center;';
        this.container.appendChild(this.prizesLayer);
        this.currentPrizeLabel = document.createElement('div');
        this.currentPrizeLabel.style.cssText = 'color:#ffffff;font-size:32px;font-weight:700;text-align:center;min-height:40px;transition:all 0.3s ease;text-shadow:0 0 30px rgba(0,212,255,0.2);margin-top:10px;';
        this.overlay.appendChild(this.currentPrizeLabel);
        this.prizeElements = [];
        for (let i = 0; i < 5; i++) {
            const el = document.createElement('div');
            el.style.cssText = 'position:absolute;top:50%;transform:translateY(-50%);color:rgba(255,255,255,0.6);font-size:18px;font-weight:500;white-space:nowrap;opacity:0.2;transition:all 0.3s cubic-bezier(0.25,0.1,0.25,1);';
            this.prizesLayer.appendChild(el);
            this.prizeElements.push(el);
        }
        document.body.appendChild(this.overlay);
    }
    
    startSpin() { this.nextPrize(); }
    
    nextPrize() {
        if (!this.isSpinning) return;
        
        this.currentPrizeLabel.style.transition = 'opacity 0.15s ease';
        this.currentPrizeLabel.style.opacity = '0';
        
        setTimeout(() => {
            const name = this.prizes[this.currentIndex % this.prizes.length][0];
            const value = this.prizes[this.currentIndex % this.prizes.length][1];
            const type = this.prizes[this.currentIndex % this.prizes.length][2];
            this.result = {name, value, type};
            this.currentPrizeLabel.textContent = name;
            this.currentPrizeLabel.style.opacity = '1';
        }, 150);
        
        const progress = Math.min(this.currentIndex / this.stopAt, 1);
        const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
        this.currentSpeed = this.maxSpeed - (this.maxSpeed - this.minSpeed) * easeOutCubic(progress);
        
        for (let i = 0; i < this.prizeElements.length; i++) {
            const el = this.prizeElements[i];
            const idx = (this.currentIndex + i) % this.prizes.length;
            const prizeName = this.prizes[idx][0];
            el.textContent = prizeName;
            const positions = [-55, -28, 0, 28, 55];
            const pos = positions[i];
            el.style.left = (50 + pos) + '%';
            el.style.transform = `translate(-50%, -50%) scale(${1 - Math.abs(pos) / 100})`;
            el.style.opacity = 0.2 + (1 - Math.abs(pos) / 60) * 0.6;
            el.style.filter = Math.abs(pos) > 40 ? 'blur(3px)' : 'blur(0px)';
        }
        this.currentIndex++;
        if (this.currentIndex >= this.stopAt) {
            this.isSpinning = false;
            setTimeout(() => this.finish(), 700);
            return;
        }
        setTimeout(() => this.nextPrize(), this.currentSpeed);
    }
    
    finish() {
        // === ПОДМЕНЯЕМ НА РЕАЛЬНЫЙ РЕЗУЛЬТАТ ===
        let displayName = this.realPrize.name || this.realPrize;
        this.currentPrizeLabel.style.transition = 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        this.currentPrizeLabel.textContent = displayName;
        this.currentPrizeLabel.style.color = '#ffd700';
        this.currentPrizeLabel.style.fontSize = '44px';
        
        this.indicator.style.transition = 'opacity 0.5s ease';
        this.indicator.style.opacity = '0';
        
        setTimeout(() => {
            this.overlay.style.transition = 'opacity 0.4s ease';
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                this.overlay.remove();
                if (this.callback) this.callback(this.realPrize);
            }, 400);
        }, 1200);
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
        this.resultLabel.style.cssText = 'font-size:80px;font-weight:900;text-align:center;transition:all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);text-shadow:0 0 60px rgba(0,212,255,0.3);';
        this.resultLabel.textContent = this.success ? '⬆️' : '💔';
        this.overlay.appendChild(this.resultLabel);
        
        this.statusLabel = document.createElement('div');
        this.statusLabel.style.cssText = 'color:#ffffff;font-size:32px;font-weight:700;text-align:center;margin-top:15px;transition:all 0.5s ease;';
        this.statusLabel.textContent = this.success ? 'UP' : 'LOSE';
        this.overlay.appendChild(this.statusLabel);
        
        document.body.appendChild(this.overlay);
        
        // Анимация
        setTimeout(() => {
            this.resultLabel.style.transform = 'scale(1.5)';
            this.resultLabel.style.color = this.success ? '#00d4ff' : '#ff4444';
            this.resultLabel.style.textShadow = this.success ? 
                '0 0 80px rgba(0,212,255,0.5)' : '0 0 80px rgba(255,68,68,0.5)';
            
            this.statusLabel.style.color = this.success ? '#00d4ff' : '#ff4444';
            this.statusLabel.style.fontSize = '48px';
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
            showModal('🎉 НАГРАДА ПОЛУЧЕНА!', `День ${day} — +${reward} 🪙`);
            loadBalance();
            updateDailyButton();
            setTimeout(() => showScreen('main'), 1500);
        } else {
            showModal('❌ ОШИБКА', data.error || 'Не удалось получить награду');
        }
    })
    .catch(() => showModal('❌ ОШИБКА', 'Ошибка соединения'));
}

// ============ ПОДПИСКА НА КАНАЛ ============
function checkSubscription() {
    if (!userId) {
        showModal('Ошибка', 'Пожалуйста, войдите в систему');
        return;
    }
    showModal('📺 ПРОВЕРКА ПОДПИСКИ', `
        <div style="text-align:center;padding:10px 0;">
            <div style="font-size:16px;color:#00d4ff;padding:8px 0;">1. Подпишись на канал: <strong>@ARTCSSKINS</strong></div>
            <button class="case-btn" onclick="window.open('https://t.me/ARTCSSKINS','_blank')" style="margin:10px 0;">📺 ПЕРЕЙТИ В КАНАЛ</button>
            <div style="font-size:14px;color:#6a7a8e;padding:8px 0;">2. После подписки нажми кнопку проверки</div>
            <button class="case-btn primary" onclick="verifySubscription()" style="margin:10px 0;">✅ ПРОВЕРИТЬ ПОДПИСКУ</button>
            <button class="case-btn" onclick="closeModal()">❌ ЗАКРЫТЬ</button>
        </div>
    `);
}

function verifySubscription() {
    if (!userId) {
        showModal('Ошибка', 'Пожалуйста, войдите в систему');
        return;
    }
    document.getElementById('modalBody').innerHTML = '<div style="text-align:center;padding:20px;"><div style="font-size:24px;">⏳</div><div style="color:#6a7a8e;padding:10px 0;">Проверяем подписку...</div></div>';
    fetch('/api/check_subscription', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: userId})
    })
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            showModal('❌ Ошибка', data.error);
            return;
        }
        if (data.subscribed) {
            if (data.already_rewarded) {
                showModal('ℹ️ УЖЕ ПОЛУЧЕНО', data.message);
            } else {
                showModal('🎉 ПОЗДРАВЛЯЮ!', `
                    <div style="text-align:center;">
                        <div style="font-size:40px;margin:10px 0;">🎉</div>
                        <div style="font-size:20px;font-weight:700;color:#00d4ff;">+${data.reward} 🪙</div>
                        <div style="color:#6a7a8e;font-size:14px;padding:8px 0;">${data.message}</div>
                        <button class="case-btn primary" onclick="closeModal();loadBalance();">✅ ОК</button>
                    </div>
                `);
                loadBalance();
            }
        } else {
            showModal('❌ НЕ ПОДПИСАН', `
                <div style="text-align:center;">
                    <div style="color:#ff6b6b;font-size:16px;padding:8px 0;">${data.message}</div>
                    <button class="case-btn" onclick="window.open('https://t.me/ARTCSSKINS','_blank')">📺 ПЕРЕЙТИ В КАНАЛ</button>
                    <button class="case-btn primary" onclick="verifySubscription()">🔄 ПРОВЕРИТЬ СНОВА</button>
                    <button class="case-btn" onclick="closeModal()">❌ ЗАКРЫТЬ</button>
                </div>
            `);
        }
    })
    .catch(() => showModal('❌ Ошибка', 'Не удалось проверить подписку. Попробуй позже.'));
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
                            <div style="font-size:20px;font-weight:700;color:#00d4ff;">ВЫПАЛО!</div>
                            <div style="font-size:18px;font-weight:600;padding:8px 0;">${item}</div>
                            <div style="font-size:16px;color:#ffd700;">${price} 🪙</div>
                            <div style="display:flex;gap:10px;margin-top:16px;">
                                <button class="case-btn" onclick="closeModal();openCase('${caseName}',${price})" style="flex:1;background:rgba(0,212,255,0.15);">🔄 ЕЩЁ</button>
                                <button class="case-btn primary" onclick="closeModal();loadInventory();loadBalance();" style="flex:1;">✅ ОК</button>
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

// ============ ИНВЕНТАРЬ ============
function loadInventory() {
    const list = document.getElementById('inventoryList');
    if (!list) return;
    list.innerHTML = '<div class="loading">⏳ Загрузка...</div>';
    fetch(`/api/miniapp_inventory?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.items && data.items.length > 0) {
            let html = '', total = 0;
            data.items.forEach(item => {
                const isPending = item.withdraw_status === 'pending';
                html += `
                    <div class="inventory-item" style="border-color:${isPending ? '#ff6b6b' : 'rgba(255,255,255,0.06)'}">
                        <span class="name">${item.name} ${isPending ? '<div style="font-size:11px;color:#ff6b6b;">⏳ Вывод (24ч)</div>' : ''}</span>
                        <span class="price">${item.price} 🪙</span>
                        <div class="actions">
                            ${!isPending ? `<button class="btn-sell" onclick="sellItem(${item.id}, ${item.price})">${t('sell')}</button>` : ''}
                            ${!isPending ? `<button class="btn-withdraw" onclick="withdrawItem(${item.id}, '${item.name}', ${item.price})">${t('withdraw')}</button>` : ''}
                            ${isPending ? '<button class="btn-withdraw" style="opacity:0.5;cursor:not-allowed;">⏳</button>' : ''}
                        </div>
                    </div>
                `;
                total += item.price;
            });
            html += `<div style="padding:12px;text-align:center;"><button class="case-btn primary" onclick="sellAll()">${t('sell_all')} (${total} 🪙)</button></div>`;
            list.innerHTML = html;
        } else {
            list.innerHTML = '<div style="text-align:center;color:#6a7a8e;padding:30px 0;">📭 Нет предметов! Откройте кейсы!</div>';
        }
    })
    .catch(() => list.innerHTML = '<div style="text-align:center;color:#ff4444;padding:30px 0;">❌ Ошибка соединения</div>');
}

function sellItem(itemId, price) {
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
            showModal('💰 ПРОДАНО!', `+${price} 🪙`);
        } else {
            showModal('❌ ОШИБКА', data.error || 'Не удалось продать');
        }
    });
}

function sellAll() {
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
            showModal('💰 ПРОДАНО ВСЁ!', `+${data.total} 🪙 за ${data.count} предметов`);
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
                <div style="font-size:18px;font-weight:600;color:#00d4ff;">${name}</div>
                <div style="color:#6a7a8e;font-size:14px;padding:8px 0;">${price} 🪙</div>
                <div style="color:#ff4444;font-size:16px;font-weight:700;padding:12px 0;background:rgba(255,0,0,0.1);border-radius:8px;border:1px solid rgba(255,0,0,0.2);">⚠️ ДЛЯ ВЫВОДА ОБЯЗАТЕЛЬНО НАПИШИ В ПОДДЕРЖКУ СО СКРИНОМ ДАННОГО ОКНА</div>
                <div style="color:#6a7a8e;font-size:13px;padding:8px 0;">Введите Steam Trade Link</div>
                <input type="text" id="tradeLinkInput" placeholder="Steam Trade Link" style="width:100%;padding:12px;border:2px solid #00d4ff;border-radius:12px;font-size:14px;margin:10px 0;background:rgba(0,0,0,0.3);color:#fff;">
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
            showModal('✅ ЗАЯВКА ОТПРАВЛЕНА!', `
                <div style="text-align:center;">
                    <div style="font-size:20px;font-weight:700;color:#00d4ff;">✅ Заявка создана!</div>
                    <div style="color:#6a7a8e;font-size:14px;padding:8px 0;">У вас есть 24 часа для подтверждения.<br><br><strong>Не забудьте заскринить этот таймер!</strong></div>
                    <div style="background:rgba(0,0,0,0.3);padding:12px;border-radius:12px;margin:10px 0;border:1px solid #00d4ff;">⏱️ <span id="withdrawTimer">24:00:00</span></div>
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

// ============ ПРОФИЛЬ ============
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
        content.innerHTML = `
            <div style="text-align:center;font-size:32px;font-weight:700;color:#00d4ff;padding:8px 0;">${data.username || username} ${isAdminUser ? '✅ 👑' : ''}</div>
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
            <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">
                <button class="case-btn" onclick="showDeposit()">💳 ПОПОЛНИТЬ</button>
                <button class="case-btn" onclick="showReferral()">🔗 РЕФЕРАЛЬНАЯ ССЫЛКА</button>
                <button class="case-btn" onclick="showSupport()">🆘 ПОДДЕРЖКА</button>
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

// ============ ЯЗЫК ============
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
            <div style="color:#00d4ff;padding:8px 0;">💱 Курс: 25000 🪙 = 115 RUB</div>
            <div style="color:#6a7a8e;font-size:14px;">📌 После перевода отправьте чек в поддержку</div>
            <button class="case-btn primary" onclick="closeModal()">✅ ОК</button>
        </div>
    `);
}

function showReferral() {
    const link = `https://artappreb.onrender.com?ref=${userId}`;
    showModal('🔗 РЕФЕРАЛЬНАЯ ССЫЛКА', `
        <div style="text-align:center;">
            <div style="word-break:break-all;font-size:14px;padding:8px;background:rgba(0,0,0,0.3);border-radius:8px;border:1px solid #00d4ff;">${link}</div>
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
            const realPrize = data.result;
            
            new WheelAnimation(realPrize, (result) => {
                let msg = '';
                if (result.type === 'coins') msg = `🎉 Вы выиграли ${result.value} 🪙!`;
                else if (result.type === 'discount') msg = `🎉 Вы выиграли ${result.value}% скидку!`;
                showModal('🎡 КОЛЕСО', `<div style="text-align:center;font-size:24px;color:#00d4ff;">${msg}</div>`);
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

// ============ PVP ============
function cyclePvpCase() {
    pvpCaseIndex = (pvpCaseIndex + 1) % pvpCases.length;
    const c = pvpCases[pvpCaseIndex];
    const btn = document.getElementById('pvpCaseBtn');
    if (btn) btn.textContent = c.label;
}

function findPvpOpponent() {
    const btn = document.getElementById('pvpSearchBtn');
    btn.disabled = true;
    btn.textContent = '⏳ ПОИСК...';
    if (tg) tg.HapticFeedback.impactOccurred('medium');
    document.getElementById('pvpStatus').textContent = '🔍 Поиск соперника...';
    document.getElementById('pvpResult').textContent = '';
    const caseName = pvpCases[pvpCaseIndex].name;
    fetch('/api/pvp_find', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: userId, case_name: caseName})
    })
    .then(res => res.json())
    .then(data => {
        if (data.waiting) {
            document.getElementById('pvpStatus').textContent = '⏳ Ожидание соперника...';
            let attempts = 0;
            const interval = setInterval(() => {
                attempts++;
                if (attempts > 20) {
                    clearInterval(interval);
                    btn.disabled = false;
                    btn.textContent = '🔍 НАЙТИ СОПЕРНИКА';
                    document.getElementById('pvpStatus').textContent = '❌ Соперник не найден';
                    return;
                }
                fetch(`/api/pvp_status?battle_id=${data.battle_id}`)
                .then(res => res.json())
                .then(status => {
                    if (status.status === 'active') {
                        clearInterval(interval);
                        startPvpBattle(data.battle_id);
                    }
                });
            }, 3000);
        } else if (data.success) {
            startPvpBattle(data.battle_id);
        } else {
            btn.disabled = false;
            btn.textContent = '🔍 НАЙТИ СОПЕРНИКА';
            document.getElementById('pvpStatus').textContent = data.error || '❌ Ошибка';
        }
    })
    .catch(() => {
        btn.disabled = false;
        btn.textContent = '🔍 НАЙТИ СОПЕРНИКА';
        document.getElementById('pvpStatus').textContent = '❌ Ошибка соединения';
    });
}

function startPvpBattle(battleId) {
    document.getElementById('pvpStatus').textContent = '⚔️ Битва начинается...';
    fetch('/api/pvp_start', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({battle_id: battleId, user_id: userId, case_name: pvpCases[pvpCaseIndex].name})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('pvpStatus').textContent = `🎯 Ваш скин: ${data.skin} (${data.price} 🪙)`;
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (attempts > 30) {
                clearInterval(interval);
                document.getElementById('pvpSearchBtn').disabled = false;
                document.getElementById('pvpSearchBtn').textContent = '🔍 НАЙТИ СОПЕРНИКА';
                document.getElementById('pvpStatus').textContent = '⏱️ Таймаут битвы';
                return;
            }
            fetch(`/api/pvp_status?battle_id=${battleId}`)
            .then(res => res.json())
            .then(status => {
                if (status.winner_id) {
                    clearInterval(interval);
                    document.getElementById('pvpSearchBtn').disabled = false;
                    document.getElementById('pvpSearchBtn').textContent = '🔍 НАЙТИ СОПЕРНИКА';
                    if (status.winner_id == userId) {
                        document.getElementById('pvpResult').textContent = `🏆 ПОБЕДА! +${status.price2} 🪙!`;
                        loadBalance();
                    } else {
                        document.getElementById('pvpResult').textContent = '💔 ПОРАЖЕНИЕ! Вы потеряли скин';
                        loadBalance();
                    }
                }
            });
        }, 1000);
    });
}

// ============ ТОП ИГРОКОВ ============
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
            showModal('✅ ЗАЯВКА ОТПРАВЛЕНА', 'Заявка в друзья отправлена!');
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
            showModal('✅ ДРУГ ДОБАВЛЕН!', data.message);
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
            showModal('✅ УДАЛЁН', 'Друг удалён');
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
                        <button class="btn-withdraw" onclick="window.open('tg://resolve?domain=${f.username}','_blank')" style="border-color:#00d4ff;">💬</button>
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
            let html = '<div style="font-weight:700;color:#00d4ff;padding:8px 0;">📦 ИНВЕНТАРЬ ДРУГА:</div>';
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
                html += `
                    <div class="inventory-item" style="flex-direction:column;align-items:stretch;gap:4px;">
                        <div style="display:flex;justify-content:space-between;">
                            <span>${ach.done ? '✅' : '🔒'} ${ach.name}</span>
                            <span style="color:#00d4ff;">+${ach.reward} 🪙</span>
                        </div>
                        <div style="font-size:12px;color:#6a7a8e;">${ach.description}</div>
                        <div style="background:rgba(255,255,255,0.05);border-radius:8px;height:6px;overflow:hidden;">
                            <div style="background:${ach.done ? '#00d4ff' : 'rgba(0,212,255,0.3)'};width:${percent}%;height:100%;border-radius:8px;transition:width 0.5s;"></div>
                        </div>
                        <div style="font-size:11px;color:#6a7a8e;text-align:right;">${progress}/${target}</div>
                    </div>
                `;
            });
            list.innerHTML = html;
        } else {
            list.innerHTML = '<div style="text-align:center;color:#6a7a8e;padding:30px 0;">🏅 Нет достижений</div>';
        }
    })
    .catch(() => list.innerHTML = '<div style="text-align:center;color:#ff4444;padding:30px 0;">❌ Ошибка соединения</div>');
}

// ============ ПРОМОКОДЫ ============
function showPromoModal() {
    showModal('🎫 ПРОМОКОД', `
        <div style="text-align:center;padding:10px 0;">
            <div style="color:#6a7a8e;font-size:14px;padding:8px 0;">Введите промокод</div>
            <input type="text" id="promoInput" placeholder="Введите код" style="width:100%;padding:12px;border:2px solid #00d4ff;border-radius:12px;font-size:16px;margin:10px 0;background:rgba(0,0,0,0.3);color:#fff;">
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
            showModal('🎉 УСПЕХ!', `+${data.reward} 🪙`);
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
    
    let html = '<div style="font-weight:700;color:#00d4ff;padding:8px 0;">📦 ВЫБЕРИ ПРЕДМЕТ:</div>';
    upgradeItems.forEach(item => {
        html += `
            <div class="inventory-item" onclick="setSource(${item.id}, '${item.name}', ${item.price})">
                <span>${item.name}</span>
                <span style="color:#00d4ff;">${item.price} 🪙</span>
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
        const color = chance > 60 ? '#00d4ff' : chance > 30 ? '#ffd700' : '#ff4444';
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
            riskEl.style.color = risk === 'ВЫСОКИЙ' ? '#ff4444' : risk === 'СРЕДНИЙ' ? '#ffd700' : '#00d4ff';
            
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
            
            // === АНИМАЦИЯ АПГРЕЙДА ===
            new UpgradeAnimation(success, () => {
                if (success) {
                    showModal('🎉 АПГРЕЙД УСПЕШЕН!', `
                        <div style="text-align:center;padding:10px 0;">
                            <div style="font-size:48px;margin:10px 0;">🎉</div>
                            <div style="font-size:20px;font-weight:700;color:#00d4ff;">${data.target_name}</div>
                            <div style="font-size:16px;color:#ffd700;">+${data.target_price} 🪙</div>
                            <div style="color:#6a7a8e;font-size:14px;">Шанс: ${data.chance}% | Ролл: ${data.roll}%</div>
                            <button class="case-btn primary" onclick="closeModal();loadBalance();loadInventory();loadUpgradeItems();">✅ ОК</button>
                        </div>
                    `);
                } else {
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

// ============ АДМИН-ПАНЕЛЬ (С ПАРОЛЕМ) ============
function loadAdminPanel() {
    const content = document.getElementById('adminContent');
    if (!content) return;
    
    const adminAccess = sessionStorage.getItem('adminAccess') === 'true';
    
    if (!adminAccess) {
        content.innerHTML = `
            <div style="text-align:center;padding:20px 0;">
                <div style="font-size:48px;margin:10px 0;">🔐</div>
                <div style="font-size:18px;font-weight:700;color:#00d4ff;">ВХОД В АДМИН-ПАНЕЛЬ</div>
                <div style="color:#6a7a8e;font-size:14px;padding:8px 0;">Введите пароль для доступа</div>
                <input type="password" id="adminPasswordInput" placeholder="Введите пароль" 
                    style="width:100%;padding:14px;border:2px solid #00d4ff;border-radius:12px;font-size:16px;
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
            <button class="case-btn" onclick="adminCreatePersonalPromo()">🎫 Личный промокод</button>
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

function adminChangePassword() {
    showModal('🔑 СМЕНА ПАРОЛЯ', `
        <div style="padding:10px 0;">
            <div style="color:#6a7a8e;font-size:14px;padding:4px 0;">Старый пароль</div>
            <input type="password" id="oldPassInput" placeholder="Введите старый пароль" 
                style="width:100%;padding:12px;border:2px solid #00d4ff;border-radius:12px;font-size:14px;margin:6px 0;background:rgba(0,0,0,0.3);color:#fff;">
            <div style="color:#6a7a8e;font-size:14px;padding:4px 0;">Новый пароль</div>
            <input type="password" id="newPassInput" placeholder="Введите новый пароль" 
                style="width:100%;padding:12px;border:2px solid #00d4ff;border-radius:12px;font-size:14px;margin:6px 0;background:rgba(0,0,0,0.3);color:#fff;">
            <button class="case-btn primary" onclick="submitPasswordChange()">🔑 СМЕНИТЬ</button>
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
        let html = '<div style="font-weight:700;color:#00d4ff;padding:8px 0;">👥 ИГРОКИ:</div>';
        if (data.users && data.users.length > 0) {
            data.users.forEach(u => {
                html += `<div class="inventory-item"><span>${u.username} ${u.is_frozen ? '❄️' : ''} ${u.is_banned ? '🚫' : ''}</span><span>${u.coins} 🪙</span><span>⭐ Lv.${u.level}</span></div>`;
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
        let html = '<div style="font-weight:700;color:#00d4ff;padding:8px 0;">🔍 РЕЗУЛЬТАТЫ:</div>';
        if (data.users && data.users.length > 0) {
            data.users.forEach(u => {
                html += `<div class="inventory-item"><span>${u.username}</span><span>${u.coins} 🪙</span><span>⭐ Lv.${u.level}</span></div>`;
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
            <div style="font-weight:700;color:#00d4ff;padding:8px 0;">👤 ПРОФИЛЬ ${data.username}:</div>
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
        let html = `<div style="font-weight:700;color:#00d4ff;padding:8px 0;">📦 ИНВЕНТАРЬ игрока ${uid}:</div>`;
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
        let html = `<div style="font-weight:700;color:#00d4ff;padding:8px 0;">📜 ИСТОРИЯ ПОПОЛНЕНИЙ игрока ${uid}:</div>`;
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

function adminGiveCase() { showAdminConfirm('Введите ID игрока', 'Введите кейс (bomj/berkut/champion/draft)', (uid, caseName) => {
    fetch('/api/admin/give_case', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid), case_name:caseName})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? `✅ Готово! ${data.item} (${data.price} 🪙)` : '❌ Ошибка');
}); }

function adminResetInventory() { showAdminConfirm('Введите ID игрока', '', (uid) => {
    if (!confirm('Удалить все предметы?')) return;
    fetch('/api/admin/reset_inventory', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка');
}); }

function adminSetCasePrice() {
    const caseName = prompt('Введите кейс (bomj/berkut/champion/draft):');
    if (!caseName) return;
    const price = prompt('Введите новую цену:');
    if (!price) return;
    fetch('/api/admin/set_case_price', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({case_name:caseName, price:parseInt(price)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка');
}

function adminSetCaseChance() {
    const caseName = prompt('Введите кейс (bomj/berkut/champion/draft):');
    if (!caseName) return;
    const chance = prompt('Введите шанс джекпота %:');
    if (!chance) return;
    fetch('/api/admin/set_case_chance', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({case_name:caseName, jackpot_chance:parseFloat(chance)})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка');
}

function adminToggleCase() {
    const caseName = prompt('Введите кейс (bomj/berkut/champion/draft):');
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

function adminCreatePersonalPromo() { showAdminConfirm('Введите ID игрока', 'Введите награду (монеты)', (uid, reward) => {
    const code = prompt('Введите желаемый код промокода (буквы и цифры, без пробелов):');
    if (!code) return;
    fetch('/api/admin/create_personal_promo', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid), reward:parseInt(reward), code:code})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? `✅ Личный промокод: ${code} для игрока ${uid}` : '❌ Ошибка');
}); }

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
        let html = '<div style="font-weight:700;color:#00d4ff;padding:8px 0;">🎫 ПРОМОКОДЫ:</div>';
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
        let html = '<div style="font-weight:700;color:#00d4ff;padding:8px 0;">📤 ЗАЯВКИ НА ВЫВОД:</div>';
        if (data.requests && data.requests.length > 0) {
            data.requests.slice(0, 20).forEach(r => {
                html += `<div class="inventory-item"><span>${r.username}</span><span>${r.item}</span><span>${r.price} 🪙</span></div>`;
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
    const msg = prompt('Введите текст рассылки:');
    if (!msg) return;
    fetch('/api/admin/broadcast', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:msg})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? `✅ Отправлено ${data.count} пользователям!` : '❌ Ошибка');
}

function adminPersonalBroadcast() { showAdminConfirm('Введите ID игрока', 'Введите текст сообщения', (uid, msg) => {
    fetch('/api/admin/personal_broadcast', {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({user_id:parseInt(uid), message:msg})})
    .then(res => res.json()).then(data => document.getElementById('adminInfo').textContent = data.success ? '✅ Отправлено!' : '❌ Ошибка');
}); }

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
        let html = '<div style="font-weight:700;color:#00d4ff;padding:8px 0;">🟢 АКТИВНЫЕ ИГРОКИ (10 мин):</div>';
        if (data.users && data.users.length > 0) {
            data.users.slice(0, 30).forEach(u => {
                html += `<div class="inventory-item"><span>${u.username}</span><span>${u.last_activity}</span></div>`;
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
            html += `<div class="inventory-item"><span>${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`} ${u.username}</span><span>${u.coins} 🪙</span></div>`;
        });
        document.getElementById('adminInfo').innerHTML = html;
    });
}

function adminTopLevel() {
    fetch('/api/admin/top_level')
    .then(res => res.json())
    .then(data => {
        let html = '<div style="font-weight:700;color:#00d4ff;padding:8px 0;">⭐ ТОП УРОВНЕЙ:</div>';
        data.users.forEach((u, i) => {
            html += `<div class="inventory-item"><span>${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}.`} ${u.username}</span><span>⭐ ${u.level}</span></div>`;
        });
        document.getElementById('adminInfo').innerHTML = html;
    });
}

function adminStats() {
    fetch('/api/admin/stats')
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').innerHTML = `
            <div style="font-weight:700;color:#00d4ff;padding:8px 0;">📊 СТАТИСТИКА:</div>
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
