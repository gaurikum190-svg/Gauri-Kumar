import React, { useRef, useMemo } from 'react';
import { DailyLog, UserProfile, WeightLog, WorkoutLog, OuterHealthAssessment } from '../types';
import { Download, Upload, Trash2, Calendar, HardDrive, Eye, AlertOctagon } from 'lucide-react';

interface HistoryLogsProps {
  profile: UserProfile;
  dailyLogs: DailyLog[];
  weightLogs: WeightLog[];
  workoutLogs: WorkoutLog[];
  assessments: OuterHealthAssessment[];
  onDeleteDailyLog: (date: string) => void;
  onImportData: (data: {
    profile: UserProfile;
    dailyLogs: DailyLog[];
    weightLogs: WeightLog[];
    workoutLogs: WorkoutLog[];
    assessments: OuterHealthAssessment[];
  }) => void;
  onResetAllData: () => void;
}

export default function HistoryLogs({
  profile,
  dailyLogs,
  weightLogs,
  workoutLogs,
  assessments,
  onDeleteDailyLog,
  onImportData,
  onResetAllData
}: HistoryLogsProps) {
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sort daily logs by date descending
  const sortedDailyLogs = useMemo(() => {
    return [...dailyLogs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [dailyLogs]);

  // Export JSON Backup
  const handleExportJSON = () => {
    const backupData = {
      profile,
      dailyLogs,
      weightLogs,
      workoutLogs,
      assessments,
      _exportedAt: new Date().toISOString()
    };
    
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vitaltrack_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Export CSV Logs
  const handleExportCSV = () => {
    if (dailyLogs.length === 0) {
      alert("No daily logs available to export.");
      return;
    }

    // Header row
    const headers = ["Date", "Sleep Hours", "Sleep Quality", "Water Intake (Glasses)", "Steps", "Exercise Mins", "Mood", "Stress Level", "Journal Notes"];
    
    // Data rows
    const rows = dailyLogs.map(log => [
      log.date,
      log.sleepHours,
      log.sleepQuality,
      log.waterIntake,
      log.steps,
      log.exerciseMins,
      log.mood,
      log.stressLevel,
      `"${log.journalNotes.replace(/"/g, '""')}"` // Escape double quotes for CSV safety
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", encodedUri);
    downloadAnchor.setAttribute("download", `vitaltrack_daily_logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handle Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (imported.profile && imported.dailyLogs && imported.weightLogs && imported.workoutLogs) {
          onImportData({
            profile: imported.profile,
            dailyLogs: imported.dailyLogs,
            weightLogs: imported.weightLogs,
            workoutLogs: imported.workoutLogs,
            assessments: imported.assessments || []
          });
          alert("Backup data imported and restored successfully!");
        } else {
          alert("Invalid backup file. Make sure it contains profile, dailyLogs, and historical registries.");
        }
      } catch (err) {
        alert("Failed to parse JSON file. The file may be corrupt.");
      }
    };
    reader.readAsText(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Confirm Reset
  const handleResetConfirm = () => {
    const firstConfirm = window.confirm("Are you absolutely sure you want to clear all VitalTrack profiles, logs, and workout history? This cannot be undone.");
    if (firstConfirm) {
      const secondConfirm = window.confirm("Please confirm a second time: This will permanently delete your local databases.");
      if (secondConfirm) {
        onResetAllData();
        alert("All VitalTrack data has been cleared from local storage.");
      }
    }
  };

  // Helper for rendering mood emoji
  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case 'sad': return '😢';
      case 'neutral': return '😐';
      case 'happy': return '🙂';
      case 'joy': return '😀';
      case 'excited': return '🔥';
      default: return '😐';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Portability Command Deck */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Backup & Portability */}
        <div className="bg-white rounded-[24px] border border-slate-200 p-6 space-y-4 shadow-none">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-1.5">
              <HardDrive className="w-5.5 h-5.5 text-emerald-500" />
              Data Portability
            </h3>
            <p className="text-xs text-gray-400">Save backups or download logs for secondary spreadsheets.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              id="export-json-btn"
              onClick={handleExportJSON}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-xl transition"
            >
              <Download className="w-4 h-4" />
              Export JSON
            </button>

            <button
              id="export-csv-btn"
              onClick={handleExportCSV}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-sky-50 hover:bg-sky-100 border border-sky-100 text-sky-700 text-xs font-bold rounded-xl transition"
            >
              <Download className="w-4 h-4" />
              Export CSV (Daily)
            </button>
          </div>

          <div className="border-t border-gray-100 pt-4 flex gap-3">
            <button
              id="import-json-btn"
              onClick={triggerFileSelect}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 text-xs font-bold rounded-xl transition"
            >
              <Upload className="w-4 h-4" />
              Import Backup
            </button>
            <input 
              id="import-json-file"
              type="file" 
              ref={fileInputRef}
              onChange={handleImportJSON}
              className="hidden" 
              accept=".json"
            />
            <p className="text-[10px] text-gray-400 leading-normal flex items-center">
              Restoring a backup will overwrite current profile and history databases.
            </p>
          </div>
        </div>

        {/* Destructive Clear Zone */}
        <div className="bg-red-50/20 rounded-[24px] border border-red-150/40 p-6 space-y-4 shadow-none flex flex-col justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-rose-950 flex items-center gap-1.5">
              <AlertOctagon className="w-5.5 h-5.5 text-rose-500" />
              System Clear Settings
            </h3>
            <p className="text-xs text-rose-800">Irreversible clearing protocols for local databases.</p>
          </div>

          <p className="text-[11px] text-rose-700/95 leading-relaxed">
            Selecting "Clear Local Databases" will wipe all stored profile records, body metric records, sleep patterns, steps, and mental journals completely from your local browser caching directories.
          </p>

          <button
            id="reset-database-btn"
            onClick={handleResetConfirm}
            className="w-full py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition shadow-md"
          >
            Clear Local Databases Permanently
          </button>
        </div>
      </div>

      {/* Complete check-in logs table history */}
      <div className="bg-white rounded-[24px] border border-slate-200 p-6 shadow-none">
        <div className="space-y-1 mb-4">
          <h4 className="font-bold text-gray-800 text-base">Check-In Logs Archives</h4>
          <p className="text-xs text-gray-400">Chronological list of all daily logs logged on this device.</p>
        </div>

        <div className="overflow-x-auto">
          {sortedDailyLogs.length > 0 ? (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3 text-center">Mood</th>
                  <th className="py-2.5 px-3 text-center">Stress</th>
                  <th className="py-2.5 px-3 text-center">Sleep</th>
                  <th className="py-2.5 px-3 text-center">Water</th>
                  <th className="py-2.5 px-3 text-center">Steps</th>
                  <th className="py-2.5 px-3 text-center">Exercise</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs">
                {sortedDailyLogs.map((log) => (
                  <tr key={log.date} className="hover:bg-gray-50/50 transition">
                    <td className="py-3.5 px-3 font-semibold font-mono text-gray-600">
                      {log.date}
                    </td>
                    <td className="py-3.5 px-3 text-center text-lg leading-none">
                      <span title={log.mood}>{getMoodEmoji(log.mood)}</span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold text-gray-700">
                      {log.stressLevel} / 5
                    </td>
                    <td className="py-3.5 px-3 text-center text-gray-600">
                      <span className="font-bold font-mono text-gray-800">{log.sleepHours}</span> hrs <span className="text-[10px] text-gray-400 block font-medium">({log.sleepQuality})</span>
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold font-mono text-blue-700">
                      {log.waterIntake} gls
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold font-mono text-gray-700">
                      {log.steps.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold font-mono text-emerald-700">
                      {log.exerciseMins} mins
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <button
                        id={`delete-daily-log-${log.date}-btn`}
                        onClick={() => onDeleteDailyLog(log.date)}
                        className="p-1.5 bg-gray-50 hover:bg-rose-50 hover:text-rose-600 border border-gray-100 hover:border-rose-100 text-gray-400 rounded-lg transition"
                        title="Delete log"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-12 text-gray-400 text-xs">
              No daily logs recorded yet. Proceed to "Daily Check-in" tab to begin tracking habits.
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
