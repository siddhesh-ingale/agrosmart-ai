
package agrosmart_backend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CropRecommendationRequest {

    @NotNull
    @DecimalMin("0.0")
    private Double nitrogen;

    @NotNull
    @DecimalMin("0.0")
    private Double phosphorus;

    @NotNull
    @DecimalMin("0.0")
    private Double potassium;

    @NotNull
    private Double temperature;

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("100.0")
    private Double humidity;

    @NotNull
    @DecimalMin("0.0")
    @DecimalMax("14.0")
    private Double ph;

    @NotNull
    @DecimalMin("0.0")
    private Double rainfall;

    @NotBlank
    private String soilType;

    @NotBlank
    private String location;

    @NotBlank
    private String season;
}

