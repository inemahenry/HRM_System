package com.hallmark.reception.controller;

import com.hallmark.reception.entity.DocumentUpload;
import com.hallmark.reception.service.DocumentUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class DocumentUploadController {

    private final DocumentUploadService documentUploadService;

    @GetMapping("/guest/{guestId}")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER','ROLE_RECEPTIONIST')")
    public ResponseEntity<List<DocumentUpload>> findByGuestId(@PathVariable Long guestId) {
        return ResponseEntity.ok(documentUploadService.findByGuestId(guestId));
    }

    @PostMapping("/guest/{guestId}")
    @PreAuthorize("hasAnyRole('ROLE_MANAGER','ROLE_RECEPTIONIST')")
    public ResponseEntity<DocumentUpload> upload(@PathVariable Long guestId,
                                                @RequestParam("file") MultipartFile file,
                                                @RequestParam(value = "documentType", defaultValue = "ID") String documentType) {
        return ResponseEntity.ok(documentUploadService.upload(guestId, file, documentType));
    }
}
