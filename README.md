# FarsiMatrix — English ↔ Persian Dictionary API  
<div align="center">

<!-- Logo SVG -->
<svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect rx="6" width="24" height="24" fill="#0ea5a4" />
  <path d="M7 9h10M7 12h10M7 15h6" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

**A fast, free, and beautifully simple English–Persian dictionary API**  
**4M+ words — 69 specialized groups — JSON output — No authentication required**

</div>

---

<p align="center">
  <a href="https://farsimatrix.ehsanjs.ir"><img src="https://img.shields.io/badge/Docs-FarsiMatrix-blue.svg" alt="Docs"/></a>
  <img src="https://img.shields.io/badge/Status-Online-green.svg" alt="Status"/>
  <img src="https://img.shields.io/badge/License-MIT-lightgrey.svg" alt="License"/>
</p>

---

## 🎯 Quick Overview
- **Name**: FarsiMatrix API  
- **Purpose**: English ↔ Persian dictionary with translation & quiz generation  
- **Database Size**: Over 4 million words  
- **Groups**: 69 specialized categories (technical, academic, idioms, etc.)  
- **Authentication**: None — completely free  
- **Response Format**: JSON

---

## ✨ Key Features
- Massive multilingual database  
- Exact or partial search modes  
- Filter by topic-specific groups (e.g., `electronics`, `biology`, `idioms`)  
- Quiz generator for `translation` and `multiple-choice`  
- Clean and fast JSON responses  
- Ready-to-use examples for Fetch, curl, or Node.js

---

## 📚 Documentation
Complete and interactive documentation is available at:  
👉 **[https://farsimatrix.ehsanjs.ir](https://farsmatrix.ehsanjs.ir)**

---

## 📡 API Endpoints

### Get All Groups
**GET** `/groups`  
Returns a list of all available word groups with their respective word counts.

---

### Get Random Words
**GET** `/random?group={group}&limit={limit}`
- `group` *(optional)*: Filter by a specific group name  
- `limit` *(optional)*: Number of words to return (default: 1)

**Example:**
```js
fetch('https://api-farsimatrix.ehsanjs.ir/random?limit=5')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

### Search Words
**GET** `/search?q={query}&group={group}&exact={boolean}`
- `q` *(required)*: Search term  
- `group` *(optional)*  
- `exact` *(optional)*: `true` / `false` (default: `false`)

**Example:**
```js
fetch('https://api-farsimatrix.ehsanjs.ir/search?q=book')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

### Generate Quiz
**GET** `/quiz?group={group}&limit={limit}&type={type}`
- `group` *(optional)*  
- `limit` *(optional)*: Number of questions (default: 10, max: 50)  
- `type` *(optional)*: `translation` or `multiple-choice` (default: `translation`)

**Example:**
```js
fetch('https://api-farsimatrix.ehsanjs.ir/quiz?type=multiple-choice&limit=10')
  .then(res => res.json())
  .then(data => console.log(data));
```

---

## 📂 Example Response
```json
{
  "word": "book",
  "translations": ["کتاب", "دفتر"],
  "group": "generic-1",
  "examples": ["I read a book.", "She bought a new book."]
}
```

---

## 🧭 Use Cases
- Language learning apps (flashcards, quizzes)
- Educational platforms and e-learning tools
- Translation services and content processors
- Offline mobile dictionary applications
- Text classification and linguistic analysis

---

## 🧩 Example Code — Node.js (axios)
```js
const axios = require('axios');

async function search(q) {
  const res = await axios.get('https://api-farsimatrix.ehsanjs.ir/search', { params: { q } });
  return res.data;
}

search('computer').then(console.log).catch(console.error);
```

---

## 🛠️ Implementation Tips
- Cache `random` and `search` results to improve performance.
- Download key word groups for offline apps.
- For quizzes, use `limit` between 5–20 for best UX.

---

## 🤝 Contributing
Contributions are welcome! Please submit a Pull Request with a short description of your improvements.

**Steps:**
1. Fork the repository  
2. Create a new branch for your changes  
3. Submit a Pull Request

---

## 📬 Contact
- **Developer**: Ehsan Fazli  
- **GitHub**: [tsshack](https://github.com/tsshack)  
- **Telegram**: [@devehsan](https://t.me/devehsan)

---

<div align="center">
<small>Built with ❤️ for the Persian-speaking community — FarsiMatrix</small>
</div>

