package com.hallmark.reception.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "document_uploads")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DocumentUpload {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long guestId;

    private String fileName;

    private String contentType;

    private String documentType;

    private String storagePath;
}
