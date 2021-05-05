package com.boardgame.app.entity.werewolf;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public abstract class WerewolfRoll {

	protected int rollNo;
	protected int teamNo;
	protected String name;
	protected String winDescription;
	protected String description;
	protected int votingSize;
	protected int point;
	protected int discussionActionCount;
	protected List<String> openTargetUsernameList;
	protected boolean missingAbleFlg;
	protected boolean openFlg;


	public WerewolfRoll() {
		point = 1;
		votingSize = 1;
		discussionActionCount = 0;
		openTargetUsernameList = new ArrayList<String>();
		missingAbleFlg = true; //欠け有
		openFlg = false;

	}

	abstract public void discussionAction(WerewolfRoom room, List<String> usernameList);

}
