package agrosmart_backend.service;
import agrosmart_backend.dto.DiseaseDetectionResponse;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class DiseaseDetectionService {

    private final GeminiService geminiService;

    public DiseaseDetectionService(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    public DiseaseDetectionResponse detectDisease(
            MultipartFile image,
            String cropName) throws Exception {

        String prompt = """
                You are an expert agricultural plant disease advisor.

                Analyze the provided crop leaf image.

                Crop name: %s

                Identify the most likely disease visible in the image.

                Provide:
                1. Disease name
                2. Confidence level
                3. Severity
                4. Visible symptoms
                5. Possible causes
                6. Immediate actions the farmer should take
                7. Recommended treatment
                8. Prevention methods
                9. Practical advice for the farmer
                10. When the farmer should seek help from an agricultural expert

                Give practical and easy-to-understand advice
                suitable for a farmer.

                If the image does not clearly show a disease,
                clearly say that the result is uncertain.

                Return ONLY valid JSON:

                {
                  "disease": "Disease name",
                  "confidence": "High/Medium/Low",
                  "severity": "Mild/Moderate/Severe",
                  "symptoms": "Visible symptoms",
                  "possibleCauses": "Possible causes",
                  "immediateActions": [
                    "Action 1",
                    "Action 2"
                  ],
                  "treatment": "Recommended treatment",
                  "prevention": [
                    "Prevention 1",
                    "Prevention 2"
                  ],
                  "farmerAdvice": "Practical advice",
                  "whenToSeekExpertHelp": "When to contact an agricultural expert"
                }

                Do not use Markdown.
                Do not add text outside the JSON.
                """.formatted(cropName);

        String response = geminiService.generateImageResponse( prompt, image.getBytes(), image.getContentType());

        return new com.fasterxml.jackson.databind.ObjectMapper()
                .readValue(response, DiseaseDetectionResponse.class);
    }
}