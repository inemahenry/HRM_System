import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiCalendar,
  FiChevronDown,
  FiCreditCard,
  FiDollarSign,
  FiFileText,
  FiGlobe,
  FiHome,
  FiMail,
  FiPhone,
  FiRotateCcw,
  FiSave,
  FiUser,
  FiUsers,
  FiX,
} from "react-icons/fi";

const DEFAULT_FORM_VALUES = {
  name: "",
  phone: "",
  email: "",
  nationality: "",
  identityNumber: "",
  villaNumber: "",
  adults: "1",
  children: "0",
  checkInDate: "",
  checkOutDate: "",
  roomPrice: "",
  depositPaid: "",
  remainingBalance: 0,
  paymentMethod: "",
  paymentStatus: "Partial",
  stayStatus: "Reserved",
  notes: "",
};

const PAYMENT_METHODS = ["Cash", "Mobile Money", "Card", "Bank"];

const DEFAULT_VILLA_OPTIONS = Array.from({ length: 12 }, (_, index) => ({
  value: `Villa ${String(index + 1).padStart(2, "0")}`,
  label: `Villa ${String(index + 1).padStart(2, "0")}`,
  status: index === 6 ? "Maintenance" : "Available",
}));

function asInputValue(value, fallback = "") {
  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value);
}

function numberValue(value) {
  if (value === "" || value === null || value === undefined) {
    return Number.NaN;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : Number.NaN;
}

function calculateRemainingBalance(roomPrice, depositPaid) {
  const price = numberValue(roomPrice);
  const deposit = numberValue(depositPaid);

  if (!Number.isFinite(price)) {
    return 0;
  }

  return Math.max(price - (Number.isFinite(deposit) ? deposit : 0), 0);
}

function derivePaymentStatus(roomPrice, depositPaid, fallback = "Partial") {
  const price = numberValue(roomPrice);
  const deposit = numberValue(depositPaid);

  if (!Number.isFinite(price) || price <= 0 || !Number.isFinite(deposit)) {
    return fallback;
  }

  if (deposit <= 0) {
    return "Unpaid";
  }

  if (deposit >= price) {
    return "Paid";
  }

  return "Partial";
}

function mergeFormValues(source = {}) {
  const values = source || {};

  return {
    ...DEFAULT_FORM_VALUES,
    ...values,
    // These aliases make the form safe to use for existing guest records too.
    name: asInputValue(values.name ?? values.fullName ?? values.guestName),
    identityNumber: asInputValue(
      values.identityNumber ?? values.nationalId ?? values.passport,
    ),
    villaNumber: asInputValue(values.villaNumber ?? values.villaId ?? values.villa),
    phone: asInputValue(values.phone),
    email: asInputValue(values.email),
    nationality: asInputValue(values.nationality),
    adults: asInputValue(values.adults, "1"),
    children: asInputValue(values.children, "0"),
    checkInDate: asInputValue(values.checkInDate),
    checkOutDate: asInputValue(values.checkOutDate),
    roomPrice: asInputValue(values.roomPrice),
    depositPaid: asInputValue(values.depositPaid),
    paymentMethod: asInputValue(values.paymentMethod),
    paymentStatus: asInputValue(values.paymentStatus, "Partial"),
    stayStatus: asInputValue(values.stayStatus, "Reserved"),
    notes: asInputValue(values.notes),
  };
}

function normalizeVillaOption(villa) {
  if (typeof villa === "string" || typeof villa === "number") {
    const value = String(villa);
    return { value, label: value, status: "" };
  }

  if (!villa || typeof villa !== "object") {
    return null;
  }

  const value = asInputValue(
    villa.value ?? villa.number ?? villa.villaNumber ?? villa.id ?? villa.name,
  );

  if (!value) {
    return null;
  }

  return {
    value,
    label: asInputValue(villa.label ?? villa.number ?? villa.villaNumber ?? villa.name, value),
    status: asInputValue(villa.status),
  };
}

function withDerivedValues(values) {
  const mergedValues = mergeFormValues(values);

  return {
    ...mergedValues,
    remainingBalance: calculateRemainingBalance(
      mergedValues.roomPrice,
      mergedValues.depositPaid,
    ),
    paymentStatus: derivePaymentStatus(
      mergedValues.roomPrice,
      mergedValues.depositPaid,
      mergedValues.paymentStatus,
    ),
  };
}

function validateGuest(values) {
  const errors = {};
  const phoneDigits = values.phone.replace(/\D/g, "");
  const adults = numberValue(values.adults);
  const children = numberValue(values.children);
  const roomPrice = numberValue(values.roomPrice);
  const depositPaid = numberValue(values.depositPaid);

  if (!values.name.trim()) {
    errors.name = "Enter the guest's full name.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Enter a phone number.";
  } else if (phoneDigits.length < 7) {
    errors.phone = "Enter a valid phone number.";
  }

  if (!values.email.trim()) {
    errors.email = "Enter the guest's email address.";
  } else if (!/^\S+@\S+\.\S+$/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.nationality.trim()) {
    errors.nationality = "Select or enter a nationality.";
  }

  if (!values.identityNumber.trim()) {
    errors.identityNumber = "Enter a National ID or passport number.";
  }

  if (!values.villaNumber.trim()) {
    errors.villaNumber = "Select a villa number.";
  }

  if (!Number.isFinite(adults) || adults < 1 || !Number.isInteger(adults)) {
    errors.adults = "At least one adult is required.";
  }

  if (!Number.isFinite(children) || children < 0 || !Number.isInteger(children)) {
    errors.children = "Enter 0 or more children.";
  }

  if (!values.checkInDate) {
    errors.checkInDate = "Select a check-in date.";
  }

  if (!values.checkOutDate) {
    errors.checkOutDate = "Select a check-out date.";
  } else if (values.checkInDate && values.checkOutDate <= values.checkInDate) {
    errors.checkOutDate = "Check-out must be after check-in.";
  }

  if (!Number.isFinite(roomPrice) || roomPrice <= 0) {
    errors.roomPrice = "Enter a room price greater than 0.";
  }

  if (!Number.isFinite(depositPaid) || depositPaid < 0) {
    errors.depositPaid = "Enter a valid deposit amount.";
  } else if (Number.isFinite(roomPrice) && depositPaid > roomPrice) {
    errors.depositPaid = "Deposit cannot be greater than the room price.";
  }

  if (!values.paymentMethod) {
    errors.paymentMethod = "Choose a payment method.";
  }

  return errors;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function FormField({
  children,
  error,
  icon: Icon,
  id,
  label,
  required = false,
}) {
  return (
    <div className="group min-w-0">
      <label
        className="mb-2 flex items-center gap-1 text-sm font-semibold text-ink"
        htmlFor={id}
      >
        {label}
        {required && <span className="text-negative">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-4 z-10 -translate-y-1/2 text-lg text-muted transition-colors duration-200 group-focus-within:text-hallmark"
          />
        )}
        {children}
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-medium text-negative" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

/**
 * A reusable guest check-in form. It manages its own form state by default.
 * Pass `values` and `onChange(nextValues, change)` to use it as a controlled form.
 * `villas` may contain villa strings or objects with number/value and status fields.
 */
export default function GuestForm({
  initialValues = {},
  values,
  villas,
  onChange,
  onSubmit,
  onCancel,
  onReset,
  isSubmitting = false,
  submitLabel = "Save Guest",
  className = "",
}) {
  const isControlled = values !== undefined;
  const initialValuesKey = JSON.stringify(initialValues || {});
  const previousInitialValuesKey = useRef(initialValuesKey);
  const [managedValues, setManagedValues] = useState(() =>
    withDerivedValues(initialValues),
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isControlled && previousInitialValuesKey.current !== initialValuesKey) {
      setManagedValues(withDerivedValues(initialValues));
      setErrors({});
    }

    previousInitialValuesKey.current = initialValuesKey;
  }, [initialValues, initialValuesKey, isControlled]);

  const formValues = useMemo(
    () => withDerivedValues(isControlled ? values : managedValues),
    [isControlled, managedValues, values],
  );

  const villaOptions = useMemo(() => {
    const sourceOptions = Array.isArray(villas) && villas.length ? villas : DEFAULT_VILLA_OPTIONS;
    const options = sourceOptions.map(normalizeVillaOption).filter(Boolean);
    const uniqueOptions = options.filter(
      (option, index) => options.findIndex((item) => item.value === option.value) === index,
    );

    if (
      formValues.villaNumber &&
      !uniqueOptions.some((option) => option.value === formValues.villaNumber)
    ) {
      uniqueOptions.unshift({
        value: formValues.villaNumber,
        label: formValues.villaNumber,
        status: "",
      });
    }

    return uniqueOptions;
  }, [formValues.villaNumber, villas]);

  const inputClass = (fieldName, additionalClasses = "") =>
    [
      "h-14 w-full rounded-xl border bg-surface py-3 pr-4 pl-11 text-[15px] text-ink outline-none transition-all duration-200 placeholder:text-slate-400",
      errors[fieldName]
        ? "border-negative ring-4 ring-negative/10"
        : "border-line hover:border-slate-300 focus:border-hallmark focus:ring-4 focus:ring-hallmark/10",
      additionalClasses,
    ].join(" ");

  const publishValues = (nextValues) => {
    const derivedValues = withDerivedValues(nextValues);

    if (!isControlled) {
      setManagedValues(derivedValues);
    }

    return derivedValues;
  };

  const clearErrorsFor = (fieldName) => {
    const relatedFields = {
      checkInDate: ["checkInDate", "checkOutDate"],
      checkOutDate: ["checkInDate", "checkOutDate"],
      roomPrice: ["roomPrice", "depositPaid"],
      depositPaid: ["roomPrice", "depositPaid"],
    };
    const fieldsToClear = relatedFields[fieldName] || [fieldName];

    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };
      fieldsToClear.forEach((field) => delete nextErrors[field]);
      return nextErrors;
    });
  };

  const handleValueChange = (event) => {
    const { name, value } = event.target;
    const nextValues = publishValues({ ...formValues, [name]: value });

    clearErrorsFor(name);
    onChange?.(nextValues, { name, value });
  };

  const handleBlur = (event) => {
    const { name } = event.target;
    const validationErrors = validateGuest(formValues);
    const relatedFields = {
      checkInDate: ["checkInDate", "checkOutDate"],
      checkOutDate: ["checkInDate", "checkOutDate"],
      roomPrice: ["roomPrice", "depositPaid"],
      depositPaid: ["roomPrice", "depositPaid"],
    };
    const fieldsToValidate = relatedFields[name] || [name];

    setErrors((currentErrors) => {
      const nextErrors = { ...currentErrors };

      fieldsToValidate.forEach((field) => {
        if (validationErrors[field]) {
          nextErrors[field] = validationErrors[field];
        } else {
          delete nextErrors[field];
        }
      });

      return nextErrors;
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validateGuest(formValues);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const submission = {
      ...formValues,
      name: formValues.name.trim(),
      phone: formValues.phone.trim(),
      email: formValues.email.trim(),
      nationality: formValues.nationality.trim(),
      identityNumber: formValues.identityNumber.trim(),
      villaNumber: formValues.villaNumber.trim(),
      adults: numberValue(formValues.adults),
      children: numberValue(formValues.children),
      roomPrice: numberValue(formValues.roomPrice),
      depositPaid: numberValue(formValues.depositPaid),
      remainingBalance: calculateRemainingBalance(
        formValues.roomPrice,
        formValues.depositPaid,
      ),
      paymentStatus: derivePaymentStatus(
        formValues.roomPrice,
        formValues.depositPaid,
        formValues.paymentStatus,
      ),
      notes: formValues.notes.trim(),
    };

    onSubmit?.(submission);
  };

  const handleReset = () => {
    const resetValues = withDerivedValues(initialValues);

    if (!isControlled) {
      setManagedValues(resetValues);
    }

    setErrors({});
    onChange?.(resetValues, { name: "reset", value: resetValues });
    onReset?.(resetValues);
  };

  return (
    <form
      className={`rounded-3xl border border-line bg-surface p-5 shadow-[0_18px_55px_rgba(31,41,55,0.07)] transition-shadow duration-300 sm:p-7 lg:p-8 ${className}`}
      noValidate
      onSubmit={handleSubmit}
    >
      <div className="mb-7 flex flex-col gap-2 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold tracking-[0.16em] text-hallmark uppercase">
            Guest registration
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
            New check-in details
          </h2>
          <p className="mt-1 text-sm text-muted">
            Complete the guest, stay and payment information below.
          </p>
        </div>
        <p className="text-xs font-medium text-muted">
          <span className="text-negative">*</span> Required fields
        </p>
      </div>

      <section aria-labelledby="guest-information-heading">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-hallmark/10 text-hallmark">
            <FiUser aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-semibold text-ink" id="guest-information-heading">
              Guest information
            </h3>
            <p className="text-xs text-muted">Personal and contact details</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2">
          <FormField error={errors.name} icon={FiUser} id="guest-name" label="Guest Name" required>
            <input
              aria-describedby={errors.name ? "guest-name-error" : undefined}
              aria-invalid={Boolean(errors.name)}
              autoComplete="name"
              className={inputClass("name")}
              id="guest-name"
              name="name"
              onBlur={handleBlur}
              onChange={handleValueChange}
              placeholder="Enter full name"
              type="text"
              value={formValues.name}
            />
          </FormField>

          <FormField error={errors.phone} icon={FiPhone} id="guest-phone" label="Phone" required>
            <input
              aria-describedby={errors.phone ? "guest-phone-error" : undefined}
              aria-invalid={Boolean(errors.phone)}
              autoComplete="tel"
              className={inputClass("phone")}
              id="guest-phone"
              name="phone"
              onBlur={handleBlur}
              onChange={handleValueChange}
              placeholder="e.g. +250 7xx xxx xxx"
              type="tel"
              value={formValues.phone}
            />
          </FormField>

          <FormField error={errors.email} icon={FiMail} id="guest-email" label="Email" required>
            <input
              aria-describedby={errors.email ? "guest-email-error" : undefined}
              aria-invalid={Boolean(errors.email)}
              autoComplete="email"
              className={inputClass("email")}
              id="guest-email"
              name="email"
              onBlur={handleBlur}
              onChange={handleValueChange}
              placeholder="guest@email.com"
              type="email"
              value={formValues.email}
            />
          </FormField>

          <FormField
            error={errors.nationality}
            icon={FiGlobe}
            id="guest-nationality"
            label="Nationality"
            required
          >
            <input
              aria-describedby={errors.nationality ? "guest-nationality-error" : undefined}
              aria-invalid={Boolean(errors.nationality)}
              className={inputClass("nationality")}
              id="guest-nationality"
              name="nationality"
              onBlur={handleBlur}
              onChange={handleValueChange}
              placeholder="e.g. Rwandan"
              type="text"
              value={formValues.nationality}
            />
          </FormField>

          <FormField
            error={errors.identityNumber}
            icon={FiCreditCard}
            id="guest-identity"
            label="National ID / Passport"
            required
          >
            <input
              aria-describedby={errors.identityNumber ? "guest-identity-error" : undefined}
              aria-invalid={Boolean(errors.identityNumber)}
              className={inputClass("identityNumber")}
              id="guest-identity"
              name="identityNumber"
              onBlur={handleBlur}
              onChange={handleValueChange}
              placeholder="Enter ID or passport number"
              type="text"
              value={formValues.identityNumber}
            />
          </FormField>

          <FormField error={errors.villaNumber} icon={FiHome} id="villa-number" label="Villa Number" required>
            <select
              aria-describedby={errors.villaNumber ? "villa-number-error" : undefined}
              aria-invalid={Boolean(errors.villaNumber)}
              className={inputClass("villaNumber", "appearance-none pr-11")}
              id="villa-number"
              name="villaNumber"
              onBlur={handleBlur}
              onChange={handleValueChange}
              value={formValues.villaNumber}
            >
              <option value="">Select a villa</option>
              {villaOptions.map((villa) => {
                const unavailable =
                  villa.status &&
                  villa.status !== "Available" &&
                  villa.value !== formValues.villaNumber;

                return (
                  <option disabled={unavailable} key={villa.value} value={villa.value}>
                    {villa.status ? `${villa.label} — ${villa.status}` : villa.label}
                  </option>
                );
              })}
            </select>
            <FiChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-lg text-muted"
            />
          </FormField>
        </div>
      </section>

      <section aria-labelledby="stay-information-heading" className="mt-9 border-t border-line pt-8">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-hallmark/10 text-hallmark">
            <FiCalendar aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-semibold text-ink" id="stay-information-heading">
              Stay information
            </h3>
            <p className="text-xs text-muted">Occupancy and reservation dates</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-5 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
          <FormField error={errors.adults} icon={FiUsers} id="guest-adults" label="Adults" required>
            <input
              aria-describedby={errors.adults ? "guest-adults-error" : undefined}
              aria-invalid={Boolean(errors.adults)}
              className={inputClass("adults")}
              id="guest-adults"
              min="1"
              name="adults"
              onBlur={handleBlur}
              onChange={handleValueChange}
              type="number"
              value={formValues.adults}
            />
          </FormField>

          <FormField error={errors.children} icon={FiUsers} id="guest-children" label="Children">
            <input
              aria-describedby={errors.children ? "guest-children-error" : undefined}
              aria-invalid={Boolean(errors.children)}
              className={inputClass("children")}
              id="guest-children"
              min="0"
              name="children"
              onBlur={handleBlur}
              onChange={handleValueChange}
              type="number"
              value={formValues.children}
            />
          </FormField>

          <FormField error={errors.checkInDate} icon={FiCalendar} id="check-in-date" label="Check-in Date" required>
            <input
              aria-describedby={errors.checkInDate ? "check-in-date-error" : undefined}
              aria-invalid={Boolean(errors.checkInDate)}
              className={inputClass("checkInDate")}
              id="check-in-date"
              name="checkInDate"
              onBlur={handleBlur}
              onChange={handleValueChange}
              type="date"
              value={formValues.checkInDate}
            />
          </FormField>

          <FormField error={errors.checkOutDate} icon={FiCalendar} id="check-out-date" label="Check-out Date" required>
            <input
              aria-describedby={errors.checkOutDate ? "check-out-date-error" : undefined}
              aria-invalid={Boolean(errors.checkOutDate)}
              className={inputClass("checkOutDate")}
              id="check-out-date"
              min={formValues.checkInDate || undefined}
              name="checkOutDate"
              onBlur={handleBlur}
              onChange={handleValueChange}
              type="date"
              value={formValues.checkOutDate}
            />
          </FormField>
        </div>
      </section>

      <section aria-labelledby="payment-information-heading" className="mt-9 border-t border-line pt-8">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-hallmark/10 text-hallmark">
            <FiDollarSign aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-semibold text-ink" id="payment-information-heading">
              Payment information
            </h3>
            <p className="text-xs text-muted">Record the reservation value and deposit</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2 xl:grid-cols-4">
          <FormField error={errors.roomPrice} icon={FiDollarSign} id="room-price" label="Room Price" required>
            <input
              aria-describedby={errors.roomPrice ? "room-price-error" : undefined}
              aria-invalid={Boolean(errors.roomPrice)}
              className={inputClass("roomPrice")}
              id="room-price"
              min="0"
              name="roomPrice"
              onBlur={handleBlur}
              onChange={handleValueChange}
              placeholder="0.00"
              step="0.01"
              type="number"
              value={formValues.roomPrice}
            />
          </FormField>

          <FormField error={errors.depositPaid} icon={FiDollarSign} id="deposit-paid" label="Deposit Paid" required>
            <input
              aria-describedby={errors.depositPaid ? "deposit-paid-error" : undefined}
              aria-invalid={Boolean(errors.depositPaid)}
              className={inputClass("depositPaid")}
              id="deposit-paid"
              min="0"
              name="depositPaid"
              onBlur={handleBlur}
              onChange={handleValueChange}
              placeholder="0.00"
              step="0.01"
              type="number"
              value={formValues.depositPaid}
            />
          </FormField>

          <div className="min-w-0">
            <label className="mb-2 block text-sm font-semibold text-ink" htmlFor="remaining-balance">
              Remaining Balance
            </label>
            <div className="relative">
              <FiDollarSign
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-lg text-hallmark"
              />
              <input
                aria-label="Remaining Balance"
                className="h-14 w-full rounded-xl border border-hallmark/20 bg-hallmark/[0.035] py-3 pr-4 pl-11 text-[15px] font-semibold text-hallmark outline-none"
                id="remaining-balance"
                readOnly
                tabIndex={-1}
                type="text"
                value={formatCurrency(formValues.remainingBalance)}
              />
            </div>
            <p className="mt-1.5 text-xs text-muted">Calculated automatically</p>
          </div>

          <FormField
            error={errors.paymentMethod}
            icon={FiCreditCard}
            id="payment-method"
            label="Payment Method"
            required
          >
            <select
              aria-describedby={errors.paymentMethod ? "payment-method-error" : undefined}
              aria-invalid={Boolean(errors.paymentMethod)}
              className={inputClass("paymentMethod", "appearance-none pr-11")}
              id="payment-method"
              name="paymentMethod"
              onBlur={handleBlur}
              onChange={handleValueChange}
              value={formValues.paymentMethod}
            >
              <option value="">Select method</option>
              {PAYMENT_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
            <FiChevronDown
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-lg text-muted"
            />
          </FormField>
        </div>
      </section>

      <section aria-labelledby="guest-notes-heading" className="mt-9 border-t border-line pt-8">
        <div className="mb-4 flex items-center gap-3">
          <span className="flex size-9 items-center justify-center rounded-xl bg-hallmark/10 text-hallmark">
            <FiFileText aria-hidden="true" />
          </span>
          <div>
            <h3 className="font-semibold text-ink" id="guest-notes-heading">
              Notes
            </h3>
            <p className="text-xs text-muted">Optional preferences or arrival information</p>
          </div>
        </div>

        <div className="relative group">
          <FiFileText
            aria-hidden="true"
            className="pointer-events-none absolute top-4 left-4 text-lg text-muted transition-colors duration-200 group-focus-within:text-hallmark"
          />
          <textarea
            className="min-h-28 w-full resize-y rounded-xl border border-line bg-surface py-3 pr-4 pl-11 text-[15px] text-ink outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-hallmark focus:ring-4 focus:ring-hallmark/10"
            id="guest-notes"
            name="notes"
            onChange={handleValueChange}
            placeholder="Add any special requests, arrival details or internal notes..."
            rows="4"
            value={formValues.notes}
          />
        </div>
      </section>

      <div className="mt-9 flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-end">
        <button
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold text-muted transition-all duration-200 hover:bg-slate-100 hover:text-ink focus-visible:ring-4 focus-visible:ring-hallmark/10 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60"
          disabled={isSubmitting}
          onClick={() => onCancel?.(formValues)}
          type="button"
        >
          <FiX aria-hidden="true" />
          Cancel
        </button>
        <button
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-hallmark/25 bg-surface px-5 text-sm font-semibold text-hallmark transition-all duration-200 hover:border-hallmark hover:bg-hallmark/5 focus-visible:ring-4 focus-visible:ring-hallmark/10 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60"
          disabled={isSubmitting}
          onClick={handleReset}
          type="button"
        >
          <FiRotateCcw aria-hidden="true" />
          Reset
        </button>
        <button
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-hallmark px-6 text-sm font-semibold text-white shadow-[0_10px_22px_rgba(128,12,24,0.20)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-hallmark-deep hover:shadow-[0_14px_28px_rgba(128,12,24,0.28)] focus-visible:ring-4 focus-visible:ring-hallmark/25 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          <FiSave aria-hidden="true" />
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
