package com.hallmark.reception.service.impl;

import com.hallmark.reception.service.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    public void sendReceiptEmail(String to, String receiptNumber) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Receipt generated");
        message.setText("Receipt " + receiptNumber + " has been generated successfully.");
        mailSender.send(message);
    }

    @Override
    public void sendPaymentReminder(String to, String guestName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Payment reminder");
        message.setText("Hello " + guestName + ", this is a payment reminder from Hallmark Reception.");
        mailSender.send(message);
    }

    @Override
    public void sendBookingConfirmation(String to, String guestName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Booking confirmation");
        message.setText("Hello " + guestName + ", your booking has been confirmed.");
        mailSender.send(message);
    }

    @Override
    public void sendCheckoutReminder(String to, String guestName) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Checkout reminder");
        message.setText("Hello " + guestName + ", this is a checkout reminder from Hallmark Reception.");
        mailSender.send(message);
    }
}
