import { useState, useCallback } from 'react'
import { Table, Select, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { Meeting, Scschedule } from '../types/meeting'
import OptionsManager from '../managers/OptionsManager'
import meetingsData from '../../public/data/two.json'
import roomsData from '../../public/data/room.json'
import styles from './OptionsPage.module.css'

const { compactFormat } = {
  compactFormat: (time: string) => time.slice(11, 16),
}

/* ========== 数据初始化 ========== */
const ROOMS: { id: string; name: string }[] = [
  { id: 'A', name: '会议室 A' },
  { id: 'B', name: '会议室 B' },
  { id: 'C', name: '会议室 C' },
]

const RAW_ROOMS = roomsData as Record<string, { id: string; name: string; scschedules: Scschedule[] }[]>

function initMeetings(): Meeting[] {
  return (meetingsData as Meeting[]).map(m => ({
    ...m,
    roomId: null,
    prevRoomId: undefined,
    isConflict: false,
  }))
}

function initManager(): OptionsManager {
  const mgr = new OptionsManager()
  mgr.setRoomsData(RAW_ROOMS)
  return mgr
}

/* ========== 可视化时间轴组件 ========== */
function toMinutes(t: string): number {
  // 处理 "HH:mm" 和 "YYYY-MM-DD HH:mm:ss" 两种格式
  const h = parseInt(t.length === 5 ? t.slice(0, 2) : t.slice(11, 13), 10)
  const m = parseInt(t.length === 5 ? t.slice(3, 5) : t.slice(14, 16), 10)
  return h * 60 + m
}

function ScheduleTimeline({ manager }: { manager: OptionsManager }) {
  const allSchedules = ROOMS.flatMap(room =>
    manager.getRoomSchedules('2021-01-01', room.id)
  )

  if (allSchedules.length === 0) {
    return <div className={styles.tlEmpty}>暂无任何预约</div>
  }

  // 计算时间范围
  let minMin = Infinity, maxMin = -Infinity
  allSchedules.forEach(s => {
    const start = toMinutes(s.start)
    const end = toMinutes(s.end)
    if (start < minMin) minMin = start
    if (end > maxMin) maxMin = end
  })
  const startHour = Math.floor(minMin / 60)
  const endHour = Math.ceil(maxMin / 60)
  const totalMinutes = (endHour - startHour) * 60

  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i)
  const gridLines = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)

  const fmt = (t: string) => (t.length === 5 ? t : t.slice(11, 16))
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className={styles.timeline}>
      {/* 时间轴表头 */}
      <div className={styles.tlRow}>
        <span className={styles.tlLabel}>会议室</span>
        <div className={styles.tlTrack}>
          {hours.map(h => (
            <div
              key={h}
              className={styles.tlHour}
              style={{ left: `${((h - startHour) * 60 / totalMinutes) * 100}%` }}
            >
              {pad(h)}:00
            </div>
          ))}
        </div>
      </div>

      {/* 每个会议室一行 */}
      {ROOMS.map(room => {
        const schedules = manager.getRoomSchedules('2021-01-01', room.id)
        return (
          <div key={room.id} className={styles.tlRow}>
            <span className={styles.tlLabel}>{room.name}</span>
            <div className={styles.tlTrack}>
              {/* 竖网格线 */}
              {gridLines.map(h => (
                <div
                  key={h}
                  className={styles.tlGrid}
                  style={{ left: `${((h - startHour) * 60 / totalMinutes) * 100}%` }}
                />
              ))}
              {/* 已占用时间块 */}
              {schedules.map(s => {
                const sMin = toMinutes(s.start)
                const eMin = toMinutes(s.end)
                const left = ((sMin - startHour * 60) / totalMinutes) * 100
                const width = ((eMin - sMin) / totalMinutes) * 100
                const isInitial = s.meetingId === '10' || s.meetingId === '9'
                return (
                  <div
                    key={s.meetingId}
                    className={`${styles.tlBar} ${isInitial ? styles.tlBarInitial : styles.tlBarAdded}`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    title={`${isInitial ? '初始预约' : '追加预约'}: ${s.start} ~ ${s.end}`}
                  >
                    <span className={styles.tlBarText}>
                      {fmt(s.start)}-{fmt(s.end)}
                      <span className={styles.tlBarTag}>{isInitial ? '初始' : '追加'}</span>
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
function ScheduleTag({ schedule }: { schedule: Scschedule }) {
  const isInitial = schedule.meetingId === '10' || schedule.meetingId === '9'
  return (
    <Tag
      color={isInitial ? 'warning' : 'processing'}
      style={{ fontSize: 11, lineHeight: '18px', margin: '1px 0' }}
    >
      {isInitial ? '初始' : '追加'} {schedule.start}~{schedule.end}
      <span style={{ opacity: 0.6, marginLeft: 4 }}>(ID:{schedule.meetingId})</span>
    </Tag>
  )
}

/* ========== 主组件 ========== */
function OptionsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>(initMeetings)
  const [manager] = useState<OptionsManager>(initManager)

  const handleAssign = useCallback(
    (meeting: Meeting, roomId: string) => {
      setMeetings(prev => {
        const updated = prev.map(m =>
          m.id === meeting.id ? { ...m, prevRoomId: m.roomId, roomId } : m
        )
        const target = updated.find(m => m.id === meeting.id)!
        manager.handleRoomChange(target)
        return updated
      })
    },
    [manager],
  )

  const handleRemove = useCallback(
    (meeting: Meeting) => {
      setMeetings(prev => {
        const updated = prev.map(m =>
          m.id === meeting.id ? { ...m, prevRoomId: m.roomId, roomId: null } : m
        )
        const target = updated.find(m => m.id === meeting.id)!
        manager.handleRoomChange(target)
        return updated
      })
    },
    [manager],
  )

  const handleReset = useCallback(() => {
    manager.clear()
    manager.setRoomsData(RAW_ROOMS)
    setMeetings(initMeetings())
  }, [manager])

  const columns: ColumnsType<Meeting> = [
    {
      title: '会议',
      dataIndex: 'name',
      key: 'name',
      width: 100,
    },
    {
      title: '时间',
      key: 'time',
      width: 120,
      render: (_, r) => (
        <span className={styles.timeCell}>
          {compactFormat(r.start)} - {compactFormat(r.end)}
        </span>
      ),
    },
    {
      title: '会议室可选信息',
      key: 'roomOptions',
      render: (_, meeting) => (
        <div className={styles.optionsCell}>
          {ROOMS.map(room => {
            const selectable = manager.canSelectRoom(meeting, room.id)
            const schedules = manager.getRoomSchedules(meeting.date, room.id)
            const isSelected = meeting.roomId === room.id
            return (
              <div key={room.id} className={styles.optionRow}>
                <span className={styles.optionRoomName}>{room.name}</span>
                <span className={styles.optionStatus}>
                  {isSelected ? (
                    <Tag color="blue" style={{ margin: 0 }}>已分配</Tag>
                  ) : selectable ? (
                    <Tag color="success" style={{ margin: 0 }}>可选</Tag>
                  ) : (
                    <Tag color="error" style={{ margin: 0 }}>不可选</Tag>
                  )}
                </span>
                {schedules.length > 0 && (
                  <span className={styles.optionScheds}>
                    {schedules.map(s => (
                      <ScheduleTag key={s.meetingId} schedule={s} />
                    ))}
                  </span>
                )}
                {schedules.length === 0 && (
                  <span className={styles.optionNoSched}>无预约</span>
                )}
              </div>
            )
          })}
        </div>
      ),
    },
    {
      title: '分配',
      key: 'action',
      width: 130,
      render: (_, record) => (
        <Select
          value={record.roomId}
          placeholder="—"
          size="small"
          style={{ width: 110 }}
          allowClear
          onChange={value => {
            if (value) handleAssign(record, value)
            else handleRemove(record)
          }}
          options={ROOMS.map(r => ({
            label: r.name,
            value: r.id,
            disabled: !manager.canSelectRoom(record, r.id),
          }))}
        />
      ),
    },
  ]

  return (
    <div className={styles.container}>
      {/* 数据来源提示 */}
      <div className={styles.sourceBar}>
        <span className={styles.sourceLabel}>
          数据来源：
        </span>
        <Tag style={{ fontSize: 11 }}>public/data/two.json</Tag>
        <Tag style={{ fontSize: 11 }}>public/data/room.json</Tag>
        <button className={styles.resetBtn} onClick={handleReset}>
          重置
        </button>
      </div>

      {/* 表格 */}
      <Table<Meeting>
        columns={columns}
        dataSource={meetings}
        rowKey="id"
        size="small"
        pagination={false}
        className={styles.table}
      />

      {/* 底部：可视化日程时间轴 */}
      <div className={styles.scheduleOverview}>
        <h4 className={styles.overviewTitle}>会议室日程时间轴</h4>
        <ScheduleTimeline manager={manager} />
        <div className={styles.tlLegend}>
          <span className={styles.tlLegendItem}>
            <span className={`${styles.tlLegendDot} ${styles.dotInitial}`} />
            初始预约
          </span>
          <span className={styles.tlLegendItem}>
            <span className={`${styles.tlLegendDot} ${styles.dotAdded}`} />
            追加预约
          </span>
        </div>
      </div>
    </div>
  )
}

export default OptionsPage
