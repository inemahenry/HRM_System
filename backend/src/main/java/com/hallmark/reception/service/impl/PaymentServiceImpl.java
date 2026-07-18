package com.hallmark.reception.service.impl;

import com.hallmark.reception.dto.PaymentRequestDto;
import com.hallmark.reception.entity.Guest;
import com.hallmark.reception.entity.Payment;
import com.hallmark.reception.exception.ResourceNotFoundException;
import com.hallmark.reception.repository.GuestRepository;
import com.hallmark.reception.repository.PaymentRepository;
import com.hallmark.reception.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final GuestRepository guestRepository;

    @Override
    public List<Payment> findByGuestId(Long guestId) {
        return paymentRepository.findByGuestIdOrderByPaidAtDesc(guestId);
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
        guest.setAmountPaid(guest.getAmountPaid() != null ? guest.getAmountPaid().add(request.getAmount()) : request.getAmount());
        guest.setRemainingBalance(guest.getTotalAmount() != null ? guest.getTotalAmount().subtract(guest.getAmountPaid()) : BigDecimal.ZERO);
        guestRepository.save(guest);
        return saved;
    }
}
