package agrosmart_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CropRecommendationResponse {

    private List<CropRecommendation> recommendations;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CropRecommendation {

        private Integer rank;
        private String crop;
        private String suitability;
        private String reason;
        private String waterRequirement;
        private String growingPeriod;
        private String advice;
    }
}

