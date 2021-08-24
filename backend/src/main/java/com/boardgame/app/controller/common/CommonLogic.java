package com.boardgame.app.controller.common;

import javax.net.ssl.HttpsURLConnection;

import org.springframework.messaging.simp.SimpMessagingTemplate;

import com.boardgame.app.component.ApplicationInfoBeean;
import com.boardgame.app.entity.Room;
import com.boardgame.app.entity.SocketInfo;
import com.boardgame.app.exception.ApplicationException;

public class CommonLogic {

	/**
	 * 部屋チェック
	 * 
	 * @param appInfo
	 * @param simpMessagingTemplate
	 * @param socketInfo
	 * @return boolean
	 */
	public static boolean isExistRoom(ApplicationInfoBeean appInfo, SimpMessagingTemplate simpMessagingTemplate,
			SocketInfo socketInfo) {
		if (appInfo.getRoom(socketInfo.getRoomId()) == null) {
			socketInfo.setStatus(HttpsURLConnection.HTTP_NOT_FOUND);
			socketInfo.setMessage("部屋が存在しません。部屋の作成をしてください");
			String description = "/topic/" + socketInfo.getRoomId();
			simpMessagingTemplate.convertAndSend(description, socketInfo);
			return false;
		}
		return true;
	}

	/**
	 * エラー処理
	 * 
	 * @param e
	 * @param simpMessagingTemplate
	 * @param socketInfo
	 */
	public static void errHandler(ApplicationException e, SimpMessagingTemplate simpMessagingTemplate,
			SocketInfo socketInfo) {

		socketInfo.setStatus(e.getStatus());
		socketInfo.setMessage(e.getMessage());
		String description = "/topic/" + socketInfo.getRoomId();
		simpMessagingTemplate.convertAndSend(description, socketInfo);
	}

	/**
	 * 一般的な処理
	 * 
	 * @param func
	 * @param room
	 * @param simpMessagingTemplate
	 * @param socketInfo
	 */
	public static void actionHandler(BoardGameFunctionalInterface func, Room room,
			SimpMessagingTemplate simpMessagingTemplate, SocketInfo socketInfo) {
		String description = "/topic/" + socketInfo.getRoomId();
		try {
			if (room == null) {
				// err処理
				throw new Exception();
			}
			func.doFunc();
			socketInfo.setObj(room);
			simpMessagingTemplate.convertAndSend(description, socketInfo);
		} catch (ApplicationException e) {
			socketInfo.setStatus(e.getStatus());
			socketInfo.setMessage(e.getMessage());
			simpMessagingTemplate.convertAndSend(description, socketInfo);
		} catch (Throwable e) {
			e.printStackTrace();
			socketInfo.setStatus(HttpsURLConnection.HTTP_NOT_FOUND);
			socketInfo.setMessage("部屋が存在しません。部屋の作成をしてください");
			simpMessagingTemplate.convertAndSend(description, socketInfo);

		}
	}
}
