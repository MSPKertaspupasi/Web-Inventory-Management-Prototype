import React, { createContext, useContext, useState, useCallback } from "react";

export type KategoriABC = "A" | "B" | "C";
export type StatusStok = "Normal" | "Menipis" | "Habis";

export interface Barang {
  id: string;
  nama: string;
  stok: number;
  stokMinimum: number;
  satuan: string;
  hargaBeli: number;
  hargaJual: number;
  kategoriABC: KategoriABC;
  barcode: string;
  foto: string;
}

export interface Supplier {
  id: string;
  nama: string;
  telepon: string;
}

export interface Pembelian {
  id: string;
  tanggal: string;
  supplierId: string;
  barangId: string;
  jumlah: number;
  harga: number;
}

export interface Penjualan {
  id: string;
  tanggal: string;
  barangId: string;
  jumlah: number;
  harga: number;
}

export interface ABCItem {
  barangId: string;
  namaBarang: string;
  totalNilai: number;
  persentase: number;
  kumulatif: number;
  kategori: KategoriABC;
  rank: number;
}

const initialBarang: Barang[] = [
  {
    id: "B001", nama: "Kemeja Polos Putih", stok: 45, stokMinimum: 10, satuan: "pcs", hargaBeli: 55000, hargaJual: 95000, kategoriABC: "A",
    barcode: "",
    foto: ""
  },
  {
    id: "B002", nama: "Kaos Basic Hitam", stok: 78, stokMinimum: 15, satuan: "pcs", hargaBeli: 35000, hargaJual: 65000, kategoriABC: "A",
    barcode: "",
    foto: ""
  },
  {
    id: "B003", nama: "Celana Chino Navy", stok: 23, stokMinimum: 8, satuan: "pcs", hargaBeli: 75000, hargaJual: 135000, kategoriABC: "A",
    barcode: "",
    foto: ""
  },
  {
    id: "B004", nama: "Hoodie Polos Abu", stok: 18, stokMinimum: 5, satuan: "pcs", hargaBeli: 85000, hargaJual: 155000, kategoriABC: "A",
    barcode: "",
    foto: ""
  },
  {
    id: "B005", nama: "Jaket Denim Biru", stok: 8, stokMinimum: 5, satuan: "pcs", hargaBeli: 120000, hargaJual: 210000, kategoriABC: "A",
    barcode: "",
    foto: ""
  },
  {
    id: "B006", nama: "Rok Mini Hitam", stok: 15, stokMinimum: 5, satuan: "pcs", hargaBeli: 45000, hargaJual: 85000, kategoriABC: "B",
    barcode: "",
    foto: ""
  },
  {
    id: "B007", nama: "Dress Casual Floral", stok: 12, stokMinimum: 5, satuan: "pcs", hargaBeli: 65000, hargaJual: 115000, kategoriABC: "B",
    barcode: "",
    foto: ""
  },
  {
    id: "B008", nama: "Blouse Batik Modern", stok: 30, stokMinimum: 5, satuan: "pcs", hargaBeli: 70000, hargaJual: 125000, kategoriABC: "B",
    barcode: "",
    foto: ""
  },
  {
    id: "B009", nama: "Celana Jogger Abu", stok: 5, stokMinimum: 5, satuan: "pcs", hargaBeli: 60000, hargaJual: 105000, kategoriABC: "C",
    barcode: "",
    foto: ""
  },
  {
    id: "B010", nama: "Kemeja Flannel Kotak", stok: 3, stokMinimum: 5, satuan: "pcs", hargaBeli: 90000, hargaJual: 160000, kategoriABC: "C",
    barcode: "",
    foto: ""
  },
];

const initialSupplier: Supplier[] = [
  { id: "S001", nama: "CV Textile Jaya", telepon: "0812-3456-7890" },
  { id: "S002", nama: "UD Sandang Makmur", telepon: "0813-9876-5432" },
  { id: "S003", nama: "Toko Bahan Kain Prima", telepon: "0857-1234-5678" },
];

const initialPembelian: Pembelian[] = [
  { id: "P001", tanggal: "2026-03-01", supplierId: "S001", barangId: "B001", jumlah: 50, harga: 55000 },
  { id: "P002", tanggal: "2026-03-01", supplierId: "S001", barangId: "B002", jumlah: 80, harga: 35000 },
  { id: "P003", tanggal: "2026-03-01", supplierId: "S001", barangId: "B003", jumlah: 40, harga: 75000 },
  { id: "P004", tanggal: "2026-03-01", supplierId: "S001", barangId: "B004", jumlah: 30, harga: 85000 },
  { id: "P005", tanggal: "2026-03-01", supplierId: "S002", barangId: "B005", jumlah: 15, harga: 120000 },
  { id: "P006", tanggal: "2026-03-01", supplierId: "S002", barangId: "B006", jumlah: 35, harga: 45000 },
  { id: "P007", tanggal: "2026-03-01", supplierId: "S002", barangId: "B007", jumlah: 25, harga: 65000 },
  { id: "P008", tanggal: "2026-03-01", supplierId: "S003", barangId: "B008", jumlah: 30, harga: 70000 },
  { id: "P009", tanggal: "2026-03-01", supplierId: "S003", barangId: "B009", jumlah: 20, harga: 60000 },
  { id: "P010", tanggal: "2026-03-01", supplierId: "S003", barangId: "B010", jumlah: 10, harga: 90000 },
  { id: "P011", tanggal: "2026-04-15", supplierId: "S001", barangId: "B001", jumlah: 30, harga: 55000 },
  { id: "P012", tanggal: "2026-04-15", supplierId: "S001", barangId: "B002", jumlah: 50, harga: 35000 },
  { id: "P013", tanggal: "2026-04-15", supplierId: "S001", barangId: "B003", jumlah: 30, harga: 75000 },
  { id: "P014", tanggal: "2026-05-01", supplierId: "S001", barangId: "B004", jumlah: 20, harga: 85000 },
  { id: "P015", tanggal: "2026-05-01", supplierId: "S002", barangId: "B005", jumlah: 10, harga: 120000 },
  { id: "P016", tanggal: "2026-05-01", supplierId: "S002", barangId: "B007", jumlah: 20, harga: 65000 },
];

const initialPenjualan: Penjualan[] = [
  { id: "J001", tanggal: "2026-03-05", barangId: "B002", jumlah: 30, harga: 65000 },
  { id: "J002", tanggal: "2026-03-08", barangId: "B001", jumlah: 25, harga: 95000 },
  { id: "J003", tanggal: "2026-03-10", barangId: "B003", jumlah: 20, harga: 135000 },
  { id: "J004", tanggal: "2026-03-15", barangId: "B004", jumlah: 20, harga: 155000 },
  { id: "J005", tanggal: "2026-03-18", barangId: "B002", jumlah: 25, harga: 65000 },
  { id: "J006", tanggal: "2026-03-20", barangId: "B005", jumlah: 10, harga: 210000 },
  { id: "J007", tanggal: "2026-03-22", barangId: "B006", jumlah: 25, harga: 85000 },
  { id: "J008", tanggal: "2026-03-25", barangId: "B001", jumlah: 30, harga: 95000 },
  { id: "J009", tanggal: "2026-04-02", barangId: "B002", jumlah: 35, harga: 65000 },
  { id: "J010", tanggal: "2026-04-05", barangId: "B003", jumlah: 25, harga: 135000 },
  { id: "J011", tanggal: "2026-04-08", barangId: "B007", jumlah: 20, harga: 115000 },
  { id: "J012", tanggal: "2026-04-10", barangId: "B004", jumlah: 25, harga: 155000 },
  { id: "J013", tanggal: "2026-04-15", barangId: "B001", jumlah: 35, harga: 95000 },
  { id: "J014", tanggal: "2026-04-18", barangId: "B005", jumlah: 15, harga: 210000 },
  { id: "J015", tanggal: "2026-04-20", barangId: "B003", jumlah: 20, harga: 135000 },
  { id: "J016", tanggal: "2026-04-20", barangId: "B002", jumlah: 40, harga: 65000 },
  { id: "J017", tanggal: "2026-04-22", barangId: "B008", jumlah: 10, harga: 125000 },
  { id: "J018", tanggal: "2026-04-25", barangId: "B006", jumlah: 30, harga: 85000 },
  { id: "J019", tanggal: "2026-04-28", barangId: "B007", jumlah: 20, harga: 115000 },
  { id: "J020", tanggal: "2026-04-30", barangId: "B009", jumlah: 10, harga: 105000 },
  { id: "J021", tanggal: "2026-05-01", barangId: "B004", jumlah: 20, harga: 155000 },
  { id: "J022", tanggal: "2026-05-03", barangId: "B001", jumlah: 30, harga: 95000 },
  { id: "J023", tanggal: "2026-05-05", barangId: "B010", jumlah: 10, harga: 160000 },
  { id: "J024", tanggal: "2026-05-08", barangId: "B002", jumlah: 50, harga: 65000 },
  { id: "J025", tanggal: "2026-05-10", barangId: "B008", jumlah: 10, harga: 125000 },
  { id: "J026", tanggal: "2026-05-12", barangId: "B003", jumlah: 20, harga: 135000 },
  { id: "J027", tanggal: "2026-05-15", barangId: "B007", jumlah: 10, harga: 115000 },
  { id: "J028", tanggal: "2026-05-20", barangId: "B009", jumlah: 8, harga: 105000 },
];

function hitungKategoriABC(penjualan: Penjualan[]): Map<string, KategoriABC> {
  const nilaiPerBarang = new Map<string, number>();
  for (const j of penjualan) {
    nilaiPerBarang.set(j.barangId, (nilaiPerBarang.get(j.barangId) ?? 0) + j.jumlah * j.harga);
  }
  const sorted = Array.from(nilaiPerBarang.entries()).sort((a, b) => b[1] - a[1]);
  const total = sorted.reduce((s, [, v]) => s + v, 0);
  let kumulatif = 0;
  const result = new Map<string, KategoriABC>();
  for (const [id, nilai] of sorted) {
    kumulatif += nilai / total;
    if (kumulatif <= 0.8) result.set(id, "A");
    else if (kumulatif <= 0.95) result.set(id, "B");
    else result.set(id, "C");
  }
  return result;
}

export function getStatusStok(b: Barang): StatusStok {
  if (b.stok === 0) return "Habis";
  if (b.stok <= b.stokMinimum) return "Menipis";
  return "Normal";
}

export function formatRupiah(n: number): string {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(n);
}

export function formatTanggal(t: string): string {
  return new Date(t).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

interface AppContextType {
  barang: Barang[];
  supplier: Supplier[];
  pembelian: Pembelian[];
  penjualan: Penjualan[];
  currentPage: string;
  selectedBarangId: string | null;
  navigate: (page: string, barangId?: string) => void;
  addBarang: (b: Omit<Barang, "id" | "kategoriABC">) => void;
  updateBarang: (id: string, b: Partial<Barang>) => void;
  deleteBarang: (id: string) => void;
  addSupplier: (s: Omit<Supplier, "id">) => void;
  updateSupplier: (id: string, s: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addPembelian: (p: Omit<Pembelian, "id">) => void;
  deletePembelian: (id: string) => void;
  addPenjualan: (p: Omit<Penjualan, "id">) => void;
  deletePenjualan: (id: string) => void;
  getAbcAnalysis: () => ABCItem[];
  getBarangById: (id: string) => Barang | undefined;
  getSupplierById: (id: string) => Supplier | undefined;
}

const AppContext = createContext<AppContextType>(null!);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [barang, setBarang] = useState<Barang[]>(initialBarang);
  const [supplier, setSupplier] = useState<Supplier[]>(initialSupplier);
  const [pembelian, setPembelian] = useState<Pembelian[]>(initialPembelian);
  const [penjualan, setPenjualan] = useState<Penjualan[]>(initialPenjualan);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedBarangId, setSelectedBarangId] = useState<string | null>(null);

  const counter = React.useRef(100);
  const nextId = (prefix: string) => `${prefix}${String(++counter.current).padStart(3, "0")}`;

  const navigate = useCallback((page: string, barangId?: string) => {
    setCurrentPage(page);
    setSelectedBarangId(barangId ?? null);
    window.scrollTo(0, 0);
  }, []);

  const recalcABC = useCallback((newPenjualan: Penjualan[], newBarang: Barang[]): Barang[] => {
    const map = hitungKategoriABC(newPenjualan);
    return newBarang.map(b => ({ ...b, kategoriABC: map.get(b.id) ?? b.kategoriABC }));
  }, []);

  const addBarang = useCallback((b: Omit<Barang, "id" | "kategoriABC">) => {
    setBarang(prev => [...prev, { ...b, id: nextId("B"), kategoriABC: "C" }]);
  }, []);

  const updateBarang = useCallback((id: string, data: Partial<Barang>) => {
    setBarang(prev => prev.map(b => b.id === id ? { ...b, ...data } : b));
  }, []);

  const deleteBarang = useCallback((id: string) => {
    setBarang(prev => prev.filter(b => b.id !== id));
  }, []);

  const addSupplier = useCallback((s: Omit<Supplier, "id">) => {
    setSupplier(prev => [...prev, { ...s, id: nextId("S") }]);
  }, []);

  const updateSupplier = useCallback((id: string, data: Partial<Supplier>) => {
    setSupplier(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
  }, []);

  const deleteSupplier = useCallback((id: string) => {
    setSupplier(prev => prev.filter(s => s.id !== id));
  }, []);

  const addPembelian = useCallback((p: Omit<Pembelian, "id">) => {
    const newP = { ...p, id: nextId("P") };
    setPembelian(prev => [...prev, newP]);
    setBarang(prev => prev.map(b => b.id === p.barangId ? { ...b, stok: b.stok + p.jumlah } : b));
  }, []);

  const deletePembelian = useCallback((id: string) => {
    const p = pembelian.find(x => x.id === id);
    if (!p) return;
    setPembelian(prev => prev.filter(x => x.id !== id));
    setBarang(prev => prev.map(b => b.id === p.barangId ? { ...b, stok: Math.max(0, b.stok - p.jumlah) } : b));
  }, [pembelian]);

  const addPenjualan = useCallback((p: Omit<Penjualan, "id">) => {
    const newP = { ...p, id: nextId("J") };
    setPenjualan(prev => {
      const updated = [...prev, newP];
      setBarang(curr => recalcABC(updated, curr.map(b => b.id === p.barangId ? { ...b, stok: Math.max(0, b.stok - p.jumlah) } : b)));
      return updated;
    });
  }, [recalcABC]);

  const deletePenjualan = useCallback((id: string) => {
    const p = penjualan.find(x => x.id === id);
    if (!p) return;
    setPenjualan(prev => {
      const updated = prev.filter(x => x.id !== id);
      setBarang(curr => recalcABC(updated, curr.map(b => b.id === p.barangId ? { ...b, stok: b.stok + p.jumlah } : b)));
      return updated;
    });
  }, [penjualan, recalcABC]);

  const getAbcAnalysis = useCallback((): ABCItem[] => {
    const nilaiPerBarang = new Map<string, number>();
    for (const j of penjualan) {
      nilaiPerBarang.set(j.barangId, (nilaiPerBarang.get(j.barangId) ?? 0) + j.jumlah * j.harga);
    }
    const sorted = Array.from(nilaiPerBarang.entries()).sort((a, b) => b[1] - a[1]);
    const total = sorted.reduce((s, [, v]) => s + v, 0);
    let kumulatif = 0;
    return sorted.map(([id, nilai], index) => {
      const pct = nilai / total;
      kumulatif += pct;
      const kategori: KategoriABC = kumulatif <= 0.8 ? "A" : kumulatif <= 0.95 ? "B" : "C";
      return {
        barangId: id,
        namaBarang: barang.find(b => b.id === id)?.nama ?? id,
        totalNilai: nilai,
        persentase: pct * 100,
        kumulatif: kumulatif * 100,
        kategori,
        rank: index + 1,
      };
    });
  }, [penjualan, barang]);

  const getBarangById = useCallback((id: string) => barang.find(b => b.id === id), [barang]);
  const getSupplierById = useCallback((id: string) => supplier.find(s => s.id === id), [supplier]);

  return (
    <AppContext.Provider value={{
      barang, supplier, pembelian, penjualan,
      currentPage, selectedBarangId, navigate,
      addBarang, updateBarang, deleteBarang,
      addSupplier, updateSupplier, deleteSupplier,
      addPembelian, deletePembelian,
      addPenjualan, deletePenjualan,
      getAbcAnalysis, getBarangById, getSupplierById,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
