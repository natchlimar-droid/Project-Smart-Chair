# 🪑 PostureQuest: Office Syndrome Gamification & IoT Analytics

An interactive, full-stack IoT analytics and gamification web application engineered to combat **Office Syndrome** through real-time posture telemetry, RPG mechanics, and ergonomic analytics.

Built for **Smart Ergonomic Chairs** equipped with **ESP32**, **Time-of-Flight (ToF) LiDAR distance sensors**, and **4-Channel Load Cell pressure arrays**.

---

## 🚀 Quick Start

### 1. Development Server
```bash
npm run dev
```
The app will start instantly at `http://localhost:3000`.

### 2. Production Build & Preview
```bash
npm run build
npm run preview
```

---

## 🕹️ Interactive Built-in Sensor Simulator

Since physical hardware is simulated during development, the UI includes a **Hardware Sensor Simulator Drawer** at the top of the screen:

* **Chair Occupancy Toggle:** Instantly simulate sitting vs standing up.
* **ToF Screen Distance Slider (30cm – 80cm):**
  * `< 45cm`: Triggers forward head slouching warning / kyphosis strain.
  * `≥ 50cm`: Optimal spinal alignment.
* **Weight Balance Slider (20% – 80% Left/Right):**
  * `45% – 55%`: Symmetrical pelvic load.
  * `< 45%` or `> 55%`: Pelvic tilt / asymmetric spine strain.
* **Simulation Speed Multiplier:** Toggle between `1x` (Realtime), `10x` (Turbo), and `60x` (Ultra-fast testing).
* **Sensor Micro-Jitter:** Simulates real human micro-movements on load cells.
* **One-Click Presets:**
  * **"Good Posture"**: Distance = 62cm, 50/50 balance.
  * **"Slouching"**: Distance = 38cm, 32/68 balance.
  * **"Jump 45m Sitting"**: Fast-forwards to trigger the 45-minute Sedentary Overtime debuff.
  * **"Take 3m Break"**: Simulates a 3-minute walking break to earn the +100 EXP break bonus.
  * **"Admin Revive"**: Restores character from 0 HP Burnout state.

---

## 🎮 Gamification & Rules Engine

### 1. Good Posture (+10 EXP / min)
* Criteria: `is_occupied == true`, `distance_cm >= 50`, `balance_left_pct` between 45% and 55%.
* Rewards: +10 EXP per simulated minute (+1/6 EXP/sec), contributes damage to the weekly **Team Co-op Boss**.

### 2. Slouching Grace Period & Health Drain (-5 HP / 30s)
* Criteria: `distance_cm < 45` or weight imbalance (`< 45%` or `> 55%`).
* **10-Second Grace Period**: Gives the user time to adjust their posture without immediate penalty.
* **Penalty Trigger**: If slouching continues past 10s, EXP pauses and **-5 HP** is deducted every 30 seconds of continuous slouching.

### 3. Sedentary Overtime Debuff (≥ 45 Minutes Continuous Sitting)
* Criteria: Continuous sitting time reaches 45:00 (2,700s).
* Effect: Reduces future EXP gain by 50% and continuously drains **-2 HP / minute** until the user stands up.

### 4. Active Break Bonus (+100 EXP, +20 HP)
* Criteria: User sits for ≥ 30 minutes, then leaves the chair (`is_occupied == false`) for **≥ 3 minutes** (180s).
* Rewards: Awards **+100 EXP**, restores **+20 HP**, resets the continuous sitting timer to 0:00, and clears the Sedentary Overtime debuff.

### 5. Edge Cases Handled
* **Accidental Sensor Drops / Brief Standing:** Standing up for `< 5 seconds` is buffered by a debounce filter and does not reset the 45-minute continuous sitting session timer.
* **Character Burnout (0 HP):** When health drops to 0, the character enters an **Exhausted / Burnout** state. EXP freezes and a mandatory **5-minute walking break** (`is_occupied == false` for 300s) is required to revive (restoring 50 HP).

---

## 📊 Analytics View (Data Engineer Module)

* **KPI Summary:** Good Posture Ratio (%), Sitting Hours Today, Slouch Incidents, and Clinical Ergonomic Risk Index.
* **7-Day Trend Chart:** Dual-axis Recharts visualization comparing daily sitting volume against good posture adherence (with a 75% target baseline).
* **Hourly Fatigue Heatmap:** 24-hour distribution identifying peak fatigue slumps (notably post-lunch 13:00 – 15:00).
* **Department Ergonomics Leaderboard:** Ranks colleagues by *Break Consistency* and *Good Posture %* (not hours sat, preventing toxic sedentary culture).
* **Weekly Co-op Raid Boss:** "Lord Kyphosis (The Spine Crump)" with 10,000 HP, damaged cooperatively when team members maintain good posture and take active breaks.

---

## 🛠️ Tech Stack
* **Framework:** React 18 + TypeScript + Vite
* **Styling:** Tailwind CSS (Dark/Light mode support)
* **Icons:** Lucide React
* **Charts:** Recharts (ComposedChart, BarChart, ReferenceLines)
* **Audio Synthesis:** Native Web Audio API Synthesizer (Zero external audio asset dependencies)

