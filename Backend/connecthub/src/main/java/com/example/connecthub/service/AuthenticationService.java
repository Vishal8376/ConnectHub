package com.example.connecthub.service;


import com.example.connecthub.dto.request.LoginRequest;
import com.example.connecthub.dto.response.LoginResponse;

public interface AuthenticationService {

    LoginResponse login(LoginRequest request);

}