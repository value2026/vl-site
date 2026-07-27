import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar, MapPin, Clock, Users, X } from 'lucide-react';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function isSameDay(d1, d2) {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
}

const statusColors = {
  approved: 'bg-emerald-500',
  pending: 'bg-amber-400',
  rejected: 'bg-red-400',
};

export default function WorkshopCalendar({ workshops = [], role = 'admin' }) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedWorkshop, setSelectedWorkshop] = useState(null);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);

  const workshopsByDate = useMemo(() => {
    const map = {};
    workshops.forEach((w) => {
      const d = new Date(w.date);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(w);
    });
    return map;
  }, [workshops]);

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const cells = [];
  for (let i = 0; i < firstDay; i++) {
    cells.push(<div key={`empty-${i}`} className="min-h-[100px] bg-slate-900/30" />);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const dateKey = `${currentYear}-${currentMonth}-${day}`;
    const dayWorkshops = workshopsByDate[dateKey] || [];
    const isToday = today.getFullYear() === currentYear && today.getMonth() === currentMonth && today.getDate() === day;
    const isPast = new Date(currentYear, currentMonth, day) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

    cells.push(
      <div
        key={day}
        className={`min-h-[100px] p-2 border border-slate-800/50 rounded-xl transition-all duration-200 ${
          isToday
            ? 'bg-purple-500/10 border-purple-500/40 ring-1 ring-purple-500/20'
            : isPast
            ? 'bg-slate-900/20 opacity-60'
            : 'bg-slate-900/40 hover:bg-slate-800/50'
        }`}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className={`text-sm font-bold ${
              isToday ? 'text-purple-400' : isPast ? 'text-slate-600' : 'text-slate-300'
            }`}
          >
            {day}
          </span>
          {isToday && (
            <span className="text-[9px] font-bold bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded uppercase tracking-wider">
              Today
            </span>
          )}
        </div>
        <div className="space-y-1">
          {dayWorkshops.slice(0, 2).map((w) => (
            <button
              key={w.id}
              onClick={() => setSelectedWorkshop(w)}
              className={`w-full text-left px-2 py-1 rounded-lg text-[10px] font-bold truncate transition-colors ${
                w.status === 'approved'
                  ? 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20'
                  : w.status === 'pending'
                  ? 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/20'
                  : 'bg-red-500/15 text-red-400 hover:bg-red-500/25 border border-red-500/20'
              }`}
              title={w.title}
            >
              {w.title}
            </button>
          ))}
          {dayWorkshops.length > 2 && (
            <span className="text-[9px] text-slate-500 font-medium px-1">
              +{dayWorkshops.length - 2} more
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
      {/* Calendar Header */}
      <div className="p-5 border-b border-slate-800 bg-slate-900/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <h2 className="text-lg font-bold text-white min-w-[180px] text-center">
            {MONTHS[currentMonth]} {currentYear}
          </h2>
          <button
            onClick={nextMonth}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={goToToday}
            className="ml-2 px-3 py-1.5 rounded-lg text-xs font-bold text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 transition-colors"
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-semibold">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Approved</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-slate-400">Pending</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-400" />
            <span className="text-slate-400">Rejected</span>
          </span>
        </div>
      </div>

      {/* Weekday Headers */}
      <div className="grid grid-cols-7 border-b border-slate-800/50">
        {WEEKDAYS.map((day) => (
          <div key={day} className="px-2 py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 p-2 gap-2">
        {cells}
      </div>

      {/* Workshop Detail Modal */}
      {selectedWorkshop && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedWorkshop(null)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setSelectedWorkshop(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${
                selectedWorkshop.status === 'approved'
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : selectedWorkshop.status === 'pending'
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
                {selectedWorkshop.status}
              </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-4 pr-8">{selectedWorkshop.title}</h3>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-sm text-slate-300">
                <Calendar className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{new Date(selectedWorkshop.date).toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                })}</span>
              </div>
              {selectedWorkshop.location && (
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span>{selectedWorkshop.location}</span>
                </div>
              )}
              {selectedWorkshop.mode && (
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Clock className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <span>{selectedWorkshop.mode}</span>
                </div>
              )}
              {selectedWorkshop.seats && (
                <div className="flex items-center gap-3 text-sm text-slate-300">
                  <Users className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>{selectedWorkshop.seats} seats</span>
                </div>
              )}
            </div>

            {selectedWorkshop.description && (
              <p className="text-sm text-slate-400 leading-relaxed border-t border-slate-800 pt-4">
                {selectedWorkshop.description}
              </p>
            )}

            {selectedWorkshop.createdBy && (
              <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-500">
                Created by {selectedWorkshop.createdBy.name}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
