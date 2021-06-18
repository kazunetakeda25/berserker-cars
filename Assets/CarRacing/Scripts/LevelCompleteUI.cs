using UnityEngine;
using System.Collections;

public class LevelCompleteUI : UIController {

	public UILabel completionTime;
	public UILabel position;
	public UILabel reward;
	
	public void SetParameters(float time, int pos){
		completionTime.text = getTimeString (time);// Mathf.FloorToInt(time) + " Secs";
		position.text = pos + "";
		reward.text = ((5 - pos) * 500) + " $";
		int points = PlayerPrefs.GetInt ("totalPoints", 0);
		points += ((5 - pos) * 500);
		PlayerPrefs.SetInt ("totalPoints", points);
		int knock0ut = PlayerPrefs.GetInt ("knockOutRound", 1);
		if (!PlayerPrefs.HasKey("statsRound" + knock0ut + "Pos")) {
				PlayerPrefs.SetInt ("statsRound" + knock0ut + "Pos", pos);
				PlayerPrefs.SetString ("statsRound" + knock0ut + "Time", getTimeString (time));
		} else {
			int statsPos = PlayerPrefs.GetInt ("statsRound" + knock0ut + "Pos", 5);
			if(statsPos<pos){
				PlayerPrefs.SetInt ("statsRound" + knock0ut + "Pos", pos);
				PlayerPrefs.SetString ("statsRound" + knock0ut + "Time", getTimeString (time));
			}
		}
		if (knock0ut < 4) {
			knock0ut++;
		}
		PlayerPrefs.SetInt ("knockOutRound", knock0ut);
	}
	public string getTimeString (float timeVal)
	{
		timeVal = Mathf.FloorToInt (timeVal);
		int h = 0;
		int min = 0;
		int sec = 0;
		string s = "";
		
		if (timeVal < 60) {
			if (timeVal < 10) {
				s = "00:00:0" + timeVal;
			} else {
				s = "00:00:" + timeVal;
			}
			
		} else if (timeVal <= 3600) {
			min = Mathf.FloorToInt (timeVal / 60);
			sec = Mathf.FloorToInt (timeVal % 60);
			string mStr = "";
			string sStr = "";
			if (min < 10) {
				mStr = "0" + min;
			} else {
				mStr = "" + min;
			}
			if (sec < 10) {
				sStr = "0" + sec;
			} else {
				sStr = "" + sec;
			}
			s = "00:" + mStr + ":" + sStr;
		}
		
		return s;
		
	}

}
