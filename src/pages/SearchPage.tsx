import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { InvalidParamsError, getSearchOptions, searchRestaurants } from '../api/client'
import { CRITERION_LABELS, EMPTY_CRITERIA } from '../api/types'
import type { CriterionKey, SearchCriteria, SearchOptions, SearchResponse } from '../api/types'
import { ResultList } from '../components/ResultList'
import { SearchFilters } from '../components/SearchFilters'
import { EmptyState } from '../components/ui'
import styles from './SearchPage.module.css'

/** Marca na URL que a busca já foi disparada pelo menos uma vez. */
const SEARCHED = 'buscar'

const LIST_KEYS = [ 'cuisines', 'occasions', 'vibes', 'price_ranges', 'amenities' ] as const

function readList(value: string | null): number[] {
  if (value === null || value === '') return []

  return value
    .split(',')
    .map(Number)
    .filter((item) => Number.isFinite(item))
}

function readNumber(value: string | null): number | null {
  if (value === null || value === '') return null

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/** Os critérios ficam na URL: refinar a busca é só alterar um filtro (5a). */
function readCriteria(params: URLSearchParams): SearchCriteria {
  return {
    city_id: readNumber(params.get('city_id')),
    cuisines: readList(params.get('cuisines')),
    occasions: readList(params.get('occasions')),
    vibes: readList(params.get('vibes')),
    price_ranges: readList(params.get('price_ranges')),
    min_rating: readNumber(params.get('min_rating')),
    amenities: readList(params.get('amenities')),
  }
}

function writeParams(criteria: SearchCriteria, searched: boolean): URLSearchParams {
  const params = new URLSearchParams()

  if (criteria.city_id !== null) params.set('city_id', String(criteria.city_id))
  if (criteria.min_rating !== null) params.set('min_rating', String(criteria.min_rating))
  for (const key of LIST_KEYS) {
    if (criteria[key].length > 0) params.set(key, criteria[key].join(','))
  }
  if (searched) params.set(SEARCHED, '1')

  return params
}

function withoutCriterion(criteria: SearchCriteria, key: CriterionKey): SearchCriteria {
  const next = { ...criteria }
  if (key === 'city_id' || key === 'min_rating') next[key] = null
  else next[key] = []

  return next
}

export function SearchPage() {
  const [ searchParams, setSearchParams ] = useSearchParams()
  const criteria = useMemo(() => readCriteria(searchParams), [ searchParams ])
  const searched = searchParams.get(SEARCHED) === '1'

  const [ options, setOptions ] = useState<SearchOptions | null>(null)
  const [ optionsFailed, setOptionsFailed ] = useState(false)
  const [ optionsAttempt, setOptionsAttempt ] = useState(0)

  const [ response, setResponse ] = useState<SearchResponse | null>(null)
  const [ loading, setLoading ] = useState(false)
  const [ failure, setFailure ] = useState<unknown>(null)
  const [ searchAttempt, setSearchAttempt ] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getSearchOptions(controller.signal)
      .then(setOptions)
      .catch(() => {
        if (!controller.signal.aborted) setOptionsFailed(true)
      })

    return () => controller.abort()
  }, [ optionsAttempt ])

  useEffect(() => {
    // Sem a marca na URL a tela está no estado inicial: nada a buscar.
    if (!searched) return

    const controller = new AbortController()
    setLoading(true)
    setFailure(null)

    searchRestaurants(criteria, controller.signal)
      .then((data) => {
        setResponse(data)
        setLoading(false)
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return
        setFailure(cause)
        setLoading(false)
      })

    return () => controller.abort()
  }, [ criteria, searched, searchAttempt ])

  const retryOptions = () => {
    setOptionsFailed(false)
    setOptionsAttempt((attempt) => attempt + 1)
  }

  const change = (patch: Partial<SearchCriteria>) => {
    setSearchParams(writeParams({ ...criteria, ...patch }, searched), { replace: true })
  }

  const submit = () => {
    setSearchParams(writeParams(criteria, true))
    setSearchAttempt((attempt) => attempt + 1)
  }

  const clear = () => {
    setSearchParams(writeParams(EMPTY_CRITERIA, false))
  }

  const remove = (key: CriterionKey) => {
    setSearchParams(writeParams(withoutCriterion(criteria, key), true))
  }

  return (
    <div className={styles.root}>
      <div className={styles.intro}>
        <h1 className={styles.title}>O que você está planejando?</h1>
        <p className={styles.lead}>
          Escolha a ocasião e a vibe para ver os restaurantes que combinam. Nenhum critério é
          obrigatório.
        </p>
      </div>

      {optionsFailed ? (
        <EmptyState
          title="Não foi possível carregar os filtros"
          description="A API não respondeu. Verifique se ela está rodando e tente de novo."
          action={{ label: 'Tentar de novo', onClick: retryOptions }}
        />
      ) : options === null ? (
        <p className={styles.loading}>Carregando filtros…</p>
      ) : (
        <>
          <SearchFilters
            options={options}
            criteria={criteria}
            onChange={change}
            onSubmit={submit}
            onClear={clear}
            loading={loading}
          />

          <div className={styles.results} aria-live="polite">
            <Results
              searched={searched}
              loading={loading}
              failure={failure}
              response={response}
              onRetry={() => setSearchAttempt((attempt) => attempt + 1)}
              onRemove={remove}
              onClear={clear}
            />
          </div>
        </>
      )}
    </div>
  )
}

type ResultsProps = {
  searched: boolean
  loading: boolean
  failure: unknown
  response: SearchResponse | null
  onRetry: () => void
  onRemove: (key: CriterionKey) => void
  onClear: () => void
}

/** Os cinco estados da tela, na ordem em que aparecem no plano. */
function Results({
  searched,
  loading,
  failure,
  response,
  onRetry,
  onRemove,
  onClear,
}: ResultsProps) {
  // Estado inicial: os filtros estão vazios e nada foi buscado ainda.
  if (!searched) {
    return (
      <EmptyState
        title="Comece pela ocasião"
        description="Marque o que combina com o seu plano e toque em buscar restaurantes."
      />
    )
  }

  if (loading) return <p className={styles.loading}>Buscando restaurantes…</p>

  if (failure instanceof InvalidParamsError) {
    const fields = failure.fields
      .map((field) => CRITERION_LABELS[field as CriterionKey] ?? field)
      .join(', ')

    return (
      <EmptyState
        title="Alguns critérios não valem mais"
        description={`A API não reconheceu: ${fields}. Limpe os filtros e comece de novo.`}
        action={{ label: 'Limpar filtros', onClick: onClear }}
      />
    )
  }

  if (failure !== null) {
    return (
      <EmptyState
        title="Não foi possível buscar agora"
        description="A API não respondeu. Verifique a conexão e tente de novo."
        action={{ label: 'Tentar de novo', onClick: onRetry }}
      />
    )
  }

  if (!searched || response === null) {
    return (
      <EmptyState
        title="Comece pela ocasião"
        description="Marque o que combina com o seu plano e toque em buscar restaurantes."
      />
    )
  }

  if (response.results.length === 0) {
    const suggestion = response.suggestion

    if (suggestion === null) {
      return (
        <EmptyState
          title="Nenhum restaurante combina com tudo isso"
          description="Nenhum critério sozinho resolve. Limpe os filtros e comece de novo."
          action={{ label: 'Limpar filtros', onClick: onClear }}
        />
      )
    }

    const label = CRITERION_LABELS[suggestion.remove]
    const count =
      suggestion.would_return === 1 ? '1 restaurante volta' : `${suggestion.would_return} restaurantes voltam`

    return (
      <EmptyState
        title="Nenhum restaurante combina com tudo isso"
        description={`Tente remover a ${label}: ${count}.`}
        action={{ label: `Remover ${label}`, onClick: () => onRemove(suggestion.remove) }}
      />
    )
  }

  return <ResultList ordering={response.ordering} results={response.results} />
}
