import { useState, useCallback, useEffect } from 'react'
import type { Meeting, IMeetingManager } from '../types/meeting'
import DataSelector, { DataKey } from './DataSelector'
import MeetingTable from './MeetingTable'
import AllConflictManager from '../managers/AllConflictManager'
import LastConflictManager from '../managers/LastConflictManager'

const ROOMS = [
  { id: 'A', name: '会议室 A' },
  { id: 'B', name: '会议室 B' },
]

const DATA_FILES: Record<DataKey, string> = {
  two: '/data/two.json',
  'three-full': '/data/three-full.json',
  'three-cross': '/data/three-cross.json',
  four: '/data/four.json',
}

interface ScenarioPageProps {
  mode: 'all' | 'last'
}

function ScenarioPage({ mode }: ScenarioPageProps) {
  const [manager] = useState<IMeetingManager>(() =>
    mode === 'all' ? new AllConflictManager() : new LastConflictManager()
  )

  const [dataKey, setDataKey] = useState<DataKey>('two')
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [refreshKey, setRefreshKey] = useState(0)

  const loadData = useCallback(async (key: DataKey) => {
    manager.clear()
    try {
      const res = await fetch(DATA_FILES[key])
      const data: Meeting[] = await res.json()
      const resetData = data.map(m => ({
        ...m,
        roomId: null,
        prevRoomId: undefined,
        isConflict: false,
      }))
      setMeetings(resetData)
    } catch {
      console.error('加载数据失败')
    }
  }, [manager])

  useEffect(() => {
    loadData(dataKey)
  }, [dataKey, loadData])

  const handleAssign = useCallback((meeting: Meeting, roomId: string) => {
    const updated = meetings.map(m =>
      m.id === meeting.id ? { ...m, prevRoomId: m.roomId, roomId } : m
    )
    setMeetings(updated)
    const target = updated.find(m => m.id === meeting.id)!
    manager.handleRoomChange(target)
    setRefreshKey(k => k + 1)
  }, [meetings, manager])

  const handleRemove = useCallback((meeting: Meeting) => {
    const updated = meetings.map(m =>
      m.id === meeting.id ? { ...m, prevRoomId: m.roomId, roomId: null } : m
    )
    setMeetings(updated)
    const target = updated.find(m => m.id === meeting.id)!
    manager.handleRoomChange(target)
    setRefreshKey(k => k + 1)
  }, [meetings, manager])

  const conflictCount = meetings.filter(m => m.isConflict).length

  return (
    <div>
      <DataSelector value={dataKey} onChange={setDataKey} />

      <MeetingTable
        key={refreshKey}
        meetings={meetings}
        rooms={ROOMS}
        onAssign={handleAssign}
        onRemove={handleRemove}
      />

      {conflictCount > 0 && (
        <p style={styles.hint}>
          冲突会议已标红显示
        </p>
      )}
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  hint: {
    marginTop: 16,
    fontSize: 13,
    color: '#999',
  },
}

export default ScenarioPage
