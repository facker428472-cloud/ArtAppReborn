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
import threading
import io
import csv
import requests

app = Flask(__name__)
CORS(app)

DB = "artdrop.db"
DB_TIMEOUT = 60

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

# ============ СКИНЫ ============
BOMJ_SKINS_CHEAP = [
    ("P90 | Sand Spray (BS)", 180), ("MP9 | Sand Dashed (FT)", 177),
    ("SCAR-20 | Zinc (BS)", 167), ("SG 553 | Night Camo (BS)", 162),
    ("XM1014 | Canvas Cloud (MW)", 160), ("Sticker | BLAST.tv", 155),
    ("Sticker | Lynn Vision", 212), ("MP5-SD | Dirt Drop", 192),
    ("Sticker | The Huns", 192), ("Sticker | halzerk", 192),
    ("Sticker | JDC (MW)", 192), ("G3SG1 | Red Jasper (BS)", 185),
    ("UMP-45 | Facility Dark (FT)", 375), ("Sticker | AUSTIN | FlameZ", 365),
    ("SCAR-20 | Short Ochre (MW)", 330), ("Sticker | AUSTIN | Team Spirit", 305),
    ("Tec-9 | Blue Blast (BS)", 215), ("Sticker | apEX", 442),
    ("MP9 | Slide (FT)", 440), ("UMP-45 | Mudder (FT)", 500),
    ("SCAR-20 | Contractor (FT)", 500), ("AUG | Sweeper", 477),
    ("Sticker | FURIA", 472), ("FAMAS | Palm (FT)", 115),
    ("SCAR-20 | Zinc (FT)", 115), ("SG 553 | Night Camo (FT)", 115),
    ("XM1014 | Canvas Cloud (FT)", 115), ("MAC-10 | Bronzer (BS)", 115),
    ("Sawed-Off | Crimson Batik (FT)", 115), ("M249 | Sage Camo (FT)", 115)
]

BOMJ_SKINS_EXPENSIVE = [
    ("Nova | Sand Dune", 577), ("MP9 | Sand Dashed (MW)", 577),
    ("UMP-45 | Facility Dark (MW)", 542), ("G3SG1 | Desert Storm (BS)", 537),
    ("P250 | Facility Draft (FT)", 515), ("Nova | Predator (FT)", 510),
    ("Sticker | AUSTIN | Cxzi", 672), ("Sticker | PGL", 662),
    ("Zeus x27 | Swamp DDPAT", 632), ("G3SG1 | Jungle Dashed", 652),
    ("Nova | Mandrel", 590), ("MAG-7 | Rust Coat", 750),
    ("Sticker | Senzu", 750), ("Sticker | n1ssim", 750),
    ("Sticker | malbsMd", 747), ("Five-SeveN | Coolant", 692),
    ("Sticker | mezii", 672), ("M4A4 | Mainframe", 1175),
    ("Graffiti | Popdog", 1085), ("AUG | Contractor (FT)", 1075),
    ("SCAR-20 | Sand Mesh (WW)", 1014), ("Sticker | nafany (MW)", 1000),
    ("Nova | Mandrel (BS)", 987), ("SCAR-20 | Fragments", 1527),
    ("MP7 | Forest DDPAT", 1460), ("PP-Bizon | Facility Sketch", 1350),
    ("Negev | Ultralight", 1325), ("G3SG1 | Polar Camo (MW)", 1307),
    ("P250 | Re.built (BS)", 1242), ("Galil AR | Cold Fusion (FT)", 1997)
]

BERKUT_SKINS_COMMON = [
    ("MP7 | Army Recon (FT)", 670), ("Tec-9 | Urban DDPAT (FT)", 670),
    ("G3SG1 | Polar Camo (FT)", 612), ("G3SG1 | Red Jasper (FN)", 535),
    ("Zeus x27 | Swamp DDPAT (MW)", 392), ("SCAR-20 | Sand Mesh (BS)", 367),
    ("MP9 | Sand Dashed (FT)", 290), ("Nova | Mandrel", 915),
    ("SG 553 | Basket Halftone", 710), ("MP7 | Motherboard", 1290),
    ("PP-Bizon | Cold Cell", 1290)
]

BERKUT_SKINS_RARE = [
    ("SSG 08 | Blue Spruce", 1725), ("Five-SeveN | Sky Blue", 1547),
    ("MP7 | Motherboard (FT)", 1522), ("Negev | Bulkhead", 1322),
    ("AUG | Condemned (FT)", 2205), ("USP-S | PC-GRN (FT)", 2180),
    ("P2000 | Granite Marbleized (FT)", 2115), ("M4A1-S | Wash me plz (MW)", 1815),
    ("Five-SeveN | Scrawl (WW)", 1790), ("Galil AR | Cold Fusion (FT)", 1727)
]

BERKUT_SKINS_EPIC = [
    ("SG 553 | Aloha", 3800), ("MAC-10 | Candy Apple (WW)", 3800),
    ("MP5-SD | Liquidation (MW)", 3655), ("Five-SeveN | Scrawl (MW)", 3432),
    ("Galil AR | Cold Fusion (MW)", 3377), ("Galil AR | Green Apple (MW)", 3257),
    ("P250 | Cassette (BS)", 2257), ("P250 | Cassette (FT)", 2225)
]

BERKUT_SKINS_LEGENDARY = [
    ("FAMAS | Teardown", 5175), ("Charm | Lil' No. 2", 5002),
    ("MP9 | Black Sand (WW)", 5000), ("SG 553 | Ol' Rusty", 5000),
    ("R8 Revolver | Crimson Web (FT)", 4640), ("G3SG1 | Green Apple (FN)", 4392)
]

BERKUT_SKINS_MYTHIC = [
    ("SSG 08 | Zeno", 11502), ("Zeus x27 | Tosai", 11117),
    ("MP7 | Urban Hazard (FT)", 11112), ("P90 | Off World (MW)", 6917),
    ("SCAR-20 | Assault (MW)", 6290), ("R8 Revolver | Junk Yard (FT)", 6257),
    ("P250 | Vino Primo", 14390), ("MAC-10 | Pipsqueak (FT)", 13715),
    ("XM1014 | Solitude (FT)", 13447), ("Desert Eagle | Trigger Discipline", 13150),
    ("XM1014 | Irezumi (FN)", 12662), ("M4A4 | Magnesium (MW)", 12437),
    ("Glock-18 | Coral Bloom (FT)", 11645), ("Five-SeveN | Buddy (MW)", 11542),
    ("SSG 08 | Necropos", 20737), ("M4A4 | Converter", 19122),
    ("MAC-10 | Lapis Gator", 16180), ("MP7 | Cirrus", 15652)
]

CHAMPION_SKINS_COMMON = [
    ("SCAR-20 | Contractor (FT)", 435), ("Galil AR | VariCamo (FT)", 1125),
    ("XM1014 | Irezumi (BS)", 1250), ("G3SG1 | Green Apple (FT)", 1572),
    ("MAC-10 | Ensnared (MW)", 1610), ("AK-47 | Olive Polycam (FT)", 1627),
    ("PP-Bizon | Candy Apple (MW)", 1735), ("Desert Eagle | Tilted (FT)", 1760),
    ("Glock-18 | Winterized (WW)", 1860)
]

CHAMPION_SKINS_RARE = [
    ("AUG | Condemned (FT)", 2152), ("Desert Eagle | Tilted (FT)", 2237),
    ("M4A1-S | Boreal Forest (FT)", 2400), ("AWP | Safari Mesh (MW)", 2422),
    ("AK-47 | Safari Mesh (WW)", 2497), ("Nova | Candy Apple (MW)", 2497),
    ("SSG 08 | Mainframe 001 (FT)", 2532), ("P250 | Metallic DDPAT (MW)", 3012)
]

CHAMPION_SKINS_EPIC = [
    ("Glock-18 | High Beam (FN)", 3100), ("MAC-10 | Candy Apple (MW)", 3305),
    ("PP-Bizon | Candy Apple (FN)", 3322), ("USP-S | Forest Leaves (MW)", 3560),
    ("AUG | Ricochet (FT)", 4517), ("SCAR-20 | Trail Blazer (FT)", 4887),
    ("M4A4 | Magnesium (WW)", 4952), ("Desert Eagle | Bronze Deco (FT)", 5177),
    ("Desert Eagle | Blue Ply (WW)", 5270), ("Tec-9 | Red Quartz (MW)", 5892)
]

CHAMPION_SKINS_LEGENDARY = [
    ("Glock-18 | Oxide Blaze (FT)", 5912), ("Dual Berettas | Cobalt Quartz (FT)", 6110),
    ("Glock-18 | Umbral Rabbit (BS)", 6330), ("MAC-10 | Sakkaku (WW)", 6435),
    ("Desert Eagle | Blue Ply (FT)", 6522), ("Nova | Candy Apple (FN)", 6570),
    ("AWP | Safari Mesh (MW)", 6940)
]

CHAMPION_SKINS_MYTHIC = [
    ("M4A1-S | Mud-Spec (FT)", 7432), ("Desert Eagle | Bronze Deco (MW)", 7972),
    ("M4A1-S | Emphorosaurus-S (FT)", 8317), ("MAC-10 | Candy Apple (FN)", 8865),
    ("Desert Eagle | Oxide Blaze (FT)", 9095), ("M4A1-S | Nitro (BS)", 10000),
    ("USP-S | Ticket to Hell (BS)", 10180), ("P250 | Valence (MW)", 10677),
    ("USP-S | Flashback (FT)", 11785), ("Tec-9 | Red Quartz (FN)", 13082),
    ("M4A1-S | Night Terror (MW)", 15130), ("M4A1-S | Nitro (FT)", 16062),
    ("SSG 08 | Fever Dream (FT)", 16777), ("AWP | Pit Viper (FT)", 17952),
    ("Desert Eagle | Light Rail (BS)", 21095), ("SSG 08 | Ghost Crusader (WW)", 23417)
]

DRAFT_SKINS = [
    ("STAT TRAK AK-47 | Elite Build (FT)", 37205),
    ("STAT TRAK PP-Bizon | Cobalt Halftone (FT)", 30745),
    ("P90 | Randy Rush (FN)", 30550),
    ("M4A4 | Turbine (MW)", 20430),
    ("MAG-7 | Insomnia (BS)", 21750),
    ("P2000 | Oceanic (MW)", 16687),
    ("XM1014 | Zombie Offensive (MW)", 12277),
    ("Desert Eagle | Oxide Blaze (FN)", 10017),
    ("SCAR-20 | Fragments (FT)", 8465),
    ("SCAR-20 | Assault (FT)", 7512),
    ("P90 | Grim (FT)", 5957),
    ("Desert Eagle | Mudder (FT)", 1632),
    ("Galil AR | Green Apple (FT)", 1575),
    ("AK-47 | Elite Build (MW)", 20000),
    ("PP-Bizon | Cobalt Halftone (FN)", 18000),
    ("P90 | Randy Rush (MW)", 15500),
    ("M4A4 | Turbine (FN)", 15000),
    ("MAG-7 | Insomnia (MW)", 14000),
    ("P2000 | Oceanic (FN)", 13000),
    ("XM1014 | Zombie Offensive (FN)", 11000),
    ("Desert Eagle | Oxide Blaze (MW)", 9000),
    ("SCAR-20 | Fragments (MW)", 7500),
    ("SCAR-20 | Assault (MW)", 6800),
    ("P90 | Grim (MW)", 5500),
    ("Desert Eagle | Mudder (MW)", 1500),
    ("Galil AR | Green Apple (MW)", 1400)
]

# ============ НОВЫЕ СКИНЫ ДЛЯ КЕЙСА M0NESY ============
MONESY_SKINS = [
    ("USP-S | Sleeping Potion (MW)", 99480),
    ("Five-SeveN | Fraise Crane (FN)", 79442),
    ("Galil AR | Sky Mandala (FN)", 44822),
    ("USP-S | Sleeping Potion (MW)", 38175),
    ("SSG 08 | Calligrafaux (FN)", 29082),
    ("Zeus x27 | Earth Mandala (MW)", 24997),
    ("Five-SeveN | Fraise Crane (FN)", 30297),
    ("UMP-45 | Warm Blooded (MW)", 27462),
    ("Galil AR | Sky Mandala (MW)", 17370),
    ("Zeus x27 | Earth Mandala (MW)", 11707),
    ("UMP-45 | Warm Blooded (MW)", 11407),
    ("MP7 | Coral Paisley (FN)", 8060),
    ("MP5-SD | Picnic (WW)", 5910),
    ("Galil AR | Sky Mandala (FT)", 5827),
    ("Zeus x27 | Earth Mandala (FT)", 5612),
    ("Galil AR | Sky Mandala (FT)", 5000),
    ("UMP-45 | Warm Blooded (FT)", 4385),
    ("Galil AR | Sky Mandala (BS)", 4345),
    ("Tec-9 | Banana Leaf (FN)", 3750),
    ("UMP-45 | Warm Blooded (BS)", 3365),
    ("XM1014 | XoooM (FN)", 3332),
    ("MP9 | Bee-Tron (MW)", 3265),
    ("SSG 08 | Calligrafaux (MW)", 3252),
    ("MP5-SD | Picnic (FT)", 1835),
    ("MP7 | Coral Paisley (MW)", 1740),
    ("Tec-9 | Banana Leaf (FN)", 1397),
    ("R8 Revolver | Mauve Aside (FN)", 1322),
    ("CZ75-Auto | Honey Paisley (WW)", 1237),
    ("MP7 | Coral Paisley (MW)", 1192),
    ("XM1014 | XoooM (FT)", 1115),
    ("SSG 08 | Calligrafaux (FT)", 637)
]

# ============ НОВЫЕ СКИНЫ ДЛЯ КЕЙСА DONK ============
DONK_SKINS = [
    ("USP-S | Cortex (FT)", 83665),
    ("Package Paris 2023 Mirage (FT)", 67587),
    ("UMP-45 | Wild Child (WW)", 66182),
    ("AK-47 | Emerald Pinstripe (MW)", 52310),
    ("M4A1-S | Emphorosaur-S (BS)", 48500),
    ("Dual Berettas | Twin Turbo (FN)", 47857),
    ("AK-47 | Steel Delta (FN)", 45690),
    ("SG 553 | Dragon Tech (MW)", 42155),
    ("Package Paris 2023 Vertigo (BS)", 41997),
    ("Desert Eagle | Directive (FN)", 40537),
    ("Dual Berettas | Dualing Dragons (MW)", 36580),
    ("AWP | Pit Viper (FN)", 36087),
    ("R8 Revolver | Amber Fade (FN)", 27370),
    ("DRYDEN, Feel The... (FT)", 27060),
    ("Desert Eagle | Heat Treated (WW)", 25787),
    ("Capsule Berlin 2019 (FT)", 25375),
    ("Sticker | Natus Vincere (WW)", 25110),
    ("MP7 | Powercore (FN)", 25077),
    ("SSG 08 | Acid Fade (FN)", 21835),
    ("USP-S | Check Engine (FT)", 21275),
    ("SG 553 | Dragon Tech (BS)", 20550),
    ("M4A1-S | Emphorosaur-S (MW)", 20382),
    ("M4A1-S | Emphorosaur-S (WW)", 20095),
    ("CZ75-Auto | Eco (FT)", 19430),
    ("PP-Bizon | Fuel Rod (WW)", 18495),
    ("Glock-18 | Catacombs (FT)", 18040),
    ("P90 | Randy Rush (FT)", 17805),
    ("Sticker | Dirty Money (FT)", 17322),
    ("AK-47 | Uncharted (WW)", 15715),
    ("Tec-9 | Bamboozle (FT)", 14620),
    ("G3SG1 | Dream Glade (FT)", 13472),
    ("Capsule Warhammer 40,0 (FT)", 13307),
    ("P2000 | Amber Fade (WW)", 13272),
    ("USP-S | Flashback (BS)", 12755),
    ("UMP-45 | Plastique (BS)", 11250),
    ("Sticker | FlyQuest (FT)", 10800),
    ("M4A1-S | Emphorosaur-S (FT)", 9475),
    ("M4A1-S | Nitro (FT)", 8777),
    ("Dual Berettas | Flora Carnivora (WW)", 7730),
    ("MP9 | Bioleak (FT)", 9120),
    ("R8 Revolver | Crazy 8 (BS)", 7502),
    ("USP-S | 27 (WW)", 7362),
    ("P90 | Grim (FT)", 7287),
    ("R8 Revolver | Banana Cannon (FT)", 6735),
    ("P250 | Verdigris (FT)", 5372),
    ("Charm | Big Kev (FT)", 5000),
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

def open_draft_case():
    r = random.random() * 100
    if r <= 0.83: return DRAFT_SKINS[0]
    elif r <= 2.04: return DRAFT_SKINS[1]
    elif r <= 4.07: return DRAFT_SKINS[2]
    elif r <= 6.28: return DRAFT_SKINS[3]
    elif r <= 8.47: return DRAFT_SKINS[4]
    elif r <= 11.19: return DRAFT_SKINS[5]
    elif r <= 15.19: return DRAFT_SKINS[6]
    elif r <= 19.58: return DRAFT_SKINS[7]
    elif r <= 24.22: return DRAFT_SKINS[8]
    elif r <= 29.04: return DRAFT_SKINS[9]
    elif r <= 34.77: return DRAFT_SKINS[10]
    elif r <= 41.31: return DRAFT_SKINS[11]
    elif r <= 47.85: return DRAFT_SKINS[12]
    else: return random.choice(DRAFT_SKINS[13:])

def open_m0nesy_case():
    return random.choice(MONESY_SKINS)

def open_donk_case():
    return random.choice(DONK_SKINS)

def open_case_by_name(case_name):
    if case_name == "bomj": return open_bomj_case()
    elif case_name == "berkut": return open_berkut_case()
    elif case_name == "champion": return open_champion_case()
    elif case_name == "draft": return open_draft_case()
    elif case_name == "m0nesy": return open_m0nesy_case()
    elif case_name == "donk": return open_donk_case()
    return random.choice(BOMJ_SKINS_CHEAP)

def get_case_price(case_name):
    prices = {"bomj": 500, "berkut": 1500, "champion": 5000, "draft": 7000, "m0nesy": 10000, "donk": 15000}
    return prices.get(case_name, 500)

# ============ КОЛЕСО (БЕЗ КЕЙСОВ) ============
WHEEL_PRIZES = [
    ("50 coins", 50, "coins"), ("100 coins", 100, "coins"),
    ("150 coins", 150, "coins"), ("200 coins", 200, "coins"),
    ("300 coins", 300, "coins"), ("500 coins", 500, "coins"),
    ("750 coins", 750, "coins"), ("1000 coins", 1000, "coins"),
    ("5% discount", 0, "discount"), ("10% discount", 0, "discount"),
    ("15% discount", 0, "discount"), ("25% discount", 0, "discount")
]

# ============ ИНИЦИАЛИЗАЦИЯ БД ============
def init_db():
    with db_pool.get_connection() as conn:
        c = conn.cursor()
        
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
            is_frozen INTEGER DEFAULT 0,
            prime_expires TEXT,
            trade_link TEXT,
            created_at TEXT,
            last_activity TEXT,
            daily_reward_day INTEGER DEFAULT 0,
            daily_reward_last TEXT,
            subscribed_reward INTEGER DEFAULT 0,
            refund_requested INTEGER DEFAULT 0,
            prime_expires_date TEXT,
            daily_streak INTEGER DEFAULT 0,
            last_daily_date TEXT
        )''')
        
        c.execute('''CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            item_name TEXT,
            item_price INTEGER,
            opened_at TEXT,
            withdraw_status TEXT DEFAULT 'none',
            withdraw_expires TEXT
        )''')
        
        c.execute('''CREATE TABLE IF NOT EXISTS cases (
            name TEXT PRIMARY KEY,
            price INTEGER,
            max_item_price INTEGER,
            jackpot_chance REAL,
            is_active INTEGER DEFAULT 1
        )''')
        
        c.execute('''CREATE TABLE IF NOT EXISTS promocodes (
            code TEXT PRIMARY KEY,
            reward INTEGER,
            uses_left INTEGER,
            created_by INTEGER,
            target_user INTEGER DEFAULT 0,
            created_at TEXT,
            is_active INTEGER DEFAULT 1
        )''')
        
        c.execute('''CREATE TABLE IF NOT EXISTS promo_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            username TEXT,
            code TEXT,
            reward INTEGER,
            used_at TEXT
        )''')
        
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
        
        c.execute('''CREATE TABLE IF NOT EXISTS deposit_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            amount INTEGER,
            discount_used INTEGER,
            created_at TEXT
        )''')
        
        c.execute('''CREATE TABLE IF NOT EXISTS refund_requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            amount INTEGER,
            status TEXT DEFAULT 'pending',
            created_at TEXT
        )''')
        
        c.execute('''CREATE TABLE IF NOT EXISTS settings (
            key TEXT PRIMARY KEY,
            value TEXT
        )''')
        
        c.execute('''CREATE TABLE IF NOT EXISTS user_achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            achievement_id INTEGER,
            unlocked_at TEXT,
            claimed INTEGER DEFAULT 0,
            UNIQUE(user_id, achievement_id)
        )''')
        
        c.execute('''CREATE TABLE IF NOT EXISTS friends (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            friend_id INTEGER,
            status TEXT DEFAULT 'pending',
            created_at TEXT,
            UNIQUE(user_id, friend_id)
        )''')
        
        c.execute('''CREATE TABLE IF NOT EXISTS broadcasts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT,
            created_at TEXT,
            expires_at TEXT
        )''')
        
        c.execute('''CREATE TABLE IF NOT EXISTS broadcast_reads (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            broadcast_id INTEGER,
            user_id INTEGER,
            read_at TEXT,
            UNIQUE(broadcast_id, user_id)
        )''')
        
        c.execute("INSERT OR IGNORE INTO cases (name, price, max_item_price, jackpot_chance) VALUES ('bomj', 500, 5000, 1.0)")
        c.execute("INSERT OR IGNORE INTO cases (name, price, max_item_price, jackpot_chance) VALUES ('berkut', 1500, 50000, 1.5)")
        c.execute("INSERT OR IGNORE INTO cases (name, price, max_item_price, jackpot_chance) VALUES ('champion', 5000, 250000, 2.0)")
        c.execute("INSERT OR IGNORE INTO cases (name, price, max_item_price, jackpot_chance) VALUES ('draft', 7000, 50000, 2.0)")
        c.execute("INSERT OR IGNORE INTO cases (name, price, max_item_price, jackpot_chance) VALUES ('m0nesy', 10000, 100000, 2.5)")
        c.execute("INSERT OR IGNORE INTO cases (name, price, max_item_price, jackpot_chance) VALUES ('donk', 15000, 150000, 3.0)")
        
        c.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('coin_rate', '217')")
        c.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('pvp_enabled', '0')")
        c.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('withdraw_enabled', '1')")
        c.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('wheel_enabled', '1')")
        c.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('achievements_enabled', '1')")
        c.execute("INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_password', '250734382')")
        
        c.execute("SELECT COUNT(*) FROM users WHERE is_admin=1")
        if c.fetchone()[0] == 0:
            c.execute("INSERT INTO users (id, username, password, coins, is_admin, created_at, last_wheel_date) VALUES (?,?,?,?,?,?,?)",
                      (1, "admin", "admin123", 1000000, 1, datetime.now().isoformat(), "2000-01-01"))

# ============ СТАТИЧЕСКИЕ ФАЙЛЫ ============
@app.route('/images/<path:filename>')
def serve_images(filename):
    return send_from_directory('images', filename)

@app.route('/static/css/<path:filename>')
def serve_css(filename):
    return send_from_directory('static/css', filename)

@app.route('/static/js/<path:filename>')
def serve_js(filename):
    return send_from_directory('static/js', filename)

@app.route('/')
@app.route('/miniapp')
def index():
    return render_template('index.html')

# ============ API ============

@app.route('/api/miniapp_login', methods=['POST'])
def miniapp_login():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        username = data.get('username')
        ref_code = data.get('ref_code')
        
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            total_users = c.execute("SELECT COUNT(*) FROM users").fetchone()[0]
            is_admin = (total_users < 2)
            
            c.execute("SELECT id, username, is_admin, coins FROM users WHERE id=?", (user_id,))
            user = c.fetchone()
            
            if user:
                if user[2] == 1:
                    is_admin = True
                if user[2] != is_admin:
                    c.execute("UPDATE users SET is_admin=?, username=?, last_activity=? WHERE id=?", (is_admin, username, datetime.now().isoformat(), user_id))
                else:
                    c.execute("UPDATE users SET last_activity=?, username=? WHERE id=?", (datetime.now().isoformat(), username, user_id))
                if user[3] < 0:
                    c.execute("UPDATE users SET is_frozen=1 WHERE id=?", (user_id,))
                return jsonify({"success": True, "user_id": user_id, "username": username, "is_admin": is_admin or user[2]})
            else:
                # Новый пользователь
                coins = 500
                if ref_code:
                    # Начисляем бонус пришедшему (+3000)
                    coins += 3000
                    # Начисляем бонус пригласившему (+5000)
                    c.execute("UPDATE users SET coins = coins + 5000 WHERE id = ?", (ref_code,))
                
                c.execute("INSERT INTO users (id, username, password, is_admin, coins, level, exp, created_at, last_wheel_date, last_activity) VALUES (?,?,?,?,?,?,?,?,?,?)",
                          (user_id, username, "telegram_" + str(user_id), is_admin, coins, 1, 0, datetime.now().isoformat(), "2000-01-01", datetime.now().isoformat()))
                return jsonify({"success": True, "user_id": user_id, "username": username, "is_admin": is_admin})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/daily_reward', methods=['POST'])
def daily_reward():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            user = c.execute("SELECT daily_reward_day, daily_reward_last, coins, daily_streak, last_daily_date FROM users WHERE id=?", (user_id,)).fetchone()
            if not user:
                return jsonify({"error": "User not found"}), 404
            
            today = date.today().isoformat()
            day, last_date, coins, streak, last_daily = user[0], user[1], user[2], user[3] or 0, user[4]
            
            if last_date != today:
                if last_date:
                    last = datetime.strptime(last_date, "%Y-%m-%d").date()
                    diff = (date.today() - last).days
                    if diff == 1:
                        streak += 1
                    else:
                        streak = 1
                else:
                    streak = 1
                
                # Проверяем бонус за 30 дней
                bonus = 0
                if streak >= 30:
                    bonus = 5000
                    streak = 0  # Сброс после получения
                
                day += 1
                if day > 7:
                    day = 1
                
                rewards = {1: 500, 2: 750, 3: 1000, 4: 1250, 5: 1500, 6: 2500, 7: 3000}
                reward = rewards.get(day, 500)
                total_reward = reward + bonus
                
                c.execute("UPDATE users SET coins=coins+?, daily_reward_day=?, daily_reward_last=?, daily_streak=?, last_daily_date=? WHERE id=?", 
                         (total_reward, day, today, streak, today, user_id))
                conn.commit()
                return jsonify({"success": True, "day": day, "reward": total_reward, "bonus": bonus, "streak": streak, "coins": coins + total_reward})
            else:
                return jsonify({"error": "Already claimed today"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/miniapp_profile', methods=['GET'])
def miniapp_profile():
    try:
        user_id = request.args.get('user_id')
        if not user_id:
            return jsonify({"error": "No user_id"}), 400
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            
            # Авторазморозка
            user_check = c.execute("SELECT coins, is_frozen FROM users WHERE id=?", (user_id,)).fetchone()
            if user_check and user_check[1] == 1 and user_check[0] >= 0:
                c.execute("UPDATE users SET is_frozen=0 WHERE id=?", (user_id,))
            
            # Проверка прайм-подписки
            c.execute("SELECT prime_expires_date FROM users WHERE id=?", (user_id,))
            prime_data = c.fetchone()
            is_prime = False
            if prime_data and prime_data[0]:
                try:
                    expires = datetime.strptime(prime_data[0], "%Y-%m-%d").date()
                    if expires >= date.today():
                        is_prime = True
                except:
                    pass
            
            c.execute("SELECT id, username, coins, level, exp, pvp_wins, pvp_losses, wheel_spins, is_admin, total_deposit, is_frozen, daily_reward_day, daily_reward_last, subscribed_reward, daily_streak FROM users WHERE id=?", (user_id,))
            user = c.fetchone()
            if user:
                referrals = c.execute("SELECT COUNT(*) FROM users WHERE referred_by=?", (user_id,)).fetchone()[0]
                return jsonify({
                    "id": user[0], "username": user[1], "coins": user[2] or 0,
                    "level": user[3] or 1, "exp": user[4] or 0,
                    "wins": user[5] or 0, "losses": user[6] or 0,
                    "wheel_spins": user[7] or 0, "referrals": referrals,
                    "is_admin": user[8] or 0, "total_deposit": user[9] or 0,
                    "is_frozen": user[10] or 0,
                    "daily_reward_day": user[11] or 0,
                    "daily_reward_last": user[12],
                    "subscribed_reward": user[13] or 0,
                    "daily_streak": user[14] or 0,
                    "is_prime": is_prime
                })
            else:
                total_users = c.execute("SELECT COUNT(*) FROM users").fetchone()[0]
                is_admin = (total_users < 2)
                c.execute("INSERT INTO users (id, username, password, is_admin, coins, level, created_at, last_wheel_date) VALUES (?,?,?,?,?,?,?,?)",
                          (user_id, "player_" + str(user_id), "telegram_" + str(user_id), is_admin, 500, 1, datetime.now().isoformat(), "2000-01-01"))
                conn.commit()
                return jsonify({"id": user_id, "username": "player_" + str(user_id), "coins": 500, "level": 1, 
                              "exp": 0, "wins": 0, "losses": 0, "wheel_spins": 1, "referrals": 0, 
                              "is_admin": is_admin, "total_deposit": 0, "is_frozen": 0,
                              "daily_reward_day": 0, "daily_reward_last": None, "subscribed_reward": 0,
                              "daily_streak": 0, "is_prime": False})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/miniapp_inventory', methods=['GET'])
def miniapp_inventory():
    try:
        user_id = request.args.get('user_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("SELECT id, item_name, item_price, withdraw_status, withdraw_expires FROM inventory WHERE user_id=? ORDER BY id DESC", (user_id,))
            items = c.fetchall()
            return jsonify({"items": [{"id": i[0], "name": i[1], "price": i[2], "withdraw_status": i[3] or 'none', "withdraw_expires": i[4]} for i in items]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/miniapp_open_case', methods=['POST'])
def miniapp_open_case():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        case_name = data.get('case_name')
        price = get_case_price(case_name)
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            user = c.execute("SELECT coins, is_frozen FROM users WHERE id=?", (user_id,)).fetchone()
            if not user:
                return jsonify({"error": "User not found"}), 404
            if user[1] == 1:
                return jsonify({"error": "Account frozen"}), 400
            if user[0] < price:
                return jsonify({"error": f"Need {price} coins"}), 400
            c.execute("UPDATE users SET coins=coins-? WHERE id=?", (price, user_id))
            item_name, item_price = open_case_by_name(case_name)
            c.execute("INSERT INTO inventory (user_id, item_name, item_price, opened_at) VALUES (?,?,?,?)", (user_id, item_name, item_price, datetime.now().isoformat()))
        add_exp(user_id, 5)
        return jsonify({"success": True, "item": item_name, "price": item_price})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/miniapp_sell_item', methods=['POST'])
def miniapp_sell_item():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        item_id = data.get('item_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            user = c.execute("SELECT is_frozen FROM users WHERE id=?", (user_id,)).fetchone()
            if user and user[0] == 1:
                return jsonify({"error": "Account frozen"}), 400
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

@app.route('/api/miniapp_sell_all', methods=['POST'])
def miniapp_sell_all():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            user = c.execute("SELECT is_frozen FROM users WHERE id=?", (user_id,)).fetchone()
            if user and user[0] == 1:
                return jsonify({"error": "Account frozen"}), 400
            items = c.execute("SELECT item_price FROM inventory WHERE user_id=? AND withdraw_status='none'", (user_id,)).fetchall()
            total = sum(i[0] for i in items)
            c.execute("DELETE FROM inventory WHERE user_id=? AND withdraw_status='none'", (user_id,))
            c.execute("UPDATE users SET coins=coins+? WHERE id=?", (total, user_id))
        add_exp(user_id, len(items) * 10)
        return jsonify({"success": True, "total": total, "count": len(items)})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/miniapp_wheel', methods=['POST'])
def miniapp_wheel():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            user = c.execute("SELECT is_frozen FROM users WHERE id=?", (user_id,)).fetchone()
            if user and user[0] == 1:
                return jsonify({"error": "Account frozen"}), 400
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
                c.execute("INSERT INTO inventory (user_id, item_name, item_price, opened_at) VALUES (?,?,?,?)", (user_id, item_name, item_price, datetime.now().isoformat()))
                result = {"name": prize_name, "case": prize_type, "item": item_name, "price": item_price}
                add_exp(user_id, 5)
            return jsonify({"success": True, "result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/promo_activate', methods=['POST'])
def promo_activate():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        code = data.get('code').upper()
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            user = c.execute("SELECT is_frozen FROM users WHERE id=?", (user_id,)).fetchone()
            if user and user[0] == 1:
                return jsonify({"error": "Account frozen"}), 400
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
            c.execute("INSERT INTO promo_usage (user_id, username, code, reward, used_at) VALUES (?,?,?,?,?)", (user_id, "", code, promo[0], datetime.now().isoformat()))
            return jsonify({"success": True, "reward": promo[0]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/withdraw_request', methods=['POST'])
def withdraw_request():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        item_id = data.get('item_id')
        trade_link = data.get('trade_link')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            user = c.execute("SELECT username, coins, is_frozen, total_deposit FROM users WHERE id=?", (user_id,)).fetchone()
            if not user:
                return jsonify({"error": "User not found"}), 404
            if user[2] == 1:
                return jsonify({"error": "Account frozen"}), 400
            
            if user[3] < 115:
                return jsonify({"error": "❌ Вывод доступен только при пополнении от 115 RUB"}), 400
            
            item = c.execute("SELECT item_name, item_price FROM inventory WHERE id=? AND user_id=?", (item_id, user_id)).fetchone()
            if not item:
                return jsonify({"error": "Предмет не найден"}), 404
            existing = c.execute("SELECT id FROM withdraw_requests WHERE item_id=? AND status='pending'", (item_id,)).fetchone()
            if existing:
                return jsonify({"error": "Заявка на этот предмет уже отправлена"}), 400
            c.execute("UPDATE inventory SET withdraw_status='pending' WHERE id=? AND user_id=?", (item_id, user_id))
            expires_at = (datetime.now() + timedelta(hours=24)).isoformat()
            c.execute("INSERT INTO withdraw_requests (user_id, username, item_id, item_name, item_price, trade_link, created_at, expires_at) VALUES (?,?,?,?,?,?,?,?)",
                      (user_id, user[0], item_id, item[0], item[1], trade_link, datetime.now().isoformat(), expires_at))
            return jsonify({"success": True, "expires_at": expires_at, "message": "Заявка создана! У вас 24 часа для подтверждения."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/withdraw_check', methods=['GET'])
def withdraw_check():
    try:
        user_id = request.args.get('user_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            now = datetime.now().isoformat()
            expired = c.execute("SELECT id, item_id FROM withdraw_requests WHERE user_id=? AND status='pending' AND expires_at < ?", (user_id, now)).fetchall()
            for req in expired:
                c.execute("UPDATE withdraw_requests SET status='expired' WHERE id=?", (req[0],))
                c.execute("UPDATE inventory SET withdraw_status='none' WHERE id=?", (req[1],))
            active = c.execute("SELECT id, item_name, item_price, created_at, expires_at FROM withdraw_requests WHERE user_id=? AND status='pending'", (user_id,)).fetchall()
            return jsonify({"active": [{"id": r[0], "item_name": r[1], "item_price": r[2], "created_at": r[3], "expires_at": r[4]} for r in active]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/check_subscription', methods=['POST'])
def check_subscription():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        CHANNEL_ID = "@ARTCSSKINS"
        BOT_TOKEN = "8990265498:AAHwke0u_4MroSTSiY_Krc-8nUS-XAP__K0"
        url = f"https://api.telegram.org/bot{BOT_TOKEN}/getChatMember"
        params = {"chat_id": CHANNEL_ID, "user_id": user_id}
        response = requests.get(url, params=params, timeout=10)
        data = response.json()
        if data.get("ok"):
            status = data["result"].get("status")
            if status in ["member", "creator", "administrator"]:
                with db_pool.get_connection() as conn:
                    c = conn.cursor()
                    rewarded = c.execute("SELECT subscribed_reward FROM users WHERE id=?", (user_id,)).fetchone()
                    if rewarded and rewarded[0] == 1:
                        return jsonify({"subscribed": True, "already_rewarded": True, "message": "Ты уже получил награду!"})
                    else:
                        c.execute("UPDATE users SET coins=coins+3000, subscribed_reward=1 WHERE id=?", (user_id,))
                        conn.commit()
                        return jsonify({"subscribed": True, "already_rewarded": False, "reward": 3000, "message": "✅ Подписка подтверждена! +3000 монет"})
            else:
                return jsonify({"subscribed": False, "message": "❌ Ты не подписан на канал!"})
        else:
            return jsonify({"error": "Ошибка проверки подписки. Убедись, что бот добавлен в канал."}), 500
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/refund_request', methods=['POST'])
def refund_request():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            user = c.execute("SELECT coins, total_deposit FROM users WHERE id=?", (user_id,)).fetchone()
            if not user:
                return jsonify({"error": "User not found"}), 404
            coins = user[0]
            deposit = user[1]
            if coins < deposit * 217:
                return jsonify({"error": "Монеты были потрачены, возврат невозможен"}), 400
            c.execute("INSERT INTO refund_requests (user_id, amount, created_at) VALUES (?,?,?)", (user_id, deposit, datetime.now().isoformat()))
            c.execute("UPDATE users SET refund_requested=1 WHERE id=?", (user_id,))
            return jsonify({"success": True, "message": "Заявка на возврат отправлена. Ожидайте до 7 рабочих дней."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============ НОВЫЕ API ============

# 1. ПОСЛЕДНИЕ ДРОПЫ
@app.route('/api/recent_drops', methods=['GET'])
def recent_drops():
    try:
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            yesterday = (datetime.now() - timedelta(hours=24)).isoformat()
            c.execute('''
                SELECT 
                    i.item_name,
                    i.item_price,
                    i.opened_at,
                    u.username,
                    u.id as user_id
                FROM inventory i
                JOIN users u ON i.user_id = u.id
                WHERE i.opened_at > ?
                ORDER BY i.opened_at DESC
                LIMIT 50
            ''', (yesterday,))
            items = c.fetchall()
            result = []
            for row in items:
                username = row[3] or 'Player'
                avatar_letter = username[0].upper()
                colors = ['#ffd700', '#f5a623', '#e8a800', '#ff6b35', '#ff4444', '#ff8844', '#ffaa44', '#ffcc44']
                color_index = len(username) % len(colors)
                result.append({
                    'item_name': row[0],
                    'item_price': row[1],
                    'opened_at': row[2],
                    'username': username,
                    'user_id': row[4],
                    'avatar_letter': avatar_letter,
                    'avatar_color': colors[color_index]
                })
            return jsonify({'drops': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 2. ТОП ИГРОКОВ
@app.route('/api/top_players', methods=['GET'])
def top_players():
    try:
        user_id = request.args.get('user_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute('''
                SELECT 
                    id, username, coins, total_deposit,
                    (SELECT COUNT(*) FROM users WHERE referred_by = u.id) as referrals,
                    (SELECT COUNT(*) FROM inventory WHERE user_id = u.id) as items_count,
                    (coins + (SELECT COUNT(*) FROM users WHERE referred_by = u.id) * 100 + total_deposit * 217 + (SELECT COUNT(*) FROM inventory WHERE user_id = u.id) * 10) as rating
                FROM users u
                WHERE is_admin = 0
                ORDER BY rating DESC
                LIMIT 10
            ''')
            top = c.fetchall()
            top_list = []
            for i, row in enumerate(top, 1):
                top_list.append({
                    'place': i,
                    'id': row[0],
                    'username': row[1],
                    'coins': row[2],
                    'deposit': row[3],
                    'referrals': row[4],
                    'items': row[5],
                    'rating': row[6]
                })
            user_place = None
            if user_id:
                c.execute('''
                    SELECT 
                        id, username, coins, total_deposit,
                        (SELECT COUNT(*) FROM users WHERE referred_by = u.id) as referrals,
                        (SELECT COUNT(*) FROM inventory WHERE user_id = u.id) as items_count,
                        (coins + (SELECT COUNT(*) FROM users WHERE referred_by = u.id) * 100 + total_deposit * 217 + (SELECT COUNT(*) FROM inventory WHERE user_id = u.id) * 10) as rating,
                        (SELECT COUNT(*) + 1 FROM users WHERE 
                            (coins + (SELECT COUNT(*) FROM users WHERE referred_by = users.id) * 100 + total_deposit * 217 + (SELECT COUNT(*) FROM inventory WHERE user_id = users.id) * 10) > 
                            (SELECT coins + (SELECT COUNT(*) FROM users WHERE referred_by = u2.id) * 100 + total_deposit * 217 + (SELECT COUNT(*) FROM inventory WHERE user_id = u2.id) * 10 FROM users u2 WHERE u2.id = ?)
                        ) as place
                    FROM users u
                    WHERE u.id = ?
                ''', (user_id, user_id))
                user_row = c.fetchone()
                if user_row:
                    user_place = {
                        'place': user_row[7] or 0,
                        'id': user_row[0],
                        'username': user_row[1],
                        'coins': user_row[2],
                        'deposit': user_row[3],
                        'referrals': user_row[4],
                        'items': user_row[5],
                        'rating': user_row[6]
                    }
            return jsonify({'top': top_list, 'user': user_place})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 3. ДРУЗЬЯ
@app.route('/api/search_user', methods=['GET'])
def search_user():
    try:
        user_id = request.args.get('user_id')
        search_id = request.args.get('search_id')
        if not search_id:
            return jsonify({'error': 'Введите ID пользователя'}), 400
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            users = c.execute('''
                SELECT id, username, coins, level, is_frozen, is_banned,
                       (SELECT COUNT(*) FROM friends WHERE user_id = ? AND friend_id = users.id AND status = 'accepted') as is_friend,
                       (SELECT COUNT(*) FROM friends WHERE user_id = ? AND friend_id = users.id AND status = 'pending') as request_sent,
                       (SELECT COUNT(*) FROM friends WHERE user_id = users.id AND friend_id = ? AND status = 'pending') as request_received,
                       (SELECT COUNT(*) FROM inventory WHERE user_id = users.id) as items_count,
                       last_activity
                FROM users 
                WHERE id = ? OR username LIKE ?
            ''', (user_id, user_id, user_id, search_id, f'%{search_id}%'))
            results = c.fetchall()
            if not results:
                return jsonify({'error': 'Пользователь не найден'}), 404
            users_list = []
            for row in results:
                is_online = row[8] and (datetime.now() - datetime.fromisoformat(row[8])).seconds < 120
                users_list.append({
                    'id': row[0],
                    'username': row[1],
                    'coins': row[2],
                    'level': row[3],
                    'is_frozen': row[4],
                    'is_banned': row[5],
                    'is_friend': row[6] > 0,
                    'request_sent': row[7] > 0,
                    'request_received': row[8] > 0,
                    'items_count': row[9],
                    'is_online': is_online,
                    'last_activity': row[8]
                })
            return jsonify({'users': users_list})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/send_friend_request', methods=['POST'])
def send_friend_request():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        friend_id = data.get('friend_id')
        if user_id == friend_id:
            return jsonify({'error': 'Нельзя добавить себя в друзья'}), 400
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            existing = c.execute('''
                SELECT * FROM friends 
                WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
            ''', (user_id, friend_id, friend_id, user_id)).fetchone()
            if existing:
                return jsonify({'error': 'Заявка уже существует'}), 400
            c.execute('''
                INSERT INTO friends (user_id, friend_id, status, created_at)
                VALUES (?, ?, 'pending', ?)
            ''', (user_id, friend_id, datetime.now().isoformat()))
            return jsonify({'success': True, 'message': 'Заявка отправлена!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/accept_friend', methods=['POST'])
def accept_friend():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        friend_id = data.get('friend_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute('''
                UPDATE friends 
                SET status = 'accepted' 
                WHERE user_id = ? AND friend_id = ?
            ''', (friend_id, user_id))
            return jsonify({'success': True, 'message': 'Друг добавлен!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/get_friends', methods=['GET'])
def get_friends():
    try:
        user_id = request.args.get('user_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            friends = c.execute('''
                SELECT 
                    u.id, u.username, u.coins, u.level, u.is_frozen, u.is_banned,
                    (SELECT COUNT(*) FROM inventory WHERE user_id = u.id) as items_count,
                    u.last_activity,
                    f.created_at
                FROM friends f
                JOIN users u ON (u.id = f.friend_id OR u.id = f.user_id)
                WHERE (f.user_id = ? OR f.friend_id = ?) 
                  AND f.status = 'accepted'
                  AND u.id != ?
            ''', (user_id, user_id, user_id)).fetchall()
            requests = c.execute('''
                SELECT 
                    u.id, u.username, u.coins, u.level,
                    f.created_at
                FROM friends f
                JOIN users u ON u.id = f.user_id
                WHERE f.friend_id = ? AND f.status = 'pending'
            ''', (user_id,)).fetchall()
            friends_list = []
            for row in friends:
                is_online = row[7] and (datetime.now() - datetime.fromisoformat(row[7])).seconds < 120
                friends_list.append({
                    'id': row[0],
                    'username': row[1],
                    'coins': row[2],
                    'level': row[3],
                    'is_frozen': row[4],
                    'is_banned': row[5],
                    'items_count': row[6],
                    'is_online': is_online,
                    'last_activity': row[7],
                    'since': row[8]
                })
            requests_list = []
            for row in requests:
                requests_list.append({
                    'id': row[0],
                    'username': row[1],
                    'coins': row[2],
                    'level': row[3],
                    'created_at': row[4]
                })
            return jsonify({
                'friends': friends_list,
                'requests': requests_list
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reject_friend', methods=['POST'])
def reject_friend():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        friend_id = data.get('friend_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute('''
                DELETE FROM friends 
                WHERE user_id = ? AND friend_id = ? AND status = 'pending'
            ''', (friend_id, user_id))
            return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/remove_friend', methods=['POST'])
def remove_friend():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        friend_id = data.get('friend_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute('''
                DELETE FROM friends 
                WHERE (user_id = ? AND friend_id = ?) OR (user_id = ? AND friend_id = ?)
            ''', (user_id, friend_id, friend_id, user_id))
            return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 4. АПГРЕЙД
@app.route('/api/upgrade_items', methods=['GET'])
def get_upgrade_items():
    try:
        user_id = request.args.get('user_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute('''
                SELECT id, item_name, item_price 
                FROM inventory 
                WHERE user_id = ? AND item_price >= 1000 AND withdraw_status = 'none'
                ORDER BY item_price ASC
            ''', (user_id,))
            items = c.fetchall()
            return jsonify({
                'items': [{
                    'id': row[0],
                    'name': row[1],
                    'price': row[2]
                } for row in items]
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upgrade_calculate', methods=['POST'])
def upgrade_calculate():
    try:
        data = request.get_json()
        source_id = data.get('source_id')
        target_price = data.get('target_price')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute('SELECT item_price FROM inventory WHERE id = ?', (source_id,))
            source = c.fetchone()
            if not source:
                return jsonify({'error': 'Предмет не найден'}), 404
            source_price = source[0]
            diff = target_price - source_price
            if diff <= 0:
                chance = 95.0
            else:
                chance = max(5, 95 - (diff / source_price) * 50)
                chance = round(chance, 2)
            profit = target_price - source_price
            coefficient = round((target_price / source_price), 2) if source_price > 0 else 1
            return jsonify({
                'success': True,
                'source_price': source_price,
                'target_price': target_price,
                'chance': chance,
                'profit': profit,
                'coefficient': coefficient,
                'risk': 'ВЫСОКИЙ' if chance < 30 else 'СРЕДНИЙ' if chance < 60 else 'НИЗКИЙ'
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/upgrade_execute', methods=['POST'])
def upgrade_execute():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        source_id = data.get('source_id')
        target_name = data.get('target_name')
        target_price = data.get('target_price')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            user = c.execute('SELECT is_frozen FROM users WHERE id = ?', (user_id,)).fetchone()
            if user[0] == 1:
                return jsonify({'error': 'Аккаунт заморожен'}), 400
            c.execute('SELECT item_price FROM inventory WHERE id = ? AND user_id = ?', (source_id, user_id))
            source = c.fetchone()
            if not source:
                return jsonify({'error': 'Предмет не найден'}), 404
            source_price = source[0]
            diff = target_price - source_price
            if diff <= 0:
                chance = 95.0
            else:
                chance = max(5, 95 - (diff / source_price) * 50)
                chance = round(chance, 2)
            roll = random.random() * 100
            success = roll <= chance
            c.execute('DELETE FROM inventory WHERE id = ? AND user_id = ?', (source_id, user_id))
            if success:
                c.execute('''
                    INSERT INTO inventory (user_id, item_name, item_price, opened_at)
                    VALUES (?, ?, ?, ?)
                ''', (user_id, target_name, target_price, datetime.now().isoformat()))
                add_exp(user_id, 20)
                return jsonify({
                    'success': True,
                    'upgraded': True,
                    'target_name': target_name,
                    'target_price': target_price,
                    'chance': chance,
                    'roll': round(roll, 2)
                })
            else:
                add_exp(user_id, 5)
                return jsonify({
                    'success': True,
                    'upgraded': False,
                    'chance': chance,
                    'roll': round(roll, 2),
                    'lost_item': source_price
                })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 5. АДМИН-ПАНЕЛЬ С ПАРОЛЕМ
@app.route('/api/admin_verify', methods=['POST'])
def admin_verify():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        password = data.get('password')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            stored = c.execute("SELECT value FROM settings WHERE key = 'admin_password'").fetchone()
            if not stored:
                return jsonify({'error': 'Пароль не установлен'}), 500
            if password != stored[0]:
                return jsonify({'error': 'Неверный пароль'}), 401
            user = c.execute("SELECT is_admin FROM users WHERE id = ?", (user_id,)).fetchone()
            if not user:
                return jsonify({'error': 'Пользователь не найден'}), 404
            if user[0] == 0:
                c.execute("UPDATE users SET is_admin = 1 WHERE id = ?", (user_id,))
            return jsonify({
                'success': True,
                'is_admin': True,
                'message': 'Доступ разрешён!'
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/admin_change_password', methods=['POST'])
def admin_change_password():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        old_password = data.get('old_password')
        new_password = data.get('new_password')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            user = c.execute("SELECT is_admin FROM users WHERE id = ?", (user_id,)).fetchone()
            if not user or user[0] == 0:
                return jsonify({'error': 'Нет прав'}), 403
            stored = c.execute("SELECT value FROM settings WHERE key = 'admin_password'").fetchone()
            if not stored or old_password != stored[0]:
                return jsonify({'error': 'Неверный старый пароль'}), 401
            c.execute("UPDATE settings SET value = ? WHERE key = 'admin_password'", (new_password,))
            return jsonify({'success': True, 'message': 'Пароль изменён!'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 6. РАССЫЛКА
@app.route('/api/admin/broadcast', methods=['POST'])
def admin_broadcast():
    try:
        data = request.get_json()
        message = data.get('message')
        expires_hours = 24
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            expires_at = (datetime.now() + timedelta(hours=expires_hours)).isoformat()
            c.execute('''
                INSERT INTO broadcasts (message, created_at, expires_at)
                VALUES (?, ?, ?)
            ''', (message, datetime.now().isoformat(), expires_at))
            broadcast_id = c.lastrowid
            users = c.execute("SELECT id FROM users").fetchall()
            return jsonify({
                'success': True,
                'broadcast_id': broadcast_id,
                'count': len(users),
                'expires_at': expires_at,
                'message': f'Рассылка отправлена {len(users)} пользователям!'
            })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/get_broadcasts', methods=['GET'])
def get_broadcasts():
    try:
        user_id = request.args.get('user_id')
        now = datetime.now().isoformat()
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            broadcasts = c.execute('''
                SELECT b.id, b.message, b.created_at, b.expires_at
                FROM broadcasts b
                LEFT JOIN broadcast_reads br ON b.id = br.broadcast_id AND br.user_id = ?
                WHERE br.id IS NULL
                  AND b.expires_at > ?
                ORDER BY b.created_at DESC
            ''', (user_id, now))
            result = []
            for row in broadcasts:
                result.append({
                    'id': row[0],
                    'message': row[1],
                    'created_at': row[2],
                    'expires_at': row[3]
                })
            return jsonify({'broadcasts': result})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/mark_broadcast_read', methods=['POST'])
def mark_broadcast_read():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        broadcast_id = data.get('broadcast_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute('''
                INSERT OR IGNORE INTO broadcast_reads (broadcast_id, user_id, read_at)
                VALUES (?, ?, ?)
            ''', (broadcast_id, user_id, datetime.now().isoformat()))
            return jsonify({'success': True})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 7. ПРАЙМ-ПОДПИСКА
@app.route('/api/prime/subscribe', methods=['POST'])
def prime_subscribe():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        # Здесь должна быть интеграция с платежной системой
        # Пока просто активируем на месяц
        expires = (date.today() + timedelta(days=30)).isoformat()
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("UPDATE users SET prime_expires_date = ? WHERE id = ?", (expires, user_id))
            return jsonify({'success': True, 'expires': expires})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/prime/status', methods=['GET'])
def prime_status():
    try:
        user_id = request.args.get('user_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("SELECT prime_expires_date FROM users WHERE id = ?", (user_id,))
            result = c.fetchone()
            if result and result[0]:
                expires = datetime.strptime(result[0], "%Y-%m-%d").date()
                if expires >= date.today():
                    return jsonify({'is_prime': True, 'expires': expires.isoformat()})
            return jsonify({'is_prime': False})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# ============ СТАРЫЕ АДМИН-ФУНКЦИИ ============

@app.route('/api/admin/users', methods=['GET'])
def admin_users():
    with db_pool.get_connection() as conn:
        c = conn.cursor()
        c.execute("SELECT id, username, coins, level, is_frozen, is_banned FROM users ORDER BY id DESC LIMIT 100")
        users = c.fetchall()
        return jsonify({"users": [{"id": u[0], "username": u[1], "coins": u[2], "level": u[3], "is_frozen": u[4], "is_banned": u[5]} for u in users]})

@app.route('/api/admin/get_user_by_id/<int:user_id>', methods=['GET'])
def admin_get_user_by_id(user_id):
    with db_pool.get_connection() as conn:
        c = conn.cursor()
        c.execute("SELECT id, username, coins, level, is_frozen, is_banned FROM users WHERE id=?", (user_id,))
        user = c.fetchone()
        if user:
            return jsonify({"id": user[0], "username": user[1], "coins": user[2], "level": user[3], "is_frozen": user[4], "is_banned": user[5]})
        return jsonify({"error": "User not found"}), 404

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
            user = c.execute("SELECT coins FROM users WHERE id=?", (user_id,)).fetchone()
            if user[0] < amount:
                return jsonify({"error": "Недостаточно монет"}), 400
            c.execute("UPDATE users SET coins=coins-? WHERE id=?", (amount, user_id))
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/remove_deposit', methods=['POST'])
def admin_remove_deposit():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        amount = data.get('amount')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            user = c.execute("SELECT total_deposit FROM users WHERE id=?", (user_id,)).fetchone()
            if user[0] < amount:
                return jsonify({"error": "Недостаточно депозита"}), 400
            c.execute("UPDATE users SET total_deposit=total_deposit-? WHERE id=?", (amount, user_id))
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/simulate_deposit', methods=['POST'])
def admin_simulate_deposit():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        rub_amount = data.get('amount')
        discount = data.get('discount', 0)
        bonus = int(rub_amount * discount / 100)
        total = rub_amount + bonus
        coin_rate = 217
        coins = total * coin_rate
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("UPDATE users SET coins=coins+?, total_deposit=total_deposit+? WHERE id=?", (coins, rub_amount, user_id))
            c.execute("INSERT INTO deposit_history (user_id, amount, discount_used, created_at) VALUES (?,?,?,?)", (user_id, rub_amount, discount, datetime.now().isoformat()))
            c.execute("UPDATE users SET active_discount=0 WHERE id=?", (user_id,))
        return jsonify({"success": True, "coins": coins})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/set_coin_rate', methods=['POST'])
def admin_set_coin_rate():
    try:
        data = request.get_json()
        rate = data.get('rate')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("UPDATE settings SET value=? WHERE key='coin_rate'", (str(rate),))
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/give_item', methods=['POST'])
def admin_give_item():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        item_name = data.get('item_name')
        item_price = data.get('item_price')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("INSERT INTO inventory (user_id, item_name, item_price, opened_at) VALUES (?,?,?,?)", (user_id, item_name, item_price, datetime.now().isoformat()))
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/remove_item', methods=['POST'])
def admin_remove_item():
    try:
        data = request.get_json()
        item_id = data.get('item_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("DELETE FROM inventory WHERE id=?", (item_id,))
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

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

@app.route('/api/admin/give_case', methods=['POST'])
def admin_give_case():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        case_name = data.get('case_name')
        item_name, item_price = open_case_by_name(case_name)
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("INSERT INTO inventory (user_id, item_name, item_price, opened_at) VALUES (?,?,?,?)", (user_id, item_name, item_price, datetime.now().isoformat()))
        return jsonify({"success": True, "item": item_name, "price": item_price})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/set_case_price', methods=['POST'])
def admin_set_case_price():
    try:
        data = request.get_json()
        case_name = data.get('case_name')
        price = data.get('price')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("UPDATE cases SET price=? WHERE name=?", (price, case_name))
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/set_case_chance', methods=['POST'])
def admin_set_case_chance():
    try:
        data = request.get_json()
        case_name = data.get('case_name')
        chance = data.get('jackpot_chance')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("UPDATE cases SET jackpot_chance=? WHERE name=?", (chance, case_name))
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/toggle_case', methods=['POST'])
def admin_toggle_case():
    try:
        data = request.get_json()
        case_name = data.get('case_name')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            current = c.execute("SELECT is_active FROM cases WHERE name=?", (case_name,)).fetchone()
            new = 0 if current[0] else 1
            c.execute("UPDATE cases SET is_active=? WHERE name=?", (new, case_name))
        return jsonify({"success": True, "is_active": new})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/give_spins', methods=['POST'])
def admin_give_spins():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        spins = data.get('spins')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("UPDATE users SET wheel_spins=wheel_spins+? WHERE id=?", (spins, user_id))
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/give_discount', methods=['POST'])
def admin_give_discount():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        discount = data.get('discount')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("UPDATE users SET active_discount=? WHERE id=?", (discount, user_id))
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/reset_winrate', methods=['POST'])
def admin_reset_winrate():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("UPDATE users SET pvp_wins=0, pvp_losses=0 WHERE id=?", (user_id,))
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/reset_inventory', methods=['POST'])
def admin_reset_inventory():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("DELETE FROM inventory WHERE user_id=?", (user_id,))
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/reset_progress', methods=['POST'])
def admin_reset_progress():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("UPDATE users SET coins=500, level=1, exp=0, pvp_wins=0, pvp_losses=0, total_deposit=0 WHERE id=?", (user_id,))
            c.execute("DELETE FROM inventory WHERE user_id=?", (user_id,))
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

@app.route('/api/admin/freeze_user', methods=['POST'])
def admin_freeze_user():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("UPDATE users SET is_frozen=1 WHERE id=?", (user_id,))
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/unfreeze_user', methods=['POST'])
def admin_unfreeze_user():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("UPDATE users SET is_frozen=0 WHERE id=?", (user_id,))
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/give_xp', methods=['POST'])
def admin_give_xp():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        amount = data.get('xp')
        add_exp(user_id, amount)
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/remove_xp', methods=['POST'])
def admin_remove_xp():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        amount = data.get('xp')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            level, exp = c.execute("SELECT level, exp FROM users WHERE id=?", (user_id,)).fetchone()
            exp -= amount
            if exp < 0:
                exp = 0
            c.execute("UPDATE users SET exp=? WHERE id=?", (exp, user_id))
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/give_level', methods=['POST'])
def admin_give_level():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        level = data.get('level')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            exp = level * 1000
            c.execute("UPDATE users SET level=?, exp=? WHERE id=?", (level, exp, user_id))
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/remove_level', methods=['POST'])
def admin_remove_level():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("UPDATE users SET level=1, exp=0 WHERE id=?", (user_id,))
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/give_prime', methods=['POST'])
def admin_give_prime():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        expires = (date.today() + timedelta(days=30)).isoformat()
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("UPDATE users SET prime_expires=? WHERE id=?", (expires, user_id))
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/remove_prime', methods=['POST'])
def admin_remove_prime():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("UPDATE users SET prime_expires=NULL WHERE id=?", (user_id,))
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/withdraw_requests', methods=['GET'])
def admin_withdraw_requests():
    with db_pool.get_connection() as conn:
        c = conn.cursor()
        c.execute("SELECT id, user_id, username, item_name, item_price, trade_link, created_at FROM withdraw_requests WHERE status='pending'")
        reqs = c.fetchall()
        return jsonify({"requests": [{"id": r[0], "user_id": r[1], "username": r[2], "item": r[3], "price": r[4], "trade_link": r[5], "created_at": r[6]} for r in reqs]})

@app.route('/api/admin/accept_withdraw', methods=['POST'])
def admin_accept_withdraw():
    try:
        data = request.get_json()
        request_id = data.get('request_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            req = c.execute("SELECT user_id, item_price FROM withdraw_requests WHERE id=?", (request_id,)).fetchone()
            if req:
                c.execute("UPDATE users SET total_withdrawn=total_withdrawn+? WHERE id=?", (req[1], req[0]))
            c.execute("UPDATE withdraw_requests SET status='completed' WHERE id=?", (request_id,))
            c.execute("UPDATE inventory SET withdraw_status='none' WHERE id=(SELECT item_id FROM withdraw_requests WHERE id=?)", (request_id,))
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/reject_withdraw', methods=['POST'])
def admin_reject_withdraw():
    try:
        data = request.get_json()
        request_id = data.get('request_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            req = c.execute("SELECT user_id, item_name, item_price, item_id FROM withdraw_requests WHERE id=?", (request_id,)).fetchone()
            if req:
                c.execute("UPDATE inventory SET withdraw_status='none' WHERE id=?", (req[3],))
            c.execute("UPDATE withdraw_requests SET status='rejected' WHERE id=?", (request_id,))
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/personal_broadcast', methods=['POST'])
def admin_personal_broadcast():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        message = data.get('message')
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/toggle_pvp', methods=['POST'])
def admin_toggle_pvp():
    try:
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            current = c.execute("SELECT value FROM settings WHERE key='pvp_enabled'").fetchone()
            new = "0" if current[0] == "1" else "1"
            c.execute("UPDATE settings SET value=? WHERE key='pvp_enabled'", (new,))
        return jsonify({"success": True, "enabled": new == "1"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/toggle_withdraw', methods=['POST'])
def admin_toggle_withdraw():
    try:
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            current = c.execute("SELECT value FROM settings WHERE key='withdraw_enabled'").fetchone()
            new = "0" if current[0] == "1" else "1"
            c.execute("UPDATE settings SET value=? WHERE key='withdraw_enabled'", (new,))
        return jsonify({"success": True, "enabled": new == "1"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/toggle_wheel', methods=['POST'])
def admin_toggle_wheel():
    try:
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            current = c.execute("SELECT value FROM settings WHERE key='wheel_enabled'").fetchone()
            new = "0" if current[0] == "1" else "1"
            c.execute("UPDATE settings SET value=? WHERE key='wheel_enabled'", (new,))
        return jsonify({"success": True, "enabled": new == "1"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/toggle_achievements', methods=['POST'])
def admin_toggle_achievements():
    try:
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            current = c.execute("SELECT value FROM settings WHERE key='achievements_enabled'").fetchone()
            new = "0" if current[0] == "1" else "1"
            c.execute("UPDATE settings SET value=? WHERE key='achievements_enabled'", (new,))
        return jsonify({"success": True, "enabled": new == "1"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/toggle_quiz', methods=['POST'])
def admin_toggle_quiz():
    try:
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            current = c.execute("SELECT value FROM settings WHERE key='quiz_enabled'").fetchone()
            new = "0" if current[0] == "1" else "1"
            c.execute("UPDATE settings SET value=? WHERE key='quiz_enabled'", (new,))
        return jsonify({"success": True, "enabled": new == "1"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/toggle_referrals', methods=['POST'])
def admin_toggle_referrals():
    try:
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            current = c.execute("SELECT value FROM settings WHERE key='referrals_enabled'").fetchone()
            new = "0" if current[0] == "1" else "1"
            c.execute("UPDATE settings SET value=? WHERE key='referrals_enabled'", (new,))
        return jsonify({"success": True, "enabled": new == "1"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/active_users', methods=['GET'])
def admin_active_users():
    try:
        ten_min_ago = (datetime.now() - timedelta(minutes=10)).isoformat()
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("SELECT id, username, last_activity FROM users WHERE last_activity > ?", (ten_min_ago,))
            users = c.fetchall()
        return jsonify({"users": [{"id": u[0], "username": u[1], "last_activity": u[2]} for u in users]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/view_inventory/<int:user_id>', methods=['GET'])
def admin_view_inventory(user_id):
    with db_pool.get_connection() as conn:
        c = conn.cursor()
        c.execute("SELECT id, item_name, item_price, opened_at FROM inventory WHERE user_id=? ORDER BY id DESC", (user_id,))
        items = c.fetchall()
        return jsonify({"items": [{"id": i[0], "name": i[1], "price": i[2], "opened_at": i[3]} for i in items]})

@app.route('/api/admin/view_profile/<int:user_id>', methods=['GET'])
def admin_view_profile(user_id):
    with db_pool.get_connection() as conn:
        c = conn.cursor()
        c.execute("SELECT id, username, coins, level, exp, pvp_wins, pvp_losses, total_deposit, total_withdrawn, referred_by, prime_expires, is_banned, ban_reason, is_frozen FROM users WHERE id=?", (user_id,))
        user = c.fetchone()
        if user:
            return jsonify({
                "id": user[0], "username": user[1], "coins": user[2], "level": user[3], "exp": user[4],
                "wins": user[5], "losses": user[6], "deposit": user[7], "withdrawn": user[8],
                "referred_by": user[9], "prime_expires": user[10], "is_banned": user[11],
                "ban_reason": user[12], "is_frozen": user[13]
            })
        return jsonify({"error": "User not found"}), 404

@app.route('/api/admin/deposit_history/<int:user_id>', methods=['GET'])
def admin_deposit_history(user_id):
    with db_pool.get_connection() as conn:
        c = conn.cursor()
        c.execute("SELECT amount, discount_used, created_at FROM deposit_history WHERE user_id=? ORDER BY created_at DESC", (user_id,))
        deposits = c.fetchall()
        return jsonify({"deposits": [{"amount": d[0], "discount": d[1], "date": d[2]} for d in deposits]})

@app.route('/api/admin/export_users_csv', methods=['GET'])
def admin_export_users_csv():
    try:
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("SELECT id, username, coins, level, exp, pvp_wins, pvp_losses, total_deposit, total_withdrawn, created_at FROM users")
            users = c.fetchall()
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["ID", "Username", "Coins", "Level", "XP", "Wins", "Losses", "Deposit", "Withdrawn", "Registered"])
        for u in users:
            writer.writerow(list(u))
        return output.getvalue(), 200, {'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename=users.csv'}
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/reset_tradelink', methods=['POST'])
def admin_reset_tradelink():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("UPDATE users SET trade_link=NULL WHERE id=?", (user_id,))
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/restart', methods=['POST'])
def admin_restart():
    try:
        threading.Timer(1, lambda: os._exit(0)).start()
        return jsonify({"success": True, "message": "Server restarting..."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/stats', methods=['GET'])
def admin_stats():
    with db_pool.get_connection() as conn:
        c = conn.cursor()
        total_users = c.execute("SELECT COUNT(*) FROM users").fetchone()[0]
        total_coins = c.execute("SELECT SUM(coins) FROM users").fetchone()[0] or 0
        total_items = c.execute("SELECT COUNT(*) FROM inventory").fetchone()[0]
        total_deposit = c.execute("SELECT SUM(total_deposit) FROM users").fetchone()[0] or 0
        return jsonify({
            "total_users": total_users,
            "total_coins": total_coins,
            "total_items": total_items,
            "total_deposit": total_deposit
        })

@app.route('/api/admin/top_coins', methods=['GET'])
def admin_top_coins():
    with db_pool.get_connection() as conn:
        c = conn.cursor()
        c.execute("SELECT id, username, coins FROM users ORDER BY coins DESC LIMIT 10")
        users = c.fetchall()
        return jsonify({"users": [{"id": u[0], "username": u[1], "coins": u[2]} for u in users]})

@app.route('/api/admin/top_level', methods=['GET'])
def admin_top_level():
    with db_pool.get_connection() as conn:
        c = conn.cursor()
        c.execute("SELECT id, username, level FROM users ORDER BY level DESC LIMIT 10")
        users = c.fetchall()
        return jsonify({"users": [{"id": u[0], "username": u[1], "level": u[2]} for u in users]})

@app.route('/api/admin/find_user', methods=['GET'])
def admin_find_user():
    try:
        username = request.args.get('username')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("SELECT id, username, coins, level FROM users WHERE username LIKE ?", (f'%{username}%',))
            users = c.fetchall()
            return jsonify({"users": [{"id": u[0], "username": u[1], "coins": u[2], "level": u[3]} for u in users]})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/delete_user', methods=['POST'])
def admin_delete_user():
    try:
        data = request.get_json()
        user_id = data.get('user_id')
        with db_pool.get_connection() as conn:
            c = conn.cursor()
            c.execute("DELETE FROM inventory WHERE user_id=?", (user_id,))
            c.execute("DELETE FROM deposit_history WHERE user_id=?", (user_id,))
            c.execute("DELETE FROM promo_usage WHERE user_id=?", (user_id,))
            c.execute("DELETE FROM withdraw_requests WHERE user_id=?", (user_id,))
            c.execute("DELETE FROM refund_requests WHERE user_id=?", (user_id,))
            c.execute("DELETE FROM users WHERE id=?", (user_id,))
        return jsonify({"success": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/add_skin_to_case', methods=['POST'])
def admin_add_skin_to_case():
    try:
        data = request.get_json()
        case_name = data.get('case_name')
        skin_name = data.get('skin_name')
        skin_price = data.get('skin_price')
        return jsonify({"success": True, "message": "Feature coming soon"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/admin/remove_skin_from_case', methods=['POST'])
def admin_remove_skin_from_case():
    try:
        data = request.get_json()
        case_name = data.get('case_name')
        skin_name = data.get('skin_name')
        return jsonify({"success": True, "message": "Feature coming soon"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ============ ЗАПУСК ============
if __name__ == '__main__':
    init_db()
    port = int(os.environ.get('PORT', 10000))
    app.run(host='0.0.0.0', port=port, debug=False, threaded=True)
