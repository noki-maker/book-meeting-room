export interface Meeting {
  id: number
  name: string
  start: string   // 格式: "2021-01-01 08:00:00"
  end: string     // 格式: "2021-01-01 09:00:00"
  date: string    // 格式: "2021-01-01"
  isConflict: boolean
  roomId: string | null
  prevRoomId?: string | null
}

export interface Scschedule {
  start: string
  end: string
  meetingId: string
}

export interface Room {
  id: string
  name: string
  scschedules: Scschedule[]
}

export interface IMeetingManager {
  clear(): void
  handleRoomChange(meeting: Meeting): void
  getRoomMeetings(date: string, roomId: string): Meeting[]
}
