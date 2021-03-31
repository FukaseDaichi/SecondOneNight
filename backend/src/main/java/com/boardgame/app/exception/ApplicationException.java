package com.boardgame.app.exception;

public class ApplicationException extends Exception {

	private static final long serialVersionUID = 1899570079632502139L;

	public ApplicationException() {
		super();
	}

	public ApplicationException(String message) {
		super(message);
	}

	public ApplicationException(String message, Exception e) {
		super(message, e);
	}
}
