import { useState } from "react";
import { useApp, Supplier } from "../context/AppContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Search, Plus, Pencil, Trash2, Truck } from "lucide-react";
import { toast } from "sonner";

type FormData = Omit<Supplier, "id">;
const emptyForm: FormData = { nama: "", telepon: "" };

export function PageSupplier() {
  const { supplier, addSupplier, updateSupplier, deleteSupplier } = useApp();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  const filtered = supplier.filter(s =>
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    s.telepon.includes(search)
  );

  function openAdd() {
    setEditId(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(s: Supplier) {
    setEditId(s.id);
    setForm({ nama: s.nama, telepon: s.telepon });
    setErrors({});
    setModalOpen(true);
  }

  function validate() {
    const e: Partial<FormData> = {};
    if (!form.nama.trim()) e.nama = "Nama supplier wajib diisi";
    if (!form.telepon.trim()) e.telepon = "Nomor telepon wajib diisi";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    if (editId) {
      updateSupplier(editId, form);
      toast.success("Supplier berhasil diperbarui");
    } else {
      addSupplier(form);
      toast.success("Supplier berhasil ditambahkan");
    }
    setModalOpen(false);
  }

  function handleDelete() {
    if (!deleteId) return;
    deleteSupplier(deleteId);
    toast.success("Supplier berhasil dihapus");
    setDeleteId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cari supplier..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 bg-white"
          />
        </div>
        <Button onClick={openAdd} className="bg-green-600 hover:bg-green-700 text-white h-9 gap-1.5">
          <Plus className="w-4 h-4" /> Tambah
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
            <Truck className="w-10 h-10" />
            <p className="text-sm">{search ? "Tidak ada hasil pencarian" : "Belum ada data supplier"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs">Nama Supplier</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs">Nomor Telepon</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-xs text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                          {s.nama.charAt(0)}
                        </div>
                        {s.nama}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{s.telepon}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(s.id)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-sm" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Supplier" : "Tambah Supplier"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Nama Supplier</Label>
              <Input
                value={form.nama}
                onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                placeholder="cth. CV Textile Jaya"
                className={errors.nama ? "border-red-400" : ""}
              />
              {errors.nama && <p className="text-xs text-red-500">{errors.nama}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label>Nomor Telepon</Label>
              <Input
                value={form.telepon}
                onChange={e => setForm(f => ({ ...f, telepon: e.target.value }))}
                placeholder="cth. 0812-3456-7890"
                className={errors.telepon ? "border-red-400" : ""}
              />
              {errors.telepon && <p className="text-xs text-red-500">{errors.telepon}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">
              {editId ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Supplier?</AlertDialogTitle>
            <AlertDialogDescription>
              Data supplier akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
