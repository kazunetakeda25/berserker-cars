using UnityEngine;
using System.Collections;

public class LevelCompleteUIController : MonoBehaviour {

	public UILabel distanceLbl;
	public UILabel enemiesKilled;
	public UILabel coinsEarned;
	public UILabel score;
	// Use this for initialization
	void Start () {
	
	}

	public void SetParams(int dst, int enemKilled, int coinEarned){
		distanceLbl.text = dst + "";
		enemiesKilled.text = enemKilled + "";
		coinsEarned.text = coinEarned + "";
		int tempScore = (dst + enemKilled * 3 + coinEarned * 2 + 100);
		score.text = tempScore.ToString ();
		int currentScore = PlayerPrefs.GetInt ("currentScore");
		currentScore += tempScore;
		PlayerPrefs.SetInt ("currentScore", currentScore);
		if (currentScore > PlayerPrefs.GetInt ("HighScore")) {
			PlayerPrefs.SetInt ("HighScore",currentScore);
			ShowHighScore();
		}
	}

	public void ShowHighScore(){
		GameObject HighScore = Instantiate (Resources.Load ("HighScore"))as GameObject;
		HighScore.transform.parent = GameObject.FindWithTag ("ControlsRootPanel").transform;
		HighScore.transform.localPosition = new Vector3 (0, 0, -80);
		HighScore.transform.localScale = new Vector3 (1, 1, 1);
	}
	void HomeBtnClicked(){
		//GameObject.FindGameObjectWithTag("SceneController").SendMessage("Home");
		Time.timeScale = 1;
		Destroy(gameObject);
		Application.LoadLevel (0);
		Resources.UnloadUnusedAssets ();
	}

	void NextMissionClicked(){
		
		Time.timeScale = 1;
		//	GameObject.FindGameObjectWithTag("SceneController").SendMessage("ReplayCurrentLevel");
		Destroy(gameObject);
		Resources.UnloadUnusedAssets ();
		Application.LoadLevel ("game2");
	}
}
