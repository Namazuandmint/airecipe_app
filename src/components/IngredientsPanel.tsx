import type { Ingredient } from '../types/ui'

export function IngredientsPanel({
  ingredients,
}: {
  ingredients: Ingredient[]
}) {
  return (
    <section className="panel" id="ingredients" aria-labelledby="ingredients-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">在庫管理</p>
          <h2 id="ingredients-title">期限が近い食材</h2>
        </div>
        <button type="button" className="small-button">
          登録
        </button>
      </div>
      <ul className="ingredient-list">
        {ingredients.map((ingredient) => (
          <li key={ingredient.name}>
            <span>
              <strong>{ingredient.name}</strong>
              <small>{ingredient.amount}</small>
            </span>
            <em>{ingredient.status}</em>
          </li>
        ))}
      </ul>
    </section>
  )
}
