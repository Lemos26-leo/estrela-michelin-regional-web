import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { RestaurantPage } from './pages/RestaurantPage'
import { SearchPage } from './pages/SearchPage'

const THEME_KEY = 'emr:theme'

type Theme = 'light' | 'dark'

function storedTheme(): Theme {
  return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
}

export default function App() {
  // Os dois temas saem dos mesmos tokens; claro é o padrão.
  const [ theme, setTheme ] = useState<Theme>(storedTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem(THEME_KEY, theme)
  }, [ theme ])

  return (
    <BrowserRouter>
      <div className="app">
        <header className="app__header">
          <div>
            <p className="app__name">
              <Link to="/">Estrela Michelin Regional</Link>
            </p>
            <p className="app__tagline">Restaurantes que combinam com a sua ocasião</p>
          </div>
          <button
            type="button"
            className="app__theme"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? 'Tema claro' : 'Tema escuro'}
          </button>
        </header>

        <main>
          <Routes>
            <Route path="/" element={<SearchPage />} />
            <Route path="/restaurantes/:id" element={<RestaurantPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
