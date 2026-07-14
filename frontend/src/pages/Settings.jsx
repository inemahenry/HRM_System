import { useState } from 'react';
import { FaCog, FaSave, FaShieldAlt } from 'react-icons/fa';
import AppLayout from '../components/AppLayout';
import PageHeader from '../components/PageHeader';
import { useGuests } from '../hooks/useGuests';

const paymentMethods = ["Cash", "Mobile Money", "Bank Transfer", "Credit/Debit Card"];

export default function Settings() {
  const { settings, updateSettings, backupData, restoreBackup } = useGuests();
  const [companyName, setCompanyName] = useState(settings.companyName || 'Hallmark Residences');
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter || 'Thank you for staying with Hallmark Residences.');
  const [currency, setCurrency] = useState(settings.currency || 'USD');
  const [activeMethods, setActiveMethods] = useState(settings.paymentMethods || paymentMethods);
  const [autoBackup, setAutoBackup] = useState(Boolean(settings.systemPreferences?.autoBackup));
  const [managerApproval, setManagerApproval] = useState(Boolean(settings.systemPreferences?.requireManagerApprovalOnCheckout));
  const [showNotifications, setShowNotifications] = useState(Boolean(settings.systemPreferences?.showNotifications));

  const handleSave = () => {
    updateSettings({
      companyName,
      receiptFooter,
      currency,
      paymentMethods: activeMethods,
      systemPreferences: {
        autoBackup,
        requireManagerApprovalOnCheckout: managerApproval,
        showNotifications,
      },
    });
  };

  const handleRestore = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          restoreBackup(JSON.parse(reader.result));
        } catch (error) {
          console.error('Unable to restore backup', error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <AppLayout title="Settings" eyebrow="SYSTEM PREFERENCES">
      <PageHeader
        eyebrow="Application settings"
        title="System preferences"
        description="Manage company details, payment methods, backups, and operational preferences from one secure console."
      />

      <section className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="rounded-2xl border border-line bg-surface p-6 shadow-[0_8px_30px_rgba(31,41,55,0.055)]">
          <h2 className="text-lg font-semibold text-ink">General settings</h2>
          <p className="mt-2 text-sm text-muted">Control the application behavior and operational defaults for Hallmark Residences.</p>
          <div className="mt-6 space-y-4">
            <div className="rounded-3xl border border-line bg-white p-4">
              <label className="block text-sm font-semibold text-ink">Company information</label>
              <input value={companyName} onChange={(event) => setCompanyName(event.target.value)} className="mt-3 w-full rounded-xl border border-line px-3 py-2.5 text-sm" />
              <input value={receiptFooter} onChange={(event) => setReceiptFooter(event.target.value)} className="mt-3 w-full rounded-xl border border-line px-3 py-2.5 text-sm" placeholder="Receipt footer" />
              <input value={currency} onChange={(event) => setCurrency(event.target.value)} className="mt-3 w-full rounded-xl border border-line px-3 py-2.5 text-sm" placeholder="Currency" />
            </div>
            <div className="rounded-3xl border border-line bg-white p-4">
              <p className="text-sm font-semibold text-ink">Payment methods</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {paymentMethods.map((method) => {
                  const selected = activeMethods.includes(method);
                  return (
                    <button key={method} type="button" onClick={() => setActiveMethods((current) => selected ? current.filter((item) => item !== method) : [...current, method])} className={`rounded-full px-3 py-2 text-sm font-semibold ${selected ? 'bg-hallmark text-white' : 'border border-line text-ink'}`}>
                      {method}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="rounded-3xl border border-line bg-white p-4">
              <p className="text-sm font-semibold text-ink">System preferences</p>
              <label className="mt-3 flex items-center justify-between gap-3 text-sm text-muted"><span>Automatic backup</span><input type="checkbox" checked={autoBackup} onChange={() => setAutoBackup((value) => !value)} /></label>
              <label className="mt-3 flex items-center justify-between gap-3 text-sm text-muted"><span>Manager approval for incomplete checkout</span><input type="checkbox" checked={managerApproval} onChange={() => setManagerApproval((value) => !value)} /></label>
              <label className="mt-3 flex items-center justify-between gap-3 text-sm text-muted"><span>Show notifications</span><input type="checkbox" checked={showNotifications} onChange={() => setShowNotifications((value) => !value)} /></label>
            </div>
            <button type="button" onClick={handleSave} className="inline-flex items-center gap-2 rounded-xl bg-hallmark px-4 py-3 text-sm font-semibold text-white">
              <FaSave /> Save settings
            </button>
          </div>
        </div>

        <aside className="rounded-2xl border border-line bg-surface p-6 shadow-[0_8px_30px_rgba(31,41,55,0.055)]">
          <div className="flex items-center gap-4">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-[#800C18]/10 text-hallmark">
              <FaCog aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-ink">System status</p>
              <p className="mt-1 text-sm text-muted">Hallmark backups and preferences are ready.</p>
            </div>
          </div>
          <div className="mt-6 rounded-3xl border border-line bg-white p-4">
            <p className="text-sm font-semibold text-ink">Backups</p>
            <p className="mt-1 text-sm text-muted">Create a manual export or restore from a saved Hallmark backup file.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={backupData} className="inline-flex items-center gap-2 rounded-xl bg-hallmark px-3 py-2 text-sm font-semibold text-white">Backup now</button>
              <button type="button" onClick={handleRestore} className="inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-semibold text-ink">Restore</button>
            </div>
          </div>
          <div className="mt-6 rounded-3xl border border-line bg-white p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink">
              <FaShieldAlt /> User management
            </div>
            <p className="mt-2 text-sm text-muted">Reception and manager roles are available from the Hallmark operations console.</p>
          </div>
        </aside>
      </section>
    </AppLayout>
  );
}
