using UnityEngine;
using System.Collections;

public class UIController : MonoBehaviour {

	void HomeBtnClicked(){
		Time.timeScale = 1;
		Destroy(gameObject);
		Application.LoadLevel (0);
		Resources.UnloadUnusedAssets ();
	}
	
	void NextMissionClicked(){
		
		//Time.timeScale = 1;
		//Destroy(gameObject);
		//Resources.UnloadUnusedAssets ();
		ReplayBtnClicked ();
	}

	void ReplayBtnClicked(){
		Time.timeScale = 1;
		Destroy(gameObject);
		Application.LoadLevel ("Tracks");
		Resources.UnloadUnusedAssets ();
	}

	void ResumeBtnClicked(){
		Time.timeScale = 1;
		Destroy(gameObject);
		Resources.UnloadUnusedAssets ();
	}

}
