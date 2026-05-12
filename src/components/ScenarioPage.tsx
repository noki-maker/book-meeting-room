import { useState, useCallback, useEffect } from 'react'
import type { Meeting, IMeetingManager } from '../types/meeting'
import DataSelector, { DataKey } from './DataSelector'
import MeetingTable from './MeetingTable'
import AllConflictManager from '../managers/AllConflictManager'
import LastConflictManager from '../managers/LastConflictManager'
import twoData from '../../public/data/two.json'
import threeFullData from '../../public/data/three-full.json'
import threeCrossData from '../../public/data/three-cross.json'
import fourData from '../../public/data/four.json'

const ROOMS = [
  { id: 'A', name: '会议室 A' },
  { id: 'B', name: '会议室 B' },
]

const DATA_MAP: Record<DataKey, Meeting[]> = {
  two: twoData as Meeting[],
  'three-full': threeFullData as Meeting[],
  'three-cross': threeCrossData as Meeting[],
  four: fourData as Meeting[],
}

function resetMeetings(data: Meeting[]): Meeting[] {
  return data.map(m => ({
    ...m,
    roomId: null,
    prevRoomId: undefined,
    isConflict: false,
  }))
}

interface ScenarioPageProps {
  mode: 'all' | 'last'
}

function ScenarioPage({ mode }: ScenarioPageProps) {
  const [manager] = useState<IMeetingManager>(() =>
    mode === 'all' ? new AllConflictManager() : new LastConflictManager()
  )

  const [dataKey, setDataKey] = useState<DataKey>('two')
  const [meetings, setMeetings] = useState<Meeting[]>(() =>
    resetMeetings(DATA_MAP['two'])
  )
  const [refreshKey, setRefreshKey] = useState(0)

  const loadData = useCallback((key: DataKey) => {
    manager.clear()
    setMeetings(resetMeetings(DATA_MAP[key]))
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
