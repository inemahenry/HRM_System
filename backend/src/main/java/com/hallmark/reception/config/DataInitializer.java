package com.hallmark.reception.config;

import com.hallmark.reception.entity.Villa;
import com.hallmark.reception.repository.VillaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final VillaRepository villaRepository;

    @Override
    public void run(String... args) {
        if (villaRepository.count() > 0) {
            return;
        }

        for (int i = 1; i <= 30; i++) {
            Villa villa = Villa.builder()
                    .number(String.valueOf(i))
                    .status("VACANT")
                    .active(true)
                    .rentable(i != 14)
                    .notes(null)
                    .build();

            villaRepository.save(villa);
        }
    }
}
