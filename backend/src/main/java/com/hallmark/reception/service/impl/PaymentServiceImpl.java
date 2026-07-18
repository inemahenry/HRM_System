package com.hallmark.reception.service.impl;

import com.hallmark.reception.dto.PaymentRequestDto;
import com.hallmark.reception.entity.Guest;
import com.hallmark.reception.entity.Payment;
import com.hallmark.reception.exception.ResourceNotFoundException;
import com.hallmark.reception.repository.GuestRepository;
import com.hallmark.reception.repository.PaymentRepository;
import com.hallmark.reception.service.NotificationService;
import com.hallmark.reception.service.PaymentService;
import com.hallmark.reception.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final GuestRepository guestRepository;
    private final ReceiptService receiptService;
    private final NotificationService notificationService;

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

        Payment payment = Payment.builder()
                .guestId(guest.getId())
                .amount(request.getAmount())
                .method(request.getMethod())
                .reference(request.getReference())
                .notes(request.getNotes())
                .build();

        Payment saved = paymentRepository.save(payment);
        BigDecimal newPaid = guest.getAmountPaid() != null ? guest.getAmountPaid().add(request.getAmount()) : request.getAmount();
        BigDecimal remaining = guest.getTotalAmount() != null ? guest.getTotalAmount().subtract(newPaid) : BigDecimal.ZERO;
        guest.setAmountPaid(newPaid);
        guest.setRemainingBalance(remaining.max(BigDecimal.ZERO));
        guest.setPaymentStatus(remaining.compareTo(BigDecimal.ZERO) <= 0 ? "Paid" : "Partial");
        guestRepository.save(guest);

        receiptService.createReceipt(saved);
        notificationService.create("Payment received", "Payment received for guest " + guest.getFullName(), "PAYMENT", guest.getId());
        return saved;
    }
}
