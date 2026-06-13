import { useApp } from "../context/AppContext";
import {
  LayoutDashboard, Package, Truck, ShoppingCart, TrendingUp, BarChart3, Menu, X
} from "lucide-react";
import { useState } from "react";
import { cn } from "./ui/utils";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "barang", label: "Barang", icon: Package },
  { id: "supplier", label: "Supplier", icon: Truck },
  { id: "pembelian", label: "Pembelian", icon: ShoppingCart },
  { id: "penjualan", label: "Penjualan", icon: TrendingUp },
  { id: "analisa", label: "Analisa ABC", icon: BarChart3 },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { currentPage, navigate } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-slate-200 fixed h-full z-20">
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 leading-tight">AZ-ZAIN</p>
              <p className="text-xs text-slate-500 leading-tight">Collection</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left",
                currentPage === item.id
                  ? "bg-green-50 text-green-700 font-medium"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 text-center">v1.0 &nbsp;·&nbsp; 2026</p>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/30" onClick={() => setSidebarOpen(false)} />
          <aside className="relative flex flex-col w-64 bg-white shadow-xl z-50">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-green-600 flex items-center justify-center">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900 leading-tight">AZ-ZAIN</p>
                  <p className="text-xs text-slate-500 leading-tight">Collection</p>
                </div>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-md hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 space-y-0.5">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => { navigate(item.id); setSidebarOpen(false); }}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left",
                    currentPage === item.id
                      ? "bg-green-50 text-green-700 font-medium"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-200 px-4 lg:px-6 h-14 flex items-center justify-between">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-slate-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5 text-slate-600" />
          </button>
          <h1 className="text-base font-semibold text-slate-900 hidden lg:block">
            {navItems.find(n => n.id === currentPage)?.label ?? ""}
          </h1>
          <h1 className="text-base font-semibold text-slate-900 lg:hidden">
            {navItems.find(n => n.id === currentPage)?.label ?? "Detail Barang"}
          </h1>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-xs font-semibold text-green-700">AZ</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-4 lg:px-6 py-5 pb-24 lg:pb-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 flex">
        {navItems.slice(0, 5).map(item => (
          <button
            key={item.id}
            onClick={() => navigate(item.id)}
            className={cn(
              "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors",
              currentPage === item.id
                ? "text-green-600"
                : "text-slate-500"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px]">{item.label}</span>
          </button>
        ))}
        <button
          onClick={() => navigate("analisa")}
          className={cn(
            "flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-xs transition-colors",
            currentPage === "analisa" ? "text-green-600" : "text-slate-500"
          )}
        >
          <BarChart3 className="w-5 h-5" />
          <span className="text-[10px]">ABC</span>
        </button>
      </nav>
    </div>
  );
}
