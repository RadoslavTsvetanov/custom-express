import type { State } from "@custom-express/frontend-thingies/src/react/hooks/useStateAsObject"

export const Dropdown: React.FC<{ options: string[], current: State<string> }> = ({ current, options }) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    current.set(e.target.value)
  }

  return (
    <div>
      <select value={current.value} onChange={handleChange}>
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <p>Selected: {current.value}</p>
    </div>
  )
}

// -- OptionsSelector Component --

export const OptionsSelector: React.FC<{
  options: string[]
  current: React.ReactNode
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
}> = ({ current, options, onChange }) => {
  return (
    <div>
      <select value="" onChange={onChange}>
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {current}
    </div>
  )
}