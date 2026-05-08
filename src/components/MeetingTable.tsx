import { Table, Select, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { Meeting } from '../types/meeting'
import styles from './MeetingTable.module.css'

interface Room {
  id: string
  name: string
}

interface MeetingTableProps {
  meetings: Meeting[]
  rooms: Room[]
  onAssign: (meeting: Meeting, roomId: string) => void
  onRemove: (meeting: Meeting) => void
}

function MeetingTable({
  meetings,
  rooms,
  onAssign,
  onRemove,
}: MeetingTableProps) {
  const formatTime = (timeStr: string) => timeStr.slice(11, 16)

  const columns: ColumnsType<Meeting> = [
    {
      title: '会议',
      dataIndex: 'name',
      key: 'meeting',
      width: 120,
    },
    {
      title: '时间',
      key: 'time',
      width: 130,
      render: (_, record) => (
        <span className={styles.time}>
          {formatTime(record.start)} - {formatTime(record.end)}
        </span>
      ),
    },
    {
      title: '分配',
      key: 'room',
      width: 140,
      render: (_, record) => (
        <Select
          value={record.roomId}
          placeholder="—"
          size="small"
          style={{ width: 120 }}
          allowClear
          onChange={(value) => {
            if (value) {
              onAssign(record, value)
            } else {
              onRemove(record)
            }
          }}
          options={rooms.map(r => ({
            label: r.name,
            value: r.id,
          }))}
        />
      ),
    },
    {
      title: '状态',
      key: 'status',
      width: 80,
      align: 'center' as const,
      render: (_, record) => {
        if (record.isConflict) {
          return <Tag color="red" style={{ margin: 0 }}>冲突</Tag>
        }
        if (record.roomId) {
          const room = rooms.find(r => r.id === record.roomId)
          return <span className={styles.assigned}>{room?.name}</span>
        }
        return <span className={styles.empty}>—</span>
      },
    },
  ]

  return (
    <div className={styles.wrapper}>
      <Table<Meeting>
        columns={columns}
        dataSource={meetings}
        rowKey="id"
        size="small"
        pagination={false}
        rowClassName={(record) =>
          record.isConflict ? styles.conflict : ''
        }
        className={styles.table}
      />
    </div>
  )
}

export default MeetingTable
