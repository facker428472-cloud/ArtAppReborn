from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS
import sqlite3
import json
import random
import string
import time
import queue
from datetime import datetime, date, timedelta
from contextlib import contextmanager
import os

app = Flask(__name__)
CORS(app)

DB = "artdrop.db"
DB_TIMEOUT = 60

# ============ ПУЛ КОННЕКШЕНОВ ============
class DatabasePool:
    def __init__(self, max_connections=15):
        self._connections = queue.Queue(maxsize=max_connections)
        for _ in range(max_connections):
            self._connections.put(self._create_connection())
    
    def _create_connection(self):
        conn = sqlite3.connect(DB, timeout=DB_TIMEOUT, check_same_thread=False)
        conn.execute('PRAGMA journal_mode=WAL')
        conn.execute('PRAGMA synchronous=NORMAL')
        conn.execute('PRAGMA busy_timeout=60000')
        conn.row_factory = sqlite3.Row
        return conn
    
    @contextmanager
    def get_connection(self):
        conn = self._connections.get()
        try:
            yield conn
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            self._connections.put(conn)

db_pool = DatabasePool(max_connections=20)

# ============ СКИНЫ ============
BOMJ_SKINS_CHEAP = [
    ("P90 | Sand Spray", 180), ("MP9 | Sand Dashed", 177),
    ("SCAR-20 | Zinc", 167), ("SG 553 | Night Camo", 162),
    ("XM1014 | Canvas Cloud", 160), ("Sticker | BLAST.tv", 155),
    ("Sticker | Lynn Vision", 212), ("MP5-SD | Dirt Drop", 192),
    ("Sticker | The Huns", 192), ("Sticker | halzerk", 192),
    ("Sticker | JDC", 192), ("G3SG1 | Red Jasper", 185),
    ("UMP-45 | Facility Dark", 375), ("Sticker | AUSTIN | FlameZ", 365),
    ("SCAR-20 | Short Ochre", 330), ("Sticker | AUSTIN | Team Spirit", 305),
    ("Tec-9 | Blue Blast", 215), ("Sticker | apEX", 442),
    ("MP9 | Slide", 440), ("UMP-45 | Mudder", 500),
    ("SCAR-20 | Contractor", 500), ("AUG | Sweeper", 477),
    ("Sticker | FURIA", 472), ("FAMAS | Palm", 115)
]

BOMJ_SKINS_EXPENSIVE = [
    ("Nova | Sand Dune", 577), ("MP9 | Sand Dashed", 577),
    ("UMP-45 | Facility Dark", 542), ("G3SG1 | Desert Storm", 537),
    ("P250 | Facility Draft", 515), ("Nova | Predator", 510),
    ("Sticker | AUSTIN | Cxzi", 672), ("Sticker | PGL", 662),
    ("Zeus x27 | Swamp DDPAT", 632), ("G3SG1 | Jungle Dashed", 652),
    ("Nova | Mandrel", 590), ("MAG-7 | Rust Coat", 750),
    ("Sticker | Senzu", 750), ("Sticker | n1ssim", 750),
    ("Sticker | malbsMd", 747), ("Five-SeveN | Coolant", 692),
    ("Sticker | mezii", 672), ("M4A4 | Mainframe", 1175),
    ("Graffiti | Popdog", 1085), ("AUG | Contractor", 1075),
    ("SCAR-20 | Sand Mesh", 1014), ("Sticker | nafany", 1000),
    ("Nova | Mandrel", 987), ("SCAR-20 | Fragments", 1527),
    ("MP7 | Forest DDPAT", 1460), ("PP-Bizon | Facility Sketch", 1350)
]

BERKUT_SKINS_COMMON = [
    ("MP7 | Army Recon", 670), ("Tec-9 | Urban DDPAT", 670),
    ("G3SG1 | Polar Camo", 612), ("G3SG1 | Red Jasper", 535),
    ("Zeus x27 | Swamp DDPAT", 392), ("SCAR-20 | Sand Mesh", 367),
    ("MP9 | Sand Dashed", 290), ("Nova | Mandrel", 915),
    ("SG 553 | Basket Halftone", 710), ("MP7 | Motherboard", 1290)
]

BERKUT_SKINS_RARE = [
    ("SSG 08 | Blue Spruce", 1725), ("Five-SeveN | Sky Blue", 1547),
    ("MP7 | Motherboard", 1522), ("Negev | Bulkhead", 1322),
    ("AUG | Condemned", 2205), ("USP-S | PC-GRN", 2180),
    ("P2000 | Granite Marbleized", 2115), ("M4A1-S | Wash me plz", 1815),
    ("Five-SeveN | Scrawl", 1790), ("Galil AR | Cold Fusion", 1727)
]

BERKUT_SKINS_EPIC = [
    ("SG 553 | Aloha", 3800), ("MAC-10 | Candy Apple", 3800),
    ("MP5-SD | Liquidation", 3655), ("Five-SeveN | Scrawl", 3432),
    ("Galil AR | Cold Fusion", 3377), ("Galil AR | Green Apple", 3257),
    ("P250 | Cassette", 2257), ("P250 | Cassette", 2225)
]

BERKUT_SKINS_LEGENDARY = [
    ("FAMAS | Teardown", 5175), ("Charm | Lil' No. 2", 5002),
    ("MP9 | Black Sand", 5000), ("SG 553 | Ol' Rusty", 5000),
    ("R8 Revolver | Crimson Web", 4640), ("G3SG1 | Green Apple", 4392)
]

BERKUT_SKINS_MYTHIC = [
    ("SSG 08 | Zeno", 11502), ("Zeus x27 | Tosai", 11117),
    ("MP7 | Urban Hazard", 11112), ("P90 | Off World", 6917),
    ("SCAR-20 | Assault", 6290), ("R8 Revolver | Junk Yard", 6257),
    ("P250 | Vino Primo", 14390), ("MAC-10 | Pipsqueak", 13715),
    ("XM1014 | Solitude", 13447), ("Desert Eagle | Trigger Discipline", 13150),
    ("XM1014 | Irezumi", 12662), ("M4A4 | Magnesium", 12437),
    ("Glock-18 | Coral Bloom", 11645), ("Five-SeveN | Buddy", 11542),
    ("SSG 08 | Necropos", 20737), ("M4A4 | Converter", 19122),
    ("MAC-10 | Lapis Gator", 16180), ("MP7 | Cirrus", 15652)
]

CHAMPION_SKINS_COMMON = [
    ("SCAR-20 | Contractor", 435), ("Galil AR | VariCamo", 1125),
    ("XM1014 | Irezumi", 1250), ("G3SG1 | Green Apple", 1572),
    ("MAC-10 | Ensnared", 1610), ("AK-47 | Olive Polycam", 1627),
    ("PP-Bizon | Candy Apple", 1735), ("Desert Eagle | Tilted", 1760),
    ("Glock-18 | Winterized", 1860)
]

CHAMPION_SKINS_RARE = [
    ("AUG | Condemned", 2152), ("Desert Eagle | Tilted", 2237),
    ("M4A1-S | Boreal Forest", 2400), ("AWP | Safari Mesh", 2422),
    ("AK-47 | Safari Mesh", 2497), ("Nova | Candy Apple", 2497),
    ("SSG 08 | Mainframe 001", 2532), ("P250 | Metallic DDPAT", 3012)
]

CHAMPION_SKINS_EPIC = [
    ("Glock-18 | High Beam", 3100), ("MAC-10 | Candy Apple", 3305),
    ("PP-Bizon | Candy Apple", 3322), ("USP-S | Forest Leaves", 3560),
    ("AUG | Ricochet", 4517), ("SCAR-20 | Trail Blazer", 4887),
    ("M4A4 | Magnesium", 4952), ("Desert Eagle | Bronze Deco", 5177),
    ("Desert Eagle | Blue Ply", 5270), ("Tec-9 | Red Quartz", 5892)
]

CHAMPION_SKINS_LEGENDARY = [
    ("Glock-18 | Oxide Blaze", 5912), ("Dual Berettas | Cobalt Quartz", 6110),
    ("Glock-18 | Umbral Rabbit", 6330), ("MAC-10 | Sakkaku", 6435),
    ("Desert Eagle | Blue Ply", 6522), ("Nova | Candy Apple", 6570),
    ("AWP | Safari Mesh", 6940)
]

CHAMPION_SKINS_MYTHIC = [
    ("M4A1-S | Mud-Spec", 7432), ("Desert Eagle | Bronze Deco", 7972),
    ("M4A1-S | Emphorosaurus-S", 8317), ("MAC-10 | Candy Apple", 8865),
    ("Desert Eagle | Oxide Blaze", 9095), ("M4A1-S | Nitro", 10000),
    ("USP-S | Ticket to Hell", 10180), ("P250 | Valence", 10677),
    ("USP-S | Flashback", 11785), ("Tec-9 | Red Quartz", 13082),
    ("M4A1-S | Night Terror", 15130), ("M4A1-S | Nitro", 16062),
    ("SSG 08 | Fever Dream", 16777), ("AWP | Pit Viper", 17952),
    ("Desert Eagle | Light Rail", 21095), ("SSG 08 | Ghost Crusader", 23417)
]

def open_bomj_case():
    if random.random() * 100 <= 65:
        return random.choice(BOMJ_SKINS_CHEAP)
    return random.choice(BOMJ_SKINS_EXPENSIVE)

def open_berkut_case():
    r = random.random() * 100
    if r <= 60: return random.choice(BERKUT_SKINS_COMMON)
    elif r <= 80: return random.choice(BERKUT_SKINS_RARE)
    elif r <= 90: return random.choice(BERKUT_SKINS_EPIC)
    elif r <= 96: return random.choice(BERKUT_SKINS_LEGENDARY)
    return random.choice(BERKUT_SKINS_MYTHIC)

def open_champion_case():
    r = random.random() * 100
    if r <= 55: return random.choice(CHAMPION_SKINS_COMMON)
    elif r <= 75: return random.choice(CHAMPION_SKINS_RARE)
    elif r <= 88: return random.choice(CHAMPION_SKINS_EPIC)
    elif r <= 96: return random.choice(CHAMPION_SKINS_LEGENDARY)
    return random.choice(CHAMPION_SKINS_MYTHIC)

def open_case_by_name(case_name):
    if case_name == "bomj": return open_bomj_case()
    elif case_name == "berkut": return open_berkut_case()
    return open_champion_case()

def get_case_price(case_name):
    prices = {"bomj": 500, "berkut": 1500, "champion": 5000}
    return prices.get(case_name, 500)

WHEEL_PRIZES = [
    ("50 coins", 50, "coins"), ("100 coins", 100, "coins"),
    ("250 coins", 250, "coins"), ("500 coins", 500, "coins"),
    ("1000 coins", 1000, "coins"), ("5% discount", 0, "discount"),
    ("10% discount", 0, "discount"), ("15% discount", 0, "discount"),
    ("25% discount", 0, "discount"), ("Bomj Case", 0, "bomj"),
    ("Berkut Case", 0, "berkut"), ("Champion Case", 0, "champion")
]

def add_exp(user_id, amount):
    with db_pool.get_connection() as conn:
        c = conn.cursor()
        level, exp = c.execute("SELECT level, exp FROM users WHERE id=?", (user_id,)).fetchone()
        exp += amount
        while exp >= level * 1000:
            exp -= level * 1000
            level += 1
            c.execute("UPDATE users SET coins=coins+100 WHERE id=?", (user_id,))
        c.execute("UPDATE users SET level=?, exp=? WHERE id=?", (level, exp, user_id))

# ============ ИНИЦИАЛИЗАЦИЯ БД ============
def init_db():
    with db_pool.get_connection() as conn:
        c = conn.cursor()
        
        # Таблица пользователей
        c.execute('''CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT DEFAULT '',
            coins INTEGER DEFAULT 500,
            total_deposit INTEGER DEFAULT 0,
            wheel_spins INTEGER DEFAULT 1,
            last_wheel_date TEXT,
            active_discount INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            exp INTEGER DEFAULT 0,
            pvp_wins INTEGER DEFAULT 0,
            pvp_losses INTEGER DEFAULT 0,
            referred_by INTEGER DEFAULT 0,
            is_admin INTEGER DEFAULT 0,
            is_banned INTEGER DEFAULT 0,
            created_at TEXT,
            last_activity TEXT
        )''')
        
        # Таблица инвентаря
        c.execute('''CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            item_name TEXT,
            item_price INTEGER,
            opened_at TEXT,
            withdraw_status TEXT DEFAULT 'none',
            withdraw_expires TEXT DEFAULT NULL
        )''')
        
        # Таблица кейсов
        c.execute('''CREATE TABLE IF NOT EXISTS cases (
            name TEXT PRIMARY KEY,
            price INTEGER,
            max_item_price INTEGER,
            jackpot_chance REAL,
            is_active INTEGER DEFAULT 1
        )''')
        
        # Таблица промокодов
        c.execute('''CREATE TABLE IF NOT EXISTS promocodes (
            code TEXT PRIMARY KEY,
            reward INTEGER,
            uses_left INTEGER,
            created_by INTEGER,
            target_user INTEGER DEFAULT 0,
            created_at TEXT,
            is_active INTEGER DEFAULT 1
        )''')
        
        # Таблица использования промокодов
        c.execute('''CREATE TABLE IF NOT EXISTS promo_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            username TEXT,
            code TEXT,
            reward INTEGER,
            used_at TEXT
        )''')
        
        # Таблица заявок на вывод
        c.execute('''CREATE TABLE IF NOT EXISTS withdraw_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            username TEXT,
            item_id INTEGER,
            item_name TEXT,
            item_price INTEGER,
            trade_link TEXT,
            status TEXT DEFAULT 'pending',
            created_at TEXT,
            expires_at TEXT
        )''')
        
        # Таблица истории пополнений
        c.execute('''CREATE TABLE IF NOT EXISTS deposit_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            amount INTEGER,
            discount_used INTEGER,
            created_at TEXT
        )''')
        
        # Добавляем кейсы
        c.execute("INSERT OR IGNORE INTO cases (name, price, max_item_price, jackpot_chance) VALUES ('bomj', 500, 5000, 1.0)")
        c.execute("INSERT OR IGNORE INTO cases (name, price, max_item_price, jackpot_chance) VALUES ('berkut', 1500, 50000, 1.5)")
        c.execute("INSERT OR IGNORE INTO cases (name, price, max_item_price, jackpot_chance) VALUES ('champion', 5000, 250000, 2.0)")

# ============ СТАТИЧЕСКИЕ ФАЙЛЫ ============
@app.route('/static/images/<path:filename>')
def serve_image(filename):
    return send_from_directory('static/images', filename)

@app.route('/static/css/<path:filename>')
def serve_css(filename):
    return send_from_directory('static/css', filename)

@app.route('/static/js/<path:filename>')
def serve_js(filename):
    return send_from_directory('static/js', filename)

# ============ ГЛАВНАЯ СТРАНИЦА ============
@app.route('/')
@app.route('/miniapp')
def index():
    return render_template('index.html')

# ============ API ЭНДПОИНТЫ ============

# ============ ЛОГИН ============
@app.route('/api/miniapp_login', methods=['POST'])
def miniapp_login():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        username = data.get('username')
        
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            
            total_users = c.execute("SELECT COUNT(*) FROM users").fetchone()[0]
            is_admin = (total_users < 2)
            
            c.execute("SELECT id, username, is_admin FROM users WHERE id=?", (user_id,))
            user = c.fetchone()
            
            if user:
                if user[2] == 1:
                    is_admin = True
                
                if user[2] != is_admin:
                    c.execute("UPDATE users SET is_admin=?, username=?, last_activity=? WHERE id=?", 
                             (is_admin, username, datetime.now().isoformat(), user_id))
                else:
                    c.execute("UPDATE users SET last_activity=?, username=? WHERE id=?", 
                             (datetime.now().isoformat(), username, user_id))
                
                return jsonify({
                    "success": True, 
                    "user_id": user_id, 
                    "username": username, 
                    "is_admin": is_admin or user[2]
                })
            else:
                c.execute("""
                    INSERT INTO users (id, username, password, is_admin, coins, level, exp, created_at, last_wheel_date, last_activity) 
                    VALUES (?,?,?,?,?,?,?,?,?,?)
                """, (
                    user_id, 
                    username, 
                    "telegram_" + str(user_id),
                    is_admin,
                    500,
                    1,
                    0,
                    datetime.now().isoformat(),
                    "2000-01-01",
                    datetime.now().isoformat()
                ))
                return jsonify({
                    "success": True, 
                    "user_id": user_id, 
                    "username": username, 
                    "is_admin": is_admin
                })
    except Exception as e:
        print(f"Login error: {e}")
        return jsonify({"error": str(e)}), 500

# ============ ПРОФИЛЬ ============
@app.route('/api/miniapp_profile', methods=['GET'])
def miniapp_profile():
    try:
        user_id = request.args.get('user_id')
        print(f"Profile request for user: {user_id}")
        
        if not user_id:
            return jsonify({"error": "No user_id"}), 400
        
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("SELECT id, username, coins, level, exp, pvp_wins, pvp_losses, wheel_spins, is_admin, total_deposit FROM users WHERE id=?", (user_id,))
            user = c.fetchone()
            
            if user:
                referrals = c.execute("SELECT COUNT(*) FROM users WHERE referred_by=?", (user_id,)).fetchone()[0]
                
                return jsonify({
                    "id": user[0],
                    "username": user[1],
                    "coins": user[2] or 0,
                    "level": user[3] or 1,
                    "exp": user[4] or 0,
                    "wins": user[5] or 0,
                    "losses": user[6] or 0,
                    "wheel_spins": user[7] or 0,
                    "referrals": referrals,
                    "is_admin": user[8] or 0,
                    "total_deposit": user[9] or 0
                })
            else:
                total_users = c.execute("SELECT COUNT(*) FROM users").fetchone()[0]
                is_admin = (total_users < 2)
                
                c.execute("""
                    INSERT INTO users (id, username, password, is_admin, coins, level, created_at, last_wheel_date) 
                    VALUES (?,?,?,?,?,?,?,?)
                """, (
                    user_id, 
                    "player_" + str(user_id),
                    "telegram_" + str(user_id),
                    is_admin,
                    500, 
                    1, 
                    datetime.now().isoformat(), 
                    "2000-01-01"
                ))
                conn.commit()
                return jsonify({
                    "id": user_id,
                    "username": "player_" + str(user_id),
                    "coins": 500,
                    "level": 1,
                    "exp": 0,
                    "wins": 0,
                    "losses": 0,
                    "wheel_spins": 1,
                    "referrals": 0,
                    "is_admin": is_admin,
                    "total_deposit": 0
                })
    except Exception as e:
        print(f"Profile error: {e}")
        return jsonify({"error": str(e)}), 500

# ============ ИНВЕНТАРЬ ============
@app.route('/api/miniapp_inventory', methods=['GET'])
def miniapp_inventory():
    try:
        user_id = request.args.get('user_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("SELECT id, item_name, item_price, withdraw_status, withdraw_expires FROM inventory WHERE user_id=? ORDER BY id DESC", (user_id,))
            items = c.fetchall()
            return jsonify({"items": [{
                "id": i[0], 
                "name": i[1], 
                "price": i[2],
                "withdraw_status": i[3] or 'none',
                "withdraw_expires": i[4]
            } for i in items]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============ ОТКРЫТИЕ КЕЙСА ============
@app.route('/api/miniapp_open_case', methods=['POST'])
def miniapp_open_case():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        case_name = data.get('case_name')
        price = get_case_price(case_name)
        
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            coins = c.execute("SELECT coins FROM users WHERE id=?", (user_id,)).fetchone()
            if not coins or coins[0] < price:
                return jsonify({"error": f"Need {price} coins"}), 400
            
            c.execute("UPDATE users SET coins=coins-? WHERE id=?", (price, user_id))
            item_name, item_price = open_case_by_name(case_name)
            c.execute("INSERT INTO inventory (user_id, item_name, item_price, opened_at) VALUES (?,?,?,?)",
                     (user_id, item_name, item_price, datetime.now().isoformat()))
        
        add_exp(user_id, 5)
        return jsonify({"success": True, "item": item_name, "price": item_price})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============ ПРОДАЖА ============
@app.route('/api/miniapp_sell_item', methods=['POST'])
def miniapp_sell_item():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        item_id = data.get('item_id')
        
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            
            # Проверяем статус вывода
            item = c.execute("SELECT item_price, withdraw_status FROM inventory WHERE id=? AND user_id=?", (item_id, user_id)).fetchone()
            if not item:
                return jsonify({"error": "Item not found"}), 404
            
            if item[1] == 'pending':
                return jsonify({"error": "Item is pending withdraw"}), 400
            
            c.execute("DELETE FROM inventory WHERE id=? AND user_id=?", (item_id, user_id))
            c.execute("UPDATE users SET coins=coins+? WHERE id=?", (item[0], user_id))
        
        add_exp(user_id, 10)
        return jsonify({"success": True, "price": item[0]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============ ПРОДАЖА ВСЕГО ============
@app.route('/api/miniapp_sell_all', methods=['POST'])
def miniapp_sell_all():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            items = c.execute("SELECT item_price FROM inventory WHERE user_id=? AND withdraw_status='none'", (user_id,)).fetchall()
            total = sum(i[0] for i in items)
            c.execute("DELETE FROM inventory WHERE user_id=? AND withdraw_status='none'", (user_id,))
            c.execute("UPDATE users SET coins=coins+? WHERE id=?", (total, user_id))
        
        add_exp(user_id, len(items) * 10)
        return jsonify({"success": True, "total": total, "count": len(items)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============ КОЛЕСО ============
@app.route('/api/miniapp_wheel', methods=['POST'])
def miniapp_wheel():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            today = date.today().isoformat()
            last_date, spins = c.execute("SELECT last_wheel_date, wheel_spins FROM users WHERE id=?", (user_id,)).fetchone()
            
            if last_date != today:
                c.execute("UPDATE users SET wheel_spins=wheel_spins+1, last_wheel_date=? WHERE id=?", (today, user_id))
                spins += 1
            
            if spins <= 0:
                return jsonify({"error": "No spins left"}), 400
            
            c.execute("UPDATE users SET wheel_spins=wheel_spins-1 WHERE id=?", (user_id,))
            prize_name, prize_value, prize_type = random.choice(WHEEL_PRIZES)
            result = {}
            
            if prize_type == "coins":
                c.execute("UPDATE users SET coins=coins+? WHERE id=?", (prize_value, user_id))
                result = {"name": prize_name, "coins": prize_value}
                add_exp(user_id, 10)
            elif prize_type == "discount":
                c.execute("UPDATE users SET active_discount=? WHERE id=?", (prize_value, user_id))
                result = {"name": prize_name, "discount": prize_value}
            else:
                item_name, item_price = open_case_by_name(prize_type)
                c.execute("INSERT INTO inventory (user_id, item_name, item_price, opened_at) VALUES (?,?,?,?)",
                         (user_id, item_name, item_price, datetime.now().isoformat()))
                result = {"name": prize_name, "case": prize_type, "item": item_name, "price": item_price}
                add_exp(user_id, 5)
            
            return jsonify({"success": True, "result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============ ПРОМОКОДЫ ============
@app.route('/api/promo_activate', methods=['POST'])
def promo_activate():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        code = data.get('code').upper()
        
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            promo = c.execute("SELECT reward, uses_left, target_user, is_active FROM promocodes WHERE code=?", (code,)).fetchone()
            
            if not promo or promo[3] == 0:
                return jsonify({"error": "Неверный промокод"}), 400
            if promo[1] <= 0:
                return jsonify({"error": "Промокод использован"}), 400
            if promo[2] != 0 and promo[2] != user_id:
                return jsonify({"error": "Это не ваш промокод"}), 400
            
            used = c.execute("SELECT COUNT(*) FROM promo_usage WHERE user_id=? AND code=?", (user_id, code)).fetchone()[0]
            if used > 0:
                return jsonify({"error": "Вы уже использовали этот промокод"}), 400
            
            c.execute("UPDATE users SET coins=coins+? WHERE id=?", (promo[0], user_id))
            c.execute("UPDATE promocodes SET uses_left=uses_left-1 WHERE code=?", (code,))
            c.execute("INSERT INTO promo_usage (user_id, username, code, reward, used_at) VALUES (?,?,?,?,?)",
                     (user_id, "", code, promo[0], datetime.now().isoformat()))
            
            return jsonify({"success": True, "reward": promo[0]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/create_promo', methods=['POST'])
def admin_create_promo():
    try:
        data = request.get_json()
        reward = data.get('reward')
        uses = data.get('uses', 1)
        target_user = data.get('target_user', 0)
        
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
        
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("INSERT INTO promocodes (code, reward, uses_left, created_by, target_user, created_at) VALUES (?,?,?,?,?,?)",
                     (code, reward, uses, 1, target_user, datetime.now().isoformat()))
        
        return jsonify({"success": True, "code": code})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/create_personal_promo', methods=['POST'])
def admin_create_personal_promo():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        reward = data.get('reward')
        
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=10))
        
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("INSERT INTO promocodes (code, reward, uses_left, created_by, target_user, created_at) VALUES (?,?,?,?,?,?)",
                     (code, reward, 1, 1, user_id, datetime.now().isoformat()))
        
        return jsonify({"success": True, "code": code})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/deactivate_promo', methods=['POST'])
def admin_deactivate_promo():
    try:
        data = request.get_json()
        code = data.get('code')
        
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("UPDATE promocodes SET is_active=0 WHERE code=?", (code,))
        
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/promo_stats', methods=['GET'])
def admin_promo_stats():
    try:
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            promos = c.execute("SELECT code, reward, uses_left, target_user, created_at FROM promocodes").fetchall()
            usage = c.execute("SELECT code, COUNT(*) FROM promo_usage GROUP BY code").fetchall()
        
        return jsonify({
            "promos": [{"code": p[0], "reward": p[1], "uses_left": p[2], "target": p[3], "created": p[4]} for p in promos],
            "usage": [{"code": u[0], "count": u[1]} for u in usage]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============ ВЫВОД ============
@app.route('/api/withdraw_request', methods=['POST'])
def withdraw_request():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        item_id = data.get('item_id')
        trade_link = data.get('trade_link')
        
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            
            user = c.execute("SELECT username, total_deposit FROM users WHERE id=?", (user_id,)).fetchone()
            if not user or user[1] < 115:
                return jsonify({"error": "Минимальный депозит 115 RUB для вывода"}), 400
            
            item = c.execute("SELECT item_name, item_price FROM inventory WHERE id=? AND user_id=?", (item_id, user_id)).fetchone()
            if not item:
                return jsonify({"error": "Предмет не найден"}), 404
            
            existing = c.execute("SELECT id FROM withdraw_requests WHERE item_id=? AND status='pending'", (item_id,)).fetchone()
            if existing:
                return jsonify({"error": "Заявка на этот предмет уже отправлена"}), 400
            
            c.execute("UPDATE inventory SET withdraw_status='pending' WHERE id=? AND user_id=?", (item_id, user_id))
            
            expires_at = (datetime.now() + timedelta(hours=24)).isoformat()
            c.execute("""
                INSERT INTO withdraw_requests (user_id, username, item_id, item_name, item_price, trade_link, created_at, expires_at) 
                VALUES (?,?,?,?,?,?,?,?)
            """, (
                user_id, user[0], item_id, item[0], item[1], trade_link, 
                datetime.now().isoformat(), expires_at
            ))
            
            return jsonify({
                "success": True, 
                "expires_at": expires_at,
                "message": "Заявка создана! У вас 24 часа для подтверждения."
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/withdraw_check', methods=['GET'])
def withdraw_check():
    try:
        user_id = request.args.get('user_id')
        
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            now = datetime.now().isoformat()
            
            expired = c.execute("""
                SELECT id, item_id FROM withdraw_requests 
                WHERE user_id=? AND status='pending' AND expires_at < ?
            """, (user_id, now)).fetchall()
            
            for req in expired:
                c.execute("UPDATE withdraw_requests SET status='expired' WHERE id=?", (req[0],))
                c.execute("UPDATE inventory SET withdraw_status='none' WHERE id=?", (req[1],))
            
            active = c.execute("""
                SELECT id, item_name, item_price, created_at, expires_at 
                FROM withdraw_requests 
                WHERE user_id=? AND status='pending'
            """, (user_id,)).fetchall()
            
            return jsonify({
                "active": [{
                    "id": r[0], 
                    "item_name": r[1], 
                    "item_price": r[2],
                    "created_at": r[3],
                    "expires_at": r[4]
                } for r in active]
            })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============ АДМИН ============
@app.route('/api/admin/force_remove_item', methods=['POST'])
def admin_force_remove_item():
    try:
        data = request.get_json()
        item_id = data.get('item_id')
        
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("DELETE FROM inventory WHERE id=?", (item_id,))
        
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/users', methods=['GET'])
def admin_users():
    with db_pool.get_connection() as conn:
        c = conn.cursor()
        c.execute("SELECT id, username, coins, level FROM users")
        users = c.fetchall()
        return jsonify({"users": [{"id": u[0], "username": u[1], "coins": u[2], "level": u[3]} for u in users]})

@app.route('/api/admin/give_coins', methods=['POST'])
def admin_give_coins():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        amount = data.get('amount')
        
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("UPDATE users SET coins=coins+? WHERE id=?", (amount, user_id))
        
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/remove_coins', methods=['POST'])
def admin_remove_coins():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        amount = data.get('amount')
        
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("UPDATE users SET coins=coins-? WHERE id=?", (amount, user_id))
        
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/ban_user', methods=['POST'])
def admin_ban_user():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        reason = data.get('reason', 'No reason')
        
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("UPDATE users SET is_banned=1 WHERE id=?", (user_id,))
        
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/unban_user', methods=['POST'])
def admin_unban_user():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("UPDATE users SET is_banned=0 WHERE id=?", (user_id,))
        
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/stats', methods=['GET'])
def admin_stats():
    with db_pool.get_connection() as conn:
        c = conn.cursor()
        total_users = c.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        total_coins = c.execute("SELECT SUM(coins) FROM users").fetchone()[0] or 0
        total_items = c.execute("SELECT COUNT(*) FROM inventory").fetchone()[0]
        
        return jsonify({
            "total_users": total_users,
            "total_coins": total_coins,
            "total_items": total_items
        })

# ============ ЗАПУСК ============
if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=False, threaded=True)
