package com.boardgame.app.entity.werewolf;

import java.util.List;

import com.boardgame.app.entity.User;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class WerwolfUser extends User {
	private static final long serialVersionUID = -608311496580970104L;

	private WerewolfRoll roll;
	private List<WerewolfRoll> handRollList;
	private int score;

}
