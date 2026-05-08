import { useState } from 'react'
import { Tabs } from 'antd'
import ScenarioPage from './components/ScenarioPage'

function App() {
  const [activeTab, setActiveTab] = useState<string>('all')

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>会议室预约</h1>
      </header>

      <main style={styles.main}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'all',
              label: '冲突均标红',
              children: <ScenarioPage mode="all" />,
            },
            {
              key: 'last',
              label: '后选标红',
              children: <ScenarioPage mode="last" />,
            },
          ]}
        />
      </main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#fafafa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    backgroundColor: '#fff',
    borderBottom: '1px solid #eee',
    padding: '20px 40px',
  },
  title: {
    fontSize: 18,
    fontWeight: 500,
    color: '#1a1a1a',
    margin: 0,
  },
  main: {
    padding: '24px 40px',
  },
}

export default App
