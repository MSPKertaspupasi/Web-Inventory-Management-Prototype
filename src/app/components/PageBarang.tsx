import { useState } from "react";
import { useApp, Barang, formatRupiah, getStatusStok } from "../context/AppContext";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Search, Plus, Pencil, Trash2, Eye, Package } from "lucide-react";
import { cn } from "./ui/utils";
import { toast } from "sonner";
import ImageUploader from "./ImageUploader";
import BarcodeScanner from "./BarcodeScanner";

const ABC_BG: Record<string, string> = {
  A: "bg-green-100 text-green-700",
  B: "bg-blue-100 text-blue-700",
  C: "bg-slate-100 text-slate-600",
};

const STATUS_BG: Record<string, string> = {
  Normal: "bg-green-50 text-green-700",
  Menipis: "bg-amber-50 text-amber-600",
  Habis: "bg-red-50 text-red-600",
};

type FormData = Omit<Barang, "id" | "kategoriABC">;

const emptyForm: FormData = {
  nama: "", stok: 0, stokMinimum: 5, satuan: "pcs", hargaBeli: 0, hargaJual: 0,
  barcode: "",
  foto: ""
};

export function PageBarang() {
  const { barang, addBarang, updateBarang, deleteBarang, navigate } = useApp();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [foto, setFoto] = useState("");
  const [barcode, setBarcode] = useState("");

  const filtered = barang.filter(b =>
    b.nama.toLowerCase().includes(search.toLowerCase())
  );

  function openAdd() {
    setEditId(null);
    setForm(emptyForm);
    setErrors({});
    setModalOpen(true);
  }

  function openEdit(b: Barang) {
    setEditId(b.id);
    setForm({ nama: b.nama, stok: b.stok, stokMinimum: b.stokMinimum, satuan: b.satuan, hargaBeli: b.hargaBeli, hargaJual: b.hargaJual, barcode: b.barcode ?? "", foto: b.foto ?? "" });
    setErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const e: Partial<Record<keyof FormData, string>> = {};
    if (!form.nama.trim()) e.nama = "Nama barang wajib diisi";
    if (form.stok < 0) e.stok = "Stok tidak boleh negatif";
    if (form.stokMinimum < 0) e.stokMinimum = "Stok minimum tidak boleh negatif";
    if (!form.satuan.trim()) e.satuan = "Satuan wajib diisi";
    if (form.hargaBeli <= 0) e.hargaBeli = "Harga beli harus lebih dari 0";
    if (form.hargaJual <= 0) e.hargaJual = "Harga jual harus lebih dari 0";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    if (editId) {
      updateBarang(editId, form);
      toast.success("Barang berhasil diperbarui");
    } else {
      addBarang(form);
      toast.success("Barang berhasil ditambahkan");
    }
    setModalOpen(false);
  }

  function handleDelete() {
    if (!deleteId) return;
    deleteBarang(deleteId);
    toast.success("Barang berhasil dihapus");
    setDeleteId(null);
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Cari barang..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 h-9 bg-white"
          />
        </div>
        <Button onClick={openAdd} className="bg-green-600 hover:bg-green-700 text-white h-9 gap-1.5">
          <Plus className="w-4 h-4" /> Tambah
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
            <Package className="w-10 h-10" />
            <p className="text-sm">{search ? "Tidak ada hasil pencarian" : "Belum ada data barang"}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs">Nama Barang</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500 text-xs">Stok</th>
                  <th className="text-left px-4 py-3 font-medium text-slate-500 text-xs hidden md:table-cell">Satuan</th>
                  <th className="text-right px-4 py-3 font-medium text-slate-500 text-xs hidden lg:table-cell">Harga Jual</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-500 text-xs">Kat.</th>
                  <th className="text-center px-4 py-3 font-medium text-slate-500 text-xs">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-500 text-xs text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(b => {
                  const status = getStatusStok(b);
                  return (
                    <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
<div className="flex items-center gap-3">

<div
className="
w-14
h-14
rounded-lg
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
text-[10px]
text-slate-400
"
>

No Photo

</div>

)}

</div>


<div>

<p
className="
font-medium
text-slate-800
"
>

{b.nama}

</p>


{b.barcode && (

<p
className="
text-xs
text-slate-400
font-mono
"
>

{b.barcode}

</p>

)}

</div>

</div>

</td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        <span className={cn(status !== "Normal" && "text-amber-600 font-semibold")}>
                          {b.stok}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{b.satuan}</td>
                      <td className="px-4 py-3 text-right text-slate-700 hidden lg:table-cell">{formatRupiah(b.hargaJual)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-semibold", ABC_BG[b.kategoriABC])}>
                          {b.kategoriABC}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={cn("inline-block px-2 py-0.5 rounded-full text-xs font-medium", STATUS_BG[status])}>
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => navigate("detail", b.id)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEdit(b)}
                            className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteId(b.id)}
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

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden" aria-describedby={undefined}>
          <DialogHeader>
            <DialogTitle>{editId ? "Edit Barang" : "Tambah Barang"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2 max-h-[70vh] overflow-y-auto  pr-2">
            <Field label="Nama Barang" error={errors.nama}>
              <Input
                value={form.nama}
                onChange={e => setForm(f => ({ ...f, nama: e.target.value }))}
                placeholder="cth. Kemeja Polos Putih"
                className={errors.nama ? "border-red-400" : ""}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Stok Awal" error={errors.stok}>
                <Input
                  type="number" min={0}
                  value={form.stok}
                  onChange={e => setForm(f => ({ ...f, stok: Number(e.target.value) }))}
                  disabled={!!editId}
                  className={errors.stok ? "border-red-400" : ""}
                />
              </Field>
              <Field label="Stok Minimum" error={errors.stokMinimum}>
                <Input
                  type="number" min={0}
                  value={form.stokMinimum}
                  onChange={e => setForm(f => ({ ...f, stokMinimum: Number(e.target.value) }))}
                  className={errors.stokMinimum ? "border-red-400" : ""}
                />
              </Field>
            </div>
            <Field label="Foto Barang">

              <ImageUploader
                onChange={(url) =>
                  setForm(f => ({
                    ...f,
                    foto: url
                  }))
                }
              />

            </Field>
            <Field label="Barcode">

              <BarcodeScanner
              onScan={(code)=>

              setForm(f=>({...f,barcode:code}))

              }

              />

              <Input
              value={form.barcode || ""}
              readOnly
              placeholder="Scan barcode"
              />

            </Field>
            <Field label="Satuan" error={errors.satuan}>
              <Input
                value={form.satuan}
                onChange={e => setForm(f => ({ ...f, satuan: e.target.value }))}
                placeholder="pcs / lusin / kg"
                className={errors.satuan ? "border-red-400" : ""}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Harga Beli (Rp)" error={errors.hargaBeli}>
                <Input
                  type="number" min={0}
                  value={form.hargaBeli}
                  onChange={e => setForm(f => ({ ...f, hargaBeli: Number(e.target.value) }))}
                  className={errors.hargaBeli ? "border-red-400" : ""}
                />
              </Field>
              <Field label="Harga Jual (Rp)" error={errors.hargaJual}>
                <Input
                  type="number" min={0}
                  value={form.hargaJual}
                  onChange={e => setForm(f => ({ ...f, hargaJual: Number(e.target.value) }))}
                  className={errors.hargaJual ? "border-red-400" : ""}
                />
              </Field>
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

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={v => !v && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Barang?</AlertDialogTitle>
            <AlertDialogDescription>
              Data barang akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.
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

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-sm">{label}</Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
