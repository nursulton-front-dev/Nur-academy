import React, { useState, useEffect } from 'react';
import { Link, Outlet, useParams, useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  CheckCircle2, 
  Lock, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  LayoutDashboard, 
  Menu, 
  X,
  PlayCircle
} from 'lucide-react';
import { mockModules } from '../data/attestatsiyaMocks';

export default function AttestatsiyaLayout() {
  const { id } = useParams(); // lesson or exam id
  const location = useLocation();
  const [expandedModules, setExpandedModules] = useState<{ [key: string]: boolean }>({});
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Automatically expand the module of the current active lesson
  useEffect(() => {
    if (location.pathname.includes('/attestatsiya/dars/')) {
      const lessonId = location.pathname.split('/attestatsiya/dars/')[1];
      const activeModule = mockModules.find(m => 
        m.lessons.some(l => l.id === lessonId)
      );
      if (activeModule) {
        setExpandedModules(prev => ({ ...prev, [activeModule.id]: true }));
      }
    }
  }, [location.pathname]);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#F6F9F8] dark:bg-[#16201F] border-r border-[#E3EBE9] dark:border-[#2A3A38] text-[#1A2E2E] dark:text-[#EAF3F0] transition-colors duration-250">
      {/* Sidebar Header */}
      <div className="p-4 border-b border-[#E3EBE9] dark:border-[#2A3A38]">
        <Link to="/" className="flex items-center space-x-2 mb-1">
          <div className="w-6 h-6 bg-[#3B7DD8] rounded flex items-center justify-center text-white font-bold text-xs">N</div>
          <span className="font-serif font-bold text-lg text-[#1A2E2E] dark:text-[#EAF3F0]">Nur Academy</span>
        </Link>
        <Link to="/attestatsiya" className="text-xs font-semibold text-[#3B7DD8] tracking-wider uppercase flex items-center gap-1 hover:underline">
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Attestatsiya kursi</span>
        </Link>
      </div>

      {/* Modules and Links Scroll Area */}
      <div className="flex-grow overflow-y-auto p-3 space-y-6 scrollbar-thin">
        {/* Course Overview Link */}
        <div>
          <Link
            to="/attestatsiya"
            className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/attestatsiya' 
                ? 'bg-[#3B7DD8]/10 text-[#3B7DD8]' 
                : 'hover:bg-[#E3EBE9]/50 dark:hover:bg-[#2A3A38]/30 text-[#1A2E2E] dark:text-[#EAF3F0]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Kurs sharhi</span>
          </Link>
        </div>

        {/* Materiallar (Modules) */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-[#5C7370] dark:text-gray-400 uppercase tracking-wider mb-2">
            Materiallar
          </h3>
          <div className="space-y-1">
            {mockModules.map((mod) => {
              const isExpanded = !!expandedModules[mod.id];
              return (
                <div key={mod.id} className="space-y-0.5">
                  <button
                    onClick={() => toggleModule(mod.id)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium text-[#1A2E2E] dark:text-[#EAF3F0] hover:bg-[#E3EBE9]/50 dark:hover:bg-[#2A3A38]/30 transition-colors text-left"
                  >
                    <span className="truncate pr-2">{mod.title}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-[#5C7370] dark:text-gray-400 flex-shrink-0" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-[#5C7370] dark:text-gray-400 flex-shrink-0" />
                    )}
                  </button>

                  {isExpanded && (
                    <div className="pl-4 pr-1 py-1 space-y-1 border-l border-[#E3EBE9] dark:border-[#2A3A38] ml-4">
                      {mod.lessons.map((les) => {
                        const isCurrent = location.pathname === `/attestatsiya/dars/${les.id}`;
                        const isCompleted = les.status === 'completed';
                        const isLocked = les.status === 'locked';

                        let statusIcon = <PlayCircle className="w-4 h-4 text-[#5C7370] dark:text-gray-400" />;
                        if (isCompleted) {
                          statusIcon = <CheckCircle2 className="w-4 h-4 text-[#4CAF82]" />;
                        } else if (isLocked) {
                          statusIcon = <Lock className="w-3.5 h-3.5 text-[#5C7370] dark:text-gray-500" />;
                        }

                        return (
                          <Link
                            key={les.id}
                            to={isLocked ? '#' : `/attestatsiya/dars/${les.id}`}
                            onClick={(e) => {
                              if (isLocked) e.preventDefault();
                              else setMobileMenuOpen(false);
                            }}
                            className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                              isCurrent 
                                ? 'bg-[#3B7DD8] text-white' 
                                : isLocked 
                                  ? 'opacity-50 cursor-not-allowed text-[#5C7370] dark:text-gray-500' 
                                  : 'hover:bg-[#E3EBE9]/50 dark:hover:bg-[#2A3A38]/30 text-[#1A2E2E] dark:text-[#EAF3F0]'
                            }`}
                          >
                            <span className="flex-shrink-0">{statusIcon}</span>
                            <span className="truncate">{les.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Testlar Section */}
        <div>
          <h3 className="px-3 text-xs font-semibold text-[#5C7370] dark:text-gray-400 uppercase tracking-wider mb-2">
            Testlar
          </h3>
          <div className="space-y-1">
            <Link
              to="/attestatsiya/testlar"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/attestatsiya/testlar' 
                  ? 'bg-[#3B7DD8]/10 text-[#3B7DD8]' 
                  : 'hover:bg-[#E3EBE9]/50 dark:hover:bg-[#2A3A38]/30 text-[#1A2E2E] dark:text-[#EAF3F0]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Mavzu testlari</span>
            </Link>
            <Link
              to="/attestatsiya/testlar"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center space-x-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                location.pathname === '/attestatsiya/testlar' 
                  ? 'bg-[#3B7DD8]/10 text-[#3B7DD8]' 
                  : 'hover:bg-[#E3EBE9]/50 dark:hover:bg-[#2A3A38]/30 text-[#1A2E2E] dark:text-[#EAF3F0]'
              }`}
            >
              <FileText className="w-4 h-4 text-[#3B7DD8]" />
              <span>Mock imtihonlar</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#F6F9F8] dark:bg-[#16201F] transition-colors duration-250">
      {/* Mobile Top Header */}
      <div className="flex md:hidden items-center justify-between px-4 py-3 bg-white dark:bg-[#1E2B29] border-b border-[#E3EBE9] dark:border-[#2A3A38] sticky top-16 z-30">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 text-[#1A2E2E] dark:text-[#EAF3F0]"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
        <span className="font-serif font-bold text-base text-[#1A2E2E] dark:text-[#EAF3F0]">Attestatsiya Kursi</span>
        <div className="w-6"></div>
      </div>

      {/* Sidebar - Desktop */}
      <aside className="hidden md:block w-[220px] h-[calc(100vh-64px)] sticky top-16 flex-shrink-0 z-20">
        {sidebarContent}
      </aside>

      {/* Sidebar - Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 top-[113px] bg-black/40">
          <aside className="w-[260px] h-full shadow-2xl relative animate-slideRight">
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-grow p-4 sm:p-8 overflow-x-hidden min-h-[calc(100vh-64px)]">
        <div className="max-w-5xl mx-auto bg-white dark:bg-[#1E2B29] rounded-2xl border border-[#E3EBE9] dark:border-[#2A3A38] p-6 sm:p-8 shadow-sm transition-colors duration-250">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
