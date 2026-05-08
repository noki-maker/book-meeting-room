import { describe, it, expect, beforeEach } from 'vitest'
import { resetMeetings, assignAllToRoomInOrder, removeMeetingFromRoom, moveMeeting } from './test-utils'
import meetings from '../../public/data/three-cross.json'

describe('handleRoomChange 1 A 2 A 3 A', () => {
    beforeEach(() => {
        resetMeetings(meetings)
        assignAllToRoomInOrder(meetings, 'A', 0, 1, 2)
    })

    it('1 A 2 A 3 A => 2 x 3 x', () => {
        expect(meetings[0].isConflict).toBe(false)
        expect(meetings[1].isConflict).toBe(true)
        expect(meetings[2].isConflict).toBe(true)
    })

    it('1 A 2 A 3 A -> 1 null => 2 x', () => {
        removeMeetingFromRoom(meetings[0])
        expect(meetings[0].isConflict).toBe(false)
        expect(meetings[1].isConflict).toBe(true)
        expect(meetings[2].isConflict).toBe(false)
    })

    it('1 A 2 A 3 A -> 2 null =>', () => {
        removeMeetingFromRoom(meetings[1])
        expect(meetings[0].isConflict).toBe(false)
        expect(meetings[1].isConflict).toBe(false)
        expect(meetings[2].isConflict).toBe(false)
    })

    it('1 A 2 A 3 A -> 3 null => 2 x', () => {
        removeMeetingFromRoom(meetings[2])
        expect(meetings[0].isConflict).toBe(false)
        expect(meetings[1].isConflict).toBe(true)
        expect(meetings[2].isConflict).toBe(false)
    })

    it('1 A 2 A 3 A -> 1 B => 2 x', () => {
        moveMeeting(meetings[0], 'B')
        expect(meetings[0].isConflict).toBe(false)
        expect(meetings[1].isConflict).toBe(true)
        expect(meetings[2].isConflict).toBe(false)
    })

    it('1 A 2 A 3 A -> 2 B =>', () => {
        moveMeeting(meetings[1], 'B')
        expect(meetings[0].isConflict).toBe(false)
        expect(meetings[1].isConflict).toBe(false)
        expect(meetings[2].isConflict).toBe(false)
    })

    it('1 A 2 A 3 A -> 3 B => 2 x', () => {
        moveMeeting(meetings[2], 'B')
        expect(meetings[0].isConflict).toBe(false)
        expect(meetings[1].isConflict).toBe(true)
        expect(meetings[2].isConflict).toBe(false)
    })
})

describe('handleRoomChange 2 A 1 A 3 A', () => {
    beforeEach(() => {
        resetMeetings(meetings)
        assignAllToRoomInOrder(meetings, 'A', 1, 0, 2)
    })

    it('2 A 1 A 3 A => 1 x 3 x', () => {
        expect(meetings[0].isConflict).toBe(true)
        expect(meetings[1].isConflict).toBe(false)
        expect(meetings[2].isConflict).toBe(true)
    })

    it('2 A 1 A 3 A -> 1 null => 1 x', () => {
        removeMeetingFromRoom(meetings[0])
        expect(meetings[0].isConflict).toBe(false)
        expect(meetings[1].isConflict).toBe(false)
        expect(meetings[2].isConflict).toBe(true)
    })

    it('2 A 1 A 3 A -> 2 null =>', () => {
        removeMeetingFromRoom(meetings[1])
        expect(meetings[0].isConflict).toBe(false)
        expect(meetings[1].isConflict).toBe(false)
        expect(meetings[2].isConflict).toBe(false)
    })

    it('2 A 1 A 3 A -> 3 null => 1 x', () => {
        removeMeetingFromRoom(meetings[2])
        expect(meetings[0].isConflict).toBe(true)
        expect(meetings[1].isConflict).toBe(false)
        expect(meetings[2].isConflict).toBe(false)
    })

    it('2 A 1 A 3 A -> 1 B => 2 x', () => {
        moveMeeting(meetings[0], 'B')
        expect(meetings[0].isConflict).toBe(false)
        expect(meetings[1].isConflict).toBe(false)
        expect(meetings[2].isConflict).toBe(true)
    })

    it('2 A 1 A 3 A -> 2 B =>', () => {
        moveMeeting(meetings[1], 'B')
        expect(meetings[0].isConflict).toBe(false)
        expect(meetings[1].isConflict).toBe(false)
        expect(meetings[2].isConflict).toBe(false)
    })

    it('2 A 1 A 3 A -> 3 B => 1 x', () => {
        moveMeeting(meetings[2], 'B')
        expect(meetings[0].isConflict).toBe(true)
        expect(meetings[1].isConflict).toBe(false)
        expect(meetings[2].isConflict).toBe(false)
    })
})
