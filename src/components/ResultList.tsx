import type { Ordering, RestaurantResult } from '../api/types'
import { RestaurantCard } from './RestaurantCard'
import styles from './ResultList.module.css'

const ORDERING_LABEL: Record<Ordering, string> = {
  compatibility: 'Ordenado por compatibilidade',
  rating: 'Ordenado por nota',
}

type ResultListProps = {
  ordering: Ordering
  results: RestaurantResult[]
}

/** Lista ordenada, com o aviso do tipo de ordenação acima. */
export function ResultList({ ordering, results }: ResultListProps) {
  return (
    <div className={styles.root}>
      <div className={styles.summary}>
        <span className={styles.ordering}>{ORDERING_LABEL[ordering]}</span>
        <span>
          {results.length === 1 ? '1 restaurante' : `${results.length} restaurantes`}
        </span>
      </div>
      <ul className={styles.cards}>
        {results.map((restaurant) => (
          <li key={restaurant.id}>
            <RestaurantCard restaurant={restaurant} />
          </li>
        ))}
      </ul>
    </div>
  )
}
