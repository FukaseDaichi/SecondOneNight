package com.boardgame.app.entity.timebomb;

import java.io.Serializable;

import lombok.Data;

@Data
public class LeadCards implements Serializable {
	private static final long serialVersionUID = -2364042991175915196L;

	private int cardType;

	/**
	 * true:open
	 * false:close
	 */
	private boolean openFlg;

	public LeadCards(int cardType) {
		this.cardType = cardType;

		openFlg = false;
	}

}
