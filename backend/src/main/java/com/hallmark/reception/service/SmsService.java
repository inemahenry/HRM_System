package com.hallmark.reception.service;

public interface SmsService {
    void sendSms(String phoneNumber, String message);
}
