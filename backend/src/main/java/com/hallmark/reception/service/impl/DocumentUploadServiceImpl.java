package com.hallmark.reception.service.impl;

import com.hallmark.reception.entity.DocumentUpload;
import com.hallmark.reception.repository.DocumentUploadRepository;
import com.hallmark.reception.service.DocumentUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DocumentUploadServiceImpl implements DocumentUploadService {

    private final DocumentUploadRepository documentUploadRepository;

    @Override
    public List<DocumentUpload> findByGuestId(Long guestId) {
        return documentUploadRepository.findByGuestId(guestId);
    }

    @Override
    public DocumentUpload upload(Long guestId, MultipartFile file, String documentType) {
        try {
            Path uploadDir = Paths.get("uploads");
            Files.createDirectories(uploadDir);
            String storedName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path target = uploadDir.resolve(storedName);
            Files.copy(file.getInputStream(), target);

            DocumentUpload upload = DocumentUpload.builder()
                    .guestId(guestId)
                    .fileName(file.getOriginalFilename())
                    .contentType(file.getContentType())
                    .documentType(documentType)
                    .storagePath(target.toString())
                    .build();
            return documentUploadRepository.save(upload);
        } catch (IOException e) {
            throw new IllegalStateException("Unable to store uploaded file", e);
        }
    }
}
