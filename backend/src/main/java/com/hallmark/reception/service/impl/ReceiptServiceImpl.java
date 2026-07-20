package com.hallmark.reception.service.impl;

import com.hallmark.reception.entity.Guest;
import com.hallmark.reception.entity.Payment;
import com.hallmark.reception.entity.Receipt;
import com.hallmark.reception.entity.User;
import com.hallmark.reception.exception.ResourceNotFoundException;
import com.hallmark.reception.repository.GuestRepository;
import com.hallmark.reception.repository.ReceiptRepository;
import com.hallmark.reception.service.AuthenticatedUserContext;
import com.hallmark.reception.service.ReceiptService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReceiptServiceImpl implements ReceiptService {

    private final ReceiptRepository receiptRepository;
    private final GuestRepository guestRepository;
    private final AuthenticatedUserContext authenticatedUserContext;

    @Override
    public List<Receipt> findAll() {
        return receiptRepository.findAll().stream()
                .filter(receipt -> !"14".equals(receipt.getVillaNumber()))
                .toList();
    }

    @Override
    public List<Receipt> findByGuestId(Long guestId) {
        guestRepository.findById(guestId)
                .filter(guest -> !"14".equals(guest.getVillaNumber()))
                .orElseThrow(() -> new ResourceNotFoundException("Guest not found with id " + guestId));
        return receiptRepository.findByGuestIdOrderByIssuedAtDesc(guestId);
    }

    @Override
    public Receipt findById(Long id) {
        Receipt receipt = receiptRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found with id " + id));
        if ("14".equals(receipt.getVillaNumber())) {
            throw new ResourceNotFoundException("Receipt not found with id " + id);
        }
        return receipt;
    }

    @Override
    public Receipt createReceipt(Payment payment) {
        Guest guest = guestRepository.findById(payment.getGuestId())
                .orElseThrow(() -> new ResourceNotFoundException("Guest not found with id " + payment.getGuestId()));

        User currentUser = authenticatedUserContext.currentUser();
        String receiptNumber = String.format("HRMS-%s-%s", LocalDate.now().getYear(), UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        Receipt receipt = Receipt.builder()
                .receiptNumber(receiptNumber)
                .paymentId(payment.getId())
                .guestId(guest.getId())
                .amount(payment.getAmount())
                .notes(payment.getNotes())
                .guestName(guest.getFullName())
                .villaNumber(guest.getVillaNumber())
                .primaryTenant(guest.getFullName())
                .phoneNumber(guest.getPhoneNumber())
                .previousBalance(payment.getPreviousBalance())
                .remainingBalance(payment.getRemainingBalance())
                .dueDate(payment.getDueDate())
                .receivedBy(currentUser != null ? currentUser.getFullName() : payment.getReceptionistName())
                .paymentMethod(payment.getMethod())
                .paymentType(payment.getPaymentType())
                .reference(payment.getReference())
                .paymentDuration(payment.getPaymentDuration())
                .durationDays(payment.getDurationDays())
                .issuedAt(LocalDateTime.now())
                .build();
        return receiptRepository.save(receipt);
    }

    @Override
    public Receipt findByReceiptNumber(String receiptNumber) {
        Receipt receipt = receiptRepository.findByReceiptNumber(receiptNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Receipt not found with number " + receiptNumber));
        if ("14".equals(receipt.getVillaNumber())) {
            throw new ResourceNotFoundException("Receipt not found with number " + receiptNumber);
        }
        return receipt;
    }
}
