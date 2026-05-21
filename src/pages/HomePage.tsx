import { FeatureCard } from '../components/FeatureCard'
import { HeroPanel } from '../components/HeroPanel'
import { IngredientsPanel } from '../components/IngredientsPanel'
import { RecipesPanel } from '../components/RecipesPanel'
import { SummaryGrid } from '../components/SummaryGrid'
import { Topbar } from '../components/Topbar'
import {
  expiringIngredients,
  primaryFeatures,
  secondaryFeatures,
  suggestedRecipes,
  summaryItems,
} from '../data/home'

export function HomePage() {
  return (
    <div className="app-shell">
      <Topbar />

      <main className="home">
        <HeroPanel />

        <SummaryGrid items={summaryItems} />

        <section className="feature-section" aria-label="繧ｯ繧､繝・け繧｢繧ｯ繧ｻ繧ｹ">
          <div className="feature-grid">
            {primaryFeatures.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </section>

        <div className="dashboard-grid">
          <IngredientsPanel ingredients={expiringIngredients} />
          <RecipesPanel recipes={suggestedRecipes} />
        </div>

        <section
          className="secondary-section"
          id="shopping"
          aria-label="繧｢繧ｫ繧ｦ繝ｳ繝医→繧ｵ繝昴・繝・"
        >
          <div className="secondary-grid">
            {secondaryFeatures.map((feature) => (
              <FeatureCard key={feature.title} feature={feature} />
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
