using UnityEngine;
using System.Collections;

public class CarColliderHandler : MonoBehaviour {

	public int point = 1;
	public GameObject leftParticles;
	public GameObject RightParticles;

	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
	
	}

	void OnTriggerStay(Collider col){
		if (col.tag != "wheels" && col.tag != "CheckPoints") {
			if (point == 1) {
					leftParticles.SetActive (true);
			}
			else if (point == 2) {
				RightParticles.SetActive(true);
			}
		}
	}

	void OnTriggerExit(Collider col){
		if (col.tag != "wheels" && col.tag != "CheckPoints") {
			if (point == 1) {
				leftParticles.SetActive (false);
			}
			else if (point == 2) {
				RightParticles.SetActive(false);
			}
		}
	}
}
