package com.boardgame.app.entity.werewolf;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.junit.jupiter.api.Test;

import com.boardgame.app.constclass.werewolf.WereWolfConst;
import com.boardgame.app.entity.User;
import com.boardgame.app.entity.werewolf.roll.Assasin;
import com.boardgame.app.entity.werewolf.roll.Villager;
import com.boardgame.app.entity.werewolf.roll.Werewolf;
import com.boardgame.app.entity.werewolf.roll.WhiteWerewolf;
import com.boardgame.app.entity.werewolf.roll.Teruteru;

class WerewolfRoomTest {

	@Test
	void 人狼暗殺かつてるてるなしは対象だけ死亡して村人勝利で終了する() throws Exception {
		WerewolfUser assassin = user("assassin", new Assasin(), 0);
		WerewolfUser wolf = user("wolf", new Werewolf(), 1);
		WerewolfUser villager = user("villager", new Villager(), 2);
		WerewolfRoom room = room(assassin, wolf, villager);

		room.discussionAction("assassin", Arrays.asList("assassin", "wolf"));

		assertEquals(4, room.getTurn());
		assertEquals(Arrays.asList(WereWolfConst.TEAM_NO_VILLAGER), room.getWinteamList());
		assertOnlyPunished(room, wolf);
		assertTrue(wolf.getRoll().isOpenFlg());
	}

	@Test
	void 白狼暗殺かつてるてるなしも村人勝利で終了する() throws Exception {
		WerewolfUser assassin = user("assassin", new Assasin(), 0);
		WerewolfUser whiteWerewolf = user("white-wolf", new WhiteWerewolf(), 1);
		WerewolfUser villager = user("villager", new Villager(), 2);
		WerewolfRoom room = room(assassin, whiteWerewolf, villager);

		room.discussionAction("assassin", Arrays.asList("assassin", "white-wolf"));

		assertEquals(4, room.getTurn());
		assertEquals(Arrays.asList(WereWolfConst.TEAM_NO_VILLAGER), room.getWinteamList());
		assertOnlyPunished(room, whiteWerewolf);
	}

	@Test
	void てるてるありで人狼を暗殺した場合は投票まで継続する() throws Exception {
		WerewolfUser assassin = user("assassin", new Assasin(), 0);
		WerewolfUser wolf = user("wolf", new Werewolf(), 1);
		WerewolfUser villager = user("villager", new Villager(), 2);
		WerewolfUser teruteru = user("teruteru", new Teruteru(), 3);
		WerewolfRoom room = room(assassin, wolf, villager, teruteru);

		room.discussionAction("assassin", Arrays.asList("assassin", "wolf"));

		assertEquals(2, room.getTurn());
		assertTrue(room.getWinteamList().isEmpty());
		assertTrue(wolf.getRoll().isPunishmentFlg());
		assertFalse(wolf.getRoll().isVotingAbleFlg());
		assertOnlyPunished(room, wolf);
	}

	@Test
	void てるてるがNPCに配役されている場合は人狼暗殺後も継続する() throws Exception {
		WerewolfUser assassin = user("assassin", new Assasin(), 0);
		WerewolfUser wolf = user("wolf", new Werewolf(), 1);
		WerewolfUser villager = user("villager", new Villager(), 2);
		WerewolfUser npc = user(WereWolfConst.USERNAME_NPC, new Teruteru(), 3);
		WerewolfRoom room = room(assassin, wolf, villager);
		room.setNpcuser(npc);
		room.getRollList().add(npc.getRoll());

		room.discussionAction("assassin", Arrays.asList("assassin", "wolf"));

		assertEquals(2, room.getTurn());
		assertTrue(room.getWinteamList().isEmpty());
		assertOnlyPunished(room, wolf);
	}

	@Test
	void てるてるが役欠けなら役職リストに残っていても人狼暗殺で終了する() throws Exception {
		WerewolfUser assassin = user("assassin", new Assasin(), 0);
		WerewolfUser wolf = user("wolf", new Werewolf(), 1);
		WerewolfUser villager = user("villager", new Villager(), 2);
		WerewolfRoom room = room(assassin, wolf, villager);
		room.getRollList().add(new Teruteru());

		room.discussionAction("assassin", Arrays.asList("assassin", "wolf"));

		assertEquals(4, room.getTurn());
		assertEquals(Arrays.asList(WereWolfConst.TEAM_NO_VILLAGER), room.getWinteamList());
		assertOnlyPunished(room, wolf);
	}

	@Test
	void てるてるありで人狼を暗殺後にてるてるが最多票ならてるてる勝利になる() throws Exception {
		WerewolfUser assassin = user("assassin", new Assasin(), 0);
		WerewolfUser wolf = user("wolf", new Werewolf(), 1);
		WerewolfUser villager = user("villager", new Villager(), 2);
		WerewolfUser teruteru = user("teruteru", new Teruteru(), 3);
		WerewolfRoom room = room(assassin, wolf, villager, teruteru);

		room.discussionAction("assassin", Arrays.asList("assassin", "wolf"));
		room.endDiscussion();
		room.voting("assassin", "teruteru");
		room.voting("villager", "teruteru");
		room.voting("teruteru", "villager");

		assertEquals(4, room.getTurn());
		assertEquals(Arrays.asList(WereWolfConst.TEAM_NO_TERUTERU), room.getWinteamList());
		assertTrue(wolf.getRoll().isPunishmentFlg());
		assertTrue(teruteru.getRoll().isPunishmentFlg());
	}

	@Test
	void てるてる暗殺は対象だけ死亡して第三陣営勝利で終了する() throws Exception {
		WerewolfUser assassin = user("assassin", new Assasin(), 0);
		WerewolfUser teruteru = user("teruteru", new Teruteru(), 1);
		WerewolfUser villager = user("villager", new Villager(), 2);
		WerewolfRoom room = room(assassin, teruteru, villager);

		room.discussionAction("assassin", Arrays.asList("assassin", "teruteru"));

		assertEquals(4, room.getTurn());
		assertEquals(Arrays.asList(WereWolfConst.TEAM_NO_TERUTERU), room.getWinteamList());
		assertOnlyPunished(room, teruteru);
	}

	@Test
	void 通常投票の最多得票判定は維持される() {
		WerewolfUser assassin = user("assassin", new Assasin(), 0);
		WerewolfUser wolf = user("wolf", new Werewolf(), 1);
		WerewolfUser villager = user("villager", new Villager(), 2);
		WerewolfRoom room = room(assassin, wolf, villager);
		wolf.getRoll().setVotingCount(1);

		room.judgement();

		assertEquals(4, room.getTurn());
		assertEquals(Arrays.asList(WereWolfConst.TEAM_NO_VILLAGER), room.getWinteamList());
		assertOnlyPunished(room, wolf);
	}

	private WerewolfRoom room(WerewolfUser... users) {
		WerewolfRoom room = new WerewolfRoom();
		List<User> userList = new ArrayList<User>(Arrays.asList(users));
		List<WerewolfRoll> rollList = Arrays.stream(users).map(WerewolfUser::getRoll)
				.collect(Collectors.toCollection(ArrayList::new));
		room.setUserList(userList);
		room.setRollList(rollList);
		room.setWinteamList(new ArrayList<Integer>());
		room.setTurn(2);
		return room;
	}

	private WerewolfUser user(String name, WerewolfRoll roll, int userNo) {
		WerewolfUser user = new WerewolfUser();
		user.setUserName(name);
		user.setUserNo(userNo);
		user.setRoll(roll);
		return user;
	}

	private void assertOnlyPunished(WerewolfRoom room, WerewolfUser expected) {
		List<WerewolfRoll> punished = room.getRollList().stream().filter(WerewolfRoll::isPunishmentFlg)
				.collect(Collectors.toList());
		assertEquals(1, punished.size());
		assertTrue(punished.contains(expected.getRoll()));
	}
}
