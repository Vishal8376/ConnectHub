package com.example.connecthub.exception;

public class ConnectionAlreadyExistsException extends RuntimeException {

    public ConnectionAlreadyExistsException(String message) {
        super(message);
    }
}