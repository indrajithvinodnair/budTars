# 📱 Personal Budget Tracker (Offline PWA)

A fully offline personal finance tracker designed to run as a **Progressive Web App (PWA)** on your smartphone. Built using **React + Vite + ShadCN UI**, this app uses local JSON-style data (via localStorage or optional File System Access API) to manage budget caps and expenses with a **reverse budgeting** model.

This project is designed to work **entirely on-device**, with no need for cloud hosting or Android Studio.

---

## 🚀 Features

* 🧾 **Reverse Budgeting**: Deduct expenses from preset caps
* 📂 **Offline First**: Uses localStorage or File System API
* 📱 **Installable PWA**: Works like a native app on Android
* 🧩 **Customizable**: Change caps, categories, and reset cycles
* 📝 **Expense Notes**: Attach notes to transactions
* 📊 **Modern UI**: Built with ShadCN and TailwindCSS
* 💾 **Manual Export/Import**: Backup or restore JSON data
* 🔍 **JSON Viewer/Editor**: View and edit raw data in the UI

---

## 🧱 Tech Stack

| Layer      | Tool                           | Why?                              |
| ---------- | ------------------------------ | --------------------------------- |
| Framework  | React + Vite                   | Fast, minimal dev environment     |
| UI Library | ShadCN UI (Tailwinnpm create vite@latest . --template react-ts --registry "https://registry.npmjs.org/"d)           | Beautiful, clean, mobile-friendly |
| Storage    | localStorage / File System API | Fully offline, manual backup      |
| Deploy     | PWA install (no hosting)       | Add to home screen, run offline   |

---

## 🗃️ Folder Structure

```plaintext
/
├── public/                # Static assets
├── src/
│   ├── components/        # Reusable UI components
│   ├── data/              # Simulated JSON budgets
│   ├── hooks/             # useBudget, useStorage etc.
│   ├── pages/             # Home, Settings, JSON Editor
│   ├── App.jsx            # Root App component
│   └── main.jsx           # App entry point
├── index.html
└── README.md
```

---

## 📁 Simulated JSON Files

Internally mimicking `budget_caps.json` and `transactions.json` with `localStorage`, plus optional import/export to real JSON files.

### Example: Budget Caps

```json
{
  "gym": 5000,
  "food": 4000,
  "entertainment": 3000,
  "bike": 1000
}
```

### Example: Transactions

```json
[
  {
    "category": "gym",
    "amount": 1000,
    "note": "PT fee",
    "date": "2025-05-29"
  },
  {
    "category": "food",
    "amount": 600,
    "note": "eggs and milk",
    "date": "2025-05-28"
  }
]
```

---

## 🛠 Setup Instructions

### 1. Clone the Repo

```bash
git clone https://github.com/yourname/budget-tracker-pwa.git
cd budget-tracker-pwa
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run the App Locally

```bash
npm run dev
```

### 4. Build for Production

```bash
npm run build
```

### 5. Install on Android (No Hosting Needed)

* Run `npm run dev` and open the app URL on your phone via LAN (e.g., `http://192.168.0.x:5173`)
* Tap **"Add to Home Screen"** in Chrome
* The app is now fully offline and behaves like a native app

**Alternative (No LAN):** Copy the `dist/` folder to phone and use a browser like Hermit to open `index.html`

---

## 🔐 Manual Backup & Restore

You can manually view, backup, and edit your JSON files:

* Use the **JSON Editor Screen** to:

  * View raw data
  * Edit caps or transactions
  * Restore or adjust manually

* Use built-in buttons:

  * 📤 Export data to `.json`
  * 📥 Import from a saved file

---

## 🧩 Customization Ideas

* Monthly resets (automated)
* Graphs / pie charts for spend distribution
* Budget alerts when close to limits
* Export to CSV
* Dark/light mode toggle

---

## 🤝 Contributing

Fork the repo, suggest features, or open a PR — all contributions welcome!

---

## 📜 License

MIT License

---

## 🧠 Author

TARS (powered by ChatGPT)



Future Plans 
1. Option to edit budget cap name from settings screen. Right now its possible, but the budget cap name kind of falls beyond the left boundary of the screen. We need to show a modal to ask for edit.
2. Implement Delete budget cap confirmation modal 
    We are already using modal for clear data confirmation in raw-data screen
    lets create a common modal component and use it in both areas.
    We should be able to dynamically set the content and action buttons for the modal
    through component input or by other means.

3.  May be allow users to set budget caps in fixed, variable, Priority / Investments . Even though we dont track investments as is in the app. We still can log those as expenses since they are taken out from the monthly salary.
Also instead of showing all the budget caps at once in the home screen, maybe we can show budget caps grouped by type. While logging and adding transactions, an additional input needs to be taken which is the expense type.
When thats entered, the expense caps according to that type will be shown.


4. Since the budget caps are constant across the months for most of the time,
   It will be nice to have a feature where I can enter the json into the raw-data screen and have a special option to generate budget from it. This will make things easier than setting up the same stuff every month

5. VA is variable expenses/ amonts. SI are Savings / Investments

6. While logging expenses, if the Note is length like 'Chicken Masala and other things' , the amount and edit button goes beyond the screen. Also the date part wraps to a new line. We need to handle the aligment of elements in the transaction history part efficiently

7. Add copy button beneath the transaction history json and budget data json in the raw-data screen, upon clicking the data should be copied to clip board. It would be nice if we can show an alert also like data copied to clip board with a check mark. At present copying data by scrolling the field is cumbersome.
