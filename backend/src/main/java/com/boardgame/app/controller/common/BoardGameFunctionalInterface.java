package com.boardgame.app.controller.common;

import com.boardgame.app.exception.ApplicationException;

@FunctionalInterface
public interface BoardGameFunctionalInterface {

	void doFunc() throws ApplicationException;

}
