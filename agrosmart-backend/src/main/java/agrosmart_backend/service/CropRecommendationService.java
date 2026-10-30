package agrosmart_backend.service;

import agrosmart_backend.dto.CropRecommendationRequest;
import agrosmart_backend.dto.CropRecommendationResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;

@Service
public class CropRecommendationService {

    private final GeminiService geminiService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public CropRecommendationService(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    public CropRecommendationResponse recommendCrop(CropRecommendationRequest request) {
        String prompt = """
                
                You are an expert agricultural advisor.

                Analyze the following farmer and environmental conditions:

                Nitrogen: %s
                Phosphorus: %s
                Potassium: %s
                Temperature: %s °C
                Humidity: %s %%
                Soil pH: %s
                Rainfall: %s mm
                Soil Type: %s
                Location: %s
                Season: %s

                Recommend the TOP 3 most suitable crops.

                Rank them from 1 to 3.

                For each crop provide:
                - rank
                - crop
                - suitability
                - reason
                - waterRequirement
                - growingPeriod
                - advice

                Consider all provided conditions together.
                Give practical and farmer-friendly information.

                Return ONLY valid JSON.
                Do not use Markdown.
                Do not use code blocks.
                Do not add any text outside the JSON.

                Use exactly this structure:

                {
                  "recommendations": [
                    {
                      "rank": 1,
                      "crop": "Crop name",
                      "suitability": "Highly Suitable",
                      "reason": "Reason based on the provided conditions",
                      "waterRequirement": "Low/Moderate/High",
                      "growingPeriod": "Number of days",
                      "advice": "Practical advice for the farmer"
                    }
                  ]
                }

                Return exactly 3 recommendations.
                """.formatted(
                request.getNitrogen(),
                request.getPhosphorus(),
                request.getPotassium(),
                request.getTemperature(),
                request.getHumidity(),
                request.getPh(),
                request.getRainfall(),
                request.getSoilType(),
                request.getLocation(),
                request.getSeason()
        );
        String response = geminiService.generateResponse(prompt);
        try {
            String json = cleanJsonResponse(response);
            return objectMapper.readValue(json, CropRecommendationResponse.class);

        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini crop recommendation response", e);
        }
    }

    private String cleanJsonResponse(String response) {
        response = response.trim();
        if (response.startsWith("```")) {
            response = response
                    .replaceFirst("^```json\\s*", "")
                    .replaceFirst("^```\\s*", "")
                    .replaceFirst("\\s*```$", "");
        }
        return response.trim();
    }
}
