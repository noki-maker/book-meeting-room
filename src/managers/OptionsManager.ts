import type { Meeting, IMeetingManager, Room, Scschedule } from '../types/meeting'

/**
 * 深拷贝会议室数据，避免操作时污染原始导入的数据
 */
function deepCloneRooms(rooms: Record<string, Room[]>): Record<string, Room[]> {
  const result: Record<string, Room[]> = {}
  for (const [date, roomList] of Object.entries(rooms)) {
    result[date] = roomList.map(room => ({
      ...room,
      scschedules: room.scschedules.map(s => ({ ...s })),
    }))
  }
  return result
}

/**
 * 基于 scschedules 的会议室预约功能：
 *
 * - 会议室初始 scschedules（如 room.json 中的已有预约）完整保留，严禁暴力量置
 * - 会议选入会议室时，其时间段安全追加（append）到该会议室的 scschedules 中
 * - 会议移出时，仅移除本管理器曾添加的日程，不动初始数据
 * - 会议室可选性严格基于 scschedules 的全部已占用时间段判断
 * - 不含任何 isConflict 标记或冲突检测逻辑
 */
class OptionsManager implements IMeetingManager {
  /** 初始数据的洁净副本，用于 clear() 恢复 */
  private pristineRooms: Record<string, Room[]> = {}
  /** 运行时操作的真实数据（深拷贝，不会污染原始导入） */
  private roomsData: Record<string, Room[]> = {}

  setRoomsData(rooms: Record<string, Room[]>): void {
    this.pristineRooms = deepCloneRooms(rooms)
    this.roomsData = deepCloneRooms(rooms)
  }

  /**
   * 重置 roomsData 到初始状态。
   * 永远不执行 `scschedules = []`，而是通过深拷贝初始副本恢复，
   * 确保初始预约数据完整保留。
   */
  clear(): void {
    this.roomsData = deepCloneRooms(this.pristineRooms)
  }

  /** 获取指定日期、指定会议室的预约时间段列表 */
  getRoomSchedules(date: string, roomId: string): Scschedule[] {
    const dateRooms = this.roomsData[date]
    if (!dateRooms) return []
    const room = dateRooms.find(r => r.id === roomId)
    return room ? room.scschedules : []
  }

  /** IMeetingManager 接口兼容存根（本管理器不维护 meetingsMap） */
  getRoomMeetings(_date: string, _roomId: string): Meeting[] {
    return []
  }

  private findRoom(date: string, roomId: string): Room | undefined {
    const dateRooms = this.roomsData[date]
    if (!dateRooms) return undefined
    return dateRooms.find(r => r.id === roomId)
  }

  /**
   * 将短格式时间 "HH:mm" 或 "HH:mm:ss" 补全为 "YYYY-MM-DD HH:mm:ss"，
   * 以支持与 full datetime 格式的统一字典序比较。
   */
  private normalizeTime(time: string, date: string): string {
    if (time.includes('-')) return time
    const parts = time.split(':')
    if (parts.length === 2) return `${date} ${time}:00`
    return `${date} ${time}`
  }

  /**
   * 判断会议能否选入指定会议室。
   * 严格基于 scschedules 中所有已占用时间段判断是否有时间重叠。
   */
  canSelectRoom(meeting: Meeting, roomId: string): boolean {
    const schedules = this.getRoomSchedules(meeting.date, roomId)
    return !schedules.some(s => {
      const sStart = this.normalizeTime(s.start, meeting.date)
      const sEnd = this.normalizeTime(s.end, meeting.date)
      return sStart < meeting.end && meeting.start < sEnd
    })
  }

  /** 将会议的时间段追加（append）到指定会议室的 scschedules */
  private addSchedule(meeting: Meeting, roomId: string): void {
    const room = this.findRoom(meeting.date, roomId)
    if (!room) return
    const scheduleId = String(meeting.id)
    const exists = room.scschedules.some(s => s.meetingId === scheduleId)
    if (!exists) {
      room.scschedules.push({
        start: meeting.start,
        end: meeting.end,
        meetingId: scheduleId,
      })
    }
  }

  /** 移除本管理器曾为会议添加的 scschedules 条目（不动初始数据） */
  private removeSchedule(meeting: Meeting, roomId: string): void {
    const room = this.findRoom(meeting.date, roomId)
    if (!room) return
    const scheduleId = String(meeting.id)
    const index = room.scschedules.findIndex(s => s.meetingId === scheduleId)
    if (index !== -1) {
      room.scschedules.splice(index, 1)
    }
  }

  handleRoomChange(meeting: Meeting): void {
    const { prevRoomId, roomId } = meeting
    if (prevRoomId) {
      this.removeSchedule(meeting, prevRoomId)
    }
    if (roomId) {
      this.addSchedule(meeting, roomId)
    }
  }
}

export default OptionsManager
