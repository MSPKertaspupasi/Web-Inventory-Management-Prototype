import { useApp, formatRupiah, KategoriABC } from "../context/AppContext";
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  ReferenceLine, Cell
} from "recharts";
import { cn } from "./ui/utils";
import { TrendingUp, AlertCircle, Eye, Activity } from "lucide-react";

const ABC_BG: Record<KategoriABC, string> = {
  A: "bg-green-100 text-green-700 border border-green-200",
  B: "bg-blue-100 text-blue-700 border border-blue-200",
  C: "bg-slate-100 text-slate-600 border border-slate-200",
};

const ABC_COLOR: Record<KategoriABC, string> = {
  A: "#16a34a",
  B: "#2563eb",
  C: "#94a3b8",
};

const REKOMENDASI: Record<KategoriABC, { label: string; desc: string; icon: React.ElementType; color: string }> = {
  A: { label: "Restock Segera", desc: "Barang prioritas utama. Pastikan stok selalu tersedia.", icon: AlertCircle, color: "text-green-600 bg-green-50 border-green-200" },
  B: { label: "Pantau Rutin", desc: "Barang penting. Periksa stok secara berkala setiap minggu.", icon: Eye, color: "text-blue-600 bg-blue-50 border-blue-200" },
  C: { label: "Prioritas Rendah", desc: "Barang dengan kontribusi kecil. Restock sesuai kebutuhan.", icon: Activity, color: "text-slate-600 bg-slate-50 border-slate-200" },
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-md p-3 text-xs min-w-[160px]">
      <p className="font-semibold text-slate-800 mb-1.5">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex justify-between gap-4">
          <span className="text-slate-500">{p.name}</span>
          <span className="font-medium" style={{ color: p.color }}>
            {p.name === "Kumulatif %" ? `${p.value.toFixed(1)}%` : formatRupiah(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export function PageAnalisaABC() {
  const { getAbcAnalysis, navigate } = useApp();
  const data = getAbcAnalysis();

  const chartData = data.map(d => ({
    nama: d.namaBarang.split(" ").slice(0, 2).join(" "),
    namaFull: d.namaBarang,
    nilai: d.totalNilai,
    kumulatif: parseFloat(d.kumulatif.toFixed(1)),
    kategori: d.kategori,
  }));

  const totalNilai = data.reduce((s, d) => s + d.totalNilai, 0);
  const countA = data.filter(d => d.kategori === "A").length;
  const countB = data.filter(d => d.kategori === "B").length;
  const countC = data.filter(d => d.kategori === "C").length;
  const nilaiA = data.filter(d => d.kategori === "A").reduce((s, d) => s + d.totalNilai, 0);
  const nilaiB = data.filter(d => d.kategori === "B").reduce((s, d) => s + d.totalNilai, 0);
  const nilaiC = data.filter(d => d.kategori === "C").reduce((s, d) => s + d.totalNilai, 0);

  return (
    <div className="space-y-5">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {(["A", "B", "C"] as KategoriABC[]).map(k => {
          const counts = { A: countA, B: countB, C: countC };
          const values = { A: nilaiA, B: nilaiB, C: nilaiC };
          const pcts = { A: "0-80%", B: "80-95%", C: "95-100%" };
          return (
            <div key={k} className={cn("rounded-xl border p-4 shadow-sm", k === "A" ? "bg-green-50 border-green-200" : k === "B" ? "bg-blue-50 border-blue-200" : "bg-slate-50 border-slate-200")}>
              <div className="flex items-center justify-between mb-2">
                <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", ABC_BG[k])}>
                  Kategori {k}
                </span>
                <span className="text-xs text-slate-400">{pcts[k]}</span>
              </div>
              <p className="text-2xl font-bold" style={{ color: ABC_COLOR[k] }}>{counts[k]}</p>
              <p className="text-xs text-slate-500 mt-0.5">barang</p>
              <p className="text-xs font-medium text-slate-700 mt-1.5">{formatRupiah(values[k])}</p>
              <p className="text-xs text-slate-400">({totalNilai > 0 ? ((values[k] / totalNilai) * 100).toFixed(1) : 0}% total)</p>
            </div>
          );
        })}
      </div>

      {/* Pareto Chart */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
        <div className="px-4 py-3 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Diagram Pareto — Distribusi ABC</h3>
          <p className="text-xs text-slate-400 mt-0.5">Nilai penjualan per barang dan persentase kumulatif</p>
        </div>
        <div className="px-2 pt-4 pb-2">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="nama"
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                angle={-30}
                textAnchor="end"
                height={48}
              />
              <YAxis
                yAxisId="left"
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `${(v / 1000000).toFixed(0)}jt`}
                width={40}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tick={{ fontSize: 10, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={v => `${v}%`}
                domain={[0, 100]}
                width={36}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
                formatter={v => <span className="text-slate-600">{v}</span>}
              />
              <Bar
                yAxisId="left"
                dataKey="nilai"
                name="Nilai Penjualan"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
                fill="#16a34a"
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={ABC_COLOR[entry.kategori as KategoriABC]} />
                ))}
              </Bar>
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="kumulatif"
                name="Kumulatif %"
                stroke="#f59e0b"
                strokeWidth={2}
                dot={{ r: 3, fill: "#f59e0b" }}
              />
              <ReferenceLine yAxisId="right" y={80} stroke="#16a34a" strokeDasharray="4 4" label={{ value: "80%", position: "right", fontSize: 10, fill: "#16a34a" }} />
              <ReferenceLine yAxisId="right" y={95} stroke="#2563eb" strokeDasharray="4 4" label={{ value: "95%", position: "right", fontSize: 10, fill: "#2563eb" }} />
            </ComposedChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 justify-center mt-1 pb-1">
            {(["A", "B", "C"] as KategoriABC[]).map(k => (
              <div key={k} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ background: ABC_COLOR[k] }} />
                <span className="text-xs text-slate-500">Kategori {k}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-0.5 bg-amber-400" />
              <span className="text-xs text-slate-500">Kumulatif %</span>
            </div>
          </div>
        </div>
      </div>

      {/* Ranking table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Ranking Barang</h3>
            <p className="text-xs text-slate-400">Berdasarkan total nilai penjualan</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60">
                <th className="text-center px-3 py-2.5 font-medium text-slate-500 text-xs w-10">#</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs">Nama Barang</th>
                <th className="text-right px-4 py-2.5 font-medium text-slate-500 text-xs">Nilai Penjualan</th>
                <th className="text-right px-4 py-2.5 font-medium text-slate-500 text-xs hidden md:table-cell">% Nilai</th>
                <th className="text-right px-4 py-2.5 font-medium text-slate-500 text-xs hidden md:table-cell">% Kumulatif</th>
                <th className="text-center px-4 py-2.5 font-medium text-slate-500 text-xs">Kat.</th>
                <th className="text-left px-4 py-2.5 font-medium text-slate-500 text-xs hidden lg:table-cell">Rekomendasi</th>
                <th className="px-3 py-2.5 font-medium text-slate-500 text-xs text-right">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.map(d => {
                const rek = REKOMENDASI[d.kategori];
                return (
                  <tr key={d.barangId} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-3 py-3 text-center text-slate-400 text-xs font-medium">{d.rank}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{d.namaBarang}</td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatRupiah(d.totalNilai)}</td>
                    <td className="px-4 py-3 text-right text-slate-600 hidden md:table-cell">{d.persentase.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-right text-slate-600 hidden md:table-cell">{d.kumulatif.toFixed(1)}%</td>
                    <td className="px-4 py-3 text-center">
                      <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-semibold", ABC_BG[d.kategori])}>
                        {d.kategori}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={cn("inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border", rek.color)}>
                        <rek.icon className="w-3 h-3" />
                        {rek.label}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <button
                        onClick={() => navigate("detail", d.barangId)}
                        className="p-1.5 rounded-md text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                      >
                        <TrendingUp className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendation Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {(["A", "B", "C"] as KategoriABC[]).map(k => {
          const rek = REKOMENDASI[k];
          return (
            <div key={k} className={cn("rounded-xl border p-4 shadow-sm", rek.color)}>
              <div className="flex items-start gap-2.5">
                <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-white/60")}>
                  <rek.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-xs font-semibold px-1.5 py-0.5 rounded-full", ABC_BG[k])}>
                      {k}
                    </span>
                    <span className="text-sm font-semibold">{rek.label}</span>
                  </div>
                  <p className="text-xs text-slate-600">{rek.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
