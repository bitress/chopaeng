"""
SysBot Simulator for ChoBot & Chopaeng
Simulates Nintendo Switch SysBot-ACNH files without requiring physical Nintendo Switch hardware.

Creates and manages:
- Sub Islands (VIP Islands) with Dodo.txt, Visitors.txt, Villagers.txt
- Free Islands with Dodo.txt, Visitors.txt, Villagers.txt
- Order Bot Island (SYSBOT-ACNH-ORDERS / Sinta) with Dodo.txt, Visitors.txt, Villagers.txt

Usage:
    python scripts/simulate_sysbot.py          # Generate mock folders and run live simulator
    python scripts/simulate_sysbot.py init     # Generate mock folders only (static)
"""

import os
import sys
import time
import random
import argparse
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Paths
CHOBOT_DIR = Path("C:/Users/bitress/Desktop/chobot")
MOCK_DIR = CHOBOT_DIR / "sysbot_mock"
SUB_ISLANDS_DIR = MOCK_DIR / "Sub Islands"
FREE_ISLANDS_DIR = MOCK_DIR / "Free Islands"
ORDER_BOT_DIR = MOCK_DIR / "Orders" / "SYSBOT-ACNH-ORDERS"

ALL_SUB_ISLANDS = [
    "Adhika", "Alapaap", "Aruga", "Bahaghari", "Bituin", "Bonita", "Dakila",
    "Diwata", "Gilas", "Harana", "Hiraya", "Kalayaan", "Kagandahan", "Liwayway",
    "Ligaya", "Mabuhay", "Malaya", "Mayumi", "Payapa", "Tadhana"
]

FREE_ISLANDS = ["Kagandahan", "Liwayway"]

POPULAR_VILLAGERS = [
    "Raymond", "Marshal", "Judy", "Sherb", "Audie", "Ankha", "Shino",
    "Sasha", "Ione", "Bob", "Roald", "Stitches", "Marina", "Zucker",
    "Coco", "Fauna", "Beau", "Lolly", "Molly", "Maple", "Tangy"
]

SAMPLE_VISITORS = [
    "NookFan", "StarGazer", "IslandMayor", "ACNHPro", "DodoFlyer",
    "BellsTrader", "TurnipKing", "VillagerHunter", "IslandLover"
]

DODO_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"


def generate_dodo() -> str:
    """Generate a realistic 5-character ACNH Dodo code."""
    return "".join(random.choices(DODO_CHARS, k=5))


def write_file_safe(file_path: Path, content: str) -> None:
    """Write text file safely creating parent directories as needed."""
    file_path.parent.mkdir(parents=True, exist_ok=True)
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)


def init_mock_island(folder: Path, island_name: str, status: str = "ONLINE") -> None:
    """Initialize an individual island folder with Dodo.txt, Visitors.txt, Villagers.txt."""
    folder.mkdir(parents=True, exist_ok=True)

    # 1. Dodo.txt
    if status == "ONLINE":
        dodo = generate_dodo()
    elif status == "REFRESHING":
        dodo = "00000"
    else:
        dodo = "OFFLINE"
    write_file_safe(folder / "Dodo.txt", f"{dodo}\n")

    # 2. Visitors.txt
    visitor_count = random.randint(0, 3) if status == "ONLINE" else 0
    chosen_visitors = random.sample(SAMPLE_VISITORS, visitor_count) if visitor_count > 0 else []
    visitor_content = f"{visitor_count}\n" + "\n".join(chosen_visitors) + ("\n" if chosen_visitors else "")
    write_file_safe(folder / "Visitors.txt", visitor_content)

    # 3. Villagers.txt (10 plots)
    ten_villagers = random.sample(POPULAR_VILLAGERS, 10)
    write_file_safe(folder / "Villagers.txt", "\n".join(ten_villagers) + "\n")


def setup_all_mock_folders() -> None:
    """Create full directory hierarchy for all Sub Islands, Free Islands, and Order Bot."""
    print("🏝️ Initializing SysBot mock folders...")

    # Sub Islands
    for island in ALL_SUB_ISLANDS:
        island_path = SUB_ISLANDS_DIR / island
        init_mock_island(island_path, island, status="ONLINE")
        print(f"  ✓ Sub Island created: {island}")

    # Free Islands
    for island in FREE_ISLANDS:
        island_path = FREE_ISLANDS_DIR / island
        init_mock_island(island_path, island, status="ONLINE")
        print(f"  ✓ Free Island created: {island}")

    # Order Bot
    init_mock_island(ORDER_BOT_DIR, "SYSBOT-ACNH-ORDERS", status="ONLINE")
    print(f"  ✓ Order Bot Island created: SYSBOT-ACNH-ORDERS")

    print("\n✅ All SysBot mock folders initialized successfully at:")
    print(f"   • Sub Islands:  {SUB_ISLANDS_DIR}")
    print(f"   • Free Islands: {FREE_ISLANDS_DIR}")
    print(f"   • Order Bot:    {ORDER_BOT_DIR}")


def update_chobot_env() -> None:
    """Updates .env in chobot to point to the local simulated SysBot directories."""
    env_path = CHOBOT_DIR / ".env"
    if not env_path.exists():
        print(f"⚠️ {env_path} not found; skipping .env update.")
        return

    sub_path_str = str(SUB_ISLANDS_DIR).replace("/", "\\\\").replace("\\", "\\\\")
    free_path_str = str(FREE_ISLANDS_DIR).replace("/", "\\\\").replace("\\", "\\\\")
    order_path_str = str(ORDER_BOT_DIR).replace("/", "\\\\").replace("\\", "\\\\")

    with open(env_path, "r", encoding="utf-8") as f:
        content = f.read()

    import re
    if re.search(r"^VILLAGERS_DIR=", content, flags=re.MULTILINE):
        content = re.sub(r'^VILLAGERS_DIR=.*$', f'VILLAGERS_DIR="{sub_path_str}"', content, flags=re.MULTILINE)
    else:
        content += f'\nVILLAGERS_DIR="{sub_path_str}"'

    if re.search(r"^TWITCH_VILLAGERS_DIR=", content, flags=re.MULTILINE):
        content = re.sub(r'^TWITCH_VILLAGERS_DIR=.*$', f'TWITCH_VILLAGERS_DIR="{free_path_str}"', content, flags=re.MULTILINE)
    else:
        content += f'\nTWITCH_VILLAGERS_DIR="{free_path_str}"'

    if re.search(r"^ORDER_BOT_DIR=", content, flags=re.MULTILINE):
        content = re.sub(r'^ORDER_BOT_DIR=.*$', f'ORDER_BOT_DIR="{order_path_str}"', content, flags=re.MULTILINE)
    else:
        content += f'\nORDER_BOT_DIR="{order_path_str}"'

    with open(env_path, "w", encoding="utf-8") as f:
        f.write(content)

    print("⚙️ Updated chobot .env with simulated SysBot directory paths.")


def run_simulator_loop(interval_sec: int = 15) -> None:
    """Periodically simulate live visitor changes and occasional Dodo refreshes."""
    print(f"\n🔄 Running SysBot Simulator loop (updates every {interval_sec}s)... Press Ctrl+C to exit.\n")
    try:
        while True:
            random_island = random.choice(ALL_SUB_ISLANDS)
            island_folder = SUB_ISLANDS_DIR / random_island

            action = random.choice(["visitor_change", "visitor_change", "dodo_refresh"])
            if action == "visitor_change":
                visitor_count = random.randint(0, 4)
                chosen = random.sample(SAMPLE_VISITORS, visitor_count) if visitor_count > 0 else []
                content = f"{visitor_count}\n" + "\n".join(chosen) + ("\n" if chosen else "")
                write_file_safe(island_folder / "Visitors.txt", content)
                print(f"[{time.strftime('%H:%M:%S')}] 👥 {random_island}: Visitors updated to {visitor_count} ({', '.join(chosen) or 'empty'})")
            elif action == "dodo_refresh":
                new_dodo = generate_dodo()
                write_file_safe(island_folder / "Dodo.txt", f"{new_dodo}\n")
                print(f"[{time.strftime('%H:%M:%S')}] 🦤 {random_island}: New Dodo code generated -> {new_dodo}")

            time.sleep(interval_sec)
    except KeyboardInterrupt:
        print("\n🛑 SysBot Simulator stopped.")


def main():
    parser = argparse.ArgumentParser(description="SysBot ACNH Simulator for ChoBot")
    parser.add_argument("mode", nargs="?", default="init", choices=["init", "run"], help="init = setup folders only; run = setup and start live simulation loop")
    parser.add_argument("--interval", type=int, default=10, help="Interval in seconds for live simulation updates")
    args = parser.parse_args()

    setup_all_mock_folders()
    update_chobot_env()

    if args.mode == "run":
        run_simulator_loop(args.interval)


if __name__ == "__main__":
    main()
