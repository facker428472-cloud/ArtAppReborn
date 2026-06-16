// static/js/app.js

// ============ ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ============
let userId = null;
let username = null;
let isAdmin = false;
let currentCase = 'bomj';
let pvpCaseIndex = 0;
let pvpCases = [
    {name: 'bomj', label: 'BOMJ (500)', price: 500},
    {name: 'berkut', label: 'BERKUT (1500)', price: 1500},
    {name: 'champion', label: 'CHAMPION (5000)', price: 5000}
];
let tg = window.Telegram ? window.Telegram.WebApp : null;

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
    
    loginOrRegister(userId, username);
});

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
            }
            
            loadBalance();
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
    if (tg) tg.HapticFeedback.impactOccurred('light');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

function showModal(title, content) {
    document.getElementById('modalBody').innerHTML = `<div class="modal-title">${title}</div>${content}`;
    document.getElementById('modal').classList.add('active');
}

// ============ КЕЙСЫ ============
function loadCases() {
    const list = document.getElementById('casesList');
    list.innerHTML = `
        <button class="case-btn" onclick="openCase('bomj', 500)">
            <div style="font-weight:700;">BOMJ</div>
            <div style="font-size:14px;color:#7a7a8e;">500 coins</div>
        </button>
        <button class="case-btn" onclick="openCase('berkut', 1500)">
            <div style="font-weight:700;">BERKUT</div>
            <div style="font-size:14px;color:#7a7a8e;">1500 coins</div>
        </button>
        <button class="case-btn" onclick="openCase('champion', 5000)">
            <div style="font-weight:700;">CHAMPION</div>
            <div style="font-size:14px;color:#7a7a8e;">5000 coins</div>
        </button>
    `;
}

function openCase(caseName, price) {
    if (tg) tg.HapticFeedback.impactOccurred('medium');
    
    showModal('OPENING CASE', `<div class="case-animation"><span class="icon">🎲</span><div style="color:#7a7a8e;">Opening...</div></div>`);
    
    fetch(`/api/miniapp_profile?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.coins < price) {
            showModal('Error', `<div style="text-align:center;color:#c0392b;">Need ${price} coins, you have ${data.coins}</div>`);
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
                showModal('SUCCESS!', `
                    <div style="text-align:center;padding:10px 0;">
                        <div style="font-size:40px;margin:10px 0;">🎉</div>
                        <div style="font-size:20px;font-weight:700;color:#1a5276;">YOU GOT!</div>
                        <div style="font-size:16px;font-weight:600;padding:8px 0;">${data.item}</div>
                        <div style="font-size:16px;color:#1a5276;">+${data.price} coins</div>
                        <div style="display:flex;gap:10px;margin-top:16px;">
                            <button class="case-btn" onclick="closeModal();openCase('${caseName}',${price})" style="flex:1;">OPEN AGAIN</button>
                            <button class="case-btn primary" onclick="closeModal()" style="flex:1;">OK</button>
                        </div>
                    </div>
                `);
                loadBalance();
            } else {
                showModal('Error', `<div style="text-align:center;color:#c0392b;">${data.error || 'Failed to open case'}</div>`);
            }
        });
    });
}

// ============ ИНВЕНТАРЬ ============
function loadInventory() {
    const list = document.getElementById('inventoryList');
    list.innerHTML = '<div class="loading">Loading...</div>';
    
    fetch(`/api/miniapp_inventory?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        if (data.items && data.items.length > 0) {
            let html = '';
            let total = 0;
            data.items.forEach(item => {
                html += `
                    <div class="inventory-item">
                        <span class="name">${item.name}</span>
                        <span class="price">${item.price}💰</span>
                        <div class="actions">
                            <button class="btn-sell" onclick="sellItem(${item.id}, ${item.price})">SELL</button>
                            <button class="btn-withdraw" onclick="withdrawItem(${item.id}, '${item.name}', ${item.price})">WITHDRAW</button>
                        </div>
                    </div>
                `;
                total += item.price;
            });
            html += `
                <div style="padding:12px;text-align:center;">
                    <button class="case-btn primary" onclick="sellAll()">SELL ALL (${total}💰)</button>
                </div>
            `;
            list.innerHTML = html;
        } else {
            list.innerHTML = '<div style="text-align:center;color:#7a7a8e;padding:30px 0;">No items! Open some cases!</div>';
        }
    })
    .catch(() => {
        list.innerHTML = '<div style="text-align:center;color:#c0392b;padding:30px 0;">Connection error</div>';
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
            showModal('SOLD', `<div style="text-align:center;color:#1a5276;">+${price} coins</div>`);
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
            showModal('SOLD ALL', `<div style="text-align:center;color:#1a5276;">+${data.total} coins for ${data.count} items</div>`);
        }
    });
}

function withdrawItem(itemId, name, price) {
    showModal('WITHDRAW', `<div style="text-align:center;">
        <div>Withdraw ${name}</div>
        <div style="color:#1a5276;padding:8px 0;">${price} coins</div>
        <div style="color:#7a7a8e;font-size:14px;padding:8px 0;">Contact support: @ArtCSbotSupp</div>
        <button class="case-btn primary" onclick="closeModal()">OK</button>
    </div>`);
}

// ============ ПРОФИЛЬ ============
function loadProfile() {
    const content = document.getElementById('profileContent');
    content.innerHTML = '<div class="loading">Loading...</div>';
    
    if (!userId) {
        content.innerHTML = '<div style="text-align:center;color:#c0392b;">Please login</div>';
        return;
    }
    
    fetch(`/api/miniapp_profile?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        console.log('Profile data:', data);
        
        if (data.error) {
            content.innerHTML = `<div style="text-align:center;color:#c0392b;">Error: ${data.error}</div>`;
            return;
        }
        
        content.innerHTML = `
            <div style="text-align:center;font-size:32px;font-weight:700;color:#1a5276;padding:8px 0;">${data.username || username}</div>
            <div class="profile-field"><span class="label">Telegram ID</span><span class="value">${userId}</span></div>
            <div style="text-align:center;font-size:24px;font-weight:700;color:#1a5276;padding:4px 0;">${data.coins || 0} coins</div>
            <div class="profile-field"><span class="label">Level</span><span class="value">${data.level || 1}</span></div>
            <div class="profile-field"><span class="label">XP</span><span class="value">${data.exp || 0}/${(data.level || 1) * 1000}</span></div>
            <div class="profile-field"><span class="label">PVP Wins</span><span class="value">${data.wins || 0}</span></div>
            <div class="profile-field"><span class="label">PVP Losses</span><span class="value">${data.losses || 0}</span></div>
            <div class="profile-field"><span class="label">Referrals</span><span class="value">${data.referrals || 0}</span></div>
            <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">
                <button class="case-btn" onclick="showDeposit()">DEPOSIT</button>
                <button class="case-btn" onclick="showReferral()">REFERRAL LINK</button>
                <button class="case-btn" onclick="showSupport()">SUPPORT</button>
                <button class="case-btn" onclick="logout()">LOGOUT</button>
            </div>
        `;
    })
    .catch(err => {
        console.error('Profile error:', err);
        content.innerHTML = '<div style="text-align:center;color:#c0392b;">Connection error</div>';
    });
}

function showDeposit() {
    showModal('DEPOSIT', `
        <div style="text-align:center;">
            <div>Phone: +7-911-971-41-08</div>
            <div>Receiver: Аэлита.С.</div>
            <div style="color:#1a5276;padding:8px 0;">Rate: 25000 coins = 115 RUB</div>
            <div style="color:#7a7a8e;font-size:14px;">After transfer send receipt to support</div>
            <button class="case-btn primary" onclick="closeModal()">OK</button>
        </div>
    `);
}

function showReferral() {
    const link = `https://artappreb.onrender.com?ref=${userId}`;
    showModal('REFERRAL LINK', `
        <div style="text-align:center;">
            <div style="word-break:break-all;font-size:14px;padding:8px;background:#f0f2f5;border-radius:8px;">${link}</div>
            <button class="case-btn primary" onclick="copyText('${link}')">COPY</button>
            <button class="case-btn" onclick="closeModal()">CLOSE</button>
        </div>
    `);
}

function showSupport() {
    showModal('SUPPORT', `
        <div style="text-align:center;">
            <div>Contacts: @ArtCSbotSupp</div>
            <button class="case-btn primary" onclick="closeModal()">OK</button>
        </div>
    `);
}

function copyText(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text);
    }
    if (tg) tg.HapticFeedback.impactOccurred('light');
    closeModal();
    showModal('COPIED', '<div style="text-align:center;color:#1a5276;">Link copied to clipboard!</div>');
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
        document.getElementById('wheelStatus').textContent = `Spins left: ${data.wheel_spins || 0}`;
    });
}

function spinWheel() {
    const btn = document.getElementById('spinBtn');
    btn.disabled = true;
    btn.textContent = 'SPINNING...';
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
            let msg = '';
            if (prize.coins) msg = `You won ${prize.coins} coins!`;
            else if (prize.discount) msg = `You won ${prize.discount}% discount!`;
            else if (prize.case) msg = `You won ${prize.case} case!`;
            showModal('WHEEL', `<div style="text-align:center;font-size:24px;color:#1a5276;">${msg}</div>`);
            loadBalance();
            loadWheelStatus();
        } else {
            showModal('Error', `<div style="text-align:center;color:#c0392b;">${data.error || 'Failed to spin'}</div>`);
        }
        btn.disabled = false;
        btn.textContent = 'SPIN';
    })
    .catch(() => {
        btn.disabled = false;
        btn.textContent = 'SPIN';
        showModal('Error', '<div style="text-align:center;color:#c0392b;">Connection error</div>');
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
    btn.textContent = 'SEARCHING...';
    if (tg) tg.HapticFeedback.impactOccurred('medium');
    document.getElementById('pvpStatus').textContent = 'Searching for opponent...';
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
            document.getElementById('pvpStatus').textContent = 'Waiting for opponent...';
            let attempts = 0;
            const interval = setInterval(() => {
                attempts++;
                if (attempts > 20) {
                    clearInterval(interval);
                    btn.disabled = false;
                    btn.textContent = 'FIND OPPONENT';
                    document.getElementById('pvpStatus').textContent = 'No opponent found, try again';
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
            btn.textContent = 'FIND OPPONENT';
            document.getElementById('pvpStatus').textContent = data.error || 'Error';
        }
    })
    .catch(() => {
        btn.disabled = false;
        btn.textContent = 'FIND OPPONENT';
        document.getElementById('pvpStatus').textContent = 'Connection error';
    });
}

function startPvpBattle(battleId) {
    document.getElementById('pvpStatus').textContent = 'Battle starting...';
    
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
        document.getElementById('pvpStatus').textContent = `Your skin: ${data.skin} (${data.price}💰)`;
        
        let attempts = 0;
        const interval = setInterval(() => {
            attempts++;
            if (attempts > 30) {
                clearInterval(interval);
                document.getElementById('pvpSearchBtn').disabled = false;
                document.getElementById('pvpSearchBtn').textContent = 'FIND OPPONENT';
                document.getElementById('pvpStatus').textContent = 'Battle timeout';
                return;
            }
            fetch(`/api/miniapp_pvp_status?battle_id=${battleId}`)
            .then(res => res.json())
            .then(status => {
                if (status.winner_id) {
                    clearInterval(interval);
                    document.getElementById('pvpSearchBtn').disabled = false;
                    document.getElementById('pvpSearchBtn').textContent = 'FIND OPPONENT';
                    if (status.winner_id == userId) {
                        document.getElementById('pvpResult').textContent = 'VICTORY! +' + status.price2 + ' coins!';
                        loadBalance();
                    } else {
                        document.getElementById('pvpResult').textContent = 'DEFEAT! You lost your skin';
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
    list.innerHTML = '<div class="loading">Loading...</div>';
    
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
            list.innerHTML = '<div style="text-align:center;color:#7a7a8e;padding:30px 0;">No achievements yet</div>';
        }
    })
    .catch(() => {
        list.innerHTML = '<div style="text-align:center;color:#c0392b;padding:30px 0;">Connection error</div>';
    });
}

// ============ АДМИН-ПАНЕЛЬ (60+ ФУНКЦИЙ) ============
function loadAdminPanel() {
    if (!isAdmin) {
        document.getElementById('adminContent').innerHTML = '<div style="text-align:center;color:#c0392b;">Access denied</div>';
        return;
    }
    
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:6px;padding-bottom:20px;">
            <button class="case-btn" onclick="adminUsers()">👥 Users List</button>
            <button class="case-btn" onclick="adminGiveCoins()">💰 Give Coins</button>
            <button class="case-btn" onclick="adminRemoveCoins()">💸 Remove Coins</button>
            <button class="case-btn" onclick="adminRemoveDeposit()">💸 Remove Deposit</button>
            <button class="case-btn" onclick="adminSimulateDeposit()">💵 Simulate Deposit</button>
            <button class="case-btn" onclick="adminSetCoinRate()">📊 Set Coin Rate</button>
            <button class="case-btn" onclick="adminGiveItem()">🎁 Give Item</button>
            <button class="case-btn" onclick="adminRemoveItem()">🗑️ Remove Item</button>
            <button class="case-btn" onclick="adminGiveCase()">📦 Give Case</button>
            <button class="case-btn" onclick="adminSetCasePrice()">💲 Case Price</button>
            <button class="case-btn" onclick="adminSetCaseChance()">🎲 Case Chance</button>
            <button class="case-btn" onclick="adminToggleCase()">🔘 Toggle Case</button>
            <button class="case-btn" onclick="adminGiveSpins()">🎡 Give Spins</button>
            <button class="case-btn" onclick="adminGiveDiscount()">🏷️ Give Discount</button>
            <button class="case-btn" onclick="adminResetWinrate()">📉 Reset Winrate</button>
            <button class="case-btn" onclick="adminResetInventory()">🗑️ Reset Inventory</button>
            <button class="case-btn" onclick="adminResetProgress()">🔄 Reset Progress</button>
            <button class="case-btn" onclick="adminResetQuiz()">📚 Reset Quiz</button>
            <button class="case-btn" onclick="adminBan()">🔨 Ban User</button>
            <button class="case-btn" onclick="adminUnban()">🔓 Unban User</button>
            <button class="case-btn" onclick="adminFreeze()">❄️ Freeze User</button>
            <button class="case-btn" onclick="adminUnfreeze()">🔥 Unfreeze User</button>
            <button class="case-btn" onclick="adminGiveXP()">⭐ Give XP</button>
            <button class="case-btn" onclick="adminRemoveXP()">⭐ Remove XP</button>
            <button class="case-btn" onclick="adminGiveLevel()">📈 Give Level</button>
            <button class="case-btn" onclick="adminRemoveLevel()">📉 Remove Level</button>
            <button class="case-btn" onclick="adminGivePrime()">💎 Give Prime</button>
            <button class="case-btn" onclick="adminRemovePrime()">💎 Remove Prime</button>
            <button class="case-btn" onclick="adminCreatePromo()">🎫 Create Promo</button>
            <button class="case-btn" onclick="adminCreatePersonalPromo()">🎫 Personal Promo</button>
            <button class="case-btn" onclick="adminDeactivatePromo()">🚫 Deactivate Promo</button>
            <button class="case-btn" onclick="adminPromoStats()">📊 Promo Stats</button>
            <button class="case-btn" onclick="adminWithdrawals()">📤 Withdrawals</button>
            <button class="case-btn" onclick="adminAcceptWithdraw()">✅ Accept Withdraw</button>
            <button class="case-btn" onclick="adminRejectWithdraw()">❌ Reject Withdraw</button>
            <button class="case-btn" onclick="adminBroadcast()">📢 Broadcast</button>
            <button class="case-btn" onclick="adminPersonalBroadcast()">📨 Personal Broadcast</button>
            <button class="case-btn" onclick="adminTogglePVP()">⚔️ Toggle PVP</button>
            <button class="case-btn" onclick="adminToggleReferrals()">👥 Toggle Referrals</button>
            <button class="case-btn" onclick="adminToggleWithdraw()">📤 Toggle Withdraw</button>
            <button class="case-btn" onclick="adminToggleWheel()">🎡 Toggle Wheel</button>
            <button class="case-btn" onclick="adminToggleAchievements()">🏆 Toggle Achievements</button>
            <button class="case-btn" onclick="adminActiveUsers()">🟢 Active Users</button>
            <button class="case-btn" onclick="adminViewInventory()">👁️ View Inventory</button>
            <button class="case-btn" onclick="adminViewProfile()">👤 View Profile</button>
            <button class="case-btn" onclick="adminDepositHistory()">📜 Deposit History</button>
            <button class="case-btn" onclick="adminExportCSV()">📁 Export CSV</button>
            <button class="case-btn" onclick="adminResetTradeLink()">🔗 Reset Trade Link</button>
            <button class="case-btn" onclick="adminRestart()">🔁 Restart Server</button>
        </div>
        <div id="adminInfo" style="margin-top:12px;color:#7a7a8e;font-size:13px;max-height:400px;overflow-y:auto;"></div>
    `;
}

// ============ АДМИН-ФУНКЦИИ ============

function adminUsers() {
    fetch('/api/admin/users')
    .then(res => res.json())
    .then(data => {
        let html = '<div style="font-weight:700;color:#1a5276;padding:8px 0;">USERS:</div>';
        data.users.slice(0, 50).forEach(u => {
            html += `<div class="inventory-item"><span>${u.username}</span><span>${u.coins}💰</span><span>Lv.${u.level}</span></div>`;
        });
        document.getElementById('adminInfo').innerHTML = html;
    });
}

function adminGiveCoins() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    const amount = prompt('Enter amount:');
    if (!amount) return;
    fetch('/api/admin/give_coins', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid), amount: parseInt(amount)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Done!' : '❌ Error';
    });
}

function adminRemoveCoins() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    const amount = prompt('Enter amount:');
    if (!amount) return;
    fetch('/api/admin/remove_coins', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid), amount: parseInt(amount)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Done!' : '❌ Error';
    });
}

function adminRemoveDeposit() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    const amount = prompt('Enter amount (RUB):');
    if (!amount) return;
    fetch('/api/admin/remove_deposit', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid), amount: parseInt(amount)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Done!' : '❌ Error';
    });
}

function adminSimulateDeposit() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    const amount = prompt('Enter amount (RUB):');
    if (!amount) return;
    const discount = prompt('Enter discount %:');
    if (!discount) return;
    fetch('/api/admin/simulate_deposit', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid), amount: parseInt(amount), discount: parseInt(discount)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? `✅ Done! +${data.coins} coins` : '❌ Error';
    });
}

function adminSetCoinRate() {
    const rate = prompt('Enter coin rate (1 RUB = X coins):');
    if (!rate) return;
    fetch('/api/admin/set_coin_rate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({rate: parseInt(rate)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Done!' : '❌ Error';
    });
}

function adminGiveItem() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    const name = prompt('Enter item name:');
    if (!name) return;
    const price = prompt('Enter item price:');
    if (!price) return;
    fetch('/api/admin/give_item', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid), item_name: name, item_price: parseInt(price)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Done!' : '❌ Error';
    });
}

function adminRemoveItem() {
    const iid = prompt('Enter item ID:');
    if (!iid) return;
    fetch('/api/admin/remove_item', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({item_id: parseInt(iid)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Done!' : '❌ Error';
    });
}

function adminGiveCase() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    const caseName = prompt('Enter case (bomj/berkut/champion):');
    if (!caseName) return;
    fetch('/api/admin/give_case', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid), case_name: caseName})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? `✅ Done! ${data.item} (${data.price} coins)` : '❌ Error';
    });
}

function adminSetCasePrice() {
    const caseName = prompt('Enter case (bomj/berkut/champion):');
    if (!caseName) return;
    const price = prompt('Enter new price:');
    if (!price) return;
    fetch('/api/admin/set_case_price', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({case_name: caseName, price: parseInt(price)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Done!' : '❌ Error';
    });
}

function adminSetCaseChance() {
    const caseName = prompt('Enter case (bomj/berkut/champion):');
    if (!caseName) return;
    const chance = prompt('Enter jackpot chance %:');
    if (!chance) return;
    fetch('/api/admin/set_case_chance', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({case_name: caseName, jackpot_chance: parseFloat(chance)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Done!' : '❌ Error';
    });
}

function adminToggleCase() {
    const caseName = prompt('Enter case (bomj/berkut/champion):');
    if (!caseName) return;
    fetch('/api/admin/toggle_case', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({case_name: caseName})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? `✅ Done! Case is ${data.is_active ? 'active' : 'inactive'}` : '❌ Error';
    });
}

function adminGiveSpins() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    const spins = prompt('Enter number of spins:');
    if (!spins) return;
    fetch('/api/admin/give_spins', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid), spins: parseInt(spins)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Done!' : '❌ Error';
    });
}

function adminGiveDiscount() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    const discount = prompt('Enter discount % (5,10,15,25):');
    if (!discount) return;
    fetch('/api/admin/give_discount', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid), discount: parseInt(discount)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Done!' : '❌ Error';
    });
}

function adminResetWinrate() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    fetch('/api/admin/reset_winrate', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Done!' : '❌ Error';
    });
}

function adminResetInventory() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    if (!confirm('Delete all items for this user?')) return;
    fetch('/api/admin/reset_inventory', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Done!' : '❌ Error';
    });
}

function adminResetProgress() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    if (!confirm('Reset all progress for this user?')) return;
    fetch('/api/admin/reset_progress', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Done!' : '❌ Error';
    });
}

function adminResetQuiz() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    fetch('/api/admin/reset_quiz', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Done!' : '❌ Error';
    });
}

function adminBan() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    const reason = prompt('Enter ban reason:');
    if (!reason) return;
    fetch('/api/admin/ban_user', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid), reason: reason})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Banned!' : '❌ Error';
    });
}

function adminUnban() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    fetch('/api/admin/unban_user', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Unbanned!' : '❌ Error';
    });
}

function adminFreeze() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    fetch('/api/admin/freeze_user', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Frozen!' : '❌ Error';
    });
}

function adminUnfreeze() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    fetch('/api/admin/unfreeze_user', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Unfrozen!' : '❌ Error';
    });
}

function adminGiveXP() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    const xp = prompt('Enter amount of XP:');
    if (!xp) return;
    fetch('/api/admin/give_xp', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid), xp: parseInt(xp)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Done!' : '❌ Error';
    });
}

function adminRemoveXP() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    const xp = prompt('Enter amount of XP to remove:');
    if (!xp) return;
    fetch('/api/admin/remove_xp', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid), xp: parseInt(xp)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Done!' : '❌ Error';
    });
}

function adminGiveLevel() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    const level = prompt('Enter level to set:');
    if (!level) return;
    fetch('/api/admin/give_level', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid), level: parseInt(level)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Done!' : '❌ Error';
    });
}

function adminRemoveLevel() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    fetch('/api/admin/remove_level', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Done!' : '❌ Error';
    });
}

function adminGivePrime() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    fetch('/api/admin/give_prime', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Prime given!' : '❌ Error';
    });
}

function adminRemovePrime() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    fetch('/api/admin/remove_prime', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Prime removed!' : '❌ Error';
    });
}

function adminCreatePromo() {
    const reward = prompt('Enter reward (coins):');
    if (!reward) return;
    const uses = prompt('Enter number of uses:');
    if (!uses) return;
    fetch('/api/admin/create_promo', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({reward: parseInt(reward), uses: parseInt(uses)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? `✅ Promo created: ${data.code}` : '❌ Error';
    });
}

function adminCreatePersonalPromo() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    const reward = prompt('Enter reward (coins):');
    if (!reward) return;
    fetch('/api/admin/create_personal_promo', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid), reward: parseInt(reward)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? `✅ Personal promo: ${data.code}` : '❌ Error';
    });
}

function adminDeactivatePromo() {
    const code = prompt('Enter promo code:');
    if (!code) return;
    fetch('/api/admin/deactivate_promo', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({code: code})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Deactivated!' : '❌ Error';
    });
}

function adminPromoStats() {
    fetch('/api/admin/promo_stats')
    .then(res => res.json())
    .then(data => {
        let html = '<div style="font-weight:700;color:#1a5276;padding:8px 0;">PROMOCODES:</div>';
        data.promos.slice(0, 20).forEach(p => {
            html += `<div class="inventory-item"><span>${p.code}</span><span>${p.reward}💰</span><span>left: ${p.uses_left}</span></div>`;
        });
        document.getElementById('adminInfo').innerHTML = html;
    });
}

function adminWithdrawals() {
    fetch('/api/admin/withdraw_requests')
    .then(res => res.json())
    .then(data => {
        let html = '<div style="font-weight:700;color:#1a5276;padding:8px 0;">WITHDRAW REQUESTS:</div>';
        data.requests.slice(0, 20).forEach(r => {
            html += `<div class="inventory-item"><span>${r.username}</span><span>${r.item}</span><span>${r.price}💰</span></div>`;
        });
        document.getElementById('adminInfo').innerHTML = html;
    });
}

function adminAcceptWithdraw() {
    const rid = prompt('Enter request ID:');
    if (!rid) return;
    fetch('/api/admin/accept_withdraw', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({request_id: parseInt(rid)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Accepted!' : '❌ Error';
    });
}

function adminRejectWithdraw() {
    const rid = prompt('Enter request ID:');
    if (!rid) return;
    fetch('/api/admin/reject_withdraw', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({request_id: parseInt(rid)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Rejected!' : '❌ Error';
    });
}

function adminBroadcast() {
    const msg = prompt('Enter message to broadcast:');
    if (!msg) return;
    fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({message: msg})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? `✅ Sent to ${data.count} users!` : '❌ Error';
    });
}

function adminPersonalBroadcast() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    const msg = prompt('Enter message:');
    if (!msg) return;
    fetch('/api/admin/personal_broadcast', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid), message: msg})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Sent!' : '❌ Error';
    });
}

function adminTogglePVP() {
    fetch('/api/admin/toggle_pvp', {method: 'POST'})
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? `✅ PVP is ${data.enabled ? 'enabled' : 'disabled'}` : '❌ Error';
    });
}

function adminToggleReferrals() {
    fetch('/api/admin/toggle_referrals', {method: 'POST'})
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? `✅ Referrals are ${data.enabled ? 'enabled' : 'disabled'}` : '❌ Error';
    });
}

function adminToggleWithdraw() {
    fetch('/api/admin/toggle_withdraw', {method: 'POST'})
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? `✅ Withdraw is ${data.enabled ? 'enabled' : 'disabled'}` : '❌ Error';
    });
}

function adminToggleWheel() {
    fetch('/api/admin/toggle_wheel', {method: 'POST'})
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? `✅ Wheel is ${data.enabled ? 'enabled' : 'disabled'}` : '❌ Error';
    });
}

function adminToggleAchievements() {
    fetch('/api/admin/toggle_achievements', {method: 'POST'})
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? `✅ Achievements are ${data.enabled ? 'enabled' : 'disabled'}` : '❌ Error';
    });
}

function adminActiveUsers() {
    fetch('/api/admin/active_users')
    .then(res => res.json())
    .then(data => {
        let html = '<div style="font-weight:700;color:#1a5276;padding:8px 0;">ACTIVE USERS (last 10 min):</div>';
        data.users.slice(0, 30).forEach(u => {
            html += `<div class="inventory-item"><span>${u.username}</span><span>${u.last_activity}</span></div>`;
        });
        document.getElementById('adminInfo').innerHTML = html;
    });
}

function adminViewInventory() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    fetch(`/api/admin/view_inventory/${parseInt(uid)}`)
    .then(res => res.json())
    .then(data => {
        let html = `<div style="font-weight:700;color:#1a5276;padding:8px 0;">INVENTORY for user ${uid}:</div>`;
        data.items.slice(0, 30).forEach(i => {
            html += `<div class="inventory-item"><span>${i.name}</span><span>${i.price}💰</span></div>`;
        });
        document.getElementById('adminInfo').innerHTML = html;
    });
}

function adminViewProfile() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    fetch(`/api/admin/view_profile/${parseInt(uid)}`)
    .then(res => res.json())
    .then(data => {
        if (data.error) {
            document.getElementById('adminInfo').textContent = '❌ ' + data.error;
            return;
        }
        document.getElementById('adminInfo').innerHTML = `
            <div style="font-weight:700;color:#1a5276;padding:8px 0;">PROFILE ${data.username}:</div>
            <div>💰 Coins: ${data.coins}</div>
            <div>⭐ Level: ${data.level}</div>
            <div>📊 XP: ${data.exp}</div>
            <div>🏆 Wins: ${data.wins}</div>
            <div>💔 Losses: ${data.losses}</div>
            <div>💳 Deposit: ${data.deposit} RUB</div>
            <div>📤 Withdrawn: ${data.withdrawn}</div>
            <div>👥 Referrals: ${data.referrals}</div>
            <div>🔐 Prime: ${data.prime_expires || 'No'}</div>
            <div>🔨 Banned: ${data.is_banned ? 'Yes' : 'No'}</div>
            <div>❄️ Frozen: ${data.is_frozen ? 'Yes' : 'No'}</div>
        `;
    });
}

function adminDepositHistory() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    fetch(`/api/admin/deposit_history/${parseInt(uid)}`)
    .then(res => res.json())
    .then(data => {
        let html = `<div style="font-weight:700;color:#1a5276;padding:8px 0;">DEPOSIT HISTORY for user ${uid}:</div>`;
        data.deposits.slice(0, 20).forEach(d => {
            html += `<div class="inventory-item"><span>${d.amount} RUB</span><span>discount: ${d.discount}%</span><span>${d.date}</span></div>`;
        });
        document.getElementById('adminInfo').innerHTML = html;
    });
}

function adminExportCSV() {
    window.open('/api/admin/export_users_csv', '_blank');
    document.getElementById('adminInfo').textContent = '📁 CSV file downloaded!';
}

function adminResetTradeLink() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    fetch('/api/admin/reset_tradelink', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid)})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Done!' : '❌ Error';
    });
}

function adminRestart() {
    if (!confirm('Restart server?')) return;
    fetch('/api/admin/restart', {method: 'POST'})
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = '🔄 Server restarting...';
    });
}
