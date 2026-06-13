import { useState } from "react";
import { useApp, Pembelian, formatRupiah, formatTanggal } from "../context/AppContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Plus, Trash2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

type FormData = Omit<Pembelian, "id">;

const today = new Date().toISOString().split("T")[0];

const emptyForm: FormData = {
  tanggal: today, supplierId: "", barangId: "", jumlah: 1, harga: 0,
};

export function PagePembelian() {
  const { pembelian, barang, supplier, addPembelian, deletePembelian, getSupplierById, getBarangById } = useApp();
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const sortedPembelian = [...pembelian].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
  const total = pembelian.reduce((s, p) => s + p.jumlah * p.harga, 0);

  function openAdd() {
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function handleBarangChange(barangId: string) {
    const b = barang.find(x => x.id === barangId);
    setForm(f => ({ ...f, barangId, harga: b?.hargaBeli ?? 0 }));
  }

  function validate() {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.tanggal) e.tanggal = "Tanggal wajib diisi";
    if (!form.supplierId) e.supplierId = "Supplier wajib dipilih";
    if (!form.barangId) e.barangId = "Barang wajib dipilih";
    if (form.jumlah <= 0) e.jumlah = "Jumlah harus lebih dari 0";
    if (form.harga <= 0) e.harga = "Harga harus lebih dari 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    addPembelian(form);
    toast.success("Transaksi pembelian berhasil disimpan. Stok diperbarui.");
    setModalOpen(false);
  }

  function handleDelete() {
    if (!deleteId) return;
    deletePembelian(deleteId);
    toast.success("Transaksi dihapus. Stok diperbarui.");
    setDeleteId(null);
  }

  return (
    <div className="space-y-4">
      {/* Summary card */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500">Total Nilai Pembelian</p>
          <p className="text-xl font-semibold text-slate-900 mt-0.5">{formatRupiah(total)}</p>
          <p className="text-xs text-slate-400">{pembelian.length} transaksi</p>
        </div>
        <Button onClick={openAdd} className="bg-green-600 hover:bg-green-700 text-white h-9 gap-1.5">
          <Plus className="w-4 h-4" /> Input Pembelian
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {sortedPembelian.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
            <ShoppingCart className="w-10 h-10" />
            <p className="text-sm">Belum ada data pembelian</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs">Tanggal</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs">Supplier</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs">Barang</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500 text-xs">Jml</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500 text-xs hidden md:table-cell">Harga/pcs</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500 text-xs">Total</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-xs text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sortedPembelian.map(p => {
                  const s = getSupplierById(p.supplierId);
                  const b = getBarangById(p.barangId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatTanggal(p.tanggal)}</td>
                      <td className="px-4 py-3 text-slate-700">{s?.nama ?? p.supplierId}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{b?.nama ?? p.barangId}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{p.jumlah}</td>
                      <td className="px-4 py-3 text-right text-slate-600 hidden md:table-cell">{formatRupiah(p.harga)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatRupiah(p.jumlah * p.harga)}</td>
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

      {/* Add Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>Input Pembelian</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Tanggal</Label>
              <Input type="date" value={form.tanggal} onChange={e => setForm(f => ({ ...f, tanggal: e.target.value }))} className={errors.tanggal ? "border-red-400" : ""} />
              {errors.tanggal && <p className="text-xs text-red-500">{errors.tanggal}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label>Supplier</Label>
              <select
                value={form.supplierId}
                onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))}
                className={`h-9 rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.supplierId ? "border-red-400" : "border-slate-200"}`}
              >
                <option value="">-- Pilih Supplier --</option>
                {supplier.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
              </select>
              {errors.supplierId && <p className="text-xs text-red-500">{errors.supplierId}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label>Barang</Label>
              <select
                value={form.barangId}
                onChange={e => handleBarangChange(e.target.value)}
                className={`h-9 rounded-md border bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.barangId ? "border-red-400" : "border-slate-200"}`}
              >
                <option value="">-- Pilih Barang --</option>
                {barang.map(b => <option key={b.id} value={b.id}>{b.nama}</option>)}
              </select>
              {errors.barangId && <p className="text-xs text-red-500">{errors.barangId}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Jumlah</Label>
                <Input type="number" min={1} value={form.jumlah} onChange={e => setForm(f => ({ ...f, jumlah: Number(e.target.value) }))} className={errors.jumlah ? "border-red-400" : ""} />
                {errors.jumlah && <p className="text-xs text-red-500">{errors.jumlah}</p>}
              </div>
              <div className="grid gap-1.5">
                <Label>Harga Beli (Rp)</Label>
                <Input type="number" min={0} value={form.harga} onChange={e => setForm(f => ({ ...f, harga: Number(e.target.value) }))} className={errors.harga ? "border-red-400" : ""} />
                {errors.harga && <p className="text-xs text-red-500">{errors.harga}</p>}
              </div>
            </div>
            {form.jumlah > 0 && form.harga > 0 && (
              <div className="bg-green-50 rounded-lg px-3 py-2 flex items-center justify-between">
                <span className="text-sm text-green-700">Total Pembelian</span>
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
            <AlertDialogDescription>Stok akan dikurangi sesuai transaksi yang dihapus.</AlertDialogDescription>
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
