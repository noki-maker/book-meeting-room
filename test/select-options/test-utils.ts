import OptionsManager from '../../src/managers/OptionsManager'
import type { Meeting, Room } from '../../src/types/meeting'
import rooms from '../../public/data/room.json'

const manager = new OptionsManager()
manager.setRoomsData(rooms as Record<string, Room[]>)

export function getManager(): OptionsManager {
  return manager
}

export function resetMeetings(meetings: Meeting[]): void {
    meetings.forEach(m => {
        m.isConflict = false
        m.prevRoomId = null
        m.roomId = null
    })
    manager.clear()
    manager.setRoomsData(rooms as Record<string, Room[]>)
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
