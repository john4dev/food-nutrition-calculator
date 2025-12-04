# 🥗 Food Calorie Counter

A free, embeddable food recipe nutrition calculator that provides instant nutritional breakdowns. Paste the ingredients of your dish (one per line) and get totals for calories, protein, carbs, fat, and fiber, plus per-ingredient details.

## ✨ Features

- Simple and intuitive: paste ingredients, press Calculate
- Instant totals: calories, protein, carbs, fat, fiber
- Per-ingredient breakdown
- Mobile-friendly responsive design
- Client-side only (no servers, no API keys)
- Easy to embed via iframe

## 🚀 Quick Start

### Option 1: Open directly

Open `index.html` in your browser.

### Option 2: Serve locally

```powershell
# Python
python -m http.server 8000

# Node (http-server)
npx http-server

# PHP
php -S localhost:8000
```

Then open http://localhost:8000.

## 📦 Embed in your website

```html
<iframe 
  src="https://your-username.github.io/food-calorie-counter/" 
  width="100%" 
  height="800" 
  frameborder="0"
  title="Food Calorie Counter">
</iframe>
```

Or embed from local server:

```html
<iframe 
  src="http://localhost:8000/" 
  width="100%" 
  height="800" 
  frameborder="0"
  title="Food Calorie Counter">
</iframe>
```

## 🗂️ Project structure

```
food-calorie-counter/
├── index.html         # Main UI
├── styles.css         # Styling and responsive design
├── app.js             # Parsing and calculations
├── nutrition-data.js  # Nutrition database and unit conversions
└── README.md          # This file
```

## 🔧 How it works

1. Parse ingredient lines (quantity, unit, name)
2. Fuzzy-match ingredients against a curated nutrition database
3. Convert quantities to grams using common unit mappings
4. Calculate totals based on per-100g nutrition values
5. Render a clean summary and per-ingredient details

All processing happens in the browser using vanilla JavaScript.

## 🍎 Data sources

Nutrition values are inspired by public datasets aggregated by OpenNutrition and authoritative sources such as:
- USDA FoodData Central
- Canadian Nutrient File (CNF)
- FRIDA
- AUSNUT

Values are per 100g following standard labeling conventions.

## 🤝 Contributing

- Add more ingredients to `nutrition-data.js`
- Improve parsing and unit conversions in `app.js`
- Refine UI/UX in `styles.css`
- Report issues or open PRs

## 📄 License

MIT License.
