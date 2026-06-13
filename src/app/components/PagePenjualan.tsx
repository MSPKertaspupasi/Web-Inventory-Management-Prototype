import { useState } from "react";
import { useApp, Penjualan, formatRupiah, formatTanggal } from "../context/AppContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Plus, Trash2, TrendingUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type FormData = Omit<Penjualan, "id">;
const today = new Date().toISOString().split("T")[0];
const emptyForm: FormData = { tanggal: today, barangId: "", jumlah: 1, harga: 0 };

export function PagePenjualan() {
  const { penjualan, barang, addPenjualan, deletePenjualan, getBarangById } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const sortedPenjualan = [...penjualan].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  const total = penjualan.reduce((s, p) => s + p.jumlah * p.harga, 0);

  const selectedBarang = barang.find(b => b.id === form.barangId);
  const overStok = selectedBarang && form.jumlah > selectedBarang.stok;

  function openAdd() {
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function handleBarangChange(barangId: string) {
    const b = barang.find(x => x.id === barangId);
    setForm(f => ({ ...f, barangId, harga: b?.hargaJual ?? 0 }));
  }

  function validate() {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.tanggal) e.tanggal = "Tanggal wajib diisi";
    if (!form.barangId) e.barangId = "Barang wajib dipilih";
    if (form.jumlah <= 0) e.jumlah = "Jumlah harus lebih dari 0";
    if (form.harga <= 0) e.harga = "Harga harus lebih dari 0";
    if (selectedBarang && form.jumlah > selectedBarang.stok) {
      e.jumlah = `Stok tidak cukup. Tersedia: ${selectedBarang.stok} ${selectedBarang.satuan}`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    addPenjualan(form);
    toast.success("Transaksi penjualan berhasil disimpan. Stok diperbarui.");
    setModalOpen(false);
  }

  function handleDelete() {
    if (!deleteId) return;
    deletePenjualan(deleteId);
    toast.success("Transaksi dihapus. Stok dikembalikan.");
    setDeleteId(null);
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Total Nilai Penjualan</p>
          <p className="text-xl font-semibold text-green-700 mt-0.5">{formatRupiah(total)}</p>
          <p className="text-xs text-slate-400">{penjualan.length} transaksi</p>
        </div>
        <Button onClick={openAdd} className="bg-green-600 hover:bg-green-700 text-white h-9 gap-1.5">
          <Plus className="w-4 h-4" /> Input Penjualan
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {sortedPenjualan.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
            <TrendingUp className="w-10 h-10" />
            <p className="text-sm">Belum ada data penjualan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs">Tanggal</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs">Barang</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500 text-xs">Jml</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500 text-xs hidden md:table-cell">Harga/pcs</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500 text-xs">Total</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-xs text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sortedPenjualan.map(p => {
                  const b = getBarangById(p.barangId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatTanggal(p.tanggal)}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{b?.nama ?? p.barangId}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{p.jumlah}</td>
                      <td className="px-4 py-3 text-right text-slate-600 hidden md:table-cell">{formatRupiah(p.harga)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-700">{formatRupiah(p.jumlah * p.harga)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end">
                          <button
                            onClick={() => setDeleteId(p.id)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Input Penjualan</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Tanggal</Label>
              <Input type="date" value={form.tanggal} onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))} className={errors.tanggal ? "border-red-400" : ""} />
              {errors.tanggal && <p className="text-xs text-red-500">{errors.tanggal}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label>Barang</Label>
              <select
                value={form.barangId}
                onChange={e => handleBarangChange(e.target.value)}
                className={`h-9 rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.barangId ? "border-red-400" : "border-slate-200"}`}
              >
                <option value="">-- Pilih Barang --</option>
                {barang.map(b => (
                  <option key={b.id} value={b.id} disabled={b.stok === 0}>
                    {b.nama} {b.stok === 0 ? "(Habis)" : `(Stok: ${b.stok})`}
                  </option>
                ))}
              </select>
              {errors.barangId && <p className="text-xs text-red-500">{errors.barangId}</p>}
              {selectedBarang && (
                <p className="text-xs text-slate-500">Stok tersedia: {selectedBarang.stok} {selectedBarang.satuan}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Jumlah</Label>
                <Input
                  type="number" min={1}
                  value={form.jumlah}
                  onChange={e => setForm(f => ({ ...f, jumlah: Number(e.target.value) }))}
                  className={errors.jumlah ? "border-red-400" : ""}
                />
                {errors.jumlah && <p className="text-xs text-red-500">{errors.jumlah}</p>}
              </div>
              <div className="grid gap-1.5">
                <Label>Harga Jual (Rp)</Label>
                <Input
                  type="number" min={0}
                  value={form.harga}
                  onChange={e => setForm(f => ({ ...f, harga: Number(e.target.value) }))}
                  className={errors.harga ? "border-red-400" : ""}
                />
                {errors.harga && <p className="text-xs text-red-500">{errors.harga}</p>}
              </div>
            </div>
            {overStok && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-xs text-amber-700">Jumlah melebihi stok tersedia ({selectedBarang?.stok})</p>
              </div>
            )}
            {form.jumlah > 0 && form.harga > 0 && !overStok && (
              <div className="bg-green-50 rounded-lg px-3 py-2 flex items-center justify-between">
                <span className="text-sm text-green-700">Total Penjualan</span>
                <span className="font-semibold text-green-800">{formatRupiah(form.jumlah * form.harga)}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Transaksi?</AlertDialogTitle>
            <AlertDialogDescription>Stok akan dikembalikan sesuai jumlah transaksi yang dihapus.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
