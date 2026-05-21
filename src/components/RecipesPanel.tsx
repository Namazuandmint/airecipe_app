import type { Recipe } from '../types/ui'

export function RecipesPanel({ recipes }: { recipes: Recipe[] }) {
  return (
    <section className="panel" id="recipes" aria-labelledby="recipes-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">レシピ候補</p>
          <h2 id="recipes-title">在庫から作れる献立</h2>
        </div>
        <button type="button" className="small-button">
          再生成
        </button>
      </div>
      <div className="recipe-stack">
        {recipes.map((recipe) => (
          <article key={recipe.name} className="recipe-card">
            <h3>{recipe.name}</h3>
            <p>{recipe.meta}</p>
            <div className="tag-row">
              {recipe.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
