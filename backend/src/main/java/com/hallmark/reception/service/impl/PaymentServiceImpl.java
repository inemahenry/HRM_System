package com.hallmark.reception.service.impl;

import com.hallmark.reception.dto.PaymentRequestDto;
import com.hallmark.reception.entity.Guest;
import com.hallmark.reception.entity.Payment;
import com.hallmark.reception.entity.User;
import com.hallmark.reception.exception.ResourceNotFoundException;
import com.hallmark.reception.repository.GuestRepository;
import com.hallmark.reception.repository.PaymentRepository;
import com.hallmark.reception.service.AuthenticatedUserContext;
import com.hallmark.reception.service.NotificationService;
import com.hallmark.reception.service.PaymentService;
import com.hallmark.reception.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final GuestRepository guestRepository;
    private final ReceiptService receiptService;
    private final NotificationService notificationService;
    private final AuthenticatedUserContext authenticatedUserContext;

    @Override
    public List<Payment> findByGuestId(Long guestId) {
        return paymentRepository.findByGuestIdOrderByPaidAtDesc(guestId);
    }

    @Override
    public List<Payment> findAll() {
        return paymentRepository.findAll();
    }

    @Override
    public Payment create(PaymentRequestDto request) {
        Guest guest = guestRepository.findById(request.getGuestId())
                .orElseThrow(() -> new ResourceNotFoundException("Guest not found with id " + request.getGuestId()));

        User currentUser = authenticatedUserContext.currentUser();
        LocalDate dueDate = calculateNextDueDate(request.getPaymentDuration(), request.getDurationDays());

        Payment payment = Payment.builder()
                .guestId(guest.getId())
                .amount(request.getAmount())
                .method(request.getMethod())
                .reference(request.getReference())
                .notes(request.getNotes())
                .receptionistName(currentUser != null ? currentUser.getFullName() : "Receptionist")
                .receptionistUsername(currentUser != null ? currentUser.getUsername() : null)
                .paymentDuration(request.getPaymentDuration())
                .durationDays(request.getDurationDays())
                .dueDate(dueDate)
                .previousBalance(guest.getRemainingBalance())
                .remainingBalance(guest.getRemainingBalance() != null ? guest.getRemainingBalance().subtract(request.getAmount()) : BigDecimal.ZERO)
                .build();

        Payment saved = paymentRepository.save(payment);
        BigDecimal newPaid = guest.getAmountPaid() != null ? guest.getAmountPaid().add(request.getAmount()) : request.getAmount();
        BigDecimal remaining = guest.getTotalAmount() != null ? guest.getTotalAmount().subtract(newPaid) : BigDecimal.ZERO;
        guest.setAmountPaid(newPaid);
        guest.setRemainingBalance(remaining.max(BigDecimal.ZERO));
        guest.setPaymentStatus(remaining.compareTo(BigDecimal.ZERO) <= 0 ? "Paid" : "Partial");
        guest.setRecordedByName(currentUser != null ? currentUser.getFullName() : guest.getRecordedByName());
        guest.setRecordedByUsername(currentUser != null ? currentUser.getUsername() : guest.getRecordedByUsername());
        guest.setNextDueDate(dueDate);
        guestRepository.save(guest);

        receiptService.createReceipt(saved);
        notificationService.create("Payment received", "Payment received for guest " + guest.getFullName(), "PAYMENT", guest.getId());
        return saved;
    }

    private LocalDate calculateNextDueDate(String paymentDuration, Integer durationDays) {
        LocalDate today = LocalDate.now();
        if ("Monthly".equalsIgnoreCase(paymentDuration)) {
            return YearMonth.from(today).plusMonths(1).atDay(today.getDayOfMonth());
        }
        if ("Daily".equalsIgnoreCase(paymentDuration)) {
            return today.plusDays(1);
        }
        if (durationDays != null && durationDays > 0) {
            return today.plusDays(durationDays);
        }
        return today.plusDays(1);
    }
}
