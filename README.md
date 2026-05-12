## 预约会议室冲突的三种解决方案

### 方案一：冲突均标红（AllConflict）

**架构特点：**
- 采用 `meetingsMap: Record<date, Record<roomId, Meeting[]>>` 二维存储。
- 每次状态变更后，使用 O(n²) 两两比较检测所有冲突对。
- 冲突标记直接设置在 `Meeting.isConflict` 属性上。
- 移除/移动后完全重算当前会议室的全部冲突状态。

```typescript
removeMeetingFromRoom(meeting, roomId) {
  // 1. 从列表中移除该会议
  // 2. findAllConflicts() — O(n²) 扫描所有剩余会议对
  // 3. 更新所有会议的 isConflict
}

addMeetingToRoom(meeting, roomId) {
  // 1. push 添加到列表尾部
  // 2. findAllConflicts() — 同样的 O(n²) 扫描
  // 3. 更新所有会议的 isConflict
}
```

**优势：**
- 逻辑最直观：两两重叠即为冲突，无歧义。
- 实现简单：纯嵌套循环，无分支。
- 稳定可靠：每次变更都完整重算，无状态残留。

**局限性：**
- O(n²) 复杂度在大规模时性能下降。但对会议室场景通常 < 20 个会议，可忽略。
- 全量重算，当仅新增一个会议时做了不必要的重复工作。
- 只能回答"谁冲突"，无法回答"哪间会议室可用"。

### 方案二：后选标红（LastConflict）

**架构特点：**
- 同样使用 `meetingsMap` 二维存储。
- **关键技巧**：使用 `unshift` 向数组头部插入新会议，而非 `push`。
  - 数组头部 = 后选入的会议。
  - `Array.find()` 从左到右搜索，天然找到"最后选入"的会议。
- 冲突分组算法：先按时间排序，再按重叠关系分组。
- 每组内如果全部标红，将"第一顺位"的会议翻绿。

```typescript
addMeetingToRoom(meeting, roomId) {
  // 1. 检查与现有会议是否有冲突
  const hasConflict = roomMeetings.some(m => this.hasConflict(m, meeting))
  meeting.isConflict = hasConflict
  // 2. unshift 插入到头部——新会议后来居上
  roomMeetings.unshift(meeting)
}

resolveConflicts(roomMeetings) {
  // 1. 排序
  // 2. 按时间重叠分组
  // 3. 每组全红则找第一顺位翻绿
}
```

**优势：**
- 用户体验更好：先选的会议不会因后选而突然变红。
- 算法思路独特：用 `unshift` + `find` 组合天然实现"后选者标红"。
- 移除逻辑简洁：分组翻绿策略不超过 10 行核心逻辑。

**局限性：**
- 依赖添加顺序：同样的会议集，不同顺序导致不同结果。
- 逻辑理解成本高：需要理解"数组位置等价于添加顺序"的不变量。
- 同样无法回答"哪间会议室可用"。

### 方案三：控制可选（Options）

**架构特点：**
- 放弃 `meetingsMap`，采用 `roomsData: Record<date, Room[]>` 存储。
- 完全移除 `isConflict` 标记体系。
- 核心能力从"冲突检测"变为"可用性查询"。
- 引入双副本深拷贝机制确保数据安全。
- 新增 `canSelectRoom(meeting, roomId): boolean` 公共方法。

```typescript
class OptionsManager {
  private pristineRooms: Record<string, Room[]>  // 只读备份
  private roomsData: Record<string, Room[]>      // 工作副本

  setRoomsData(rooms)  // 初始化：深拷贝两份副本
  clear()              // roomsData = deepClone(pristineRooms)
  getRoomSchedules()   // 查询指定会议室的 scschedules
  canSelectRoom()      // 判断会议室是否可选
  handleRoomChange()   // 追加/移除 scschedules 条目
}
```

**优势：**
- 视角转换：从"冲突标记"到"可选空间"，回答不同问题。
- 数据安全：双副本 + 深拷贝，初始数据永不丢失。
- 支持外部数据：可加载已存在的预约数据（如从其他系统同步的日程）。
- 可组合性好：`canSelectRoom` 可被 UI 层灵活使用。

**局限性：**
- 不兼容 `IMeetingManager` 接口的 `isConflict` 体系。
- 不维护 `meetingsMap`，需要外部自行维护会议列表。
- 复杂度从"冲突算法"转移到"数据一致性保障"。

---

## 三种方案的横向对比

| 维度        | 冲突均标红           | 后选标红                  | 控制可选                          |
| --------- | --------------- | --------------------- | ----------------------------- |
| **核心问题**  | 谁冲突了？           | 谁该为冲突负责？              | 哪间会议室可用？                      |
| **数据模型**  | meetingsMap     | meetingsMap + unshift | roomsData + scschedules       |
| **状态维护**  | isConflict 布尔标记 | isConflict + 分组逻辑     | 无 isConflict，直接查询 scschedules |
| **算法复杂度** | O(n²) 全量重算      | O(n²) 分组重算            | O(m) 查表（m = 该会议室日程条数）         |
## 适用场景

- **冲突均标红**：适合**强约束**场景，如手术室排期、实验室设备预约，任何时间重叠都不允许。
- **后选标红**：适合**用户体验优先**场景，如办公会议室预约，先约的保持不变，后约的得到提示。
- **控制可选**：适合**已有固定日程 + 开放预约**场景，如酒店房间预订系统、共享办公空间管理。