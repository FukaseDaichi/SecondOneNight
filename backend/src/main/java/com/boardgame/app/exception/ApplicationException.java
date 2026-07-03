package com.boardgame.app.exception;

import javax.net.ssl.HttpsURLConnection;

import lombok.Getter;

public class ApplicationException extends Exception {
	private static final long serialVersionUID = 1899570079632502139L;

	@Getter
	final int status;

	public ApplicationException() {
		super();
		this.status = HttpsURLConnection.HTTP_OK;
	}

	public ApplicationException(String message) {
		super(message);
		this.status = HttpsURLConnection.HTTP_OK;
	}

	public ApplicationException(String message, Exception e) {
		super(message, e);
		this.status = HttpsURLConnection.HTTP_OK;
	}

	public ApplicationException(int status, String message) {
		super(message);
		this.status = status;
	}

}
