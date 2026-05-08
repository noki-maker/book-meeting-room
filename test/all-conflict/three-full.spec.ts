import { describe, it, expect, beforeEach } from 'vitest'
import { resetMeetings, assignToRoom, removeMeetingFromRoom, moveMeeting } from './test-utils'
import meetings from '../../public/data/three-full.json'

describe('三个会议全重叠 - 冲突均标红', () => {
    beforeEach(() => {
        resetMeetings(meetings)
        assignToRoom(meetings[0], 'A')
        assignToRoom(meetings[1], 'A')
        assignToRoom(meetings[2], 'A')
    })

    it('1 A 2 A 3 A => 1 x 2 x 3 x', () => {
        expect(meetings[0].isConflict).toBe(true)
        expect(meetings[1].isConflict).toBe(true)
        expect(meetings[2].isConflict).toBe(true)
    })

    it('1 A 2 A 3 A -> 1 null => 2 x 3 x', () => {
        removeMeetingFromRoom(meetings[0])
        expect(meetings[0].isConflict).toBe(false)
        expect(meetings[1].isConflict).toBe(true)
        expect(meetings[2].isConflict).toBe(true)
    })

    it('1 A 2 A 3 A -> 2 null => 1 x 3 x', () => {
        removeMeetingFromRoom(meetings[1])
        expect(meetings[0].isConflict).toBe(true)
        expect(meetings[1].isConflict).toBe(false)
        expect(meetings[2].isConflict).toBe(true)
    })

    it('1 A 2 A 3 A -> 3 null => 1 x 2 x', () => {
        removeMeetingFromRoom(meetings[2])
        expect(meetings[0].isConflict).toBe(true)
        expect(meetings[1].isConflict).toBe(true)
        expect(meetings[2].isConflict).toBe(false)
    })

    it('1 A 2 A 3 A -> 1 B => 2 x 3 x', () => {
        moveMeeting(meetings[0], 'B')
        expect(meetings[0].isConflict).toBe(false)
        expect(meetings[1].isConflict).toBe(true)
        expect(meetings[2].isConflict).toBe(true)
    })

    it('1 A 2 A 3 A -> 2 B => 1 x 3 x', () => {
        moveMeeting(meetings[1], 'B')
        expect(meetings[0].isConflict).toBe(true)
        expect(meetings[1].isConflict).toBe(false)
        expect(meetings[2].isConflict).toBe(true)
    })

    it('1 A 2 A 3 A -> 3 B => 1 x 2 x', () => {
        moveMeeting(meetings[2], 'B')
        expect(meetings[0].isConflict).toBe(true)
        expect(meetings[1].isConflict).toBe(true)
        expect(meetings[2].isConflict).toBe(false)
    })
})
