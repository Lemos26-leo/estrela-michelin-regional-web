import { formatPriceRange, formatRating } from '../api/types'
import type { SearchCriteria, SearchOptions } from '../api/types'
import { Button, ChipGroup, Select } from './ui'
import type { ChipOption } from './ui'
import styles from './SearchFilters.module.css'

type SearchFiltersProps = {
  options: SearchOptions
  criteria: SearchCriteria
  onChange: (patch: Partial<SearchCriteria>) => void
  onSubmit: () => void
  onClear: () => void
  loading: boolean
}

function tagOptions(tags: { id: number; name: string }[]): ChipOption[] {
  return tags.map((tag) => ({ value: String(tag.id), label: tag.name }))
}

function toIds(values: string[]): number[] {
  return values.map(Number)
}

/**
 * Critérios do UC-C04. Nenhum é obrigatório: o que ficar vazio não
 * vira filtro (RN-C01).
 */
export function SearchFilters({
  options,
  criteria,
  onChange,
  onSubmit,
  onClear,
  loading,
}: SearchFiltersProps) {
  const hasCriteria =
    criteria.city_id !== null ||
    criteria.min_rating !== null ||
    criteria.cuisines.length > 0 ||
    criteria.occasions.length > 0 ||
    criteria.vibes.length > 0 ||
    criteria.price_ranges.length > 0 ||
    criteria.amenities.length > 0

  return (
    <form
      className={styles.root}
      onSubmit={(event) => {
        event.preventDefault()
        onSubmit()
      }}
    >
      <div className={styles.selects}>
        <Select
          label="Cidade"
          placeholder="Todas as cidades"
          value={criteria.city_id === null ? '' : String(criteria.city_id)}
          options={options.cities.map((city) => ({
            value: String(city.id),
            label: `${city.name} — ${city.state}`,
          }))}
          onChange={(value) => onChange({ city_id: value === '' ? null : Number(value) })}
        />
        <Select
          label="Nota mínima"
          placeholder="Qualquer nota"
          value={criteria.min_rating === null ? '' : String(criteria.min_rating)}
          options={options.min_ratings.map((rating) => ({
            value: String(rating),
            label: `${formatRating(rating)} ou mais`,
          }))}
          onChange={(value) => onChange({ min_rating: value === '' ? null : Number(value) })}
        />
      </div>

      <div className={styles.groups}>
        <ChipGroup
          label="Ocasião"
          options={tagOptions(options.tags.occasion)}
          value={criteria.occasions.map(String)}
          onChange={(value) => onChange({ occasions: toIds(value) })}
        />
        <ChipGroup
          label="Vibe"
          options={tagOptions(options.tags.vibe)}
          value={criteria.vibes.map(String)}
          onChange={(value) => onChange({ vibes: toIds(value) })}
        />
        <ChipGroup
          label="Culinária"
          options={tagOptions(options.tags.cuisine)}
          value={criteria.cuisines.map(String)}
          onChange={(value) => onChange({ cuisines: toIds(value) })}
        />
        <ChipGroup
          label="Preço"
          options={options.price_ranges.map((range) => ({
            value: String(range),
            label: formatPriceRange(range),
          }))}
          value={criteria.price_ranges.map(String)}
          onChange={(value) => onChange({ price_ranges: toIds(value) })}
        />
        <ChipGroup
          label="Comodidades"
          options={tagOptions(options.tags.amenity)}
          value={criteria.amenities.map(String)}
          onChange={(value) => onChange({ amenities: toIds(value) })}
        />
      </div>

      <div className={styles.actions}>
        <Button type="submit" disabled={loading}>
          {loading ? 'Buscando…' : 'Buscar restaurantes'}
        </Button>
        <Button variant="secondary" onClick={onClear} disabled={!hasCriteria || loading}>
          Limpar filtros
        </Button>
        <p className={styles.hint}>
          Sem ocasião nem vibe, a lista vem ordenada por nota.
        </p>
      </div>
    </form>
  )
}
