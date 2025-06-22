package com.arkam.ai_english_tutor_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    // The base URL for the Gemini API
    private final String GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models/";
    private final String MODEL_NAME = "gemini-1.5-flash";

    private final RestTemplate restTemplate;

    public GeminiService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Sends a user's message to the Gemini API with an English tutor prompt
     * and returns the AI's conversational response.
     *
     * @param userMessage The English sentence or phrase from the user.
     * @return The AI's response, acting as an English tutor.
     */
    public String getTutorResponse(String userMessage) {
        // Define the prompt for the Gemini AI.
        // It instructs Gemini to act as an English tutor.

        String promptText = String.format(
                """
                You are a friendly, enthusiastic English conversation partner. Think of yourself as a supportive friend who happens to be great at English.
                
                Guidelines for your responses:
                - Keep responses SHORT (1-2 sentences max) and conversational
                - Use casual, friendly language with natural expressions
                - If there are grammar mistakes, gently model the correct form by using it naturally in your response
                - Ask follow-up questions to keep the conversation flowing
                - Use encouraging phrases like "That's great!", "I see what you mean", "Tell me more about..."
                - Avoid formal language or lengthy explanations
                - Sound like you're having a real conversation, not giving a lesson
                - Use contractions (don't, can't, it's) to sound more natural
                - Show genuine interest in what they're saying
                
                Examples of good responses:
                - "Oh, that sounds interesting! What did you think about it?"
                - "I love that! By the way, you could also say 'I went to the store' instead of 'I go to store.'"
                - "That's awesome! Tell me more about your weekend."
                
                My sentence: "%s"
                
                Respond naturally and keep it brief!
                """, userMessage
        );

        // Construct the API URL
        String apiUrl = GEMINI_API_BASE_URL + MODEL_NAME + ":generateContent?key=" + apiKey;

        // Prepare the request body as per Gemini API documentation
        List<Map<String, Object>> contents = new ArrayList<>();
        Map<String, Object> part = new HashMap<>();
        part.put("text", promptText);
        Map<String, Object> content = new HashMap<>();
        content.put("parts", List.of(part));
        contents.add(content);

        // Optional: configure generation parameters (e.g., creativity level)
        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.7); // Adjust for more/less creative responses

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", contents);
        requestBody.put("generationConfig", generationConfig);

        // Set up HTTP headers for JSON content
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            // Make the POST request to the Gemini API
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    apiUrl,
                    request,
                    Map.class // Expect a Map in return, which we'll parse
            );

            // Parse the response to extract the AI's text
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("candidates")) {
                var candidates = (List<Map<String, Object>>) body.get("candidates");
                if (!candidates.isEmpty()) {
                    Map<String, Object> candidate = candidates.get(0);
                    Map<String, Object> candidateContent = (Map<String, Object>) candidate.get("content");
                    List<Map<String, Object>> parts = (List<Map<String, Object>>) candidateContent.get("parts");
                    if (!parts.isEmpty()) {
                        return (String) parts.get(0).get("text");
                    }
                }
            }
            // Fallback message if response is not as expected
            return "AI Tutor: I'm sorry, I couldn't generate a response. Please try again.";

        } catch (Exception e) {
            // Log the error and return an error message
            System.err.println("Error calling Gemini API for tutor: " + e.getMessage());
            return "AI Tutor: I encountered an error. Please check your API key or try again later.";
        }
    }
}
