package agrosmart_backend.service;

import com.google.genai.Client;
import com.google.genai.types.Content;
import com.google.genai.types.GenerateContentResponse;
import com.google.genai.types.Part;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class GeminiService {

    private final Client client;

    public GeminiService(
            @Value("${gemini.api.key}") String apiKey) {

        this.client = Client.builder()
                .apiKey(apiKey)
                .build();
    }

    // Existing text-based Gemini method
    public String generateResponse(String prompt) {
        GenerateContentResponse response = client.models.generateContent("gemini-3.5-flash-lite", prompt, null);
        return response.text();
    }

    // New image + text Gemini method
    public String generateImageResponse( String prompt, byte[] imageBytes, String mimeType) {

        Part textPart = Part.fromText(prompt);
        Part imagePart = Part.fromBytes( imageBytes, mimeType);

        Content content = Content.builder()
                .role("user")
                .parts(java.util.List.of(textPart, imagePart))
                .build();

        GenerateContentResponse response = client.models.generateContent("gemini-3.5-flash-lite", content, null);
        return response.text();
    }
}

