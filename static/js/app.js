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
    if (tg) {
        const user = tg.initDataUnsafe.user;
        if (user) {
            userId = user.id;
            username = user.username || user.first_name || 'player';
            loginOrRegister(userId, username);
        }
        tg.ready();
        tg.expand();
    } else {
        // Тестовый режим в браузере
        userId = 12345;
        username = 'test_user';
        loginOrRegister(userId, username);
    }
    loadBalance();
});

// ============ ФУНКЦИИ ============
function loginOrRegister(uid, uname) {
    fetch('/api/miniapp_login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: uid, username: uname})
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            userId = data.user_id;
            username = data.username;
            isAdmin = data.is_admin || false;
            if (isAdmin) {
                document.getElementById('adminPanel').style.display = 'block';
            }
            loadBalance();
        }
    })
    .catch(err => console.error('Login error:', err));
}

function loadBalance() {
    fetch(`/api/miniapp_profile?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        const coins = data.coins || 0;
        document.querySelectorAll('.balance span:last-child').forEach(el => {
            el.textContent = coins;
        });
    })
    .catch(() => {});
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
    
    fetch(`/api/miniapp_profile?user_id=${userId}`)
    .then(res => res.json())
    .then(data => {
        content.innerHTML = `
            <div style="text-align:center;font-size:32px;font-weight:700;color:#1a5276;padding:8px 0;">${username}</div>
            <div style="text-align:center;font-size:24px;font-weight:700;color:#1a5276;padding:4px 0;">${data.coins} coins</div>
            <div class="profile-field"><span class="label">Level</span><span class="value">${data.level}</span></div>
            <div class="profile-field"><span class="label">XP</span><span class="value">${data.exp}/${data.level * 1000}</span></div>
            <div class="profile-field"><span class="label">PVP Wins</span><span class="value">${data.wins}</span></div>
            <div class="profile-field"><span class="label">PVP Losses</span><span class="value">${data.losses}</span></div>
            <div class="profile-field"><span class="label">Referrals</span><span class="value">${data.referrals || 0}</span></div>
            <div style="margin-top:12px;display:flex;flex-direction:column;gap:8px;">
                <button class="case-btn" onclick="showDeposit()">DEPOSIT</button>
                <button class="case-btn" onclick="showReferral()">REFERRAL LINK</button>
                <button class="case-btn" onclick="showSupport()">SUPPORT</button>
                <button class="case-btn" onclick="logout()">LOGOUT</button>
            </div>
        `;
    })
    .catch(() => {
        content.innerHTML = '<div style="text-align:center;color:#c0392b;padding:30px 0;">Connection error</div>';
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
    const link = `https://appartdropservice250734382.onrender.com/api/register?ref=${userId}`;
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

// ============ АДМИНКА ============
function loadAdminPanel() {
    if (!isAdmin) {
        document.getElementById('adminContent').innerHTML = '<div style="text-align:center;color:#c0392b;">Access denied</div>';
        return;
    }
    const content = document.getElementById('adminContent');
    content.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:6px;">
            <button class="case-btn" onclick="adminUsers()">Users List</button>
            <button class="case-btn" onclick="adminGiveCoins()">Give Coins</button>
            <button class="case-btn" onclick="adminRemoveCoins()">Remove Coins</button>
            <button class="case-btn" onclick="adminBan()">Ban User</button>
            <button class="case-btn" onclick="adminUnban()">Unban User</button>
            <button class="case-btn" onclick="adminStats()">Statistics</button>
        </div>
        <div id="adminInfo" style="margin-top:12px;color:#7a7a8e;font-size:13px;"></div>
    `;
}

function adminUsers() {
    fetch('/api/admin/users')
    .then(res => res.json())
    .then(data => {
        let html = '';
        data.users.slice(0, 20).forEach(u => {
            html += `<div class="inventory-item"><span>${u.username}</span><span>${u.coins}💰</span></div>`;
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
        document.getElementById('adminInfo').textContent = data.success ? '✅ Done!' : 'Error';
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
        document.getElementById('adminInfo').textContent = data.success ? '✅ Done!' : 'Error';
    });
}

function adminBan() {
    const uid = prompt('Enter user ID:');
    if (!uid) return;
    const reason = prompt('Enter reason:');
    if (!reason) return;
    fetch('/api/admin/ban_user', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({user_id: parseInt(uid), reason: reason})
    })
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').textContent = data.success ? '✅ Banned!' : 'Error';
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
        document.getElementById('adminInfo').textContent = data.success ? '✅ Unbanned!' : 'Error';
    });
}

function adminStats() {
    fetch('/api/admin/stats')
    .then(res => res.json())
    .then(data => {
        document.getElementById('adminInfo').innerHTML = `
            <div>Users: ${data.total_users}</div>
            <div>Total Coins: ${data.total_coins}</div>
            <div>Items: ${data.total_items}</div>
            <div>Deposits: ${data.total_deposit} RUB</div>
        `;
    });
}
