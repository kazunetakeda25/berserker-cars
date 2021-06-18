using UnityEngine;
using System.Collections;

public class OpponentcarTyreRotation : MonoBehaviour {

	public GameObject fLeft;
	public GameObject fRight;
	public GameObject bLeft;
	public GameObject bRight;

	public bool rotate = false;
	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
		if (rotate) {
			fLeft.transform.Rotate (30, 0, 0);
			fRight.transform.Rotate (30, 0, 0);
			bLeft.transform.Rotate (30, 0, 0);
			bRight.transform.Rotate (30, 0, 0);
		}
	
	}
}
