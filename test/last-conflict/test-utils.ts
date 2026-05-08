import LastConflictManager from '../../src/managers/LastConflictManager'
import type { Meeting } from '../../src/types/meeting'

const manager = new LastConflictManager()

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

export function assignAllToRoomInOrder(meetings: Meeting[], roomId: string, ...indices: number[]): void {
    indices.forEach(i => {
        meetings[i].roomId = roomId
        manager.handleRoomChange(meetings[i])
    })
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
