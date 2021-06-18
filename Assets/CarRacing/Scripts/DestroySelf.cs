using UnityEngine;
using System.Collections;

public class DestroySelf : MonoBehaviour {

	public float timeToDestroy = 2f;
	float startTime = 0;
	// Use this for initialization
	void Start () {
		startTime = Time.time;
	}
	
	// Update is called once per frame
	void Update () {
		if (Time.time - startTime > timeToDestroy) {
			Destroy(gameObject);
		}
	
	}
}
