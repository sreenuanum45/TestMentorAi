interface DayCount {
  day: string; // "yyyy-mm-dd"
  count: number;
}

const CHART_HEIGHT = 96;

export default function ActivityChart({ data }: { data: DayCount[] }) {
  const rawMax = Math.max(1, ...data.map((d) => d.count));
  const axisMax = Math.max(5, Math.ceil(rawMax / 5) * 5);
  const ticks = [axisMax, (axisMax * 2) / 3, axisMax / 3, 0];

  return (
    <div className="flex gap-2">
      <div
        className="flex flex-col justify-between text-xs text-neutral-400"
        style={{ height: CHART_HEIGHT }}
      >
        {ticks.map((t, i) => (
          <span key={i}>{Math.round(t)}</span>
        ))}
      </div>

      <div className="flex-1">
        <div className="relative flex items-end gap-1.5" style={{ height: CHART_HEIGHT }}>
          {ticks.map((t, i) => (
            <div
              key={i}
              className="absolute left-0 right-0 border-t border-dashed border-neutral-100 dark:border-neutral-800"
              style={{ bottom: `${(t / axisMax) * CHART_HEIGHT}px` }}
            />
          ))}
          {data.map((d) => {
            const heightPx = d.count > 0 ? Math.max(4, (d.count / axisMax) * CHART_HEIGHT) : 0;
            return (
              <div key={d.day} className="group relative z-10 flex-1">
                <div
                  className="mx-auto w-full rounded-t bg-blue-600/70 dark:bg-blue-500/70 transition-colors group-hover:bg-blue-600"
                  style={{ height: `${heightPx}px` }}
                />
                <div className="pointer-events-none absolute -top-8 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded bg-neutral-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 dark:bg-neutral-100 dark:text-neutral-900">
                  {d.count} · {d.day.slice(5)}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-1 flex gap-1.5 text-[10px] text-neutral-400">
          {data.map((d) => (
            <span key={d.day} className="flex-1 text-center">
              {new Date(`${d.day}T00:00:00Z`).toLocaleDateString(undefined, {
                weekday: "narrow",
                timeZone: "UTC",
              })}
            </span>
          ))}
        </div>
      </div>

      <table className="sr-only">
        <caption>Daily activity for the last {data.length} days</caption>
        <thead>
          <tr>
            <th>Date</th>
            <th>Messages sent</th>
          </tr>
        </thead>
        <tbody>
          {data.map((d) => (
            <tr key={d.day}>
              <td>{d.day}</td>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
