
package agrosmart_backend.controller;

import agrosmart_backend.dto.CropRecommendationRequest;
import agrosmart_backend.dto.CropRecommendationResponse;
import agrosmart_backend.service.CropRecommendationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/crops")
public class CropRecommendationController {

    private final CropRecommendationService cropRecommendationService;

    public CropRecommendationController(
            CropRecommendationService cropRecommendationService) {
        this.cropRecommendationService = cropRecommendationService;
    }

    @PostMapping("/recommend")
    public ResponseEntity<CropRecommendationResponse> recommendCrop(
            @Valid @RequestBody CropRecommendationRequest request) {

        CropRecommendationResponse response =
                cropRecommendationService.recommendCrop(request);

        return ResponseEntity.ok(response);
    }
}

