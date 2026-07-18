package com.hallmark.reception.service;

import com.hallmark.reception.entity.Notification;

import java.util.List;

public interface NotificationService {
    List<Notification> findAll();
    Notification create(String title, String message, String type, Long entityId);
}
