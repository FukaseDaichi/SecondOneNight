package com.boardgame.app.entity.werewolf;

import lombok.Data;

@Data
public abstract class WerewolfRoll {

	protected int type;
	protected String name;
	protected String winDescription;
	protected String description;
	protected int votingSize;
	protected boolean discussionActionCount;

}
