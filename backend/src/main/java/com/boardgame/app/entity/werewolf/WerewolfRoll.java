package com.boardgame.app.entity.werewolf;

import java.util.ArrayList;
import java.util.List;

import com.boardgame.app.exception.ApplicationException;

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
	protected String actionName;
	protected boolean votingAbleFlg;
	private int no;
	private int votingCount;
	private boolean punishmentFlg;

	public WerewolfRoll() {
		point = 1;
		votingSize = 1;
		discussionActionCount = 0;
		openTargetUsernameList = new ArrayList<String>();
		missingAbleFlg = true; //欠け有
		openFlg = false;
		no = 0;
		votingCount = 0;
		votingAbleFlg = true; // 投票可能
		punishmentFlg = false; //処刑なし
		actionName = null;

	}

	public void discussionAction(WerewolfRoom room, List<String> usernameList) throws ApplicationException {
		// 処理なし
	};

}
