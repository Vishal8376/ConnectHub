package com.example.connecthub.service.implementation;

import com.example.connecthub.dto.request.LoginRequest;
import com.example.connecthub.dto.response.LoginResponse;
import com.example.connecthub.security.JwtService;
import com.example.connecthub.security.UserDetailsImpl;
import com.example.connecthub.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

        private final AuthenticationManager authenticationManager;
        private final JwtService jwtService;

        @Override
        public LoginResponse login(LoginRequest request) {

                var authentication = authenticationManager.authenticate(
                                new UsernamePasswordAuthenticationToken(
                                                request.getEmail(),
                                                request.getPassword()));

                UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();

                String token = jwtService.generateToken(userDetails);

                return LoginResponse.builder()
                                .token(token)
                                .tokenType("Bearer")
                                .build();
        }
}