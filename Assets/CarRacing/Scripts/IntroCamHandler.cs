using UnityEngine;
using System.Collections;

public class IntroCamHandler : MonoBehaviour {
	public Transform focusCam;
	public bool isIntro;
	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
			transform.LookAt(focusCam);
			transform.Translate(Vector3.right * Time.deltaTime);
	
	}
}
