import { useApp, formatRupiah, formatTanggal, getStatusStok } from "../context/AppContext";
import { Package, AlertTriangle, TrendingUp, RefreshCw, ArrowRight } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { cn } from "./ui/utils";

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-start gap-3 shadow-sm">
      <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", color)}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-slate-500">{label}</p>
        <p className="text-2xl font-semibold text-slate-900 mt-0.5">{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const ABC_COLORS: Record<string, string> = { A: "#16a34a", B: "#2563eb", C: "#94a3b8" };
const ABC_BG: Record<string, string> = { A: "bg-green-100 text-green-700", B: "bg-blue-100 text-blue-700", C: "bg-slate-100 text-slate-600" };

export function Dashboard() {
  const { barang, penjualan, navigate } = useApp();

  const totalBarang = barang.length;
  const stokMenipis = barang.filter(b => getStatusStok(b) !== "Normal").length;
  const kategoriA = barang.filter(b => b.kategoriABC === "A").length;
  const perluRestock = barang.filter(b => b.stok <= b.stokMinimum).length;

  const abcDistribusi = [
    { name: "Kategori A", value: barang.filter(b => b.kategoriABC === "A").length },
    { name: "Kategori B", value: barang.filter(b => b.kategoriABC === "B").length },
    { name: "Kategori C", value: barang.filter(b => b.kategoriABC === "C").length },
  ].filter(d => d.value > 0);

  const stokData = barang
    .sort((a, b) => a.stok - b.stok)
    .slice(0, 8)
    .map(b => ({ nama: b.nama.split(" ").slice(0, 2).join(" "), stok: b.stok, min: b.stokMinimum }));

  const restockList = barang
    .filter(b => b.stok <= b.stokMinimum)
    .sort((a, b) => {
      const pri = { A: 0, B: 1, C: 2 };
      return pri[a.kategoriABC] - pri[b.kategoriABC];
    });

  const recentActivity = [...penjualan]
    .sort((a, b) => b.tanggal.localeCompare(a.tanggal))
    .slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={Package} label="Total Barang" value={totalBarang} sub="jenis produk" color="bg-slate-100 text-slate-600" />
        <StatCard icon={AlertTriangle} label="Stok Menipis" value={stokMenipis} sub="perlu perhatian" color="bg-amber-100 text-amber-600" />
        <StatCard icon={TrendingUp} label="Kategori A" value={kategoriA} sub="prioritas utama" color="bg-green-100 text-green-600" />
        <StatCard icon={RefreshCw} label="Perlu Restock" value={perluRestock} sub="segera dipesan" color="bg-red-100 text-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Restock Recommendations */}
        <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Rekomendasi Restock</h3>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">{restockList.length} item</span>
          </div>
          <div className="divide-y divide-slate-50">
            {restockList.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-slate-400">Semua stok aman</div>
            ) : (
              restockList.map(b => (
                <div key={b.id} className="px-4 py-3 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{b.nama}</p>
                    <p className="text-xs text-slate-400">Stok: {b.stok} / Min: {b.stokMinimum} {b.satuan}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", ABC_BG[b.kategoriABC])}>
                      {b.kategoriABC}
                    </span>
                    <button
                      onClick={() => navigate("detail", b.id)}
                      className="text-slate-400 hover:text-green-600 transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Stock chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Ringkasan Stok (Terendah)</h3>
          </div>
          <div className="px-2 py-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stokData} margin={{ top: 0, right: 8, left: -20, bottom: 0 }}>
                <XAxis dataKey="nama" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                  formatter={(v, name) => [v, name === "stok" ? "Stok" : "Min Stok"]}
                />
                <Bar dataKey="stok" fill="#16a34a" radius={[4, 4, 0, 0]} maxBarSize={32} name="stok" />
                <Bar dataKey="min" fill="#fca5a5" radius={[4, 4, 0, 0]} maxBarSize={32} name="min" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 justify-center mt-1">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-green-600" /><span className="text-xs text-slate-500">Stok Saat Ini</span></div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-300" /><span className="text-xs text-slate-500">Stok Minimum</span></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* ABC Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Distribusi Kategori ABC</h3>
          </div>
          <div className="px-4 py-4 flex flex-col items-center">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie data={abcDistribusi} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={2}>
                  {abcDistribusi.map((entry, i) => (
                    <Cell key={i} fill={Object.values(ABC_COLORS)[i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-1">
              {abcDistribusi.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm" style={{ background: Object.values(ABC_COLORS)[i] }} />
                  <span className="text-xs text-slate-600">{d.name.replace("Kategori ", "")} ({d.value})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Aktivitas Penjualan Terbaru</h3>
            <button onClick={() => navigate("penjualan")} className="text-xs text-green-600 hover:underline">Lihat semua</button>
          </div>
          <div className="divide-y divide-slate-50">
            {recentActivity.map(j => {
              const b = barang.find(x => x.id === j.barangId);
              return (
                <div key={j.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{b?.nama ?? j.barangId}</p>
                    <p className="text-xs text-slate-400">{formatTanggal(j.tanggal)} · {j.jumlah} {b?.satuan ?? "pcs"}</p>
                  </div>
                  <p className="text-sm font-semibold text-green-700 shrink-0">
                    {formatRupiah(j.jumlah * j.harga)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
