import { Link } from 'react-router-dom'
import { formatPriceRange } from '../api/types'
import type { RestaurantResult } from '../api/types'
import { Badge, Card, CardMatch, CardMeta, CardName, CardTags, CardTop, Rating } from './ui'
import styles from './RestaurantCard.module.css'

type RestaurantCardProps = {
  restaurant: RestaurantResult
}

/**
 * Cartão de restaurante na lista. O percentual de compatibilidade só
 * aparece quando a busca tem ocasião ou vibe; sem contexto, o bloco some.
 */
export function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Card>
      <CardTop>
        <CardName>
          {/* O nome é o link para o perfil do restaurante (UC-C06). */}
          <Link to={`/restaurantes/${restaurant.id}`}>{restaurant.name}</Link>
        </CardName>
        {restaurant.compatibility === null ? null : (
          <CardMatch value={`${restaurant.compatibility}%`} label="compatível" />
        )}
      </CardTop>

      <CardMeta>
        <Rating value={restaurant.average_rating} />
        <span className={styles.separator} aria-hidden="true">
          ·
        </span>
        <span>
          {restaurant.neighborhood}, {restaurant.city}
        </span>
        <span className={styles.separator} aria-hidden="true">
          ·
        </span>
        <span className={styles.price} aria-label={`Faixa de preço ${restaurant.price_range} de 4`}>
          {formatPriceRange(restaurant.price_range)}
        </span>
        {restaurant.is_new ? <Badge variant="new">Novidade</Badge> : null}
      </CardMeta>

      {restaurant.matched_tags.length > 0 ? (
        <CardTags>
          {restaurant.matched_tags.map((tag) => (
            <Badge key={tag} variant="match">
              {tag}
            </Badge>
          ))}
        </CardTags>
      ) : null}
    </Card>
  )
}
