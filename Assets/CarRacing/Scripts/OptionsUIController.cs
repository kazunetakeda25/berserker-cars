using UnityEngine;
using System.Collections;

public class OptionsUIController : MonoBehaviour {

	public UISprite Music;
	public UISprite Control;
	public UISprite Sound;
	public UISprite Vibration;
	public UISprite camDir;
	public UISlider slider;
	public UISprite volume;

	// Use this for initialization
	void Start () {
		slider.sliderValue = PlayerPrefs.GetFloat ("audioVolume", 1);
		if(PlayerPrefs.GetInt ("sound")==0){
			if(PlayerPrefs.GetInt ("music")==0){
				audio.Play();
			}
		}
		if(slider.sliderValue>0){
			volume.spriteName = "volume_btn";
		}
		else{
			volume.spriteName = "mute_btn";
		}
		setBtns ();
	}

	void setBtns(){
		if (!PlayerPrefs.HasKey ("music")) {
			PlayerPrefs.SetInt ("music",0);
			Music.spriteName = "music_on";
		} else {
			if(PlayerPrefs.GetInt ("music")==1){
				Music.spriteName = "music_of";
			}
			else if(PlayerPrefs.GetInt ("music")==0){
				Music.spriteName = "music_on";
			}
		}

		if (!PlayerPrefs.HasKey ("sound")) {
			PlayerPrefs.SetInt ("sound",0);
			Sound.spriteName = "sound_on";
		} else {
			if(PlayerPrefs.GetInt ("sound")==1){
				Sound.spriteName = "sound_of";
			}
			else if(PlayerPrefs.GetInt ("sound")==0){
				Sound.spriteName = "sound_on";
			}
		}

		if (!PlayerPrefs.HasKey ("control")) {
			PlayerPrefs.SetInt ("control",0);
			Control.spriteName = "touch_of";
		} else {
			if(PlayerPrefs.GetInt ("control")==0){
				Control.spriteName = "touch_of";
			}
			else if(PlayerPrefs.GetInt ("control")==1){
				Control.spriteName = "touch_on";
			}
		}
		if (!PlayerPrefs.HasKey ("vibration")) {
			PlayerPrefs.SetInt ("vibration",1);
			Vibration.spriteName = "vibration_open";
		} else {
			if(PlayerPrefs.GetInt ("vibration")==0){
				Vibration.spriteName = "vibration_close";
			}
			else if(PlayerPrefs.GetInt ("vibration")==1){
				Vibration.spriteName = "vibration_open";
			}
		}
		if (!PlayerPrefs.HasKey ("camFacing")) {
			PlayerPrefs.SetInt ("camFacing",1);
			camDir.spriteName = "camera_front";
		} else {
			if(PlayerPrefs.GetInt ("camFacing")==0){
				camDir.spriteName = "camera_back";
			}
			else if(PlayerPrefs.GetInt ("camFacing")==1){
				camDir.spriteName = "camera_front";
			}
		}
	}

	void MusicClicked(){

		if(PlayerPrefs.GetInt ("music")==0){

			Music.spriteName = "music_of";
			PlayerPrefs.SetInt ("music",1);
			audio.Stop();
		}
		else if(PlayerPrefs.GetInt ("music")==1){
			Music.spriteName = "music_on";
			PlayerPrefs.SetInt ("music",0);
			if(PlayerPrefs.GetInt ("sound")==0){
				audio.Play();
			}
		}
	}
	void SoundClicked(){
		
		if(PlayerPrefs.GetInt ("sound")==0){
			
			Sound.spriteName = "sound_of";
			PlayerPrefs.SetInt ("sound",1);
			audio.Stop();
		}
		else if(PlayerPrefs.GetInt ("sound")==1){
			Sound.spriteName = "sound_on";
			PlayerPrefs.SetInt ("sound",0);
			if(PlayerPrefs.GetInt ("music")==0){
				audio.Play();
			}
		}
	}

	void ControlClicked(){
		if(PlayerPrefs.GetInt ("control")==0){
			Control.spriteName = "touch_on";
			PlayerPrefs.SetInt ("control",1);
		}
		else if(PlayerPrefs.GetInt ("control")==1){
			Control.spriteName = "touch_of";
			PlayerPrefs.SetInt ("control",0);

		}
	}

	void VibrationClicked(){
		if(PlayerPrefs.GetInt ("vibration")==0){
			Vibration.spriteName = "vibration_open";
			PlayerPrefs.SetInt ("vibration",1);
		}
		else if(PlayerPrefs.GetInt ("vibration")==1){
			Vibration.spriteName = "vibration_close";
			PlayerPrefs.SetInt ("vibration",0);
		}
	}

	void CameraClicked(){
		if(PlayerPrefs.GetInt ("camFacing")==0){
			camDir.spriteName = "camera_front";
			PlayerPrefs.SetInt ("camFacing",1);
		}
		else if(PlayerPrefs.GetInt ("camFacing")==1){
			camDir.spriteName = "camera_back";
			PlayerPrefs.SetInt ("camFacing",0);
		}
	}

	public void OnSliderChange(){
		PlayerPrefs.SetFloat ("audioVolume", slider.sliderValue);
		AudioListener.volume = slider.sliderValue;
		if(slider.sliderValue>0){
			volume.spriteName = "volume_btn";
		}
		else{
			volume.spriteName = "mute_btn";
		}
	}

	void ReturnPressed(){
		Application.LoadLevel (0);
		Resources.UnloadUnusedAssets ();
	}


}
