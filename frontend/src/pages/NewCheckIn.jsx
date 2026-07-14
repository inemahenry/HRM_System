import { FaArrowLeft, FaBed } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import AppLayout from "../components/AppLayout";
import GuestForm from "../components/GuestForm";
import PageHeader from "../components/PageHeader";
import { useGuests } from "../hooks/useGuests";

const toLocalDateKey = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getPaymentStatus = (roomPrice, depositPaid) => {
  if (roomPrice > 0 && depositPaid >= roomPrice) return "Paid";
  return depositPaid > 0 ? "Partial" : "Unpaid";
};

export default function NewCheckIn() {
  const navigate = useNavigate();
  const { addGuest, villas } = useGuests();
  const availableVillas = villas.filter((villa) => villa.status === "Available");

  const handleSaveGuest = (values) => {
    const roomPrice = Number(values.roomPrice) || 0;
    const depositPaid = Number(values.depositPaid) || 0;
    const matchedVilla = villas.find((villa) => villa.number === values.villaNumber);
    const checkInDate = values.checkInDate || toLocalDateKey();

    addGuest({
      ...values,
      villaId: matchedVilla?.id || values.villaId,
      villaNumber: values.villaNumber,
      checkInDate,
      roomPrice,
      depositPaid,
      remainingBalance: Math.max(roomPrice - depositPaid, 0),
      paymentStatus: getPaymentStatus(roomPrice, depositPaid),
      stayStatus: checkInDate <= toLocalDateKey() ? "Staying" : "Reserved",
    });
    navigate("/guests");
  };

  return (
    <AppLayout title="New Check-in" eyebrow="GUEST MANAGEMENT">
      <PageHeader
        eyebrow="Guest arrival"
        title="Create a new check-in"
        description="Capture guest details, assign a villa, and record the initial payment in one complete stay record."
        actions={(
          <Link
            to="/guests"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-gray-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-hallmark focus-visible:ring-offset-2"
          >
            <FaArrowLeft aria-hidden="true" />
            Back to Guests
          </Link>
        )}
      />

      <section className="mt-7 overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_8px_30px_rgba(31,41,55,0.055)]">
        <div className="flex flex-wrap items-center gap-3 border-b border-line bg-[#800C18]/[0.025] px-6 py-4 text-sm text-muted lg:px-8">
          <span className="flex size-9 items-center justify-center rounded-xl bg-white text-hallmark shadow-sm"><FaBed aria-hidden="true" /></span>
          <span><strong className="font-semibold text-ink">{availableVillas.length}</strong> villas are currently available for assignment.</span>
        </div>
        <GuestForm
          onSubmit={handleSaveGuest}
          onCancel={() => navigate("/guests")}
          villas={availableVillas}
          submitLabel="Save Guest"
        />
      </section>
    </AppLayout>
  );
}
