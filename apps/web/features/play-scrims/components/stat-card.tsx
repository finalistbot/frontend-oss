export function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-card-foreground">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-black text-foreground">{value}</div>
    </div>
  );
}
