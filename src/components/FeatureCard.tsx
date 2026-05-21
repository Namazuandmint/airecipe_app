import type { Feature } from '../types/ui'
import { Icon } from './Icon'

export function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <article className={`feature-card tone-${feature.tone}`}>
      <div className="feature-card__icon">
        <Icon name={feature.icon} />
      </div>
      <div>
        <h3>{feature.title}</h3>
        <p>{feature.description}</p>
      </div>
      <button type="button" className="text-button">
        <span>{feature.action}</span>
        <Icon name="arrow" />
      </button>
    </article>
  )
}
