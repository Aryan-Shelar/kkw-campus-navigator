import { CampusProvider, useCampus } from './store'
import { Header } from './components/Header'
import { AIChat } from './components/AIChat'
import { Home } from './pages/Home'
import { MapPage } from './pages/MapPage'
import { DirectoryPage } from './pages/DirectoryPage'

function Shell() {
  const { view } = useCampus()

  return (
    <div className="app">
      <Header />
      <main className="main">
        {view === 'home' && <Home />}
        {view === 'map' && <MapPage />}
        {view === 'directory' && <DirectoryPage />}
      </main>
      <AIChat />
      <div className="demo-pill">
        <i />
        Prototype · Demo campus data
      </div>
    </div>
  )
}

export default function App() {
  return (
    <CampusProvider>
      <Shell />
    </CampusProvider>
  )
}
