package com.boardgame.app.entity.hideout;

import java.util.List;

import com.boardgame.app.entity.User;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class HideoutUser extends User {

	private static final long serialVersionUID = -5134257768173040921L;

	private int userRoleNo;

	private boolean turnFlg;

	private BuildingCard buildingCard;

	private List<MemberCard> memberCardList;

}
