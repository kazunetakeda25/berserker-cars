using UnityEngine;
using System.Collections;

public class CarMovementTest : MonoBehaviour {
	GameObject main;
	public Camera controlsCam;
	bool pressed = false;
	float val= 0;
	public GameObject car;
	public enum btnDir{
		forward,
		back,
		left,
		right
	}
	public btnDir dir;
	// Use this for initialization
	void Start () {
		main = GameObject.Find ("MAIN");
		car = GameObject.FindGameObjectWithTag ("Player");
		main.SendMessage ("setFValue", 1f);
	}
	void StartCar(){
	}

	void OnMouseDown(){
		pressed = true;
		switch (dir) {
			case btnDir.forward:
				main.SendMessage ("setFValue", 0.2f);
				break;
			case btnDir.left:
			main.SendMessage ("LeftValue", -0.1f);
				break;
			case btnDir.right:
			main.SendMessage ("RightValue", 0.1f);
				break;
			case btnDir.back:
			if(PlayerPrefs.GetInt("sound",0)==0){
				audio.Play();
			}
				main.SendMessage ("ReverseValue", -0.2f);
				break;
			
		}
	
	}

	void OnMouseUp(){
		pressed = false;
		val = 0;
		switch (dir) {
		case btnDir.forward:
			main.SendMessage ("setFValue", 0f);
			break;
		case btnDir.left:
			main.SendMessage ("LeftValue", 0f);
			break;
		case btnDir.right:
			main.SendMessage ("RightValue",0f);
			break;
		case btnDir.back:
			main.SendMessage ("ReverseValue", 0f);
			if(PlayerPrefs.GetInt("sound",0)==0){
				audio.Stop();
			}
			break;
			
		}
	

	}
	
	// Update is called once per frame
	void Update () {
		if(Input.GetMouseButtonDown(0)){
			Ray ray =  controlsCam.ScreenPointToRay(Input.mousePosition);
			RaycastHit hit;
			if(Physics.Raycast(ray,out hit)){
				if(hit.collider.tag == "up"){
					Debug.Log("up");
				}
			}
		}
		for (int i=0; i<Input.touchCount; i++) {

		}

		if (pressed) {

			switch (dir) {
			case btnDir.forward:
				val +=0.03f;
				val = Mathf.Clamp(val,0,1);
				main.SendMessage ("setFValue", val);
				break;
			case btnDir.left:
				if(car.rigidbody.velocity.x>22.0f){
					val -=0.003f;
					val = Mathf.Clamp(val,-0.7f,0);
				}
				else {
					val -=0.01f;
					val = Mathf.Clamp(val,-0.9f,0);
				}
				val = Mathf.Clamp(val,-0.5f,0);
				main.SendMessage ("LeftValue", val);
				break;
			case btnDir.right: 
				if(car.rigidbody.velocity.x>22.0f){
					val +=0.003f;
					val = Mathf.Clamp(val,0,0.7f);
				}
				else {
					val +=0.01f;
					val = Mathf.Clamp(val,0,0.9f);
				}

				main.SendMessage ("RightValue",val);
				break;
			case btnDir.back:
				val -=0.01f;
				val = Mathf.Clamp(val,-1,0);
				main.SendMessage ("ReverseValue", val);
				break;
				
			}
		}
		
	}
}
