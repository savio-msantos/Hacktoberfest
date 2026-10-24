import { Icon } from "../../components/Icon";
import type { Shift } from "../../types/climate";
const hours = Array.from(
  { length: 24 },
  (_, hour) => `${String(hour).padStart(2, "0")}:00`,
);
export function ShiftFields({
  value,
  onChange,
  prefix,
}: {
  value: Shift;
  onChange: (value: Shift) => void;
  prefix: string;
}) {
  return (
    <div className="time-fields">
      {(["inicio", "fim"] as const).map((key) => (
        <label key={key} htmlFor={`${prefix}-${key}`}>
          {key === "inicio" ? "Começo" : "Fim"}
          <span className="input-wrap">
            <Icon name="clock" />
            <select
              aria-label={key === "inicio" ? "Começo" : "Fim"}
              id={`${prefix}-${key}`}
              value={value[key]}
              onChange={(event) =>
                onChange({ ...value, [key]: event.target.value })
              }
            >
              {hours.map((hour) => (
                <option key={hour}>{hour}</option>
              ))}
            </select>
            <Icon name="down" />
          </span>
        </label>
      ))}
    </div>
  );
}
