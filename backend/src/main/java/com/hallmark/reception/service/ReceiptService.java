package com.hallmark.reception.service;

import com.hallmark.reception.entity.Payment;
import com.hallmark.reception.entity.Receipt;

import java.util.List;

public interface ReceiptService {
    List<Receipt> findAll();
    List<Receipt> findByGuestId(Long guestId);
    Receipt findById(Long id);
    Receipt createReceipt(Payment payment);
    Receipt findByReceiptNumber(String receiptNumber);
}
