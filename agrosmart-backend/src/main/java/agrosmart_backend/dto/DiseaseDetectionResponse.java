package agrosmart_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiseaseDetectionResponse {

    private String disease;
    private String confidence;
    private String severity;
    private String symptoms;
    private String possibleCauses;
    private List<String> immediateActions;
    private String treatment;
    private List<String> prevention;
    private String farmerAdvice;
    private String whenToSeekExpertHelp;
}
