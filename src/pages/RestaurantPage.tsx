import { Link, useParams } from 'react-router-dom'
import styles from './RestaurantPage.module.css'

/**
 * Placeholder do UC-C06 Ver perfil do restaurante, que não faz parte
 * desta entrega. O cartão da lista aponta para cá.
 */
export function RestaurantPage() {
  const { id } = useParams()

  return (
    <div className={styles.root}>
      <h1 className={styles.title}>Perfil do restaurante</h1>
      <p className={styles.text}>
        O perfil completo é o UC-C06 e fica para a próxima entrega. Por enquanto, este é o
        restaurante {id} da busca.
      </p>
      <p>
        <Link to="/">Voltar para a busca</Link>
      </p>
    </div>
  )
}
