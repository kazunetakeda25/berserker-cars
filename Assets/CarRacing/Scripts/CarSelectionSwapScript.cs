using UnityEngine;
using System.Collections;

public class CarSelectionSwapScript : MonoBehaviour {
	public bool canSwap = false;
	float rotationY;
	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
				//	if (canSwap) {
				rotationY += Input.GetAxis ("Mouse X") * 10;
				rotationY = Mathf.Clamp (rotationY, -16, 16);
			
				//transform.localEulerAngles = new Vector3(0,-rotationY , 0);
		if (Input.touchCount > 0) {
			rotationY += Input.touches[0].deltaPosition.x * 10;
			rotationY = Mathf.Clamp (rotationY, -16, 16);

			}

			transform.rotation = Quaternion.Slerp(transform.rotation, Quaternion.Euler(new Vector3(0,-rotationY , 0)), Time.deltaTime*3);
	//	}
	
	}

	void OnMouseDown(){
		canSwap = true;
	}

	void OnMouseUp(){
		canSwap = false;
	}
}
