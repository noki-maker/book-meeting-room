import { Card, Empty } from 'antd'
import type { Meeting } from '../types/meeting'
import MeetingCard from './MeetingCard'
import styles from './RoomGrid.module.css'

interface RoomGridProps {
  rooms: { id: string; name: string }[]
  meetingsMap: Record<string, Meeting[]>
  onAssign: (meeting: Meeting, roomId: string) => void
  onRemove: (meeting: Meeting) => void
  onMove: (meeting: Meeting, targetRoomId: string) => void
}

function RoomGrid({ rooms, meetingsMap, onAssign, onRemove, onMove }: RoomGridProps) {
  return (
    <div className={styles.grid}>
      {rooms.map(room => {
        const meetings = meetingsMap[room.id] || []
        return (
          <Card
            key={room.id}
            title={
              <span>
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#1677ff',
                    marginRight: 8,
                  }}
                />
                {room.name}
              </span>
            }
            size="small"
            className={styles.roomCard}
          >
            {meetings.length > 0 ? (
              meetings.map(m => (
                <MeetingCard
                  key={m.id}
                  meeting={m}
                  rooms={rooms}
                  onAssign={onAssign}
                  onRemove={onRemove}
                  onMove={onMove}
                />
              ))
            ) : (
              <Empty
                className={styles.empty}
                description="暂无会议，请分配会议到该会议室"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Card>
        )
      })}
    </div>
  )
}

export default RoomGrid
