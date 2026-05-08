import { Radio } from 'antd'
import type { DataKey } from './DataSelector'
import styles from './DataSelector.module.css'

export type DataKey = 'two' | 'three-full' | 'three-cross' | 'four'

const dataOptions: { key: DataKey; label: string }[] = [
  { key: 'two', label: '2 会议' },
  { key: 'three-full', label: '3 全重叠' },
  { key: 'three-cross', label: '3 交叉' },
  { key: 'four', label: '4 会议' },
]

interface DataSelectorProps {
  value: DataKey
  onChange: (key: DataKey) => void
}

function DataSelector({ value, onChange }: DataSelectorProps) {
  return (
    <div className={styles.container}>
      <span className={styles.label}>测试用例</span>
      <Radio.Group
        value={value}
        onChange={e => onChange(e.target.value)}
        optionType="button"
        buttonStyle="solid"
        size="small"
      >
        {dataOptions.map(opt => (
          <Radio.Button key={opt.key} value={opt.key}>
            {opt.label}
          </Radio.Button>
        ))}
      </Radio.Group>
    </div>
  )
}

export default DataSelector
export type { DataKey }
