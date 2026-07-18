package com.hallmark.reception.service;

import com.hallmark.reception.entity.DocumentUpload;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface DocumentUploadService {
    List<DocumentUpload> findByGuestId(Long guestId);
    DocumentUpload upload(Long guestId, MultipartFile file, String documentType);
}
