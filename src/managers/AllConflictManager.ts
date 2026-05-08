import dayjs from 'dayjs'
import type { Meeting, IMeetingManager } from '../types/meeting'

/**
 * 冲突均标红 Manager
 * 同一会议室中所有时间重叠的会议都标记为冲突（isConflict = true）
 */
class AllConflictManager implements IMeetingManager {
  private meetingsMap: Record<string, Record<string, Meeting[]>> = {}

  clear(): void {
    this.meetingsMap = {}
  }

  getRoomMeetings(date: string, roomId: string): Meeting[] {
    if (!this.meetingsMap[date]) this.meetingsMap[date] = {}
    if (!this.meetingsMap[date][roomId]) this.meetingsMap[date][roomId] = []
    return this.meetingsMap[date][roomId]
  }

  private hasConflict(m1: Meeting, m2: Meeting): boolean {
    return dayjs(m1.end).isAfter(dayjs(m2.start)) && dayjs(m2.end).isAfter(dayjs(m1.start))
  }

  private findAllConflicts(roomMeetings: Meeting[]): Set<number> {
    const conflictIds = new Set<number>()
    for (let i = 0; i < roomMeetings.length; i++) {
      for (let j = i + 1; j < roomMeetings.length; j++) {
        if (this.hasConflict(roomMeetings[i], roomMeetings[j])) {
          conflictIds.add(roomMeetings[i].id)
          conflictIds.add(roomMeetings[j].id)
        }
      }
    }
    return conflictIds
  }

  private updateConflictStatus(roomMeetings: Meeting[], conflictIds: Set<number>): void {
    roomMeetings.forEach(m => {
      m.isConflict = conflictIds.has(m.id)
    })
  }

  removeMeetingFromRoom(meeting: Meeting, roomId: string): void {
    const { date } = meeting
    const roomMeetings = this.getRoomMeetings(date, roomId)
    const index = roomMeetings.findIndex(m => m.id === meeting.id)
    if (index !== -1) roomMeetings.splice(index, 1)
    const conflictIds = this.findAllConflicts(roomMeetings)
    this.updateConflictStatus(roomMeetings, conflictIds)
  }

  addMeetingToRoom(meeting: Meeting, roomId: string): void {
    const { date } = meeting
    const roomMeetings = this.getRoomMeetings(date, roomId)
    roomMeetings.push(meeting)
    const conflictIds = this.findAllConflicts(roomMeetings)
    this.updateConflictStatus(roomMeetings, conflictIds)
  }

  handleRoomChange(meeting: Meeting): void {
    const { prevRoomId, roomId } = meeting
    if (prevRoomId) {
      this.removeMeetingFromRoom(meeting, prevRoomId)
    }
    if (roomId) {
      this.addMeetingToRoom(meeting, roomId)
    } else {
      meeting.isConflict = false
    }
  }
}

export default AllConflictManager
