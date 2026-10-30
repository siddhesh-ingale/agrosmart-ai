package agrosmart_backend.controller;

import agrosmart_backend.service.GeminiService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
public class AiController {

    private final GeminiService geminiService;

    public AiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @GetMapping("/test")
    public String testGemini() {
        return geminiService.generateResponse(
                "Explain in one simple sentence why soil health is important for farmers."
        );
    }
}