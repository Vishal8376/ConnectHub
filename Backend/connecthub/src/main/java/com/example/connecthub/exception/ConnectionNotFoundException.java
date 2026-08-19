package com.example.connecthub.exception;

public class ConnectionNotFoundException extends RuntimeException {

    public ConnectionNotFoundException(String message) {
        super(message);
    }
}