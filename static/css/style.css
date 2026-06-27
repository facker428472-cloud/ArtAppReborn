/* ============ ОСНОВНЫЕ СТИЛИ ============ */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #0a0a0a;
    color: #ffffff;
    min-height: 100vh;
    overflow-x: hidden;
    padding: 0;
    margin: 0;
}

/* ============ ЭКРАН СОГЛАШЕНИЯ ============ */
#terms-screen {
    display: none;
    flex-direction: column;
    padding: 20px;
    height: 100vh;
    background: #0a0a0a;
    overflow-y: auto;
    color: #fff;
}

#terms-screen.active {
    display: flex;
}

.terms-content {
    background: rgba(255, 255, 255, 0.02);
    border-radius: 16px;
    padding: 20px;
    border: 1px solid rgba(255, 215, 0, 0.1);
    flex: 1;
    overflow-y: auto;
    font-size: 13px;
    color: #c0c0c0;
    line-height: 1.8;
    margin-bottom: 15px;
}

.terms-content .section-title {
    font-weight: 700;
    color: #ffd700;
    font-size: 16px;
    margin: 15px 0 10px 0;
}

.terms-content .section-title:first-child {
    margin-top: 0;
}

.terms-content .text {
    margin-bottom: 12px;
}

.terms-checkbox {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
}

.terms-checkbox input[type="checkbox"] {
    width: 20px;
    height: 20px;
    accent-color: #ffd700;
    cursor: pointer;
}

.terms-checkbox label {
    color: #c0c0c0;
    font-size: 14px;
    cursor: pointer;
}

.terms-btn {
    margin-top: 5px;
}

/* ============ ХЕДЕР ============ */
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px 16px 16px;
    border-bottom: 1px solid rgba(255, 215, 0, 0.15);
}

.balance {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 22px;
    font-weight: 700;
    color: #ffd700;
}

.balance span {
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.2);
}

/* ============ АВАТАРКА ============ */
.profile-btn {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 2px solid #ffd700;
    overflow: hidden;
    cursor: pointer;
    background: rgba(255, 215, 0, 0.05);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 20px rgba(255, 215, 0, 0.15);
    transition: all 0.3s ease;
    position: relative;
}

.profile-btn img {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
}

.profile-btn .avatar-placeholder {
    font-size: 28px;
    line-height: 1;
    color: #ffd700;
    font-weight: 700;
}

.profile-btn:active {
    transform: scale(0.92);
    box-shadow: 0 0 40px rgba(255, 215, 0, 0.3);
}

.profile-btn .online-status {
    position: absolute;
    bottom: 2px;
    right: 2px;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    border: 2px solid #0a0a0a;
    background: #00ff00;
    display: none;
}

.profile-btn .online-status.online {
    display: block;
}

/* ============ БЕСКОНЕЧНАЯ ПРОКРУТКА ДРОПОВ ============ */
.marquee-container {
    width: 100%;
    overflow: hidden;
    background: rgba(0, 0, 0, 0.4);
    border-top: 1px solid rgba(255, 215, 0, 0.08);
    border-bottom: 1px solid rgba(255, 215, 0, 0.08);
    padding: 8px 0;
    position: relative;
}

.marquee-track {
    display: flex;
    gap: 30px;
    white-space: nowrap;
    animation: marqueeScroll 60s linear infinite;
    width: max-content;
    align-items: center;
}

.marquee-item {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(255, 255, 255, 0.04);
    padding: 4px 14px 4px 6px;
    border-radius: 20px;
    border: 1px solid rgba(255, 215, 0, 0.08);
    transition: all 0.3s ease;
}

.marquee-avatar {
    width: 28px;
    height: 28px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    color: #ffffff;
    flex-shrink: 0;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.marquee-item-name {
    font-size: 13px;
    font-weight: 500;
    color: #e0e0e0;
}

.marquee-item-price {
    font-size: 12px;
    color: #ffd700;
    font-weight: 600;
}

.marquee-loading {
    color: #6a7a8e;
    font-size: 14px;
    padding: 4px 20px;
}

@keyframes marqueeScroll {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
}

/* ============ ГЛАВНЫЙ ЭКРАН ============ */
.welcome-text {
    font-size: 28px;
    font-weight: 700;
    color: #ffd700;
    text-align: center;
    padding: 16px 0 8px 0;
    text-shadow: 0 0 30px rgba(255, 215, 0, 0.15);
}

.grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
    margin-top: 12px;
    padding: 0 12px;
}

.card {
    background: rgba(20, 20, 20, 0.85);
    border-radius: 16px;
    padding: 18px 12px;
    text-align: center;
    border: 1px solid rgba(255, 215, 0, 0.12);
    backdrop-filter: blur(10px);
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.card:active {
    transform: scale(0.95);
    border-color: #ffd700;
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.15);
}

.card-icon {
    font-size: 32px;
    display: block;
    margin-bottom: 4px;
}

.card-title {
    font-size: 14px;
    font-weight: 600;
    color: #e0e0e0;
}

.card-sub {
    font-size: 11px;
    color: rgba(255,255,255,0.4);
}

/* ============ КАРТОЧКА ПОДПИСКИ ============ */
.subscribe-card {
    border-color: rgba(255,215,0,0.3) !important;
    background: rgba(255,215,0,0.05) !important;
}

.subscribe-card .card-title {
    color: #ffd700 !important;
}

/* ============ КНОПКИ ============ */
.case-btn {
    display: block;
    width: 100%;
    padding: 16px;
    margin: 8px 0;
    border: 2px solid rgba(255, 215, 0, 0.2);
    border-radius: 12px;
    background: rgba(20, 20, 20, 0.6);
    font-size: 16px;
    font-weight: 600;
    color: #e0e0e0;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: center;
}

.case-btn:active {
    transform: scale(0.97);
    border-color: #ffd700;
}

.case-btn.primary {
    background: #ffd700;
    color: #0a0a0a;
    border-color: #ffd700;
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.2);
}

.case-btn.primary:active {
    background: #e8a800;
}

/* ============ ПРЕДУПРЕЖДЕНИЕ ============ */
.frozen-warning {
    background: rgba(255, 0, 0, 0.15);
    border: 1px solid rgba(255, 0, 0, 0.3);
    border-radius: 12px;
    padding: 8px 12px;
    color: #ff4444;
    font-weight: 700;
    text-align: center;
    margin: 8px 12px;
    display: none;
    font-size: 14px;
}

/* ============ МОДАЛЬНОЕ ОКНО ============ */
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.7);
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
    backdrop-filter: blur(8px);
}

.modal.active {
    display: flex;
}

.modal-content {
    background: #141414;
    border-radius: 24px;
    padding: 24px;
    max-width: 400px;
    width: 100%;
    max-height: 85vh;
    overflow-y: auto;
    border: 1px solid rgba(255, 215, 0, 0.15);
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
}

.modal-title {
    font-size: 22px;
    font-weight: 700;
    color: #ffd700;
    text-align: center;
    margin-bottom: 12px;
}

.modal-close {
    font-size: 24px;
    cursor: pointer;
    color: rgba(255,255,255,0.4);
    background: none;
    border: none;
    float: right;
    padding: 0 8px;
}

.modal-close:hover {
    color: #ffd700;
}

/* ============ СКРОЛЛ ============ */
.scrollable {
    max-height: 60vh;
    overflow-y: auto;
    padding: 0 4px;
}

.scrollable::-webkit-scrollbar {
    width: 4px;
}

.scrollable::-webkit-scrollbar-thumb {
    background: #ffd700;
    border-radius: 4px;
}

.scrollable::-webkit-scrollbar-track {
    background: transparent;
}

/* ============ СТРАНИЦЫ ============ */
.page-title {
    text-align: center;
    font-size: 24px;
    font-weight: 700;
    color: #ffd700;
    padding: 8px 0 16px 0;
    text-shadow: 0 0 30px rgba(255, 215, 0, 0.1);
}

.screen {
    display: none;
}

.screen.active {
    display: block;
}

/* ============ ИНВЕНТАРЬ ============ */
.inventory-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    background: rgba(20, 20, 20, 0.6);
    border-radius: 12px;
    margin-bottom: 8px;
    border: 1px solid rgba(255, 215, 0, 0.08);
}

.inventory-item .name {
    font-weight: 500;
    color: #e0e0e0;
    flex: 1;
}

.inventory-item .price {
    color: #ffd700;
    font-weight: 600;
    margin: 0 12px;
}

.inventory-item .actions {
    display: flex;
    gap: 8px;
}

.inventory-item .actions button {
    padding: 6px 14px;
    border-radius: 8px;
    border: none;
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-sell {
    background: #ffd700;
    color: #0a0a0a;
}

.btn-sell:active {
    background: #e8a800;
}

.btn-withdraw {
    background: transparent;
    color: #ffd700;
    border: 1px solid #ffd700;
}

.btn-withdraw:active {
    background: rgba(255, 215, 0, 0.1);
}

/* ============ ПРОФИЛЬ ============ */
.profile-field {
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    background: rgba(20, 20, 20, 0.6);
    border-radius: 12px;
    margin-bottom: 6px;
    border: 1px solid rgba(255, 215, 0, 0.08);
}

.profile-field .label {
    color: rgba(255,255,255,0.4);
}

.profile-field .value {
    color: #e0e0e0;
    font-weight: 500;
}

/* ============ КОЛЕСО ============ */
.wheel-status {
    text-align: center;
    padding: 20px;
    font-size: 18px;
    color: rgba(255,255,255,0.4);
}

/* ============ PVP ============ */
.pvp-case-select {
    display: flex;
    gap: 10px;
    align-items: center;
    padding: 8px 12px;
}

.pvp-case-select span {
    color: rgba(255,255,255,0.4);
    font-weight: 500;
}

.pvp-case-select .case-btn {
    flex: 1;
    padding: 12px;
    margin: 0;
}

.pvp-status {
    text-align: center;
    padding: 12px;
    color: rgba(255,255,255,0.4);
}

.pvp-result {
    text-align: center;
    padding: 12px;
    color: #ffd700;
    font-weight: 600;
    font-size: 18px;
}

/* ============ АПГРЕЙД ============ */
.upgrade-slot {
    background: rgba(20, 20, 20, 0.6);
    border: 2px dashed rgba(255, 215, 0, 0.2);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    transition: all 0.3s ease;
    min-height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.upgrade-slot.active {
    border-color: #ffd700;
    background: rgba(255, 215, 0, 0.05);
}

.upgrade-slot .item-name {
    font-size: 18px;
    font-weight: 600;
    color: #e0e0e0;
}

.upgrade-slot .item-price {
    font-size: 14px;
    color: #ffd700;
}

.upgrade-slot .slot-label {
    color: #6a7a8e;
    font-size: 12px;
    text-transform: uppercase;
}

.upgrade-result {
    text-align: center;
    padding: 20px;
    border-radius: 12px;
    margin: 10px 0;
}

.upgrade-result.success {
    background: rgba(255, 215, 0, 0.1);
    border: 1px solid #ffd700;
}

.upgrade-result.fail {
    background: rgba(255, 0, 0, 0.1);
    border: 1px solid #ff4444;
}

/* ============ ЗАГРУЗКА ============ */
.loading {
    text-align: center;
    padding: 30px;
    color: rgba(255,255,255,0.4);
}

/* ============ АДАПТАЦИЯ ============ */
@media (max-width: 380px) {
    .balance { font-size: 18px; }
    .profile-btn { width: 44px; height: 44px; }
    .profile-btn span { font-size: 22px; }
    .card { padding: 14px 8px; }
    .card-icon { font-size: 26px; }
    .card-title { font-size: 12px; }
    .welcome-text { font-size: 22px; }
}

@media (min-width: 600px) {
    .grid { gap: 14px; }
    .card { padding: 24px 16px; }
    .card-icon { font-size: 40px; }
    .card-title { font-size: 16px; }
}
