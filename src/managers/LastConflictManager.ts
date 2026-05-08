import dayjs from 'dayjs'
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter'
import type { Meeting, IMeetingManager } from '../types/meeting'

dayjs.extend(isSameOrAfter)

/**
 * 后选标红 Manager
 * 同一冲突组中，只有后选入的会议才被标记为冲突，先选入的保持 isConflict = false
 */
class LastConflictManager implements IMeetingManager {
  private meetingsMap: Record<string, Record<string, Meeting[]>> = {}

  clear(): void {
    this.meetingsMap = {}
  }

  getRoomMeetings(date: string, roomId: string): Meeting[] {
    if (!this.meetingsMap[date]) this.meetingsMap[date] = {}
    if (!this.meetingsMap[date][roomId]) this.meetingsMap[date][roomId] = []
    return this.meetingsMap[date][roomId]
  }

  private sortMeetings(meetings: Meeting[]): Meeting[] {
    return meetings.map(m => ({ ...m })).sort((a, b) => {
      if (a.start === b.start)
        return dayjs(a.end).isBefore(dayjs(b.end)) ? -1 : 1
      return dayjs(a.start).isBefore(dayjs(b.start)) ? -1 : 1
    })
  }

  private groupMeetings(meetings: Meeting[]): Array<{ meetings: Meeting[]; end: string }> {
    const sorted = this.sortMeetings(meetings)
    const result: Array<{ meetings: Meeting[]; end: string }> = []
    let currentGroup: { meetings: Meeting[]; end: string } | null = null

    sorted.forEach(event => {
      if (!currentGroup || dayjs(event.start).isSameOrAfter(currentGroup.end)) {
        currentGroup = {
          meetings: [event],
          end: event.end,
        }
        result.push(currentGroup)
      } else if (dayjs(event.start).isBefore(currentGroup.end)) {
        currentGroup.meetings.push(event)
        if (dayjs(event.end).isAfter(currentGroup.end)) {
          currentGroup.end = event.end
        }
      }
    })

    return result
  }

  private hasConflict(m1: Meeting, m2: Meeting): boolean {
    return dayjs(m1.end).isAfter(dayjs(m2.start)) && dayjs(m2.start).isBefore(dayjs(m1.end))
  }

  private resolveConflicts(roomMeetings: Meeting[]): void {
    const groups = this.groupMeetings(roomMeetings)
    groups.forEach(group => {
      if (group.meetings.every(m => m.isConflict)) {
        const firstMeeting = roomMeetings.find(m =>
          group.meetings.map(g => g.id).includes(m.id)
        )
        if (firstMeeting) firstMeeting.isConflict = false
      }
    })
  }

  removeMeetingFromRoom(meeting: Meeting, roomId: string): void {
    const { date } = meeting
    const roomMeetings = this.getRoomMeetings(date, roomId)
    const index = roomMeetings.findIndex(m => m.id === meeting.id)
    if (index !== -1) roomMeetings.splice(index, 1)
    this.resolveConflicts(roomMeetings)
  }

  addMeetingToRoom(meeting: Meeting, roomId: string): void {
    const { date } = meeting
    const roomMeetings = this.getRoomMeetings(date, roomId)
    const hasConflictFlag = roomMeetings.some(m => this.hasConflict(m, meeting))
    meeting.isConflict = hasConflictFlag
    roomMeetings.unshift(meeting)
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

export default LastConflictManager
