using UnityEngine;
using System.Collections;

public class StatsUIController : MonoBehaviour {

	public UILabel noRecordlabel;
	public GameObject [] bgStrips;
	public UILabel [] roundLbl;
	public UILabel [] posLabels;
	public UILabel [] timeLabels;
	// Use this for initialization
	void Start () {
		if (!PlayerPrefs.HasKey("statsRound" + 1 + "Pos")) {
			noRecordlabel.enabled = true;
		} else {
			noRecordlabel.enabled = false;
			for(int i=1;i<5;i++){
				if (!PlayerPrefs.HasKey("statsRound" + i + "Pos")) {
					break;  
				}
				posLabels[i-1].enabled = true;
				posLabels[i-1].text= PlayerPrefs.GetInt ("statsRound" + i + "Pos", 50)+"";
				timeLabels[i-1].enabled = true;
				timeLabels[i-1].text= PlayerPrefs.GetString ("statsRound" + i + "Time", "");
				roundLbl[i-1].enabled = true;
				bgStrips[i-1].gameObject.SetActive(true);
			}
		
		}
	
	}

	void ReturnPressed(){
		Destroy (gameObject);
	}
}
