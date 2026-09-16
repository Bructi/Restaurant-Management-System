import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { subscribeRealtime } from '../../hooks/useRealtimeSync';
import { useToast } from '../../contexts/ToastContext';
import { downloadCsv } from '../../utils/exportUtils';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  department: 'Management' | 'Kitchen' | 'Service' | 'Cashier';
  clockInTime: string;
  status: 'active' | 'break' | 'off';
  station: string;
  pinAuthLevel: 'Master (L4)' | 'Supervisor (L3)' | 'Floor (L2)' | 'KDS Only (L1)';
  tipsEarned: number;
}

const MOCK_STAFF: StaffMember[] = [
  {
    id: 'EMP-001',
    name: 'Aniket Sharma',
    role: 'General Manager',
    department: 'Management',
    clockInTime: '17:30 IST',
    status: 'active',
    station: 'Operations Dispatch Hub',
    pinAuthLevel: 'Master (L4)',
    tipsEarned: 0,
  },
  {
    id: 'EMP-004',
    name: 'Chef Harish Rawat',
    role: 'Executive Head Chef',
    department: 'Kitchen',
    clockInTime: '17:00 IST',
    status: 'active',
    station: 'Curry & Master Station',
    pinAuthLevel: 'Supervisor (L3)',
    tipsEarned: 640,
  },
  {
    id: 'EMP-012',
    name: 'Sunil Rathod',
    role: 'Lead Floor Captain',
    department: 'Service',
    clockInTime: '17:45 IST',
    status: 'active',
    station: 'Main Dining Hall (T01-T12)',
    pinAuthLevel: 'Supervisor (L3)',
    tipsEarned: 820,
  },
  {
    id: 'EMP-018',
    name: 'Meera Kumari',
    role: 'Cashier & POS Lead',
    department: 'Cashier',
    clockInTime: '18:00 IST',
    status: 'active',
    station: 'Billing Counter POS 01',
    pinAuthLevel: 'Floor (L2)',
    tipsEarned: 520,
  },
  {
    id: 'EMP-022',
    name: 'Rajesh Paswan',
    role: 'Senior Server',
    department: 'Service',
    clockInTime: '18:10 IST',
    status: 'active',
    station: 'Terrace & Lounge (T13-T24)',
    pinAuthLevel: 'Floor (L2)',
    tipsEarned: 740,
  },
];

export const StaffManagementView: React.FC = () => {
  const toast = useToast();
  const [staffList, setStaffList] = useState<StaffMember[]>(MOCK_STAFF);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddStaffOpen, setIsAddStaffOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffRole, setNewStaffRole] = useState('Junior Server');
  const [newStaffDept, setNewStaffDept] = useState<'Management' | 'Kitchen' | 'Service' | 'Cashier'>('Service');
  const [newStaffStation, setNewStaffStation] = useState('Main Dining Hall');
  const [newStaffAuth, setNewStaffAuth] = useState<'Master (L4)' | 'Supervisor (L3)' | 'Floor (L2)' | 'KDS Only (L1)'>('Floor (L2)');

  const fetchStaff = () => {
    api.getStaff().then((res) => {
      if (res.success && res.data && res.data.length > 0) {
        setStaffList(res.data);
      }
    }).catch(() => {});
  };

  useEffect(() => {
    fetchStaff();

    const unsub = subscribeRealtime((event) => {
      if (event.type === 'STAFF_ADDED' || event.type === 'STAFF_CLOCK_IN') {
        fetchStaff();
      }
    });

    return () => unsub();
  }, []);

  const filteredStaff = staffList.filter((s) => {
    if (roleFilter !== 'all' && s.department.toLowerCase() !== roleFilter) return false;
    if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase()) && !s.id.includes(searchQuery)) {
      return false;
    }
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-16 space-y-space-md">
      {/* Top Hero & Header */}
      <div className="flex flex-col gap-space-sm pt-2">
        <div className="flex flex-wrap items-center justify-between gap-y-space-xs">
          <div className="flex items-center gap-space-xs text-on-surface-variant font-label-sm text-label-sm uppercase tracking-widest font-semibold">
            <span className="text-primary font-bold">Human Resources &amp; Floor Roster</span>
            <span>•</span>
            <span className="text-on-surface-variant">SpiceRoute Kitchen #01 (MG Road)</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-secondary px-2 py-0.5 rounded-full bg-secondary/10 font-mono-metric text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
              Terminal Sync: OK
            </span>
          </div>
          <div className="font-mono-metric text-on-surface-variant text-[12px] flex items-center gap-2">
            <span>Shift Window: 18:00 – 23:30 IST</span>
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-bold text-[11px]">
              PEAK DINNER
            </span>
          </div>
        </div>

        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-space-md">
          <div>
            <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
              Staff Shift Rostering &amp; Role Permissions
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5 max-w-3xl">
              Manage live dining room floor rosters, clock-in compliance, POS terminal encrypted PIN security, role-based access control, and shift tip-pool distribution.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-space-sm shrink-0">
            <button
              onClick={() => {
                const headers = [
                  'Employee ID',
                  'Staff Full Name',
                  'Designation / Role',
                  'Department',
                  'Assigned Station',
                  'Shift Clock-in',
                  'Current Status',
                  'Shift Tips Earned (INR)',
                  'PIN Authorization Level',
                ];
                const rows = staffList.map((s) => [
                  s.id,
                  s.name,
                  s.role,
                  s.department,
                  s.station,
                  s.clockInTime,
                  s.status.toUpperCase(),
                  s.tipsEarned,
                  s.pinAuthLevel,
                ]);
                downloadCsv('restoflow-staff-roster.csv', headers, rows);
                toast.success(`Exported ${staffList.length} staff roster members to CSV!`, 'Roster Exported');
              }}
              className="flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors font-label-md text-label-md shadow-sm border border-surface-container-high/40 font-semibold"
            >
              <span className="material-symbols-outlined text-[18px] text-tertiary">download</span>
              <span>Export Roster</span>
            </button>
            <button
              onClick={() => toast.info('Opening Monthly Shift Calendar...', 'Shift Schedule')}
              className="flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors font-label-md text-label-md shadow-sm border border-surface-container-high/40 font-semibold"
            >
              <span className="material-symbols-outlined text-[18px] text-primary">calendar_month</span>
              <span>Shift Schedule</span>
            </button>
            <button
              onClick={() => toast.success('Tip Pool: ₹3,840 calculated & distributed among 12 floor staff.', 'Tip Pool')}
              className="flex items-center gap-space-xs px-space-md py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-colors font-label-md text-label-md shadow-sm border border-surface-container-high/40 font-semibold"
            >
              <span className="material-symbols-outlined text-[18px] text-secondary">payments</span>
              <span>Tip Pool Calc</span>
            </button>
            <button
              onClick={() => setIsAddStaffOpen(true)}
              className="flex items-center gap-space-xs px-space-lg py-2.5 rounded-lg bg-primary-container text-on-primary-container hover:brightness-110 transition-all font-label-lg font-bold shadow-md"
            >
              <span className="material-symbols-outlined text-[20px]">person_add</span>
              <span>+ Add Staff Member</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
        <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between border border-surface-container-high/30">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm uppercase tracking-wider font-semibold">Active On Floor</span>
            <span className="material-symbols-outlined text-secondary text-[20px]">badge</span>
          </div>
          <div className="mt-2">
            <span className="font-display-lg text-display-lg text-on-surface font-black">14 / 18</span>
            <span className="block text-xs text-secondary font-semibold mt-1">● Full floor coverage</span>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between border border-surface-container-high/30">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm uppercase tracking-wider font-semibold">Labour Cost Run-Rate</span>
            <span className="material-symbols-outlined text-primary text-[20px]">payments</span>
          </div>
          <div className="mt-2">
            <span className="font-display-lg text-display-lg text-primary font-black">₹9,450</span>
            <span className="block text-xs text-on-surface-variant mt-1">9.6% of shift revenue</span>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between border border-surface-container-high/30">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm uppercase tracking-wider font-semibold">Biometric Verified</span>
            <span className="material-symbols-outlined text-secondary text-[20px]">fingerprint</span>
          </div>
          <div className="mt-2">
            <span className="font-display-lg text-display-lg text-secondary font-black">100%</span>
            <span className="block text-xs text-secondary font-semibold mt-1">Zero punch anomalies</span>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between border border-surface-container-high/30">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm uppercase tracking-wider font-semibold">Shift Tips Pool</span>
            <span className="material-symbols-outlined text-tertiary text-[20px]">volunteer_activism</span>
          </div>
          <div className="mt-2">
            <span className="font-display-lg text-display-lg text-tertiary font-black">₹3,840</span>
            <span className="block text-xs text-tertiary font-semibold mt-1">Auto-distributed by pax</span>
          </div>
        </div>

        <div className="p-space-md rounded-xl bg-surface-container-low shadow-sm flex flex-col justify-between border border-surface-container-high/30">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-sm uppercase tracking-wider font-semibold">Overtime Hours</span>
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">more_time</span>
          </div>
          <div className="mt-2">
            <span className="font-display-lg text-display-lg text-on-surface font-black">2.5 hrs</span>
            <span className="block text-xs text-on-surface-variant mt-1">1.5x weekend allowance</span>
          </div>
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="bg-surface-container-low rounded-2xl p-space-md shadow-sm flex flex-col gap-4 border border-surface-container-high/30">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
              search
            </span>
            <input
              type="text"
              placeholder="Search staff by name, role, or employee ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-container-lowest text-on-surface placeholder:text-on-surface-variant rounded-lg font-body-sm text-body-sm outline-none focus:ring-1 focus:ring-primary-container border border-surface-container-high/40"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-surface-container-lowest rounded-lg border border-surface-container-high/40">
            {['all', 'management', 'service', 'kitchen', 'cashier'].map((d) => (
              <button
                key={d}
                onClick={() => setRoleFilter(d)}
                className={`px-3 py-1 rounded-md text-xs font-bold uppercase transition-all ${
                  roleFilter === d
                    ? 'bg-primary-container text-on-primary-container'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-body-sm">
            <thead className="bg-surface-container-lowest text-on-surface-variant uppercase text-xs tracking-wider border-b border-surface-container-high/40 font-semibold">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-3">Designation</th>
                <th className="py-3 px-3">Station Assigned</th>
                <th className="py-3 px-3">Clock-In</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">POS Auth Level</th>
                <th className="py-3 px-3">Tips Share</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container-high/20">
              {filteredStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-surface-container transition-colors">
                  <td className="py-3.5 px-4 font-bold text-on-surface">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-container/20 text-primary flex items-center justify-center font-bold text-sm">
                        {staff.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span>{staff.name}</span>
                        <span className="text-xs text-on-surface-variant font-mono-metric font-normal">
                          {staff.id}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-3 text-on-surface font-medium">{staff.role}</td>
                  <td className="py-3.5 px-3 text-on-surface-variant text-xs">{staff.station}</td>
                  <td className="py-3.5 px-3 font-mono-metric text-on-surface-variant">
                    {staff.clockInTime}
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary text-xs font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                      ON DUTY
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 rounded bg-surface-container-high font-mono-metric text-xs text-on-surface font-semibold">
                      {staff.pinAuthLevel}
                    </span>
                  </td>
                  <td className="py-3.5 px-3 font-mono-metric text-secondary font-bold">
                    ₹{staff.tipsEarned}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={async () => {
                          const newPin = prompt(`Enter new 4-digit PIN for ${staff.name}:`, '1234');
                          if (newPin) {
                            try {
                              await api.updateStaffPin(staff.id, newPin);
                              toast.success(`Security PIN updated for ${staff.name}`, 'PIN Updated');
                            } catch (err: any) {
                              toast.error(err.message || 'Error updating PIN', 'Failed');
                            }
                          }
                        }}
                        className="px-2.5 py-1 rounded bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface"
                      >
                        PIN
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            await api.clockInStaff(staff.id);
                            toast.success(`${staff.name} clocked in successfully!`, 'Clock-In');
                            fetchStaff();
                          } catch (err: any) {
                            toast.error(err.message || 'Error clocking in', 'Failed');
                          }
                        }}
                        className="px-2.5 py-1 rounded bg-primary-container text-on-primary-container text-xs font-bold hover:brightness-110"
                      >
                        Clock-In
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddStaffOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-surface-container rounded-2xl p-space-lg shadow-2xl border border-surface-container-high flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-surface-container-high/40 pb-3">
              <h3 className="font-headline-md font-bold text-on-surface">Add Employee / Staff</h3>
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            <div className="flex flex-col gap-3 font-body-sm">
              <div>
                <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                  Employee Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Varun Grover"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                    Role Title
                  </label>
                  <input
                    type="text"
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value)}
                    className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                    Department
                  </label>
                  <select
                    value={newStaffDept}
                    onChange={(e) => setNewStaffDept(e.target.value as any)}
                    className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                  >
                    <option value="Service">Service</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Cashier">Cashier</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                    Station Area
                  </label>
                  <input
                    type="text"
                    value={newStaffStation}
                    onChange={(e) => setNewStaffStation(e.target.value)}
                    className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase text-on-surface-variant block mb-1">
                    PIN Auth Level
                  </label>
                  <select
                    value={newStaffAuth}
                    onChange={(e) => setNewStaffAuth(e.target.value as any)}
                    className="w-full bg-surface-container-lowest p-2.5 rounded-lg text-on-surface border border-surface-container-high/40 outline-none"
                  >
                    <option value="Floor (L2)">Floor (L2)</option>
                    <option value="Supervisor (L3)">Supervisor (L3)</option>
                    <option value="Master (L4)">Master (L4)</option>
                    <option value="KDS Only (L1)">KDS Only (L1)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-surface-container-high/40">
              <button
                onClick={() => setIsAddStaffOpen(false)}
                className="px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (!newStaffName) {
                    toast.warning('Please enter staff name', 'Missing Name');
                    return;
                  }
                  try {
                    await api.addStaff({
                      name: newStaffName,
                      role: newStaffRole,
                      department: newStaffDept,
                      station: newStaffStation,
                      pinAuthLevel: newStaffAuth,
                    });
                    setIsAddStaffOpen(false);
                    setNewStaffName('');
                    toast.success(`Staff member ${newStaffName} (${newStaffRole}) added to roster!`, 'Staff Added');
                    fetchStaff();
                  } catch (err: any) {
                    toast.error(err.message || 'Error adding staff', 'Failed');
                  }
                }}
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary-container text-sm font-bold shadow-md hover:brightness-110"
              >
                Add Staff Member
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
