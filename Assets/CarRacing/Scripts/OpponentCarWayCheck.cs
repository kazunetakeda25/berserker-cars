using UnityEngine;
using System.Collections;

public class OpponentCarWayCheck : MonoBehaviour {
	public int checPointNumb=1;
//	public UILabel lbl;
	public WayCheck [] checkPoints;
	public int carLap= 1;
	public int totalLaps= 1;
	public bool isFinished= false;
	// Use this for initialization
	void Start () {
		totalLaps = PlayerPrefs.GetInt ("totalLaps", 1);
		int trackNo = PlayerPrefs.GetInt ("track", 1);
		checkPoints = GameObject.Find ("Track"+trackNo+"CheckPoints").GetComponentsInChildren<WayCheck> ();
		
	}
	public void setCheckPointNumb(int numb){
		if (checPointNumb == checkPoints.Length && numb == 1) {
			carLap++;
		}
		checPointNumb = numb;
		if (carLap > totalLaps) {
			isFinished = true;
			float rand = Random.Range(1,4);
			Invoke("stopCar",rand);
		}
		if (Application.platform == RuntimePlatform.Android) {
			checkPoints[10].collider.enabled = false;
		}
	}
	void stopCar(){
		gameObject.GetComponent<hoMove> ().Stop ();
	}
	
	public float GetDistance() {
		return (transform.position - checkPoints[checPointNumb-1].gameObject.transform.position).magnitude +( checPointNumb * 1000) +( (carLap-1) * 32000);
	}
}
