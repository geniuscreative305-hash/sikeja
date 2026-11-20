import React from 'react';
import { 
  LayoutDashboard, 
  WalletCards, 
  Users2, 
  Settings2, 
  ChevronLeft, 
  ChevronRight, 
  Building2, 
  LogOut,
  X
} from 'lucide-react';

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  setIsCollapsed, 
  user, 
  onLogout,
  isMobileOpen,
  setIsMobileOpen
}) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Ringkasan & Analisis Kas',
    },
    {
      id: 'keuangan',
      label: 'Keuangan',
      icon: WalletCards,
      description: 'Tagihan, Bayar & Pengeluaran',
    },
    {
      id: 'santri',
      label: 'Data Santri',
      icon: Users2,
      description: 'Daftar Santri SMP & MA',
    },
    {
      id: 'setting',
      label: 'Setting',
      icon: Settings2,
      description: 'Tarif & Pengaturan Lembaga',
      adminOnly: true,
    },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden no-print"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out glass-panel bg-[#0b2239]/95 border-r border-white/10 no-print
          ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
          ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Sleek Floating Collapse/Expand Button on Right Border (Desktop) */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex absolute -right-3.5 top-7 z-50 w-7 h-7 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 items-center justify-center shadow-lg shadow-emerald-950/50 border border-white/30 transition-all duration-200 hover:scale-110"
          title={isCollapsed ? 'Perlebar Sidebar' : 'Ciutkan Sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Top Header */}
        <div className={`h-20 flex items-center border-b border-white/10 transition-all ${
          isCollapsed && !isMobileOpen ? 'justify-center px-2' : 'justify-between px-5'
        }`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-lime-400 p-0.5 flex-shrink-0 shadow-md shadow-emerald-950/40">
              <div className="w-full h-full bg-[#0b2239] rounded-[10px] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white">SIKEJA</span>
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    APP
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">Keuangan Pesantren</p>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button 
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation List */}
        <div className={`flex-1 py-6 space-y-2 overflow-y-auto ${
          isCollapsed && !isMobileOpen ? 'px-2' : 'px-3'
        }`}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isGuestRestricted = item.adminOnly && user?.role === 'Guest';

            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center rounded-xl font-medium text-sm transition-all duration-200
                    ${isCollapsed && !isMobileOpen ? 'justify-center h-12 px-0' : 'gap-3.5 px-3 py-3 text-left'}
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-300 border border-emerald-500/30 shadow-lg shadow-emerald-950/20'
                        : 'text-slate-300 hover:text-white hover:bg-white/[0.06] border border-transparent'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                  
                  {(!isCollapsed || isMobileOpen) && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate">{item.label}</span>
                        {item.adminOnly && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded ${isGuestRestricted ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-700/60 text-slate-400'}`}>
                            {isGuestRestricted ? 'View' : 'Admin'}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 truncate font-normal">
                        {item.description}
                      </p>
                    </div>
                  )}
                </button>

                {/* Collapsed Tooltip */}
                {isCollapsed && !isMobileOpen && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-lg bg-slate-900/95 border border-white/15 text-white text-xs font-medium whitespace-nowrap shadow-2xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
                    <div className="font-semibold text-emerald-400">{item.label}</div>
                    <div className="text-[10px] text-slate-300">{item.description}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* User Badge & Logout Section */}
        <div className="p-3 border-t border-white/10 bg-black/20">
          <div className={`flex items-center ${isCollapsed && !isMobileOpen ? 'justify-center p-1' : 'justify-between p-2'} gap-2 rounded-xl bg-white/[0.04] border border-white/5`}>
            {(!isCollapsed || isMobileOpen) ? (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs font-bold text-white truncate block">
                    {user?.nama_tampilan || 'Pengguna'}
                  </span>
                </div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${user?.role === 'Admin' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-lime-500/20 text-lime-300'}`}>
                    {user?.role === 'Admin' ? 'Administrator' : 'Tamu (Read-Only)'}
                  </span>
                </div>
              </div>
            ) : null}

            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Keluar dari Sistem"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
