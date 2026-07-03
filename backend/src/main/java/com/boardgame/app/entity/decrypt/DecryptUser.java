
package com.boardgame.app.entity.decrypt;

import com.boardgame.app.entity.User;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class DecryptUser extends User {
	private static final long serialVersionUID = -51342577681730409L;

	private int teamNo;
	private boolean cryptUserFlg;

	public DecryptUser() {
		cryptUserFlg = false;
	}

}
