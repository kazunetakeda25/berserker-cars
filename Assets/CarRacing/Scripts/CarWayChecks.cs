using UnityEngine;
using System.Collections;
using System.Collections.Generic;
using System;

public class CarWayChecks : MonoBehaviour {
	public int checPointNumb=1;
	public UILabel lbl;
	public UILabel lapLbl;
	public UILabel totalLapLbl;
	public WayCheck [] checkPoints;
	public OpponentCarWayCheck [] opponentCar;
	public BetterList<bool> checks;
	public int totalLaps= 1;
	public bool isFinished= false;
	public int lap = 1;
	int trackNo=1;
	GameObject main;
	bool firstTime=false;
	float startTime = 0;

	public AudioClip lapClearedClip;
	public AudioClip wrongDirClip;
	// Use this for initialization
	void Start () {
		main = GameObject.Find ("MAIN");
		totalLaps = PlayerPrefs.GetInt ("totalLaps", 1);
		trackNo = PlayerPrefs.GetInt ("track", 1);
		checkPoints = GameObject.Find ("Track"+trackNo+"CheckPoints").GetComponentsInChildren<WayCheck> ();
		checks = new BetterList<bool> ();
		for(int i=0; i<checkPoints.Length; i++) {
			checks.Add(false);
		}
		checks [0] = true;
		lapLbl.text = lap + "";
		totalLapLbl.text = totalLaps + "";

	
	}
	bool wrongWay = false;
	// Update is called once per frame
	void Update () {
		if (isFinished)return;
		Vector3 trackDir;
		if (checPointNumb == checkPoints.Length) {
			trackDir = GameObject.Find("Way1").transform.position - GameObject.Find("Way"+checkPoints.Length).transform.position;


		} else {
			 trackDir = GameObject.Find("Way"+(checPointNumb+1)).transform.position - GameObject.Find("Way"+checPointNumb).transform.position;

		}
		//Vector3 trackDir = GameObject.Find("Way"+(checPointNumb+1)).transform.position - GameObject.Find("Way"+checPointNumb).transform.position;
		trackDir.Normalize();
		float xx = Vector3.Dot(this.transform.forward, trackDir);
		if (xx < 0) {
				wrongWay = true;
				lbl.enabled= true;
			if(!firstTime){
				firstTime = true;
				startTime = Time.time;
			}
		} else {
				wrongWay = false;
				lbl.enabled= false;
				firstTime = false;
		}

		if (wrongWay) {
			if(firstTime){
				if(Time.time - startTime >3){
					startTime =  Time.time;
					audio.PlayOneShot(wrongDirClip);
				}
			}

		}

		//Debug.Log (" car pos " + GetCarPosition ());
	//	lbl.enabled= true;
	//	posLbl.text = GetCarPosition () + "";

	
	}
	
	public void setCheckPointNumb(int numb){
		checPointNumb = numb;
		bool isLapCleared = true;

		if (numb > 1) {
			if(checks[numb-2]== true){
				checks [checPointNumb - 1] = true;
			}
		}
		for (int i=0; i<checks.size; i++) {
			if(checks[i]== false){
				isLapCleared =  false;
				break;
			}
		}
		if (Application.platform == RuntimePlatform.Android) {
			checkPoints[15].collider.enabled = false;
		}
		if (isLapCleared && checPointNumb==1) {
			lap++;
			checks.Clear();
			for(int i=0; i<checkPoints.Length; i++) {
				checks.Add(false);
			}
			checks [0] = true;
			if (lap > totalLaps) {
				isFinished = true;

			}
			else{
				audio.PlayOneShot(lapClearedClip);
				lapLbl.text = lap+" / "+ totalLaps;
				lap--;
			}
		}
	}

	public float GetDistance() {
		if (checPointNumb > 1) {
			if (checks [checPointNumb - 2]) {
		//		Debug.Log(" distance " +(transform.position - checkPoints [checPointNumb - 1].gameObject.transform.position).magnitude);
					return (transform.position - checkPoints [checPointNumb - 1].gameObject.transform.position).magnitude + (checPointNumb * 1000) + ((lap - 1) * 32000);

			} else {
					return (lap - 1) * 32000;
			}
		}
		else {
		//	Debug.Log(" distance " +(transform.position - checkPoints [checPointNumb - 1].gameObject.transform.position).magnitude);

			return (transform.position - checkPoints [checPointNumb - 1].gameObject.transform.position).magnitude + (checPointNumb * 1000) + ((lap - 1) * 32000);

		}
	}


	public int GetCarPosition() {
		float distance = GetDistance();
		Debug.Log ("distance " + distance);
		int position = 1;
		foreach (OpponentCarWayCheck car in opponentCar) {
			if (car.GetDistance() > distance)
				position++;
		}
		return position;
	}

	void refershCar(){
		main.SendMessage ("setFValue", 0f);
		rigidbody.velocity = Vector3.zero;
		rigidbody.angularVelocity = Vector3.zero;
		WayCheck wayCheck = checkPoints [checPointNumb - 1];
		transform.localPosition = wayCheck.carRefereshPos;
		if (wayCheck.isLocalRot) {
			transform.localEulerAngles = wayCheck.rot;
		} 
		else {
			transform.localEulerAngles = new Vector3 (0,wayCheck.gameObject.transform.localEulerAngles.y, 0);
		}
		//CancelInvoke("graduallyIncrease");
		sp = 0;
		Invoke("graduallyIncrease",1);
	}
	float sp = 0;
	void graduallyIncrease(){
		if (sp <= 1) {
			main.SendMessage ("setFValue", 1);
			//gameObject.SendMessage("setSteerInput",sp);
		} else {
			CancelInvoke("graduallyIncrease");
		}
	}
}
