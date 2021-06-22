using UnityEngine;
using System.Collections;

public class TilingScript : MonoBehaviour {
	public bool canRender=false;
	public int axis = 1;
	// Use this for initialization
	void Start () {

		canRender = true;
	}
	
	// Update is called once per frame
	void Update () {
		if (axis == 1) {
			GetComponent<Renderer>().material.mainTextureOffset -= new Vector2 (0, -0.07f);
		}
		else {
			GetComponent<Renderer>().material.mainTextureOffset -= new Vector2 ( -0.0009f,0);
		}
	
	}
}
