package com.boardgame.app.constclass.fakeartist;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Random;

public class FakeArtistConst {

	public static final String ROOM_TYPE = "FAKEARTIST";

	public static final String FILE_PATH_WORD = "/src/main/resources/static/fakeartistword.csv";

	/**
	 * 役職
	 */
	public static final int ROLL_ARTIST = 1;
	public static final int ROLL_FAKE = 2;

	/**
	 * 0:初期状態 1:お絵描き 2:話し合い 3:投票 4:ゲーム終了
	 */
	public static final int TIME_FIRST = 0;
	public static final int TIME_ART = 1;
	public static final int TIME_DISCUSSION = 2;
	public static final int TIME_VOTING = 3;
	public static final int TIME_END = 4;

	public static String getWord() {

		String rtnStr = null;
		try {
			String path = new File(".").getAbsoluteFile().getParent();

			int lineCount = (int) Files.lines(Paths.get(path + FILE_PATH_WORD)).count();

			Random rand = new Random();
			Integer randNo = rand.nextInt(lineCount);

			File file = new File(path + FILE_PATH_WORD);

			// 文字コードUTF-8を指定してファイルを読み込む
			try (FileInputStream input = new FileInputStream(file);
					InputStreamReader stream = new InputStreamReader(input, "UTF-8");
					BufferedReader buffer = new BufferedReader(stream);) {
				// ファイルの最終行まで読み込む
				String str = null;
				int lineIndex = 0;
				while ((str = buffer.readLine()) != null) {
					if (randNo == lineIndex) {
						rtnStr = str.split(",")[0];
						break;
					}
					lineIndex++;
				}
			}

		} catch (Exception e) {
			e.printStackTrace();
			rtnStr = "辛子明太子";
		}

		return rtnStr;
	}

}
