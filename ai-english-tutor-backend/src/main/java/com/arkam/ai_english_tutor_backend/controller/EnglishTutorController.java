package com.arkam.ai_english_tutor_backend.controller;

import com.arkam.ai_english_tutor_backend.dto.UserMessageRequest;
import com.arkam.ai_english_tutor_backend.service.GeminiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/tutor")
public class EnglishTutorController {

    private final GeminiService geminiService;

    public EnglishTutorController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/converse")
    public ResponseEntity<String> converse(@RequestBody UserMessageRequest request) {
        if (request.message() == null || request.message().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Message cannot be empty.");
        }
        String aiResponse = geminiService.getTutorResponse(request.message());
        return ResponseEntity.ok(aiResponse);
    }
}
