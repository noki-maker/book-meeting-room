import { Card, Tag, Button, Select, message } from 'antd'
import { DeleteOutlined, SwapOutlined, PlusOutlined } from '@ant-design/icons'
import type { Meeting } from '../types/meeting'
import styles from './MeetingCard.module.css'

interface MeetingCardProps {
  meeting: Meeting
  rooms: { id: string; name: string }[]
  onAssign: (meeting: Meeting, roomId: string) => void
  onRemove: (meeting: Meeting) => void
  onMove: (meeting: Meeting, targetRoomId: string) => void
}

function MeetingCard({ meeting, rooms, onAssign, onRemove, onMove }: MeetingCardProps) {
  const isConflict = meeting.isConflict
  const roomName = meeting.roomId
    ? rooms.find(r => r.id === meeting.roomId)?.name
    : null

  const cardClass = `${styles.card} ${isConflict ? styles.conflict : styles.normal}`

  const handleMove = (targetRoomId: string) => {
    onMove(meeting, targetRoomId)
    message.info(`已将 ${meeting.name} 移动到会议室 ${targetRoomId}`)
  }

  const handleRemove = () => {
    onRemove(meeting)
    message.success(`已将 ${meeting.name} 移出会议室`)
  }

  const handleAssign = (roomId: string) => {
    onAssign(meeting, roomId)
    message.success(`已将 ${meeting.name} 分配到会议室 ${roomId}`)
  }

  const formatTime = (timeStr: string) => {
    return timeStr.slice(11, 16) // "2021-01-01 08:00:00" → "08:00"
  }

  return (
    <Card
      className={cardClass}
      size="small"
      style={{ marginBottom: 8 }}
    >
      <div className={styles.header}>
        <span className={styles.meetingName}>{meeting.name}</span>
        {isConflict && <Tag color="error">冲突</Tag>}
        {meeting.roomId && (
          <Tag color="blue">{roomName || meeting.roomId}</Tag>
        )}
      </div>
      <div className={styles.time}>
        {formatTime(meeting.start)} - {formatTime(meeting.end)}
      </div>
      <div className={styles.actions}>
        {!meeting.roomId && (
          <Select
            size="small"
            placeholder="分配"
            style={{ width: 90 }}
            options={rooms.map(r => ({ label: r.name, value: r.id }))}
            onChange={handleAssign}
          />
        )}
        {meeting.roomId && (
          <>
            <Button
              size="small"
              icon={<DeleteOutlined />}
              danger
              onClick={handleRemove}
            >
              移出
            </Button>
            <Select
              size="small"
              placeholder="移动"
              style={{ width: 90 }}
              options={rooms
                .filter(r => r.id !== meeting.roomId)
                .map(r => ({ label: r.name, value: r.id }))}
              onChange={handleMove}
            />
          </>
        )}
      </div>
    </Card>
  )
}

export default MeetingCard
