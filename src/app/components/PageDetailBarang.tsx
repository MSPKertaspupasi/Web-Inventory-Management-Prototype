import { useApp, formatRupiah, formatTanggal, getStatusStok, KategoriABC } from "../context/AppContext";
import { Button } from "./ui/button";
import { ArrowLeft, Package, ShoppingCart, TrendingUp, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { cn } from "./ui/utils";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const ABC_BG: Record<KategoriABC, string> = {
  A: "bg-green-100 text-green-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-slate-100 text-slate-600",
};

const STATUS_BG: Record<string, string> = {
  Normal: "bg-green-100 text-green-700",
  Menipis: "bg-amber-100 text-amber-600",
  Habis: "bg-red-100 text-red-600",
};

export function PageDetailBarang() {
  const { selectedBarangId, barang, pembelian, penjualan, navigate, getAbcAnalysis } = useApp();
  const abcAnalysis = getAbcAnalysis();

  const b = barang.find(x => x.id === selectedBarangId);
  if (!b) {
    return (
      <div className="py-20 flex flex-col items-center gap-3 text-slate-400">
        <Package className="w-10 h-10" />
        <p>Barang tidak ditemukan</p>
        <Button variant="outline" onClick={() => navigate("barang")} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Kembali
        </Button>
      </div>
    );
  }

  const status = getStatusStok(b);
  const margin = b.hargaJual - b.hargaBeli;
  const marginPct = ((margin / b.hargaBeli) * 100).toFixed(1);

  const riwayatPembelian = pembelian
    .filter(p => p.barangId === b.id)
    .sort((a, c) => c.tanggal.localeCompare(a.tanggal));

  const riwayatPenjualan = penjualan
    .filter(p => p.barangId === b.id)
    .sort((a, c) => c.tanggal.localeCompare(a.tanggal));

  const totalTerjual = riwayatPenjualan.reduce((s, p) => s + p.jumlah, 0);
  const totalNilaiJual = riwayatPenjualan.reduce((s, p) => s + p.jumlah * p.harga, 0);
  const totalPembelian = riwayatPembelian.reduce((s, p) => s + p.jumlah * p.harga, 0);

  // Monthly sales chart
  const monthlyMap = new Map<string, number>();
  for (const p of riwayatPenjualan) {
    const month = p.tanggal.slice(0, 7);
    monthlyMap.set(month, (monthlyMap.get(month) ?? 0) + p.jumlah * p.harga);
  }
  const chartData = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, nilai]) => ({
      bulan: new Date(month + "-01").toLocaleDateString("id-ID", { month: "short", year: "2-digit" }),
      nilai,
    }));

  const abcItem = abcAnalysis.find(x => x.barangId === b.id);

  const REKOMENDASI_AKSI: Record<KategoriABC, { label: string; desc: string; color: string; icon: React.ElementType }> = {
    A: {
      label: "Restock Segera",
      desc: b.stok <= b.stokMinimum
        ? `Stok kritis! Segera lakukan pembelian ke supplier. Rekomendasikan minimal ${b.stokMinimum * 3} ${b.satuan}.`
        : `Barang prioritas A. Pantau stok dan pastikan tidak turun di bawah ${b.stokMinimum} ${b.satuan}.`,
      color: "bg-green-50 border-green-200 text-green-800",
      icon: RefreshCw,
    },
    B: {
      label: "Pantau Rutin",
      desc: `Barang kategori B. Lakukan restock jika stok mendekati ${b.stokMinimum} ${b.satuan}.`,
      color: "bg-blue-50 border-blue-200 text-blue-800",
      icon: AlertTriangle,
    },
    C: {
      label: "Prioritas Rendah",
      desc: `Barang kategori C dengan kontribusi penjualan rendah. Restock sesuai kebutuhan.`,
      color: "bg-slate-50 border-slate-200 text-slate-700",
      icon: CheckCircle,
    },
  };

  const aksi = REKOMENDASI_AKSI[b.kategoriABC];

  return (
    <div className="space-y-4">
      {/* Header */}
      {/* Header */}
      <div className="flex items-start gap-4">

        <button
          onClick={() => navigate("barang")}
          className="
            p-2
            rounded-lg
            hover:bg-white
            border
            border-transparent
            hover:border-slate-200
            transition-all
            shrink-0
          "
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>


        <div
          className="
            w-24
            h-24
            rounded-xl
            overflow-hidden
            border
            bg-slate-100
            shrink-0
          "
        >

          {b.foto ? (

            <img
              src={b.foto}
              alt={b.nama}
              className="
                w-full
                h-full
                object-cover
              "
            />

          ) : (

            <div
              className="
                w-full
                h-full
                flex
                items-center
                justify-center
                text-xs
                text-slate-400
              "
            >

              Tidak Ada Foto

            </div>

          )}

        </div>


        <div>

          <h2
            className="
              text-lg
              font-semibold
              text-slate-900
            "
          >

            {b.nama}

          </h2>


          <p
            className="
              text-xs
              text-slate-400
            "
          >

            ID: {b.id}

          </p>


          <div
            className="
              mt-2
              flex
              flex-col
              gap-1
            "
          >

            <span
              className="
                text-xs
                text-slate-500
              "
            >

              Barcode

            </span>


            <div
              className="
                px-3
                py-1
                rounded
                bg-slate-100
                text-xs
                font-mono
              "
            >

              {b.barcode || "-"}

            </div>

          </div>

        </div>

      </div>

      {/* Info cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs text-slate-500">Stok Saat Ini</p>
          <p className={cn("text-2xl font-bold mt-0.5", status !== "Normal" ? "text-amber-600" : "text-slate-900")}>
            {b.stok}
          </p>
          <p className="text-xs text-slate-400">{b.satuan}</p>
          <span className={cn("inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium", STATUS_BG[status])}>
            {status}
          </span>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs text-slate-500">Harga Jual</p>
          <p className="text-lg font-bold text-slate-900 mt-0.5">{formatRupiah(b.hargaJual)}</p>
          <p className="text-xs text-slate-400">Beli: {formatRupiah(b.hargaBeli)}</p>
          <p className="text-xs text-green-600 mt-0.5">Margin: {marginPct}%</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs text-slate-500">Total Terjual</p>
          <p className="text-2xl font-bold text-slate-900 mt-0.5">{totalTerjual}</p>
          <p className="text-xs text-slate-400">{b.satuan}</p>
          <p className="text-xs text-green-600 mt-0.5">{formatRupiah(totalNilaiJual)}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <p className="text-xs text-slate-500">Kategori ABC</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={cn("text-2xl font-bold", b.kategoriABC === "A" ? "text-green-600" : b.kategoriABC === "B" ? "text-blue-600" : "text-slate-500")}>
              {b.kategoriABC}
            </span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", ABC_BG[b.kategoriABC])}>
              Kategori {b.kategoriABC}
            </span>
          </div>
          {abcItem && (
            <p className="text-xs text-slate-400 mt-0.5">Kontribusi: {abcItem.persentase.toFixed(1)}%</p>
          )}
        </div>
      </div>

      {/* Recommendation */}
      <div className={cn("rounded-xl border p-4 shadow-sm flex items-start gap-3", aksi.color)}>
        <div className="w-9 h-9 rounded-lg bg-white/70 flex items-center justify-center shrink-0">
          <aksi.icon className="w-4 h-4" />
        </div>
        <div>
          <p className="text-sm font-semibold">{aksi.label}</p>
          <p className="text-xs mt-0.5 opacity-80">{aksi.desc}</p>
        </div>
        <div className="ml-auto shrink-0">
          <Button
            onClick={() => navigate("pembelian")}
            className="bg-green-600 hover:bg-green-700 text-white h-8 text-xs gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Order Beli
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Sales trend chart */}
        {chartData.length > 0 && (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="px-4 py-3 border-b border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Tren Penjualan</h3>
            </div>
            <div className="px-3 py-4">
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="bulan" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                    formatter={(v: number) => [formatRupiah(v), "Nilai Jual"]}
                  />
                  <Line type="monotone" dataKey="nilai" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Riwayat Penjualan */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Riwayat Penjualan</h3>
            <span className="text-xs text-slate-400">{riwayatPenjualan.length} transaksi</span>
          </div>
          {riwayatPenjualan.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">Belum ada penjualan</div>
          ) : (
            <div className="divide-y divide-slate-50 max-h-48 overflow-y-auto">
              {riwayatPenjualan.map(p => (
                <div key={p.id} className="px-4 py-2.5 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs text-slate-400">{formatTanggal(p.tanggal)}</p>
                    <p className="text-sm text-slate-700">{p.jumlah} {b.satuan} × {formatRupiah(p.harga)}</p>
                  </div>
                  <p className="text-sm font-semibold text-green-700">{formatRupiah(p.jumlah * p.harga)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Riwayat Pembelian */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Riwayat Pembelian</h3>
          <span className="text-xs text-slate-400">{riwayatPembelian.length} transaksi · {formatRupiah(totalPembelian)}</span>
        </div>
        {riwayatPembelian.length === 0 ? (
          <div className="py-8 text-center text-sm text-slate-400">Belum ada pembelian</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-50 bg-slate-50/40">
                  <th className="text-left px-4 py-2 font-medium text-slate-500 text-xs">Tanggal</th>
                  <th className="text-right px-4 py-2 font-medium text-slate-500 text-xs">Jumlah</th>
                  <th className="text-right px-4 py-2 font-medium text-slate-500 text-xs">Harga/pcs</th>
                  <th className="text-right px-4 py-2 font-medium text-slate-500 text-xs">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {riwayatPembelian.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-4 py-2.5 text-slate-600">{formatTanggal(p.tanggal)}</td>
                    <td className="px-4 py-2.5 text-right text-slate-700">{p.jumlah} {b.satuan}</td>
                    <td className="px-4 py-2.5 text-right text-slate-600">{formatRupiah(p.harga)}</td>
                    <td className="px-4 py-2.5 text-right font-medium text-slate-800">{formatRupiah(p.jumlah * p.harga)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
