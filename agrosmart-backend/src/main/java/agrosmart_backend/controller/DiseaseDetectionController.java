package agrosmart_backend.controller;

import agrosmart_backend.dto.DiseaseDetectionResponse;
import agrosmart_backend.service.DiseaseDetectionService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/disease")
public class DiseaseDetectionController {

    private final DiseaseDetectionService diseaseDetectionService;

    public DiseaseDetectionController(
            DiseaseDetectionService diseaseDetectionService) {
        this.diseaseDetectionService = diseaseDetectionService;
    }

    @PostMapping(value = "/detect", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<DiseaseDetectionResponse> detectDisease( @RequestParam("image") MultipartFile image, @RequestParam("cropName") String cropName ) throws Exception {
        DiseaseDetectionResponse response = diseaseDetectionService.detectDisease( image, cropName);
        return ResponseEntity.ok(response);
    }
}