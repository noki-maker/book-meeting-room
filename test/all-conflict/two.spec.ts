import { describe, it, expect, beforeEach } from 'vitest'
import { resetMeetings, assignToRoom, removeMeetingFromRoom, moveMeeting } from './test-utils'
import meetings from '../../public/data/two.json'

describe('两个会议冲突检测 - 冲突均标红', () => {
    beforeEach(() => {
        resetMeetings(meetings)
        assignToRoom(meetings[0], 'A')
        assignToRoom(meetings[1], 'A')
    })

    it('1 A 2 A => 1 x 2 x', () => {
        expect(meetings[0].isConflict).toBe(true)
        expect(meetings[1].isConflict).toBe(true)
    })

    it('1 A 2 A -> 1 null =>', () => {
        removeMeetingFromRoom(meetings[0])
        expect(meetings[0].isConflict).toBe(false)
        expect(meetings[1].isConflict).toBe(false)
    })

    it('1 A 2 A -> 1 B =>', () => {
        moveMeeting(meetings[0], 'B')
        expect(meetings[0].isConflict).toBe(false)
        expect(meetings[1].isConflict).toBe(false)
    })

    it('1 A 2 A -> 2 null =>', () => {
        removeMeetingFromRoom(meetings[1])
        expect(meetings[0].isConflict).toBe(false)
        expect(meetings[1].isConflict).toBe(false)
    })

    it('1 A 2 A -> 2 B =>', () => {
        moveMeeting(meetings[1], 'B')
        expect(meetings[0].isConflict).toBe(false)
        expect(meetings[1].isConflict).toBe(false)
    })
})
