import mock from './mock.json'
import type { SearchCriteria, SearchOptions, SearchResponse } from './types'

const BASE_URL: string = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

/** Enquanto a API não existe, o front trabalha com src/api/mock.json. */
const USE_MOCK: boolean = import.meta.env.VITE_USE_MOCK === 'true'

const CLIENT_ID_KEY = 'emr:client-id'

/**
 * Simula o cliente logado do RN-C09: a API grava o histórico da busca
 * quando a requisição traz o cabeçalho X-Client-Id.
 */
function clientId(): string {
  let stored = localStorage.getItem(CLIENT_ID_KEY)
  if (!stored) {
    stored = crypto.randomUUID()
    localStorage.setItem(CLIENT_ID_KEY, stored)
  }
  return stored
}

/** Parâmetro inválido: resposta 422 do contrato. */
export class InvalidParamsError extends Error {
  readonly fields: string[]

  constructor(fields: string[]) {
    super('invalid_params')
    this.name = 'InvalidParamsError'
    this.fields = fields
  }
}

function searchQuery(criteria: SearchCriteria): string {
  const params = new URLSearchParams()

  if (criteria.city_id !== null) params.set('city_id', String(criteria.city_id))
  if (criteria.min_rating !== null) params.set('min_rating', String(criteria.min_rating))
  for (const id of criteria.cuisines) params.append('cuisines[]', String(id))
  for (const id of criteria.occasions) params.append('occasions[]', String(id))
  for (const id of criteria.vibes) params.append('vibes[]', String(id))
  for (const range of criteria.price_ranges) params.append('price_ranges[]', String(range))
  for (const id of criteria.amenities) params.append('amenities[]', String(id))

  return params.toString()
}

async function get<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, init)

  if (response.status === 422) {
    const body = (await response.json()) as { fields?: string[] }
    throw new InvalidParamsError(body.fields ?? [])
  }

  if (!response.ok) {
    throw new Error(`A API respondeu ${response.status}`)
  }

  return (await response.json()) as T
}

function delayed<T>(value: T): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(value), 300)
  })
}

/** Cidades e tags por categoria, para montar os filtros. */
export function getSearchOptions(signal?: AbortSignal): Promise<SearchOptions> {
  if (USE_MOCK) return delayed(mock.search_options as SearchOptions)

  return get<SearchOptions>('/api/v1/search_options', { signal })
}

/** Executa a busca do UC-C04. */
export function searchRestaurants(
  criteria: SearchCriteria,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  if (USE_MOCK) return delayed(mock.search as SearchResponse)

  const query = searchQuery(criteria)
  const path = query ? `/api/v1/restaurants/search?${query}` : '/api/v1/restaurants/search'

  return get<SearchResponse>(path, {
    signal,
    headers: { 'X-Client-Id': clientId() },
  })
}
