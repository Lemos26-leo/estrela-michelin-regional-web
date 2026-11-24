import {
  formatPriceRange,
  formatRating,
  type SearchCriteria,
  type SearchOptions,
  type TagOption,
} from '../api/types'
import { Button } from './ui/Button'
import { ChipGroup, type ChipOption } from './ui/Chip'
import { Select, type SelectOption } from './ui/Select'
import styles from './SearchFilters.module.css'

type SearchFiltersProps = {
  options: SearchOptions
  criteria: SearchCriteria
  onChange: (patch: Partial<SearchCriteria>) => void
  onSubmit: () => void
  onClear: () => void
  loading?: boolean
}

function toChipOptions(items: TagOption[]): ChipOption[] {
  return items.map((item) => ({
    value: String(item.id),
    label: item.name,
  }))
}

export function SearchFilters({
  options,
  criteria,
  onChange,
  onSubmit,
  onClear,
  loading = false,
}: SearchFiltersProps) {
  const cityOptions: SelectOption[] = options.cities.map((city) => ({
    value: String(city.id),
    label: `${city.name} (${city.state})`,
  }))

  const ratingOptions: SelectOption[] = options.min_ratings.map((rating) => ({
    value: String(rating),
    label: `${formatRating(rating)} ★ ou mais`,
  }))

  const priceChipOptions: ChipOption[] = options.price_ranges.map((price) => ({
    value: String(price),
    label: formatPriceRange(price),
  }))

  const toStringIds = (ids: number[]) => ids.map(String)
  const toNumberIds = (values: string[]) => values.map(Number)

  return (
    <form
      className={styles.root}
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
    >
      <div className={styles.selects}>
        <Select
          label="Cidade"
          placeholder="Todas as cidades"
          options={cityOptions}
          value={criteria.city_id !== null ? String(criteria.city_id) : ''}
          onChange={(value) =>
            onChange({ city_id: value ? Number(value) : null })
          }
        />

        <Select
          label="Nota mínima"
          placeholder="Qualquer nota"
          options={ratingOptions}
          value={criteria.min_rating !== null ? String(criteria.min_rating) : ''}
          onChange={(value) =>
            onChange({ min_rating: value ? Number(value) : null })
          }
        />
      </div>

      <div className={styles.chips}>
        <ChipGroup
          label="Ocasião"
          options={toChipOptions(options.tags.occasion)}
          value={toStringIds(criteria.occasions)}
          onChange={(values) => onChange({ occasions: toNumberIds(values) })}
        />

        <ChipGroup
          label="Vibe"
          options={toChipOptions(options.tags.vibe)}
          value={toStringIds(criteria.vibes)}
          onChange={(values) => onChange({ vibes: toNumberIds(values) })}
        />

        <ChipGroup
          label="Culinária"
          options={toChipOptions(options.tags.cuisine)}
          value={toStringIds(criteria.cuisines)}
          onChange={(values) => onChange({ cuisines: toNumberIds(values) })}
        />

        <ChipGroup
          label="Faixa de preço"
          options={priceChipOptions}
          value={toStringIds(criteria.price_ranges)}
          onChange={(values) => onChange({ price_ranges: toNumberIds(values) })}
        />

        <ChipGroup
          label="Comodidades"
          options={toChipOptions(options.tags.amenity)}
          value={toStringIds(criteria.amenities)}
          onChange={(values) => onChange({ amenities: toNumberIds(values) })}
        />
      </div>

      <div className={styles.actions}>
        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Buscando...' : 'Buscar'}
        </Button>
        <Button type="button" variant="secondary" onClick={onClear}>
          Limpar filtros
        </Button>
      </div>
    </form>
  )
}