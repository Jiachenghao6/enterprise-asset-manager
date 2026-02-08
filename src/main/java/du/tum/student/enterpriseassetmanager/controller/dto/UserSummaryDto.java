package du.tum.student.enterpriseassetmanager.controller.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserSummaryDto {
    private long id;
    private String username;
    private String firstname;
    private String lastname;
    private String email;
}