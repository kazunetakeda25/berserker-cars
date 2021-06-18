using UnityEngine;
using System.Collections;

public class TyreRotation : MonoBehaviour {
	public int speed = 30;
	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
		transform.Rotate(speed,0,0);
	}
}
