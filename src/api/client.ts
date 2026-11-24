import mockData from '../api/mock.json'
import type {
  InvalidParams,
  SearchCriteria,
  SearchOptions,
  SearchResponse,
} from './types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export class InvalidParamsError extends Error {
  fields: string[]

  constructor(fields: string[]) {
    super(`Parâmetros inválidos: ${fields.join(', ')}`)
    this.name = 'InvalidParamsError'
    this.fields = fields
  }
}

export async function getSearchOptions(signal?: AbortSignal): Promise<SearchOptions> {
  if (USE_MOCK) {
    return mockData.search_options as SearchOptions
  }

  const response = await fetch(`${API_BASE_URL}/api/v1/search_options`, { signal })

  if (!response.ok) {
    throw new Error('Erro ao carregar as opções de busca.')
  }

  return response.json()
}

export async function searchRestaurants(
  criteria: SearchCriteria,
  signal?: AbortSignal,
): Promise<SearchResponse> {
  if (USE_MOCK) {
    return mockData.search as SearchResponse
  }

  const params = new URLSearchParams()

  if (criteria.city_id !== null) {
    params.append('city_id', String(criteria.city_id))
  }
  if (criteria.min_rating !== null) {
    params.append('min_rating', String(criteria.min_rating))
  }

  criteria.cuisines.forEach((id) => params.append('cuisines[]', String(id)))
  criteria.occasions.forEach((id) => params.append('occasions[]', String(id)))
  criteria.vibes.forEach((id) => params.append('vibes[]', String(id)))
  criteria.price_ranges.forEach((range) => params.append('price_ranges[]', String(range)))
  criteria.amenities.forEach((id) => params.append('amenities[]', String(id)))

  const queryString = params.toString()
  const url = `${API_BASE_URL}/api/v1/restaurants/search${queryString ? `?${queryString}` : ''}`

  const response = await fetch(url, { signal })

  if (response.status === 422) {
    const errorData: InvalidParams = await response.json()
    throw new InvalidParamsError(errorData.fields ?? [])
  }

  if (!response.ok) {
    throw new Error('Erro ao buscar restaurantes.')
  }

  return response.json()
}