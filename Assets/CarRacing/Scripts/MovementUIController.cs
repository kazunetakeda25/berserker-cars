using UnityEngine;
using System.Collections;

public class MovementUIController : MonoBehaviour {

	public GameObject leftRightBtns;
	// Use this for initialization
	void Start () {

		
		#if UnityEditor
		controlsInput = false;
		btnControls = true;
		
		#endif
		
		if(Application.platform == RuntimePlatform.Android){
			if(PlayerPrefs.GetInt ("control",0)== 0){
				leftRightBtns.SetActive(false);
			}
			else{
				leftRightBtns.SetActive(true);
			}
		}
	}
	
	// Update is called once per frame
	void Update () {
	
	}
}
