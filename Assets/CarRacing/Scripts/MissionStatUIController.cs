using UnityEngine;
using System.Collections;

public class MissionStatUIController : MonoBehaviour {

	public UILabel coinsLabel;
	public UILabel coinsCount;
	public UILabel enemiesLbl;
	public UILabel enemiesCount;
	public UILabel SpeedX;
	string coinString = " Collect # coins";
	string enemyString = " Kill # Enemy Ships";
	bool isMissionCompleteUI = false;
	public GameObject completeLbl;
	// Use this for initialization
	void Start () {
	
	}
	void OnClick(){
		Time.timeScale = 1; 
		if (isMissionCompleteUI) {
			GameObject.FindGameObjectWithTag("GameController").SendMessage("GenerateLevelEnemy");
			GameObject.FindGameObjectWithTag("Hud").SendMessage("FillBar");

		}
		GameObject.FindGameObjectWithTag ("GameController").SendMessage ("EnableMove");
		Destroy (gameObject);
		Resources.UnloadUnusedAssets ();
	}

	public void SetParams(int speed, int coins , int enemies, int lvl, bool missionCompUi){
		isMissionCompleteUI = missionCompUi;
		setStringsAccordingToLevel (lvl);
		coinsCount.text = coins + "";
		enemiesCount.text = enemies + "";
		SpeedX.text = speed+"";
		if(isMissionCompleteUI){
			completeLbl.SetActive(true);
		}
	}

	void setStringsAccordingToLevel(int lvl){

		switch (lvl) {
		case 1:
			coinString = " Collect 10 coins";
			coinsLabel.text = coinString;
			enemyString = " Kill 10 Enemy Ships";
			enemiesLbl.text =  enemyString;
			break;

		case 2:
			coinString = " Collect 15 coins";
			coinsLabel.text = coinString;
			enemyString = " Kill 15 Enemy Ships";
			enemiesLbl.text =  enemyString;
			break;
		

		case 3:
			coinString = " Collect 20 coins";
			coinsLabel.text = coinString;
			enemyString = " Kill 20 Enemy Ships";
			enemiesLbl.text =  enemyString;
			break;

		case 4:
			coinString = " Collect 25 coins";
			coinsLabel.text = coinString;
			enemyString = " Kill 25 Enemy Ships";
			enemiesLbl.text =  enemyString;
			break;

		case 5:
			coinString = " Collect 30 coins";
			coinsLabel.text = coinString;
			enemyString = " Kill 30 Enemy Ships";
			enemiesLbl.text =  enemyString;
			break;

		case 6:
			coinString = " Collect 35 coins";
			coinsLabel.text = coinString;
			enemyString = " Kill 35 Enemy Ships";
			enemiesLbl.text =  enemyString;
			break;

				}
	}

}
