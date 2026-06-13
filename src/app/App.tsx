import { AppProvider, useApp } from "./context/AppContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./components/Dashboard";
import { PageBarang } from "./components/PageBarang";
import { PageSupplier } from "./components/PageSupplier";
import { PagePembelian } from "./components/PagePembelian";
import { PagePenjualan } from "./components/PagePenjualan";
import { PageAnalisaABC } from "./components/PageAnalisaABC";
import { PageDetailBarang } from "./components/PageDetailBarang";
import { Toaster } from "./components/ui/sonner";

function Router() {
  const { currentPage } = useApp();

  const pages: Record<string, React.ReactNode> = {
    dashboard: <Dashboard />,
    barang: <PageBarang />,
    supplier: <PageSupplier />,
    pembelian: <PagePembelian />,
    penjualan: <PagePenjualan />,
    analisa: <PageAnalisaABC />,
    detail: <PageDetailBarang />,
  };

  return (
    <Layout>
      {pages[currentPage] ?? <Dashboard />}
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <Router />
      <Toaster position="top-right" richColors />
    </AppProvider>
  );
}
