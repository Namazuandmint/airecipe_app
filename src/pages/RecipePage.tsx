// import { FeatureCard } from '../components/FeatureCard'
// import { HeroPanel } from '../components/HeroPanel'
//import { IngredientsPanel } from '../components/IngredientsPanel'
import { RecipesPanel } from '../components/RecipesPanel'
//import { SummaryGrid } from '../components/SummaryGrid'
import { useI18n } from '../lib/useI18n'
import {
  //expiringIngredients,
  //primaryFeatures,
  //secondaryFeatures,
  suggestedRecipes,
  //summaryItems,
} from '../data/home'
export function RecipePage() {
  const { t } = useI18n()

  return (
    <>
      <main className="home">
        <button type="button" className="secondary-button">
          <span>{t('topbar.ingredients')}</span>
        </button>
          <RecipesPanel recipes={suggestedRecipes} />
      </main>
    </>
  )
}
