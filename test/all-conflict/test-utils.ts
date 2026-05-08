import AllConflictManager from '../../src/managers/AllConflictManager'
import type { Meeting } from '../../src/types/meeting'

const manager = new AllConflictManager()

export function resetMeetings(meetings: Meeting[]): void {
    meetings.forEach(m => {
        m.isConflict = false
        m.prevRoomId = null
        m.roomId = null
    })
    manager.clear()
}

export function assignToRoom(meeting: Meeting, roomId: string): void {
    meeting.roomId = roomId
    manager.handleRoomChange(meeting)
}

export function removeMeetingFromRoom(meeting: Meeting): void {
    meeting.prevRoomId = meeting.roomId
    meeting.roomId = null
    manager.handleRoomChange(meeting)
}

export function moveMeeting(meeting: Meeting, newRoomId: string): void {
    meeting.prevRoomId = meeting.roomId
    meeting.roomId = newRoomId
    manager.handleRoomChange(meeting)
}
