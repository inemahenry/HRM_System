package com.hallmark.reception.service.impl;

import com.hallmark.reception.entity.Notification;
import com.hallmark.reception.repository.NotificationRepository;
import com.hallmark.reception.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public List<Notification> findAll() {
        return notificationRepository.findByOrderByCreatedAtDesc();
    }

    @Override
    public Notification create(String title, String message, String type, Long entityId) {
        Notification notification = Notification.builder()
                .title(title)
                .message(message)
                .type(type)
                .entityId(entityId)
                .build();
        return notificationRepository.save(notification);
    }
}
