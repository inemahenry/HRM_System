import { useMemo, useState } from "react";
import { FiCalendar, FiFileText, FiGlobe, FiHome, FiPhone, FiSave, FiUser, FiX } from "react-icons/fi";

const today = () => new Date().toISOString().slice(0, 10);

const initialFormValues = (values = {}) => ({
  name: values.name ?? values.fullName ?? "",
  phone: values.phone ?? values.phoneNumber ?? "",
  nationality: values.nationality ?? "",
  identityNumber: values.identityNumber ?? values.idNumber ?? "",
  villaNumber: values.villaNumber ?? "",
  checkInDate: values.checkInDate ?? today(),
  checkOutDate: values.checkOutDate ?? "",
  stayType: values.stayType === "OPEN_STAY" ? "OPEN_STAY" : "FIXED_STAY",
  notes: values.notes ?? "",
  paymentStatus: values.paymentStatus ?? "DUE",
});

const fieldClass = "mt-2 w-full rounded-xl border border-line bg-white px-3 py-2.5 text-sm text-ink outline-none transition focus:border-hallmark focus:ring-4 focus:ring-hallmark/10";

function Field({ children, label, icon: Icon, required = false }) {
  return (
    <label className="block text-sm font-medium text-ink">
      <span className="flex items-center gap-2"><Icon className="text-hallmark" />{label}{required && <span className="text-negative">*</span>}</span>
      {children}
    </label>
  );
}

export default function GuestForm({ initialValues, villas = [], guests = [], currentGuestId, onSubmit, onCancel, isSubmitting = false, submitLabel = "Save Guest" }) {
  const [values, setValues] = useState(() => initialFormValues(initialValues));
  const [error, setError] = useState("");

  const villaOptions = useMemo(() => {
    if (!values.checkInDate) {
      return [];
    }

    const requestedEndDate = values.stayType === "OPEN_STAY" ? "9999-12-31" : values.checkOutDate;

    return villas
      .filter((villa) => villa.rentable !== false && String(villa.number) !== "14")
      .filter((villa) => ["VACANT", "AVAILABLE"].includes(String(villa.status || "").toUpperCase()))
      .filter((villa) => !guests.some((guest) => {
        if (String(guest.id) === String(currentGuestId) || guest.stayStatus !== "BOOKED") {
          return false;
        }
        if (String(guest.villaNumber) !== String(villa.number) || !guest.checkInDate) {
          return false;
        }
        const guestEndDate = guest.stayType === "OPEN_STAY" || !guest.checkOutDate ? "9999-12-31" : guest.checkOutDate;
        if (!requestedEndDate) {
          return guest.checkInDate <= values.checkInDate && values.checkInDate < guestEndDate;
        }
        return guest.checkInDate < requestedEndDate && values.checkInDate < guestEndDate;
      }))
      .sort((left, right) => Number(left.number) - Number(right.number));
  }, [currentGuestId, guests, values.checkInDate, values.checkOutDate, values.stayType, villas]);

  const setValue = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({
      ...current,
      [name]: value,
      ...(name === "stayType" && value === "OPEN_STAY" ? { checkOutDate: "", villaNumber: "" } : {}),
      ...(name === "checkInDate" || name === "checkOutDate" ? { villaNumber: "" } : {}),
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const requiredValues = [values.name, values.phone, values.nationality, values.identityNumber, values.villaNumber, values.checkInDate];
    if (requiredValues.some((value) => !String(value).trim())) {
      setError("Complete the required guest details before saving.");
      return;
    }
    if (!currentGuestId && values.checkInDate < today()) {
      setError("Check-in date cannot be in the past.");
      return;
    }
    if (values.stayType === "FIXED_STAY" && !values.checkOutDate) {
      setError("Fixed stays require an expected check-out date.");
      return;
    }
    if (values.stayType === "FIXED_STAY" && values.checkOutDate <= values.checkInDate) {
      setError("Expected check-out must be after check-in.");
      return;
    }
    setError("");
    onSubmit?.({ ...values, checkOutDate: values.stayType === "OPEN_STAY" ? "" : values.checkOutDate, name: values.name.trim(), phone: values.phone.trim(), nationality: values.nationality.trim(), identityNumber: values.identityNumber.trim(), notes: values.notes.trim() });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 lg:p-8">
      <div className="grid gap-5 md:grid-cols-2">
        <Field label="Guest name" icon={FiUser} required>
          <input name="name" value={values.name} onChange={setValue} className={fieldClass} autoComplete="name" />
        </Field>
        <Field label="Phone number" icon={FiPhone} required>
          <input name="phone" value={values.phone} onChange={setValue} className={fieldClass} inputMode="tel" autoComplete="tel" />
        </Field>
        <Field label="Nationality" icon={FiGlobe} required>
          <input name="nationality" value={values.nationality} onChange={setValue} className={fieldClass} />
        </Field>
        <Field label="ID or passport" icon={FiUser} required>
          <input name="identityNumber" value={values.identityNumber} onChange={setValue} className={fieldClass} />
        </Field>
        <Field label="Villa" icon={FiHome} required>
          <select name="villaNumber" value={values.villaNumber} onChange={setValue} className={fieldClass}>
            <option value="">Select an available villa</option>
            {villaOptions.map((villa) => <option key={villa.id} value={villa.number}>Villa {villa.number}</option>)}
          </select>
          <span className="mt-1 block text-xs text-muted">Available villas are based on the selected stay dates.</span>
        </Field>
        <Field label="Check-in date" icon={FiCalendar} required>
          <input name="checkInDate" type="date" min={currentGuestId ? undefined : today()} value={values.checkInDate} onChange={setValue} className={fieldClass} />
        </Field>
        <Field label="Stay type" icon={FiCalendar} required>
          <select name="stayType" value={values.stayType} onChange={setValue} className={fieldClass}>
            <option value="FIXED_STAY">Fixed Stay</option>
            <option value="OPEN_STAY">Open Stay</option>
          </select>
        </Field>
        {values.stayType === "FIXED_STAY" && <Field label="Expected check-out date" icon={FiCalendar} required>
          <input name="checkOutDate" type="date" min={values.checkInDate} value={values.checkOutDate} onChange={setValue} className={fieldClass} />
        </Field>}
      </div>

      <Field label="Notes" icon={FiFileText}>
        <textarea name="notes" value={values.notes} onChange={setValue} className={`${fieldClass} min-h-28`} placeholder="Optional reception notes" />
      </Field>

      {error && <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
        <button type="button" disabled={isSubmitting} onClick={() => onCancel?.()} className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-muted hover:bg-slate-100"><FiX />Cancel</button>
        <button type="submit" disabled={isSubmitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-hallmark px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"><FiSave />{isSubmitting ? "Saving..." : submitLabel}</button>
      </div>
    </form>
  );
}
