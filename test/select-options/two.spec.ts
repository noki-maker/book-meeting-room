import { describe, it, expect, beforeEach } from 'vitest'
import { resetMeetings, assignToRoom, getManager, removeMeetingFromRoom, moveMeeting } from './test-utils'
import meetings from '../../public/data/two.json'
import type { Scschedule } from '../../src/types/meeting'

describe('基于 scschedules 的会议室预约（保留初始数据）', () => {
  beforeEach(() => {
    resetMeetings(meetings)
  })

  // 场景: 会议1(08:00-09:00) 受初始预约影响, 不可选 A, 可选 B(无预约) 和 C(14:00-16:00 不重叠)
  it('初始 scschedules => 1 不可选 A, 可选 B C', () => {
    // 会议1(08:00-09:00)与会议室A 初始预约(08:00-10:00) 重叠 → 不可选 A
    expect(getManager().canSelectRoom(meetings[0], 'A')).toBe(false)
    // 会议室B 无任何预约 → 可选
    expect(getManager().canSelectRoom(meetings[0], 'B')).toBe(true)
    // 会议室C 初始预约(14:00-16:00) 与会议1(08:00-09:00) 不重叠 → 可选
    expect(getManager().canSelectRoom(meetings[0], 'C')).toBe(true)
  })

  // 场景: 会议1(08:00-09:00) 选A, A 已有初始预约 08:00-10:00
  it('1 A => scschedules 追加, 2 不可选 A', () => {
    assignToRoom(meetings[0], 'A')

    // room.json 初始就有 1 条, 加上会议1 => 共 2 条
    const schedules = getManager().getRoomSchedules('2021-01-01', 'A')
    expect(schedules).toHaveLength(2)
    // 初始预约保留
    expect(schedules).toContainEqual(
      expect.objectContaining({ meetingId: '10' })
    )
    // 会议1 已追加
    expect(schedules).toContainEqual(
      expect.objectContaining({ meetingId: '1', start: '2021-01-01 08:00:00', end: '2021-01-01 09:00:00' })
    )

    // 会议2(08:30-10:00)与初始预约 08:00-10:00 重叠 → 不可选 A
    expect(getManager().canSelectRoom(meetings[1], 'A')).toBe(false)
    // B 无预约 → 可选
    expect(getManager().canSelectRoom(meetings[1], 'B')).toBe(true)
  })

  // 场景: 移除会议1后, 初始 scschedules 保留不动
  it('1 A -> 1 null => 初始 scschedules 保留, 2 因初始预约仍不可选 A', () => {
    assignToRoom(meetings[0], 'A')
    removeMeetingFromRoom(meetings[0])

    // 初始预约 (08:00-10:00) 仍在
    const schedules = getManager().getRoomSchedules('2021-01-01', 'A')
    expect(schedules).toHaveLength(1)
    expect(schedules[0]).toMatchObject({ meetingId: '10' })

    // 会议2(08:30-10:00)与初始预约 08:00-10:00 重叠 → 仍不可选 A
    expect(getManager().canSelectRoom(meetings[1], 'A')).toBe(false)
  })

  // 场景: 移出旧会议室后保留其初始数据, 新会议室追加
  it('1 A -> 1 B => A 保留初始, B 追加会议1', () => {
    assignToRoom(meetings[0], 'A')
    moveMeeting(meetings[0], 'B')

    // A 恢复到仅有初始预约
    const schedulesA = getManager().getRoomSchedules('2021-01-01', 'A')
    expect(schedulesA).toHaveLength(1)
    expect(schedulesA[0]).toMatchObject({ meetingId: '10' })

    // B 新追加会议1
    const schedulesB = getManager().getRoomSchedules('2021-01-01', 'B')
    expect(schedulesB).toHaveLength(1)
    expect(schedulesB[0]).toMatchObject({
      start: '2021-01-01 08:00:00',
      end: '2021-01-01 09:00:00',
      meetingId: '1',
    } satisfies Partial<Scschedule>)
  })

  // 场景: 不同会议室各自追加, 初始数据不受影响
  it('1 A 2 B => A 保留初始并追加, B 追加, 时间重叠不可互选', () => {
    assignToRoom(meetings[0], 'A')
    assignToRoom(meetings[1], 'B')

    expect(getManager().getRoomSchedules('2021-01-01', 'A')).toHaveLength(2)
    expect(getManager().getRoomSchedules('2021-01-01', 'B')).toHaveLength(1)

    // 两会议时间重叠 → 互不可选
    expect(getManager().canSelectRoom(meetings[0], 'B')).toBe(false)
    expect(getManager().canSelectRoom(meetings[1], 'A')).toBe(false)
  })

  // 场景: 多次追加到同一会议室 + 依赖初始预约的边界判断
  it('1 A 2 A => scschedules 3条, 边界时间判断正确', () => {
    assignToRoom(meetings[0], 'A')
    assignToRoom(meetings[1], 'A')

    // 初始(08:00-10:00) + 会议1(08:00-09:00) + 会议2(08:30-10:00)
    expect(getManager().getRoomSchedules('2021-01-01', 'A')).toHaveLength(3)

    // 09:00-10:00 与初始预约 08:00-10:00 重叠 → 不可选
    const meeting3 = { ...meetings[0], id: 3, start: '2021-01-01 09:00:00', end: '2021-01-01 10:00:00' }
    expect(getManager().canSelectRoom(meeting3, 'A')).toBe(false)

    // 10:00-11:00 与初始 08:00-10:00 刚好首尾相接 → 可选
    const meeting4 = { ...meetings[0], id: 4, start: '2021-01-01 10:00:00', end: '2021-01-01 11:00:00' }
    expect(getManager().canSelectRoom(meeting4, 'A')).toBe(true)
  })

  // 场景: clear() 仅清除本管理器添加的日程, 不碰初始数据
  it('clear() => 初始 scschedules 保留, 仅本管理器追加的日程被移除', () => {
    assignToRoom(meetings[0], 'A')
    assignToRoom(meetings[1], 'B')
    // A: 初始1 + 会议1; B: 会议2
    expect(getManager().getRoomSchedules('2021-01-01', 'A')).toHaveLength(2)
    expect(getManager().getRoomSchedules('2021-01-01', 'B')).toHaveLength(1)

    getManager().clear()

    // clear() 后 roomsData 被重置为初始状态，不含任何追加日程
    // A 保留初始 1 条 (08:00-10:00)
    expect(getManager().getRoomSchedules('2021-01-01', 'A')).toHaveLength(1)
    expect(getManager().getRoomSchedules('2021-01-01', 'A')[0]).toMatchObject({ meetingId: '10' })
    // B 无初始 → 0 条
    expect(getManager().getRoomSchedules('2021-01-01', 'B')).toHaveLength(0)
  })
})
