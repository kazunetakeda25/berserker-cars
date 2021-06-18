using UnityEngine;
using System.Collections;
using System;
using System.Collections.Generic;

public class MyPlayerCarControl : MonoBehaviour {
	public UILabel speed;
	public float forceFactor= 2.1f;
	float nossStartTime = 0;
	float nossTotalTime = 15;
	bool nossStart = false;
	public GameObject speedoMeter;
	bool soundEnabled = true;
	// Use this for initialization

	void Start(){
		if (PlayerPrefs.GetInt ("sound", 0) == 0) {
			soundEnabled = true;
		} else {
			soundEnabled = false;
		}
	}
	void Update () {
		SpeedCalculator ();
		if (!nossStart)return;

		if (Time.time - nossStartTime > nossTotalTime) {
			nossStart = false;
			gameObject.SendMessage ("setCarForce", forceFactor);
		}

	
	}
	public void NossCollected(){
		nossStart = true;
		nossStartTime = Time.time;
		gameObject.SendMessage ("setCarForce", 3f);
	}

	void SpeedCalculator(){
		float SpeedMS =new Vector2(Vector3.Dot(rigidbody.velocity, transform.forward), Vector3.Dot(rigidbody.velocity, transform.right)).magnitude * 3.2f;
		speed.text = Mathf.Floor (SpeedMS) + "";
		speedoMeter.transform.localEulerAngles = new Vector3 (0, (SpeedMS) * 0.915f, 0);
		if (soundEnabled && SpeedMS >60) {
			if (!audio.isPlaying) {
				audio.Play ();
			}
		} else {
			if (audio.isPlaying) {
				audio.Stop();
			}
		}



	}
}
