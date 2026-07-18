package com.hallmark.reception.service;

public interface EmailService {
    void sendReceiptEmail(String to, String receiptNumber);
    void sendPaymentReminder(String to, String guestName);
    void sendBookingConfirmation(String to, String guestName);
    void sendCheckoutReminder(String to, String guestName);
}
