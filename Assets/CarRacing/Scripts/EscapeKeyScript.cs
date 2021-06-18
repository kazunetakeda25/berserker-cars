using UnityEngine;
using System.Collections;

public class EscapeKeyScript : MonoBehaviour {

	public currentScene sceneSelection;

	public enum currentScene {
		main,
		options,
		carSelection
	}
	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {

		if (Input.GetKeyDown (KeyCode.Escape)) {
			switch(sceneSelection){
				case currentScene.main:
					Application.Quit();
					break;

				case currentScene.options:
				Application.LoadLevel(0);
					break;

				case currentScene.carSelection:
					Application.LoadLevel(0);
					break;


			
			}

		}
	
	}
}
