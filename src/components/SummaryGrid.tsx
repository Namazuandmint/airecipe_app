type SummaryItem = {
  label: string
  value: string
  note: string
}

export function SummaryGrid({ items }: { items: SummaryItem[] }) {
  return (
    <section className="summary-grid" aria-label="今日の状況">
      {items.map((item) => (
        <article key={item.label}>
          <span>{item.label}</span>
          <strong>{item.value}</strong>
          <small>{item.note}</small>
        </article>
      ))}
    </section>
  )
}
