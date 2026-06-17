// ============ ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ============
let userId = null;
let username = null;
let isAdmin = false;
let currentLang = 'ru';
let currentCase = 'bomj';
let pvpCaseIndex = 0;
let pvpCases = [
    {name: 'bomj', label: 'BOMJ (500)', price: 500},
    {name: 'berkut', label: 'BERKUT (1500)', price: 1500},
    {name: 'champion', label: 'CHAMPION (5000)', price: 5000}
];
let tg = window.Telegram ? window.Telegram.WebApp : null;

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
        'deposit_min': 'Минимальный депозит 115 RUB',
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
        'referrals': 'Рефералов'
    },
    'uz': {
        'welcome': 'XUSH KELIBSIZ',
        'cases': 'KASSALAR',
        'inventory': 'INVENTAR',
        'pvp': 'PVP',
        'wheel': 'G\'ILDIRAK',
        'profile': 'PROFIL',
        'achievements': 'YUTUQLAR',
        'promo': 'PROMO KOD',
        'admin': 'ADMIN PANEL',
        'back': 'ORQAGA',
        'deposit': 'DEPOZIT',
        'referral': 'REFERRAL LINK',
        'support': 'YORDAM',
        'logout': 'CHIQISH',
        'select_case': 'KASSANI TANLANG',
        'spins_left': 'Bugungi aylanishlar',
        'spin': 'AYLANTIRISH',
        'find_opponent': 'RAQIB TOPISH',
        'searching': 'Raqib qidirilmoqda...',
        'waiting': 'Raqib kutilyapti...',
        'victory': 'G\'ALABA!',
        'defeat': 'MAG\'LUBIYAT!',
        'sell': 'SOTISH',
        'sell_all': 'HAMMASINI SOTISH',
        'withdraw': 'YECHIB OLISH',
        'withdraw_request': 'YECHIB OLISH SO\'ROVI',
        'deposit_min': '115 RUB depozit kerak',
        'contact_admin': 'ADMIN BILAN BOG\'LANISH',
        'copied': 'NUSXALANDI!',
        'error': 'XATO',
        'success': 'TABRIKLAYMIZ!',
        'promo_enter': 'PROMO KODNI KIRITING',
        'promo_activate': 'FAOLLASHTIRISH',
        'promo_invalid': 'Noto\'g\'ri promo kod',
        'promo_used': 'Promo kod ishlatilgan',
        'promo_success': 'Promo kod faollashtirildi! +',
        'coins': 'tanga',
        'level': 'Daraja',
        'xp': 'Tajriba',
        'wins': 'G\'alabalar',
        'losses': 'Mag\'lubiyatlar',
        'referrals': 'Referallar'
    }
};

function t(key) {
    return LANG[currentLang][key] || key;
}

// ============ ИНИЦИАЛИЗАЦИЯ ============
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Загружаем язык из localStorage
    const savedLang = localStorage.getItem('artdrop_lang');
    if (savedLang) currentLang = savedLang;
    
    loginOrRegister(userId, username);
    updateLanguage();
});

function updateLanguage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
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
                document.getElementById('adminPanel').style.display = 'block';
                localStorage.setItem('isAdmin', 'true');
            }
            
            loadBalance();
            checkWithdrawStatus();
        } else {
            console.error('Login failed:', data.error);
        }
    })
    .catch(err => console.error('Login error:', err));
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
        document.querySelectorAll('.balance span:last-child').forEach(el => {
            el.textContent = coins;
        });
        document.querySelectorAll('#casesCoins, #invCoins, #profileCoins, #wheelCoins, #pvpCoins, #achCoins, #adminCoins').forEach(el => {
            if (el) el.textContent = coins;
        });
    })
    .catch(err => console.error('Balance error:', err));
}

function showScreen(screen) {
    document.querySelectorAll('.screen').forEach(el => {
        el.classList.remove('active');
    });
    const target = document.getElementById(screen + '-screen');
    if (target) {
        target.classList.add('active');
    }
    if (screen === 'inventory') loadInventory();
    if (screen === 'profile') loadProfile();
    if (screen === 'achievements') loadAchievements();
    if (screen === 'cases') loadCases();
    if (screen === 'admin') loadAdminPanel();
    if (screen === 'wheel') loadWheelStatus();
    if (screen === 'promo') showPromoModal();
    if (tg) tg.HapticFeedback.impactOccurred('light');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

function showModal(title, content) {
    document.getElementById('modalBody').innerHTML = `<div class="modal-title">${title}</div>${content}`;
    document.getElementById('modal').classList.add('active');
}

// ============ АНИМАЦИЯ КЕЙСОВ (ЖЁЛТАЯ ПЛАШКА) ============
class CaseAnimation {
    constructor(caseName, callback) {
        this.caseName = caseName;
        this.callback = callback;
        this.skins = this.getCaseSkins();
        this.currentIndex = 0;
        this.isSpinning = true;
        this.stopAt = randomInt(15, 30);
        this.resultItem = null;
        this.resultPrice = 0;
        
        this.createUI();
        this.startSpin();
    }
    
    getCaseSkins() {
        // Временные скины для анимации
        const allSkins = [
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
        return allSkins;
    }
    
    createUI() {
        // Создаём затемнение
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.92);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        `;
        
        // Название кейса
        const caseNames = {"bomj": "КЕЙС БОМЖ", "berkut": "КЕЙС БЕРКУТ", "champion": "КЕЙС ЧЕМПИОН"};
        const title = document.createElement('div');
        title.style.cssText = `
            color: rgba(255,255,255,0.5);
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 20px;
            letter-spacing: 2px;
        `;
        title.textContent = caseNames[this.caseName] || 'КЕЙС';
        this.overlay.appendChild(title);
        
        // Контейнер для скинов
        this.skinContainer = document.createElement('div');
        this.skinContainer.style.cssText = `
            width: 80%;
            max-width: 400px;
            height: 80px;
            position: relative;
            overflow: hidden;
            margin-bottom: 10px;
        `;
        this.overlay.appendChild(this.skinContainer);
        
        // Жёлтая плашка (индикатор)
        this.indicator = document.createElement('div');
        this.indicator.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 70%;
            height: 4px;
            background: #ffd700;
            z-index: 10;
            border-radius: 4px;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
        `;
        this.skinContainer.appendChild(this.indicator);
        
        // Контейнер для пролетающих скинов
        this.skinsLayer = document.createElement('div');
        this.skinsLayer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
        `;
        this.skinContainer.appendChild(this.skinsLayer);
        
        // Текущий скин (крупно)
        this.currentSkinLabel = document.createElement('div');
        this.currentSkinLabel.style.cssText = `
            color: white;
            font-size: 28px;
            font-weight: 700;
            text-align: center;
            margin-top: 10px;
            min-height: 40px;
            transition: all 0.1s;
        `;
        this.overlay.appendChild(this.currentSkinLabel);
        
        // Цена
        this.currentPriceLabel = document.createElement('div');
        this.currentPriceLabel.style.cssText = `
            color: #4fc3f7;
            font-size: 20px;
            font-weight: 600;
            text-align: center;
            min-height: 30px;
        `;
        this.overlay.appendChild(this.currentPriceLabel);
        
        document.body.appendChild(this.overlay);
        
        // Создаём элементы скинов
        this.skinElements = [];
        for (let i = 0; i < 5; i++) {
            const el = document.createElement('div');
            el.style.cssText = `
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                color: white;
                font-size: 20px;
                font-weight: 500;
                white-space: nowrap;
                opacity: 0.3;
                transition: all 0.15s;
            `;
            this.skinsLayer.appendChild(el);
            this.skinElements.push(el);
        }
    }
    
    startSpin() {
        this.nextSkin();
    }
    
    nextSkin() {
        if (!this.isSpinning) return;
        
        const name = this.skins[this.currentIndex % this.skins.length][0];
        const price = this.skins[this.currentIndex % this.skins.length][1];
        this.resultItem = name;
        this.resultPrice = price;
        
        this.currentSkinLabel.textContent = name;
        this.currentPriceLabel.textContent = price + ' монет';
        
        // Анимация пролёта для элементов
        for (let i = 0; i < this.skinElements.length; i++) {
            const el = this.skinElements[i];
            const idx = (this.currentIndex + i) % this.skins.length;
            const skinName = this.skins[idx][0];
            const skinPrice = this.skins[idx][1];
            el.textContent = `${skinName} (${skinPrice})`;
            
            // Распределяем позиции
            const positions = [-60, -30, 0, 30, 60];
            el.style.left = (50 + positions[i]) + '%';
            el.style.transform = `translate(-50%, -50%) scale(${1 - Math.abs(positions[i]) / 100})`;
            el.style.opacity = 0.3 + (1 - Math.abs(positions[i]) / 60) * 0.6;
            
            // Эффект размытия для крайних
            if (Math.abs(positions[i]) > 40) {
                el.style.filter = 'blur(2px)';
            } else {
                el.style.filter = 'blur(0px)';
            }
        }
        
        this.currentIndex++;
        
        if (this.currentIndex >= this.stopAt) {
            this.isSpinning = false;
            setTimeout(() => this.finish(), 600);
            return;
        }
        
        setTimeout(() => this.nextSkin(), 80);
    }
    
    finish() {
        // Подсветка золотом
        this.currentSkinLabel.style.color = '#ffd700';
        this.currentPriceLabel.style.color = '#ffd700';
        this.currentSkinLabel.style.fontSize = '36px';
        
        // Убираем плашку
        this.indicator.style.opacity = '0';
        
        setTimeout(() => {
            this.overlay.remove();
            if (this.callback) {
                this.callback(this.resultItem, this.resultPrice);
            }
        }, 1500);
    }
}

// ============ АНИМАЦИЯ КОЛЕСА ============
class WheelAnimation {
    constructor(callback) {
        this.callback = callback;
        this.prizes = [
            ["50 монет", 50, "coins"], ["100 монет", 100, "coins"],
            ["250 монет", 250, "coins"], ["500 монет", 500, "coins"],
            ["1000 монет", 1000, "coins"], ["5% скидка", 5, "discount"],
            ["10% скидка", 10, "discount"], ["15% скидка", 15, "discount"],
            ["25% скидка", 25, "discount"], ["Кейс Бомж", "bomj", "case"],
            ["Кейс Беркут", "berkut", "case"], ["Кейс Чемпион", "champion", "case"]
        ];
        this.currentIndex = 0;
        this.isSpinning = true;
        this.stopAt = randomInt(20, 35);
        this.result = null;
        
        this.createUI();
        this.startSpin();
    }
    
    createUI() {
        this.overlay = document.createElement('div');
        this.overlay.style.cssText = `
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(0,0,0,0.92);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            overflow: hidden;
        `;
        
        // Заголовок
        const title = document.createElement('div');
        title.style.cssText = `
            color: rgba(255,255,255,0.5);
            font-size: 18px;
            font-weight: 700;
            margin-bottom: 20px;
            letter-spacing: 2px;
        `;
        title.textContent = 'КОЛЕСО ФОРТУНЫ';
        this.overlay.appendChild(title);
        
        // Контейнер
        this.container = document.createElement('div');
        this.container.style.cssText = `
            width: 80%;
            max-width: 400px;
            height: 100px;
            position: relative;
            overflow: hidden;
            margin-bottom: 10px;
        `;
        this.overlay.appendChild(this.container);
        
        // Жёлтая плашка
        this.indicator = document.createElement('div');
        this.indicator.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 60%;
            height: 4px;
            background: #ffd700;
            z-index: 10;
            border-radius: 4px;
            box-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
        `;
        this.container.appendChild(this.indicator);
        
        // Слой призов
        this.prizesLayer = document.createElement('div');
        this.prizesLayer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
        `;
        this.container.appendChild(this.prizesLayer);
        
        // Текущий приз
        this.currentPrizeLabel = document.createElement('div');
        this.currentPrizeLabel.style.cssText = `
            color: white;
            font-size: 32px;
            font-weight: 700;
            text-align: center;
            min-height: 40px;
            transition: all 0.1s;
        `;
        this.overlay.appendChild(this.currentPrizeLabel);
        
        // Создаём элементы
        this.prizeElements = [];
        for (let i = 0; i < 5; i++) {
            const el = document.createElement('div');
            el.style.cssText = `
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                color: white;
                font-size: 18px;
                font-weight: 500;
                white-space: nowrap;
                opacity: 0.3;
                transition: all 0.15s;
            `;
            this.prizesLayer.appendChild(el);
            this.prizeElements.push(el);
        }
        
        document.body.appendChild(this.overlay);
    }
    
    startSpin() {
        this.nextPrize();
    }
    
    nextPrize() {
        if (!this.isSpinning) return;
        
        const name = this.prizes[this.currentIndex % this.prizes.length][0];
        const value = this.prizes[this.currentIndex % this.prizes.length][1];
        const type = this.prizes[this.currentIndex % this.prizes.length][2];
        this.result = {name, value, type};
        
        this.currentPrizeLabel.textContent = name;
        
        for (let i = 0; i < this.prizeElements.length; i++) {
            const el = this.prizeElements[i];
            const idx = (this.currentIndex + i) % this.prizes.length;
            const prizeName = this.prizes[idx][0];
            el.textContent = prizeName;
            
            const positions = [-60, -30, 0, 30, 60];
            el.style.left = (50 + positions[i]) + '%';
            el.style.transform = `translate(-50%, -50%) scale(${1 - Math.abs(positions[i]) / 100})`;
            el.style.opacity = 0.3 + (1 - Math.abs(positions[i]) / 60) * 0.6;
            
            if (Math.abs(positions[i]) > 40) {
                el.style.filter = 'blur(2px)';
            } else {
                el.style.filter = 'blur(0px)';
            }
        }
        
        this.currentIndex++;
        
        if (this.currentIndex >= this.stopAt) {
            this.isSpinning = false;
            setTimeout(() => this.finish(), 600);
            return;
        }
        
        setTimeout(() => this.nextPrize(), 80);
    }
    
    finish() {
        this.currentPrizeLabel.style.color = '#ffd700';
        this.currentPrizeLabel.style.fontSize = '40px';
        
        setTimeout(() => {
            this.overlay.remove();
            if (this.callback) {
                this.callback(this.result);
            }
        }, 1500);
    }
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============ КЕЙСЫ ============
function loadCases() {
    const list = document.getElementById('casesList');
    list.innerHTML = `
        <button class="case-btn" onclick="openCase('bomj', 500)">
            <div style="font-weight:700;">BOMJ</div>
            <div style="font-size:14px;color:#7a7a8e;">500 монет</div>
        </button>
        <button class="case-btn" onclick="openCase('berkut', 1500)">
            <div style="font-weight:700;">BERKUT</div>
            <div style="font-size:14px;color:#7a7a8e;">1500 монет</div>
        </button>
        <button class="case-btn" onclick="openCase('champion', 5000)">
            <div style="font-weight:700;">CHAMPION</div>
            <div style="font-size:14px;color:#7a7a8e;">5000 монет</div>
        </button>
    `;
}

function openCase(caseName, price) {
    if (tg) tg.HapticFeedback.impactOccurred('medium');
    
    fetch(`/api/miniapp_profile?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.coins < price) {
            showModal('Ошибка', `<div style="text-align:center;color:#c0392b;">Нужно ${price} монет, у вас ${data.coins}</div>`);
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
                // Показываем анимацию
                const anim = new CaseAnimation(caseName, (item, price) => {
                    showModal('УСПЕХ!', `
                        <div style="text-align:center;padding:10px 0;">
                            <div style="font-size:40px;margin:10px 0;">🎉</div>
                            <div style="font-size:20px;font-weight:700;color:#1a5276;">ВЫПАЛО!</div>
                            <div style="font-size:18px;font-weight:600;padding:8px 0;">${item}</div>
                            <div style="font-size:16px;color:#1a5276;">+${price} монет</div>
                            <div style="display:flex;gap:10px;margin-top:16px;">
                                <button class="case-btn" onclick="closeModal();openCase('${caseName}',${price})" style="flex:1;">ОТКРЫТЬ ЕЩЁ</button>
                                <button class="case-btn primary" onclick="closeModal();loadInventory();loadBalance();" style="flex:1;">ОК</button>
                            </div>
                        </div>
                    `);
                    loadBalance();
                });
            } else {
                showModal('Ошибка', `<div style="text-align:center;color:#c0392b;">${data.error || 'Не удалось открыть'}</div>`);
            }
        });
    });
}

// ============ ИНВЕНТАРЬ ============
function loadInventory() {
    const list = document.getElementById('inventoryList');
    list.innerHTML = '<div class="loading">Загрузка...</div>';
    
    fetch(`/api/miniapp_inventory?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.items && data.items.length > 0) {
            let html = '';
            let total = 0;
            data.items.forEach(item => {
                const isPending = item.withdraw_status === 'pending';
                const timerHtml = isPending ? `<div style="font-size:11px;color:#ff6b6b;">⏳ Вывод (24ч)</div>` : '';
                html += `
                    <div class="inventory-item">
                        <span class="name">${item.name} ${timerHtml}</span>
                        <span class="price">${item.price}💰</span>
                        <div class="actions">
                            ${!isPending ? `<button class="btn-sell" onclick="sellItem(${item.id}, ${item.price})">${t('sell')}</button>` : ''}
                            ${!isPending ? `<button class="btn-withdraw" onclick="withdrawItem(${item.id}, '${item.name}', ${item.price})">${t('withdraw')}</button>` : ''}
                            ${isPending ? `<button class="btn-withdraw" style="opacity:0.5;cursor:not-allowed;">⏳</button>` : ''}
                        </div>
                    </div>
                `;
                total += item.price;
            });
            html += `
                <div style="padding:12px;text-align:center;">
                    <button class="case-btn primary" onclick="sellAll()">${t('sell_all')} (${total}💰)</button>
                </div>
            `;
            list.innerHTML = html;
        } else {
            list.innerHTML = '<div style="text-align:center;color:#7a7a8e;padding:30px 0;">Нет предметов! Откройте кейсы!</div>';
        }
    })
    .catch(() => {
        list.innerHTML = '<div style="text-align:center;color:#c0392b;padding:30px 0;">Ошибка соединения</div>';
    });
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
            showModal('ПРОДАНО!', `<div style="text-align:center;color:#1a5276;">+${price} монет</div>`);
        } else {
            showModal('Ошибка', `<div style="text-align:center;color:#c0392b;">${data.error || 'Не удалось продать'}</div>`);
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
            showModal('ПРОДАНО ВСЁ!', `<div style="text-align:center;color:#1a5276;">+${data.total} монет за ${data.count} предметов</div>`);
        } else {
            showModal('Ошибка', `<div style="text-align:center;color:#c0392b;">${data.error || 'Не удалось продать'}</div>`);
        }
    });
}

// ============ ВЫВОД ============
function withdrawItem(itemId, name, price) {
    fetch(`/api/miniapp_profile?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.total_deposit < 115) {
            showModal('Ошибка', `<div style="text-align:center;color:#c0392b;">${t('deposit_min')}</div>`);
            return;
        }
        
        showModal('ВЫВОД', `
            <div style="text-align:center;padding:10px 0;">
                <div style="font-size:18px;font-weight:600;color:#1a5276;">${name}</div>
                <div style="color:#7a7a8e;font-size:14px;padding:8px 0;">${price} монет</div>
                <div style="color:#7a7a8e;font-size:13px;padding:4px 0;">Введите Steam Trade Link</div>
                <input type="text" id="tradeLinkInput" placeholder="Steam Trade Link" style="
                    width: 100%;
                    padding: 12px;
                    border: 2px solid #1a5276;
                    border-radius: 12px;
                    font-size: 14px;
                    margin: 10px 0;
                    background: #f5f7fa;
                ">
                <button class="case-btn primary" onclick="sendWithdrawRequest(${itemId}, '${name}', ${price})">ОТПРАВИТЬ</button>
                <button class="case-btn" onclick="closeModal()">ОТМЕНА</button>
            </div>
        `);
    });
}

function sendWithdrawRequest(itemId, name, price) {
    const tradeLink = document.getElementById('tradeLinkInput').value;
    if (!tradeLink) {
        showModal('Ошибка', 'Введите Steam Trade Link');
        return;
    }
    
    fetch('/api/withdraw_request', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: userId, item_id: itemId, trade_link: tradeLink})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            closeModal();
            showModal('ЗАЯВКА ОТПРАВЛЕНА!', `
                <div style="text-align:center;">
                    <div style="font-size:20px;font-weight:700;color:#1a5276;">✅ Заявка создана!</div>
                    <div style="color:#7a7a8e;font-size:14px;padding:8px 0;">
                        У вас есть 24 часа для подтверждения.
                        <br><br>
                        <strong>Не забудьте заскринить этот таймер!</strong>
                    </div>
                    <div style="background:#f0f2f5;padding:12px;border-radius:12px;margin:10px 0;">
                        ⏱️ <span id="withdrawTimer">24:00:00</span>
                    </div>
                    <div style="color:#7a7a8e;font-size:14px;padding:8px 0;">
                        Предмет: ${name} (${price} монет)
                    </div>
                    <button class="case-btn primary" onclick="contactAdmin('${name}', ${price})">📩 ПЕРЕЙТИ В ЧАТ С АДМИНОМ</button>
                    <button class="case-btn" onclick="closeModal();loadInventory();loadBalance();">ОК</button>
                </div>
            `);
            
            startWithdrawTimer(24 * 60 * 60);
            loadInventory();
            loadBalance();
        } else {
            showModal('Ошибка', `<div style="text-align:center;color:#c0392b;">${data.error}</div>`);
        }
    })
    .catch(() => showModal('Ошибка', 'Ошибка соединения'));
}

function startWithdrawTimer(seconds) {
    let remaining = seconds;
    const timerElement = document.getElementById('withdrawTimer');
    if (!timerElement) return;
    
    const interval = setInterval(() => {
        const hours = Math.floor(remaining / 3600);
        const minutes = Math.floor((remaining % 3600) / 60);
        const secs = remaining % 60;
        timerElement.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        
        remaining--;
        if (remaining < 0) {
            clearInterval(interval);
            timerElement.textContent = '⏰ ВРЕМЯ ВЫШЛО';
        }
    }, 1000);
}

function contactAdmin(itemName, itemPrice) {
    const message = `Здравствуйте, я по поводу вывода. Моя трейд ссылка: (ваша ссылка). Предмет: ${itemName} (${itemPrice} монет). Жду в ближайшее время.`;
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
    content.innerHTML = '<div class="loading">Загрузка...</div>';
    
    if (!userId) {
        content.innerHTML = '<div style="text-align:center;color:#c0392b;">Пожалуйста, войдите</div>';
        return;
    }
    
    fetch(`/api/miniapp_profile?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            content.innerHTML = `<div style="text-align:center;color:#c0392b;">Ошибка: ${data.error}</div>`;
            return;
        }
        
        const isAdminUser = data.is_admin || false;
        const adminBadge = isAdminUser ? '👑' : '';
        const verifiedBadge = isAdminUser ? '✅' : '';
        const adminText = isAdminUser ? '⭐ Подтверждённый аккаунт' : '';
        
        content.innerHTML = `
            <div style="text-align:center;font-size:32px;font-weight:700;color:#1a5276;padding:8px 0;">
                ${data.username || username} ${verifiedBadge} ${adminBadge}
            </div>
            <div style="text-align:center;font-size:14px;color:#7a7a8e;padding:4px 0;">${adminText}</div>
            <div class="profile-field"><span class="label">Telegram ID</span><span class="value">${userId}</span></div>
            <div style="text-align:center;font-size:24px;font-weight:700;color:#1a5276;padding:4px 0;">${data.coins || 0} монет</div>
            <div class="profile-field"><span class="label">Уровень</span><span class="value">${data.level || 1}</span></div>
            <div class="profile-field"><span class="label">Опыт</span><span class="value">${data.exp || 0}/${(data.level || 1) * 1000}</span></div>
            <div class="profile-field"><span class="label">Побед</span><span class="value">${data.wins || 0}</span></div>
            <div class="profile-field"><span class="label">Поражений</span><span class="value">${data.losses || 0}</span></div>
            <div class="profile-field"><span class="label">Рефералов</span><span class="value">${data.referrals || 0}</span></div>
            <div class="profile-field"><span class="label">Депозит</span><span class="value">${data.total_deposit || 0} RUB</span></div>
            <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">
                <button class="case-btn" onclick="showDeposit()">ПОПОЛНИТЬ</button>
                <button class="case-btn" onclick="showReferral()">РЕФЕРАЛЬНАЯ ССЫЛКА</button>
                <button class="case-btn" onclick="showSupport()">ПОДДЕРЖКА</button>
                <button class="case-btn" onclick="showLanguageSettings()">ЯЗЫК</button>
                <button class="case-btn" onclick="logout()">ВЫХОД</button>
            </div>
        `;
        
        if (isAdminUser) {
            document.getElementById('adminPanel').style.display = 'block';
        }
    })
    .catch(err => {
        console.error('Profile error:', err);
        content.innerHTML = '<div style="text-align:center;color:#c0392b;">Ошибка соединения</div>';
    });
}

// ============ НАСТРОЙКИ ЯЗЫКА ============
function showLanguageSettings() {
    showModal('ЯЗЫК / TIL', `
        <div style="display:flex;flex-direction:column;gap:10px;padding:10px 0;">
            <button class="case-btn primary" onclick="setLanguage('ru')">🇷🇺 Русский</button>
            <button class="case-btn" onclick="setLanguage('uz')">🇺🇿 O'zbek</button>
            <button class="case-btn" onclick="closeModal()">ЗАКРЫТЬ</button>
        </div>
    `);
}

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('artdrop_lang', lang);
    updateLanguage();
    closeModal();
    showModal('Готово!', `<div style="text-align:center;color:#1a5276;">Язык изменён на ${lang === 'ru' ? 'Русский' : 'O\'zbek'}</div>`);
}

function showDeposit() {
    showModal('ПОПОЛНЕНИЕ', `
        <div style="text-align:center;">
            <div>Телефон: +7-911-971-41-08</div>
            <div>Получатель: Аэлита.С.</div>
            <div style="color:#1a5276;padding:8px 0;">Курс: 25000 монет = 115 RUB</div>
            <div style="color:#7a7a8e;font-size:14px;">После перевода отправьте чек в поддержку</div>
            <button class="case-btn primary" onclick="closeModal()">ОК</button>
        </div>
    `);
}

function showReferral() {
    const link = `https://artappreb.onrender.com?ref=${userId}`;
    showModal('РЕФЕРАЛЬНАЯ ССЫЛКА', `
        <div style="text-align:center;">
            <div style="word-break:break-all;font-size:14px;padding:8px;background:#f0f2f5;border-radius:8px;">${link}</div>
            <button class="case-btn primary" onclick="copyText('${link}')">КОПИРОВАТЬ</button>
            <button class="case-btn" onclick="closeModal()">ЗАКРЫТЬ</button>
        </div>
    `);
}

function showSupport() {
    showModal('ПОДДЕРЖКА', `
        <div style="text-align:center;">
            <div>Контакты: @ArtCSbotSupp</div>
            <button class="case-btn primary" onclick="closeModal()">ОК</button>
        </div>
    `);
}

function copyText(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    }
    if (tg) tg.HapticFeedback.impactOccurred('light');
    closeModal();
    showModal('СКОПИРОВАНО!', '<div style="text-align:center;color:#1a5276;">Ссылка скопирована!</div>');
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
        document.getElementById('wheelStatus').textContent = `Прокруток сегодня: ${data.wheel_spins || 0}`;
    });
}

function spinWheel() {
    const btn = document.getElementById('spinBtn');
    btn.disabled = true;
    btn.textContent = 'КРУТИМ...';
    if (tg) tg.HapticFeedback.impactOccurred('medium');

    fetch('/api/miniapp_wheel', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: userId})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const prize = data.result;
            // Показываем анимацию колеса
            const anim = new WheelAnimation((result) => {
                let msg = '';
                if (result.type === 'coins') msg = `Вы выиграли ${result.value} монет!`;
                else if (result.type === 'discount') msg = `Вы выиграли ${result.value}% скидку!`;
                else if (result.type === 'case') msg = `Вы выиграли ${result.name}!`;
                showModal('КОЛЕСО', `<div style="text-align:center;font-size:24px;color:#1a5276;">${msg}</div>`);
                loadBalance();
                loadWheelStatus();
            });
        } else {
            showModal('Ошибка', `<div style="text-align:center;color:#c0392b;">${data.error || 'Не удалось крутить'}</div>`);
            btn.disabled = false;
            btn.textContent = 'КРУТНУТЬ';
        }
    })
    .catch(() => {
        btn.disabled = false;
        btn.textContent = 'КРУТНУТЬ';
        showModal('Ошибка', '<div style="text-align:center;color:#c0392b;">Ошибка соединения</div>');
    });
}

// ============ PVP ============
function cyclePvpCase() {
    pvpCaseIndex = (pvpCaseIndex + 1) % pvpCases.length;
    const c = pvpCases[pvpCaseIndex];
    document.getElementById('pvpCaseBtn').textContent = c.label;
}

function findPvpOpponent() {
    const btn = document.getElementById('pvpSearchBtn');
    btn.disabled = true;
    btn.textContent = 'ПОИСК...';
    if (tg) tg.HapticFeedback.impactOccurred('medium');
    document.getElementById('pvpStatus').textContent = 'Поиск соперника...';
    document.getElementById('pvpResult').textContent = '';

    const caseName = pvpCases[pvpCaseIndex].name;
    const price = pvpCases[pvpCaseIndex].price;

    fetch('/api/miniapp_pvp_find', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: userId, case_name: caseName})
    })
    .then(res => res.json())
    .then(data => {
        if (data.waiting) {
            document.getElementById('pvpStatus').textContent = 'Ожидание соперника...';
            let attempts = 0;
            const interval = setInterval(() => {
                attempts++;
                if (attempts > 20) {
                    clearInterval(interval);
                    btn.disabled = false;
                    btn.textContent = 'НАЙТИ СОПЕРНИКА';
                    document.getElementById('pvpStatus').textContent = 'Соперник не найден, попробуйте снова';
                    return;
                }
                fetch(`/api/miniapp_pvp_status?battle_id=${data.battle_id}`)
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
            btn.textContent = 'НАЙТИ СОПЕРНИКА';
            document.getElementById('pvpStatus').textContent = data.error || 'Ошибка';
        }
    })
    .catch(() => {
        btn.disabled = false;
        btn.textContent = 'НАЙТИ СОПЕРНИКА';
        document.getElementById('pvpStatus').textContent = 'Ошибка соединения';
    });
}

function startPvpBattle(battleId) {
    document.getElementById('pvpStatus').textContent = 'Битва начинается...';
    
    fetch('/api/miniapp_pvp_start', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            battle_id: battleId,
            user_id: userId,
            case_name: pvpCases[pvpCaseIndex].name
        })
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('pvpStatus').textContent = `Ваш скин: ${data.skin} (${data.price}💰)`;
        
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (attempts > 30) {
                clearInterval(interval);
                document.getElementById('pvpSearchBtn').disabled = false;
                document.getElementById('pvpSearchBtn').textContent = 'НАЙТИ СОПЕРНИКА';
                document.getElementById('pvpStatus').textContent = 'Таймаут битвы';
                return;
            }
            fetch(`/api/miniapp_pvp_status?battle_id=${battleId}`)
            .then(res => res.json())
            .then(status => {
                if (status.winner_id) {
                    clearInterval(interval);
                    document.getElementById('pvpSearchBtn').disabled = false;
                    document.getElementById('pvpSearchBtn').textContent = 'НАЙТИ СОПЕРНИКА';
                    if (status.winner_id == userId) {
                        document.getElementById('pvpResult').textContent = '🏆 ПОБЕДА! +' + status.price2 + ' монет!';
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

// ============ АЧИВКИ ============
function loadAchievements() {
    const list = document.getElementById('achievementsList');
    list.innerHTML = '<div class="loading">Загрузка...</div>';
    
    fetch(`/api/miniapp_achievements?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.achievements && data.achievements.length > 0) {
            let html = '';
            data.achievements.forEach(ach => {
                const status = ach.done ? '✅' : '🔒';
                html += `
                    <div class="inventory-item">
                        <span>${status} ${ach.name}</span>
                        <span style="color:#1a5276;">+${ach.reward}</span>
                    </div>
                `;
            });
            list.innerHTML = html;
        } else {
            list.innerHTML = '<div style="text-align:center;color:#7a7a8e;padding:30px 0;">Нет достижений</div>';
        }
    })
    .catch(() => {
        list.innerHTML = '<div style="text-align:center;color:#c0392b;padding:30px 0;">Ошибка соединения</div>';
    });
}

// ============ ПРОМОКОДЫ ============
function showPromoModal() {
    showModal('ПРОМОКОД', `
        <div style="text-align:center;padding:10px 0;">
            <div style="color:#7a7a8e;font-size:14px;padding:8px 0;">Введите промокод</div>
            <input type="text" id="promoInput" placeholder="Введите код" style="
                width: 100%;
                padding: 12px;
                border: 2px solid #1a5276;
                border-radius: 12px;
                font-size: 16px;
                margin: 10px 0;
                background: #f5f7fa;
            ">
            <button class="case-btn primary" onclick="activatePromo()">АКТИВИРОВАТЬ</button>
            <button class="case-btn" onclick="closeModal()">ЗАКРЫТЬ</button>
        </div>
    `);
}

function activatePromo() {
    const code = document.getElementById('promoInput').value;
    if (!code) {
        showModal('Ошибка', 'Введите промокод');
        return;
    }
    
    fetch('/api/promo_activate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: userId, code: code})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            closeModal();
            showModal('УСПЕХ!', `<div style="text-align:center;color:#1a5276;">+${data.reward} монет!</div>`);
            loadBalance();
        } else {
            showModal('Ошибка', `<div style="text-align:center;color:#c0392b;">${data.error}</div>`);
        }
    })
    .catch(() => showModal('Ошибка', 'Ошибка соединения'));
}

// ============ АДМИН-ПАНЕЛЬ ============
function loadAdminPanel() {
    const adminFromStorage = localStorage.getItem('isAdmin') === 'true';
    
    if (!isAdmin && !adminFromStorage) {
        document.getElementById('adminContent').innerHTML = '<div style="text-align:center;color:#c0392b;">Доступ запрещён</div>';
        return;
    }
    
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:6px;padding-bottom:20px;">
            <button class="case-btn" onclick="adminUsers()">👥 Список игроков</button>
            <button class="case-btn" onclick="adminGiveCoins()">💰 Выдать монеты</button>
            <button class="case-btn" onclick="adminRemoveCoins()">💸 Списать монеты</button>
            <button class="case-btn" onclick="adminBan()">🔨 Забанить</button>
            <button class="case-btn" onclick="adminUnban()">🔓 Разбанить</button>
            <button class="case-btn" onclick="adminStats()">📊 Статистика</button>
            <button class="case-btn" onclick="adminCreatePromo()">🎫 Создать промокод</button>
            <button class="case-btn" onclick="adminCreatePersonalPromo()">🎫 Личный промокод</button>
            <button class="case-btn" onclick="adminDeactivatePromo()">🚫 Деактивировать промо</button>
            <button class="case-btn" onclick="adminPromoStats()">📊 Статистика промокодов</button>
            <button class="case-btn" onclick="adminForceRemoveItem()">🗑️ Удалить предмет (принудительно)</button>
        </div>
        <div id="adminInfo" style="margin-top:12px;color:#7a7a8e;font-size:13px;max-height:400px;overflow-y:auto;"></div>
    `;
}

// ============ АДМИН-ФУНКЦИИ ============
function adminUsers() {
    fetch('/api/admin/users')
    .then(res => res.json())
    .then(data => {
        let html = '<div style="font-weight:700;color:#1a5276;padding:8px 0;">ИГРОКИ:</div>';
        data.users.slice(0, 50).forEach(u => {
            html += `<div class="inventory-item"><span>${u.username}</span><span>${u.coins}💰</span><span>Lv.${u.level}</span></div>`;
        });
        document.getElementById('adminInfo').innerHTML = html;
    });
}

function adminGiveCoins() {
    const uid = prompt('ID игрока:');
    if (!uid) return;
    const amount = prompt('Сумма:');
    if (!amount) return;
    fetch('/api/admin/give_coins', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid), amount: parseInt(amount)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка';
    });
}

function adminRemoveCoins() {
    const uid = prompt('ID игрока:');
    if (!uid) return;
    const amount = prompt('Сумма:');
    if (!amount) return;
    fetch('/api/admin/remove_coins', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid), amount: parseInt(amount)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Готово!' : '❌ Ошибка';
    });
}

function adminBan() {
    const uid = prompt('ID игрока:');
    if (!uid) return;
    const reason = prompt('Причина:');
    if (!reason) return;
    fetch('/api/admin/ban_user', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid), reason: reason})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Забанен!' : '❌ Ошибка';
    });
}

function adminUnban() {
    const uid = prompt('ID игрока:');
    if (!uid) return;
    fetch('/api/admin/unban_user', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Разбанен!' : '❌ Ошибка';
    });
}

function adminStats() {
    fetch('/api/admin/stats')
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').innerHTML = `
            <div>Игроков: ${data.total_users}</div>
            <div>Монет всего: ${data.total_coins}</div>
            <div>Предметов: ${data.total_items}</div>
        `;
    });
}

function adminCreatePromo() {
    const reward = prompt('Награда (монеты):');
    if (!reward) return;
    const uses = prompt('Количество использований:');
    if (!uses) return;
    fetch('/api/admin/create_promo', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({reward: parseInt(reward), uses: parseInt(uses)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? `✅ Промокод: ${data.code}` : '❌ Ошибка';
    });
}

function adminCreatePersonalPromo() {
    const uid = prompt('ID игрока:');
    if (!uid) return;
    const reward = prompt('Награда (монеты):');
    if (!reward) return;
    fetch('/api/admin/create_personal_promo', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid), reward: parseInt(reward)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? `✅ Личный промокод: ${data.code}` : '❌ Ошибка';
    });
}

function adminDeactivatePromo() {
    const code = prompt('Код промокода:');
    if (!code) return;
    fetch('/api/admin/deactivate_promo', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({code: code})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Деактивирован!' : '❌ Ошибка';
    });
}

function adminPromoStats() {
    fetch('/api/admin/promo_stats')
    .then(res => res.json())
    .then(data => {
        let html = '<div style="font-weight:700;color:#1a5276;padding:8px 0;">ПРОМОКОДЫ:</div>';
        data.promos.slice(0, 20).forEach(p => {
            html += `<div class="inventory-item"><span>${p.code}</span><span>${p.reward}💰</span><span>осталось: ${p.uses_left}</span></div>`;
        });
        document.getElementById('adminInfo').innerHTML = html;
    });
}

function adminForceRemoveItem() {
    const itemId = prompt('ID предмета:');
    if (!itemId) return;
    fetch('/api/admin/force_remove_item', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({item_id: parseInt(itemId)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Предмет удалён!' : '❌ Ошибка';
    });
}
