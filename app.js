// Main application logic
class NutritionCalculator {
    constructor() {
        this.ingredientsInput = document.getElementById('ingredientsInput');
        this.calculateBtn = document.getElementById('calculateBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.exampleBtn = document.getElementById('exampleBtn');
        this.resultsSection = document.getElementById('resultsSection');
        this.results = document.getElementById('results');
        this.loading = document.getElementById('loading');
        
        // Configuration constants
        this.LOADING_DELAY_MS = 500;
        this.MIN_WORD_LENGTH_FOR_MATCHING = 3;
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        this.calculateBtn.addEventListener('click', () => this.calculateNutrition());
        this.clearBtn.addEventListener('click', () => this.clearInput());
        this.exampleBtn.addEventListener('click', () => this.loadExample());
        
        // Allow Enter key in textarea to calculate (Ctrl+Enter or Cmd+Enter)
        this.ingredientsInput.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                this.calculateNutrition();
            }
        });
    }
    
    clearInput() {
        this.ingredientsInput.value = '';
        this.results.innerHTML = '<p class="placeholder-text">Enter ingredients above and click "Calculate Nutrition" to see results</p>';
    }
    
    loadExample() {
        const exampleRecipe = `2 cups cooked white rice
150g grilled chicken breast
1 tbsp olive oil
1 cup broccoli
1 medium tomato
2 cloves garlic
1 tsp salt
1 tsp black pepper`;
        this.ingredientsInput.value = exampleRecipe;
    }
    
    showLoading() {
        this.loading.style.display = 'block';
        this.results.style.display = 'none';
    }
    
    hideLoading() {
        this.loading.style.display = 'none';
        this.results.style.display = 'block';
    }
    
    parseIngredient(line) {
        // Parse ingredient line to extract quantity, unit, and ingredient name
        line = line.trim().toLowerCase();
        if (!line) return null;
        
        // Regex to match patterns like "2 cups rice" or "150g chicken" or "1 medium tomato"
        const patterns = [
            // Number + unit (one or two words) + ingredient (e.g., "2 cups rice", "1 fluid ounce oil")
            /^(\d+(?:\.\d+)?)\s+([a-z]+(?:\s+[a-z]+)?)\s+(.+)$/,
            // Number + ingredient (e.g., "2 eggs")
            /^(\d+(?:\.\d+)?)\s+(.+)$/,
            // Just ingredient (e.g., "salt")
            /^(.+)$/
        ];
        
        let match;
        let quantity = 1;
        let unit = null;
        let ingredientName = line;
        
        // Try pattern 1: number + unit + ingredient
        match = line.match(patterns[0]);
        if (match) {
            quantity = parseFloat(match[1]);
            unit = match[2];
            ingredientName = match[3];
        } else {
            // Try pattern 2: number + ingredient
            match = line.match(patterns[1]);
            if (match) {
                quantity = parseFloat(match[1]);
                ingredientName = match[2];
            }
        }
        
        // Clean up ingredient name (remove size descriptors)
        ingredientName = ingredientName
            .replace(/\b(small|medium|large|extra large|whole|chopped|diced|sliced|minced|cooked|raw|fresh|dried|frozen)\b/g, '')
            .trim();
        
        // Clean up unit if present
        if (unit) {
            unit = unit.trim();
        }
        
        // Convert to grams
        let grams = 100; // default for unmeasured ingredient
        if (unit) {
            // Unit is specified - look up conversion
            const conversionFactor = UNIT_CONVERSIONS[unit];
            if (conversionFactor) {
                grams = quantity * conversionFactor;
            } else {
                // Unit not recognized; assume 100g per unit as fallback
                grams = quantity * 100;
            }
        } else {
            // No unit specified - assume pieces (e.g., "4 eggs" = 4 pieces @ 100g each)
            grams = quantity * (UNIT_CONVERSIONS['piece'] || 100);
        }
        
        return {
            original: line,
            quantity,
            unit,
            ingredientName,
            grams
        };
    }
    
    findIngredient(name) {
        // Try exact match first
        if (NUTRITION_DATABASE[name]) {
            return { name, data: NUTRITION_DATABASE[name] };
        }
        
        // Try partial matches
        const ingredients = Object.keys(NUTRITION_DATABASE);
        
        // Check if the ingredient name contains any database entry
        for (let dbIngredient of ingredients) {
            if (name.includes(dbIngredient) || dbIngredient.includes(name)) {
                return { name: dbIngredient, data: NUTRITION_DATABASE[dbIngredient] };
            }
        }
        
        // Try word-by-word matching
        const nameWords = name.split(/\s+/);
        for (let word of nameWords) {
            if (word.length > this.MIN_WORD_LENGTH_FOR_MATCHING) {
                for (let dbIngredient of ingredients) {
                    if (dbIngredient.includes(word)) {
                        return { name: dbIngredient, data: NUTRITION_DATABASE[dbIngredient] };
                    }
                }
            }
        }
        
        return null;
    }
    
    calculateNutritionForIngredient(parsed) {
        const found = this.findIngredient(parsed.ingredientName);
        
        if (!found) {
            return {
                found: false,
                original: parsed.original,
                grams: parsed.grams
            };
        }
        
        // Calculate nutrition based on grams (database values are per 100g)
        const multiplier = parsed.grams / 100;
        
        return {
            found: true,
            original: parsed.original,
            matchedName: found.name,
            grams: parsed.grams,
            calories: (found.data.calories * multiplier).toFixed(1),
            protein: (found.data.protein * multiplier).toFixed(1),
            carbs: (found.data.carbs * multiplier).toFixed(1),
            fat: (found.data.fat * multiplier).toFixed(1),
            fiber: (found.data.fiber * multiplier).toFixed(1)
        };
    }
    
    calculateNutrition() {
        const input = this.ingredientsInput.value.trim();
        if (!input) {
            alert('Please enter some ingredients!');
            return;
        }
        
        this.showLoading();
        
        // Small delay for better UX (allows loading animation to display)
        setTimeout(() => {
            const lines = input.split('\n').filter(line => line.trim());
            const parsedIngredients = [];
            const totals = {
                calories: 0,
                protein: 0,
                carbs: 0,
                fat: 0,
                fiber: 0
            };
            
            // Parse and calculate each ingredient
            for (let line of lines) {
                const parsed = this.parseIngredient(line);
                if (parsed) {
                    const nutrition = this.calculateNutritionForIngredient(parsed);
                    parsedIngredients.push(nutrition);
                    
                    if (nutrition.found) {
                        totals.calories += parseFloat(nutrition.calories);
                        totals.protein += parseFloat(nutrition.protein);
                        totals.carbs += parseFloat(nutrition.carbs);
                        totals.fat += parseFloat(nutrition.fat);
                        totals.fiber += parseFloat(nutrition.fiber);
                    }
                }
            }
            
            this.displayResults(totals, parsedIngredients);
            this.hideLoading();
            
            // Scroll to results on mobile
            if (window.innerWidth < 968) {
                this.resultsSection.scrollIntoView({ behavior: 'smooth' });
            }
        }, this.LOADING_DELAY_MS);
    }
    
    displayResults(totals, ingredients) {
        const foundCount = ingredients.filter(i => i.found).length;
        const totalCount = ingredients.length;
        
        let html = `
            <div class="nutrition-summary">
                <div class="total-calories">${Math.round(totals.calories)}</div>
                <div class="total-calories-label">Total Calories</div>
                
                <div class="macros-grid">
                    <div class="macro-card">
                        <div class="macro-value">${totals.protein.toFixed(1)}g</div>
                        <div class="macro-label">Protein</div>
                    </div>
                    <div class="macro-card">
                        <div class="macro-value">${totals.carbs.toFixed(1)}g</div>
                        <div class="macro-label">Carbs</div>
                    </div>
                    <div class="macro-card">
                        <div class="macro-value">${totals.fat.toFixed(1)}g</div>
                        <div class="macro-label">Fat</div>
                    </div>
                    <div class="macro-card">
                        <div class="macro-value">${totals.fiber.toFixed(1)}g</div>
                        <div class="macro-label">Fiber</div>
                    </div>
                </div>
            </div>
            
            <div class="ingredients-breakdown">
                <h3>Ingredient Details (${foundCount}/${totalCount} matched)</h3>
        `;
        
        for (let ingredient of ingredients) {
            if (ingredient.found) {
                html += `
                    <div class="ingredient-item">
                        <div class="ingredient-name">${ingredient.matchedName}</div>
                        <div class="ingredient-amount">${ingredient.grams}g • ${ingredient.original}</div>
                        <div class="ingredient-nutrition">
                            <span>🔥 ${ingredient.calories} cal</span>
                            <span>🥩 ${ingredient.protein}g protein</span>
                            <span>🍞 ${ingredient.carbs}g carbs</span>
                            <span>🥑 ${ingredient.fat}g fat</span>
                            <span>🌾 ${ingredient.fiber}g fiber</span>
                        </div>
                    </div>
                `;
            } else {
                html += `
                    <div class="ingredient-item not-found">
                        <div class="ingredient-name">⚠️ Unknown Ingredient</div>
                        <div class="ingredient-amount">${ingredient.original}</div>
                        <div class="not-found-message">
                            This ingredient was not found in our database. Nutrition values not included in totals.
                        </div>
                    </div>
                `;
            }
        }
        
        html += '</div>';
        
        if (foundCount < totalCount) {
            html += `
                <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px; font-size: 0.9rem;">
                    <strong>Note:</strong> Some ingredients were not found in our database. 
                    Try using more common names or check spelling. The nutrition totals only include matched ingredients.
                </div>
            `;
        }
        
        this.results.innerHTML = html;
    }
}

// Initialize the calculator when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new NutritionCalculator();
});
