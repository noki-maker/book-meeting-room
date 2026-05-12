import { useState } from 'react'
import { ConfigProvider, theme, Tabs, Tooltip } from 'antd'
import { GithubOutlined, SunOutlined, MoonOutlined } from '@ant-design/icons'
import ScenarioPage from './components/ScenarioPage'
import OptionsPage from './components/OptionsPage'

function App() {
  const [activeTab, setActiveTab] = useState<string>('all')
  const [darkMode, setDarkMode] = useState(false)

  const cur = darkMode ? darkStyles : lightStyles

  return (
    <div style={{ ...base.container, ...cur.container }}>
      <header style={{ ...base.header, ...cur.header }}>
        <div style={base.headerInner}>
          <h1 style={{ ...base.title, color: darkMode ? '#e8e8e8' : '#1a1a1a' }}>会议室预约</h1>
          <div style={base.actions}>
            <Tooltip title={darkMode ? '切换亮色模式' : '切换暗黑模式'}>
              <span
                style={{ ...base.toggleBtn, color: darkMode ? '#999' : '#999' }}
                onClick={() => setDarkMode(d => !d)}
              >
                {darkMode ? <SunOutlined style={base.icon} /> : <MoonOutlined style={base.icon} />}
              </span>
            </Tooltip>
            <a
              href="https://github.com/noki-maker/book-meeting-room"
              target="_blank"
              rel="noopener noreferrer"
              title="查看源码"
              style={{ ...base.githubLink, color: darkMode ? '#888' : '#999' }}
            >
              <GithubOutlined style={base.githubIcon} />
            </a>
          </div>
        </div>
      </header>

      <ConfigProvider
        theme={{
          cssVar: true,
          algorithm: darkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
        }}
      >
        <main style={{ ...base.main, ...cur.main }}>
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
              {
                key: 'options',
                label: '控制可选',
                children: <OptionsPage />,
              },
            ]}
          />
        </main>
      </ConfigProvider>
    </div>
  )
}

const base: Record<string, React.CSSProperties> = {
  headerInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 500,
    margin: 0,
    color: '#1a1a1a',
    transition: 'color 0.2s',
  },
  toggleBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
    lineHeight: 1,
    color: '#999',
    transition: 'color 0.2s',
  },
  icon: {
    fontSize: 18,
  },
  githubLink: {
    display: 'inline-flex',
    alignItems: 'center',
    textDecoration: 'none',
    color: '#999',
    transition: 'color 0.2s',
    lineHeight: 1,
  },
  githubIcon: {
    fontSize: 20,
  },
  main: {
    padding: '24px 40px',
  },
}

const lightStyles: Record<string, React.CSSProperties> = {
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
  main: {},
}

const darkStyles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#141414',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    backgroundColor: '#1f1f1f',
    borderBottom: '1px solid #303030',
    padding: '20px 40px',
  },
  main: {},
}

export default App
