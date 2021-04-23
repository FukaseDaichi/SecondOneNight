package com.boardgame.app.controller;

import javax.net.ssl.HttpsURLConnection;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.boardgame.app.component.ApplicationInfoBeean;
import com.boardgame.app.entity.ErrObj;
import com.boardgame.app.entity.Room;
import com.boardgame.app.entity.SocketInfo;
import com.boardgame.app.entity.enif.LimitTimeInterface;
import com.boardgame.app.entity.timebomb.RoomUserInfo;
import com.boardgame.app.entity.timebomb.TimeBombRoom;
import com.boardgame.app.entity.timebomb.TimeBombUser;
import com.boardgame.app.exception.ApplicationException;

@Controller
public class TimeBombController {

	@Autowired
	SimpMessagingTemplate simpMessagingTemplate;

	@Autowired
	private ApplicationInfoBeean appInfo;

	@MessageMapping("/roomin")
	public void roomIn(RoomUserInfo userInfo) {
		String description = "/topic/" + userInfo.getRoomId() + "/timebomb";
		Room room = appInfo.getRoom(userInfo.getRoomId());

		try {

			if (room != null) {
				room.joinUser(userInfo.getUserName());
			} else {
				ErrObj obj = new ErrObj(HttpsURLConnection.HTTP_NOT_FOUND, "部屋が存在しません。部屋の作成をしてください", null);
				simpMessagingTemplate.convertAndSend(description, obj);
				return;
			}

			simpMessagingTemplate.convertAndSend(description, room);

		} catch (ApplicationException e) {
			ErrObj obj = new ErrObj(e.getStatus(), e.getMessage(), room);
			simpMessagingTemplate.convertAndSend(description, obj);

		} catch (Throwable e) {
			e.printStackTrace();
			ErrObj obj = new ErrObj(HttpsURLConnection.HTTP_NOT_FOUND, "システムエラー、部屋を立て直してください", null);
			simpMessagingTemplate.convertAndSend(description, obj);
			return;
		}

	}

	@MessageMapping("/start")
	public void start(RoomUserInfo userInfo) throws Exception {
		String description = "/topic/" + userInfo.getRoomId() + "/timebomb";

		TimeBombRoom room = (TimeBombRoom) appInfo.getRoom(userInfo.getRoomId());

		if (room != null) {
			if (room.getUserList().size() > 2) {
				room.init();
			}

		} else {
			ErrObj obj = new ErrObj(HttpsURLConnection.HTTP_NOT_FOUND, "部屋が存在しません。部屋の作成をしてください", null);
			simpMessagingTemplate.convertAndSend(description, obj);
			return;
		}

		simpMessagingTemplate.convertAndSend(description, room);
	}

	@MessageMapping("/play")
	public void play(RoomUserInfo userInfo) throws Exception {
		String description = "/topic/" + userInfo.getRoomId() + "/timebomb";
		TimeBombRoom room = (TimeBombRoom) appInfo.getRoom(userInfo.getRoomId());

		if (room != null) {

			// エラーチェック
			TimeBombUser user = (TimeBombUser) room.getUserList().stream()
					.filter(o -> o.getUserName().equals(userInfo.getUserName()))
					.findAny().orElse(null);

			if (user == null || !user.isTurnFlg()) {
				// 対象ユーザではないため終了
				return;
			}

			if ((6 - room.getRound()) * (user.getUserNo() - 1) <= userInfo.getCardIndex()
					&& userInfo.getCardIndex() < (6 - room.getRound()) * user.getUserNo()) {
				// 自信のユーザではないため終了
				return;
			}

			if (room.getLeadCardsList().get(userInfo.getCardIndex()).isOpenFlg()) {
				// 既にオープンされているため終了
				return;
			}

			if (room.getWinnerTeam() > 0) {
				// ゲーム終了時
				return;

			}

			room.playTurn(userInfo.getCardIndex());

		} else {
			ErrObj obj = new ErrObj(HttpsURLConnection.HTTP_NOT_FOUND, "部屋が存在しません。部屋の作成をしてください", null);
			simpMessagingTemplate.convertAndSend(description, obj);
			return;
		}

		simpMessagingTemplate.convertAndSend(description, room);
	}

	@MessageMapping("/ping")
	public void ping(RoomUserInfo userInfo) throws Exception {
		String description = "/topic/" + userInfo.getRoomId() + "/timebomb";

		TimeBombRoom room = (TimeBombRoom) appInfo.getRoom(userInfo.getRoomId());

		if (room == null) {
			ErrObj obj = new ErrObj(HttpsURLConnection.HTTP_NOT_FOUND, "部屋が存在しません。部屋の作成をしてください", null);
			simpMessagingTemplate.convertAndSend(description, obj);
			return;
		}

		simpMessagingTemplate.convertAndSend(description, room);
	}

	@MessageMapping("/changeIcon")
	public void changeIcon(RoomUserInfo userInfo) throws Exception {
		String description = "/topic/" + userInfo.getRoomId() + "/timebomb";

		Room room = appInfo.getRoom(userInfo.getRoomId());

		if (room != null) {
			room.getUserList().forEach(o -> {
				if (o.getUserName().equals(userInfo.getUserName())) {
					o.setUserIconUrl(userInfo.getAction());
				}
			});
		} else {
			ErrObj obj = new ErrObj(HttpsURLConnection.HTTP_NOT_FOUND, "部屋が存在しません。部屋の作成をしてください", null);
			simpMessagingTemplate.convertAndSend(description, obj);
			return;
		}
		ErrObj obj = new ErrObj(HttpsURLConnection.HTTP_CREATED, null, room.getUserList());

		simpMessagingTemplate.convertAndSend(description, obj);
	}

	@MessageMapping("/timebomb-limittime")
	public void limittime(SocketInfo socketInfo) throws Exception {
		String description = "/topic/" + socketInfo.getRoomId() + "/timebomb";

		TimeBombRoom room = (TimeBombRoom) appInfo.getRoom(socketInfo.getRoomId());

		if (room == null) {
			return;
		} else {
			room.doOverLimit((Integer) socketInfo.getObj());
		}

		simpMessagingTemplate.convertAndSend(description, room);
	}

	@MessageMapping("timebomb-setlimittime")
	public void setTimeBombLimitTime(SocketInfo socketInfo) throws Exception {
		String description = "/topic/" + socketInfo.getRoomId() + "/timebomb";

		LimitTimeInterface room = (LimitTimeInterface) appInfo.getRoom(socketInfo.getRoomId());

		room.setLimitTime((Integer) socketInfo.getObj());

		ErrObj obj = new ErrObj(socketInfo.getStatus(), null, room.getLimitTime());

		simpMessagingTemplate.convertAndSend(description, obj);

	}

}