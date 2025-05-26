# 🧠 TARS: Personal Finance Tracker Telegram Bot

**TARS** is your always-online personal finance assistant, built as a Telegram bot with Google Sheets as a backend. It helps you log expenses and investments, monitor budget caps, and track monthly contributions — all via simple chat commands.

---

## 📌 Features

* ✅ Log **expenses** and **investment contributions**
* ✅ Maintain **category-wise monthly budget caps**
* ✅ Real-time feedback on remaining budget
* ✅ Sync data to **Google Sheets**
* ✅ Monthly **reset + data archive** for clear tracking
* ✅ Easily deploy on Replit, Render, or locally

---

## 🧱 Core Commands

### `/spend <category> <amount> <note>`

Log a daily expense.

```bash
/spend food 300 lunch & milk
👉 ✅ Logged ₹300 under Food. ₹3700 left.
```

---

### `/invest <category> <amount> <note>`

Log a monthly investment contribution.

```bash
/invest sip 4000 emergency fund
👉 ✅ Logged ₹4000 under SIP. ₹3000 left.
```

---

### `/status`

Get your current budget progress:

```
📊 Budget Status (May 2025)

Expenses:
- Food: ₹300 / ₹4000 (₹3700 left)
- Gym: ₹0 / ₹5000

Investments:
- SIP: ₹4000 / ₹7000 (₹3000 left)
```

---

### `/logs`

See your last 5 transactions:

```
1. Food - ₹300 - lunch & milk
2. SIP - ₹4000 - emergency fund
```

---

### `/reset_month`

Manually trigger a **monthly archive**:

* Copies all `transactions` to `logs_YYYY_MM`
* Resets the `transactions` sheet
* Resets “Spent” values in `budgets`

---

## 📊 Google Sheet Structure

### Sheet 1: `transactions`

| Column   | Description           |
| -------- | --------------------- |
| Date     | `YYYY-MM-DD`          |
| Type     | `Expense` or `Invest` |
| Category | Budget category name  |
| Amount   | Transaction amount    |
| Note     | Optional description  |

---

### Sheet 2: `budgets`

| Column    | Description            |
| --------- | ---------------------- |
| Category  | Matches log categories |
| Type      | `Expense` or `Invest`  |
| Cap       | Monthly budget         |
| Spent     | Auto-calculated        |
| Remaining | Cap - Spent            |

---

## 🔐 Setup Instructions

### 1. Create Google Sheet

* Name: `TARS Finance Sheet`
* Tabs:

  * `transactions`
  * `budgets`
* Share it with your **Google Service Account**

### 2. Get Google Sheets Credentials

* Create a **Service Account** in Google Cloud
* Enable `Google Sheets API`
* Download `credentials.json`
* Share sheet with the service account email

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

#### `requirements.txt`

```txt
python-telegram-bot==13.15
gspread
oauth2client
python-dotenv
```

---

### 4. Set Environment Variables

Create a `.env` file:

```env
BOT_TOKEN=your_telegram_bot_token
SHEET_NAME=TARS Finance Sheet
```

---

## 📁 Project Structure

```
/tars-finance-bot

🔍 tars_bot.py           # Main bot logic
🔍 credentials.json      # Google API credentials
🔍 .env                  # Tokens and config
🔍 requirements.txt
🔍 README.md             # You're here
🔍 utils/
    └︎ sheets.py         # Google Sheet functions
```

---

## 🚀 Deploying the Bot

| Platform   | Notes                                      |
| ---------- | ------------------------------------------ |
| **Replit** | Good for always-online bots                |
| **Local**  | Simple for dev work (`python tars_bot.py`) |
| **Render** | For production-grade auto-deploy           |

---

## 🧠 Future Enhancements

* 📟 CSV export
* 📊 Graph support (spend over time)
* 🗓 Weekly/daily spend summaries
* 📊 Net worth projection (optional)
* 🔄 Scheduled reset via CRON

---

## ✅ Build Roadmap

* [x] Budget + Expense Logging
* [x] Investment Logging
* [x] Real-time Status Command
* [x] Monthly Reset and Archive
* [x] Deployable and Reusable Codebase

---

## 🧑‍💻 Author

**Indrajith Vinod Nair** — a proactive 23-year-old making smart money moves, building a tool to stay ahead of lifestyle inflation.

