package com.hallmark.reception.service.impl;

import com.hallmark.reception.dto.PaymentRequestDto;
import com.hallmark.reception.entity.Guest;
import com.hallmark.reception.entity.Payment;
import com.hallmark.reception.entity.User;
import com.hallmark.reception.entity.Villa;
import com.hallmark.reception.exception.ApiException;
import com.hallmark.reception.exception.ResourceNotFoundException;
import com.hallmark.reception.repository.GuestRepository;
import com.hallmark.reception.repository.PaymentRepository;
import com.hallmark.reception.repository.VillaRepository;
import com.hallmark.reception.service.AuthenticatedUserContext;
import com.hallmark.reception.service.NotificationService;
import com.hallmark.reception.service.PaymentService;
import com.hallmark.reception.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final GuestRepository guestRepository;
    private final ReceiptService receiptService;
    private final NotificationService notificationService;
    private final AuthenticatedUserContext authenticatedUserContext;
    private final VillaRepository villaRepository;

    @Override
    public List<Payment> findByGuestId(Long guestId) {
        guestRepository.findById(guestId)
                .filter(guest -> !"14".equals(guest.getVillaNumber()))
                .orElseThrow(() -> new ResourceNotFoundException("Guest not found with id " + guestId));
        return paymentRepository.findByGuestIdOrderByPaidAtDesc(guestId);
    }

    @Override
    public List<Payment> findAll() {
        return paymentRepository.findAll().stream()
                .filter(payment -> guestRepository.findById(payment.getGuestId())
                        .map(guest -> !"14".equals(guest.getVillaNumber()))
                        .orElse(false))
                .toList();
    }

    @Override
    public Payment create(PaymentRequestDto request) {
        Guest guest = guestRepository.findById(request.getGuestId())
                .orElseThrow(() -> new ResourceNotFoundException("Guest not found with id " + request.getGuestId()));
        if ("14".equals(guest.getVillaNumber())) {
            throw new ResourceNotFoundException("Guest not found with id " + request.getGuestId());
        }
        String paymentType = request.getPaymentType().trim().toUpperCase();
        if (!"RENT".equals(paymentType) && !"CLEANING".equals(paymentType)) {
            throw new ApiException("Payment type must be Rent or Cleaning.");
        }

        User currentUser = authenticatedUserContext.currentUser();
        LocalDate dueDate = calculateNextDueDate(request.getPaymentDuration(), request.getDurationDays());
        BigDecimal previousBalance = "RENT".equals(paymentType) && guest.getRemainingBalance() != null
                ? guest.getRemainingBalance() : BigDecimal.ZERO;
        BigDecimal remainingBalance = "RENT".equals(paymentType)
                ? previousBalance.subtract(request.getAmount()).max(BigDecimal.ZERO) : BigDecimal.ZERO;

        Payment payment = Payment.builder()
                .guestId(guest.getId())
                .amount(request.getAmount())
                .method(request.getMethod())
                .paymentType(paymentType)
                .reference(request.getReference())
                .notes(request.getNotes())
                .receptionistName(currentUser != null ? currentUser.getFullName() : "Receptionist")
                .receptionistUsername(currentUser != null ? currentUser.getUsername() : null)
                .paymentDuration(request.getPaymentDuration())
                .durationDays(request.getDurationDays())
                .dueDate(dueDate)
                .previousBalance(previousBalance)
                .remainingBalance(remainingBalance)
                .build();

        Payment saved = paymentRepository.save(payment);
        if ("RENT".equals(paymentType)) {
            BigDecimal newPaid = guest.getAmountPaid() != null ? guest.getAmountPaid().add(request.getAmount()) : request.getAmount();
            BigDecimal totalAmount = guest.getTotalAmount() != null ? guest.getTotalAmount() : BigDecimal.ZERO;
            BigDecimal remaining = totalAmount.subtract(newPaid).max(BigDecimal.ZERO);
            guest.setAmountPaid(newPaid);
            guest.setRemainingBalance(remaining);
            guest.setPaymentStatus(remaining.signum() == 0 ? "Paid" : "Partial");
            guest.setRecordedByName(currentUser != null ? currentUser.getFullName() : guest.getRecordedByName());
            guest.setRecordedByUsername(currentUser != null ? currentUser.getUsername() : guest.getRecordedByUsername());
            guest.setNextDueDate(dueDate);
            guestRepository.save(guest);
            updateVillaRentStatus(guest, "PAID");
        } else {
            updateVillaCleaningStatus(guest, dueDate);
        }

        receiptService.createReceipt(saved);
        notificationService.create(paymentType + " payment received", "Payment received for guest " + guest.getFullName(), "PAYMENT", guest.getId());
        return saved;
    }

    private LocalDate calculateNextDueDate(String paymentDuration, Integer durationDays) {
        LocalDate today = LocalDate.now();
        if ("Monthly".equalsIgnoreCase(paymentDuration)) {
            return today.plusMonths(1);
        }
        if ("Daily".equalsIgnoreCase(paymentDuration)) {
            return today.plusDays(1);
        }
        if (durationDays != null && durationDays > 0) {
            return today.plusDays(durationDays);
        }
        return today.plusDays(1);
    }

    private void updateVillaRentStatus(Guest guest, String status) {
        if (guest.getVillaId() == null) {
            return;
        }
        villaRepository.findById(guest.getVillaId()).ifPresent(villa -> {
            villa.setRentStatus(status);
            villaRepository.save(villa);
        });
    }

    private void updateVillaCleaningStatus(Guest guest, LocalDate dueDate) {
        if (guest.getVillaId() == null) {
            throw new ApiException("A villa is required to record a cleaning payment.");
        }
        Villa villa = villaRepository.findById(guest.getVillaId())
                .orElseThrow(() -> new ResourceNotFoundException("Villa not found with id " + guest.getVillaId()));
        villa.setCleaningPaymentStatus("PAID");
        villa.setCleaningNextDueDate(dueDate);
        villaRepository.save(villa);
    }
}
