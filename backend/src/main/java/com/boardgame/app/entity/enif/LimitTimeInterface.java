package com.boardgame.app.entity.enif;

import com.boardgame.app.exception.ApplicationException;

public interface LimitTimeInterface {

	int getLimitTime();

	void setLimitTime(int minites);

	void doOverLimit(int turn) throws ApplicationException;
}
