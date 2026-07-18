package com.hallmark.reception.service.impl;

import com.hallmark.reception.service.SmsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SmsServiceImpl implements SmsService {

    @Override
    public void sendSms(String phoneNumber, String message) {
        // Provider integration can be plugged in later.
    }
}
