package com.boardgame.app.constclass.fakeartist;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.util.List;
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

	public static String getWord(List<Integer> paternList) {
		String rtnStr = null;
		try {
			List<String> strList = new ArrayList<String>();
			String path = new File(".").getAbsoluteFile().getParent();
			File file = new File(path + FILE_PATH_WORD);
			// 文字コードUTF-8を指定してファイルを読み込む

			try (FileInputStream input = new FileInputStream(file);
					InputStreamReader stream = new InputStreamReader(input, "UTF-8");
					BufferedReader buffer = new BufferedReader(stream);) {
				// ファイルの最終行まで読み込む
				String str = null;
				while ((str = buffer.readLine()) != null) {
					String[] strArray = str.split(",");
					if (paternList.contains(Integer.parseInt(strArray[1]))) {
						strList.add(strArray[0]);
					}
				}
			}

			Random rand = new Random();
			Integer randNo = rand.nextInt(strList.size());
			rtnStr = strList.get(randNo);

		} catch (Exception e) {
			e.printStackTrace();
			rtnStr = "辛子明太子";
		}
		return rtnStr;
	}

}
