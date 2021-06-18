 using UnityEngine;
using System.Collections;
using System;

public class MainScreenUIController : MonoBehaviour {
	public AudioClip clip;
	public AudioSource source;
	public AudioClip clickClip;

	// Use this for initialization
	void Start () {

		if (!PlayerPrefs.HasKey ("control")) {
			PlayerPrefs.SetInt ("control",0);
		} 
		Debug.Log(" audio volume " +PlayerPrefs.GetFloat ("audioVolume", 1)); 
		AudioListener.volume = PlayerPrefs.GetFloat ("audioVolume", 1);
		if(PlayerPrefs.GetInt ("sound")==0){
			if(PlayerPrefs.GetInt ("music")==0){
				audio.Play();
				source.Play();
			}
		}
				
	//	source.PlayOneShot (clip);
		//gameObject.transform.parent.parent.gameObject.GetComponent<AudioSource> ().Play (clip);
	//	gameObject.transform.parent.parent.gameObject.GetComponent<AudioSource> ().Play ();
	
	}

	void OptionsPressed(){
		if(PlayerPrefs.GetInt ("sound")==0){
			audio.PlayOneShot(clickClip);	
		}
		Application.LoadLevel ("Options1");
	}

	void PowerPressed(){
		if(PlayerPrefs.GetInt ("sound")==0){
			audio.PlayOneShot(clickClip);
			
		}

		Application.Quit ();
	}

	void StartPressed(){
		if(PlayerPrefs.GetInt ("sound")==0){
			audio.PlayOneShot(clickClip);
			
		}
		Application.LoadLevel ("CarSelectionScene");
	}


}
