package com.hallmark.reception.service;

import com.hallmark.reception.dto.PaymentRequestDto;
import com.hallmark.reception.entity.Payment;

import java.util.List;

public interface PaymentService {
    List<Payment> findByGuestId(Long guestId);
    Payment create(PaymentRequestDto request);
}
