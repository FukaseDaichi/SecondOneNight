package com.boardgame.app.constclass.decrypt;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Random;

public class DecryptConst {

	public static final String ROOM_TYPE = "DECRYPT";

	public static final int CHOICE_MODE_HANDSUP = 0;
	public static final int CHOICE_MODE_RANDOM = 1;

	/**
	 * 1:レフト 2:ライト
	 */
	public static final int TEAM_NO_LEFT = 1;
	public static final int TEAM_NO_RIGHT = 2;
	public static final int WINNER_DRAW = 3;

	/**
	 * 0:初期状態 1:暗号作成者決定中 2:暗号作成中 3:暗号解読中 4:ゲーム終了
	 */
	public static final int TIME_FIRST = 0;
	public static final int TIME_DECISTION = 1;
	public static final int TIME_CREATE = 2;
	public static final int TIME_DECRYPT = 3;
	public static final int TIME_END = 4;

	public static final String FILE_PATH_WORD = "/src/main/resources/static/word.csv";

	public static List<String> getCodeArray() {
		List<String> returnStrList = new ArrayList<String>();
		try {

			String path = new File(".").getAbsoluteFile().getParent();

			int lineCount = (int) Files.lines(Paths.get(path + FILE_PATH_WORD)).count();

			List<Integer> randomList = new ArrayList<Integer>();

			Random rand = new Random();
			while (randomList.size() < 8) {
				Integer tmpInt = rand.nextInt(lineCount);

				if (!randomList.contains(tmpInt)) {
					randomList.add(tmpInt);
				}
			}
			randomList.sort(null);

			File file = new File(path + FILE_PATH_WORD);

			// 文字コードUTF-8を指定してファイルを読み込む
			try (FileInputStream input = new FileInputStream(file);
					InputStreamReader stream = new InputStreamReader(input, "UTF-8");
					BufferedReader buffer = new BufferedReader(stream);) {
				// ファイルの最終行まで読み込む
				String str = null;
				int index = 0;
				int lineIndex = 0;
				while ((str = buffer.readLine()) != null) {
					if (randomList.get(index) == lineIndex) {
						returnStrList.add(str.split(",")[0]);
						index++;

						if (index > 7) {
							break;
						}
					}
					lineIndex++;

				}
			} catch (Exception e) {
				e.printStackTrace();
			}
		} catch (IOException e) {
			e.printStackTrace();
		}

		Collections.shuffle(returnStrList);

		return returnStrList;
	}

	public static List<Integer> createCode() {
		List<Integer> resultList = new ArrayList<Integer>(Arrays.asList(1, 2, 3, 4));
		Collections.shuffle(resultList);
		resultList.remove(0);

		return resultList;
	}

}
