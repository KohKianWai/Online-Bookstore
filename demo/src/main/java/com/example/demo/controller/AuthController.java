package com.example.demo.controller;


import com.example.demo.dto.LoginRequestDto;
import com.example.demo.exception.LoginException;
import com.example.demo.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<Object> login(@RequestBody LoginRequestDto loginRequestDto){
        try {
            var loginResponseDto = authService.login(
                loginRequestDto.getUsername(),
                loginRequestDto.getPassword(),
                loginRequestDto.getRole()
            );

            return ResponseEntity.ok(loginResponseDto);

        } catch (LoginException e) {
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(e.getMessage());
        }
    }

    @GetMapping("/check-username")
    public ResponseEntity<Object> checkUsername(@RequestParam("username") String username) {
        return ResponseEntity.ok(authService.isUsernameAvailable(username));
    }
}
