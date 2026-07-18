package com.hallmark.reception.service.impl;

import com.hallmark.reception.entity.Guest;
import com.hallmark.reception.entity.Payment;
import com.hallmark.reception.entity.Receipt;
import com.hallmark.reception.exception.ResourceNotFoundException;
import com.hallmark.reception.repository.GuestRepository;
import com.hallmark.reception.repository.ReceiptRepository;
import com.hallmark.reception.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReceiptServiceImpl implements ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final GuestRepository guestRepository;

    @Override
    public List<Receipt> findAll() {
        return receiptRepository.findAll();
    }

    @Override
    public List<Receipt> findByGuestId(Long guestId) {
        return receiptRepository.findByGuestIdOrderByIssuedAtDesc(guestId);
    }

    @Override
    public Receipt findById(Long id) {
        return receiptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found with id " + id));
    }

    @Override
    public Receipt createReceipt(Payment payment) {
        Guest guest = guestRepository.findById(payment.getGuestId())
                .orElseThrow(() -> new ResourceNotFoundException("Guest not found with id " + payment.getGuestId()));

        String receiptNumber = String.format("RCPT-%s-%s", LocalDate.now(), UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        Receipt receipt = Receipt.builder()
                .receiptNumber(receiptNumber)
                .paymentId(payment.getId())
                .guestId(guest.getId())
                .amount(payment.getAmount())
                .notes("Receipt generated for payment " + payment.getId())
                .build();
        return receiptRepository.save(receipt);
    }

    @Override
    public Receipt findByReceiptNumber(String receiptNumber) {
        return receiptRepository.findByReceiptNumber(receiptNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found with number " + receiptNumber));
    }
}
