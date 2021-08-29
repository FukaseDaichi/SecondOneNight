
package com.boardgame.app.entity.fakeartist;

import com.boardgame.app.entity.User;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class FakeArtistUser extends User {
	private static final long serialVersionUID = -51342577681730409L;

	private int rollNo;
	private boolean drawFlg;
	protected boolean votingAbleFlg;
	private boolean punishmentFlg;
	private int votingCount;

	public FakeArtistUser() {
		rollNo = 0;
		drawFlg = true;
		votingAbleFlg = false;
		punishmentFlg = false;
		votingCount = 0;
	}

	public void addCount() {
		votingCount++;
	}

}
