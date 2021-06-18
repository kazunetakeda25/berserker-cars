using UnityEngine;
using System.Collections;

public class TrackSelectionUI : MonoBehaviour {

	public UITexture track;
	public UILabel laps;
	public GameObject leftArrow;
	public GameObject rightArrow;
	public UILabel trackNumb; 
	public UILabel totalPoints; 
	int currentIndex =1;
	int lapsIndex =1;
	public Texture2D [] trackTextures;
	int totalTracks =4;
	public UILabel trackDescription;
	public AudioClip clickClip;
	public AudioClip notEnoughClip;
	public GameObject selectbtn;
	public GameObject buyBtn;
	public GameObject lockImg;
	public GameObject selectedTrackImage;
	public UILabel trackBuyPoints;
	// Use this for initialization
	void Start () {
		setInitials ();
	}

	void setInitials(){
		if (!PlayerPrefs.HasKey ("unlockedTracks1")) {
			PlayerPrefs.SetInt ("unlockedTracks1", 1);
		}

		if (!PlayerPrefs.HasKey ("track")) {
			PlayerPrefs.SetInt ("track", 1);
		}
		if (currentIndex == PlayerPrefs.GetInt ("track", 1)) {
			selectbtn.SetActive(false);
			selectedTrackImage.SetActive (true);
		}
		else {
			selectbtn.SetActive(true);
			selectedTrackImage.SetActive (false);
		}
		totalPoints.text = PlayerPrefs.GetInt ("totalPoints", 0)+"";
	}

	public void rightPressed(){
		if (currentIndex > totalTracks) return;
		if(PlayerPrefs.GetInt ("sound")==0){
			
			audio.PlayOneShot(clickClip);
		}

		currentIndex++;

		trackNumb.text = currentIndex +"";
		trackDescription.text = GetTrackDescription (currentIndex);
		if (currentIndex <= trackTextures.Length) {
			track.mainTexture = trackTextures[currentIndex-1];
		}

		if (currentIndex >= totalTracks){
			rightArrow.SetActive(false);
		}
		leftArrow.SetActive (true);
		setBuySelectBtns ();
	}
	
	public void leftPressed(){
		if (currentIndex <1)
			return;
		if(PlayerPrefs.GetInt ("sound")==0){
			
			audio.PlayOneShot(clickClip);
		}

		currentIndex--;
		trackNumb.text = currentIndex+"" ;
		trackDescription.text = GetTrackDescription (currentIndex);
		if (currentIndex <= trackTextures.Length) {
			track.mainTexture = trackTextures[currentIndex-1];
		}
		if (currentIndex <= 1) {
			leftArrow.SetActive(false);
		}
		rightArrow.SetActive (true);
		setBuySelectBtns ();
	}

	public string GetTrackDescription(int index){
		string s = " kuch nhi ";
		switch (index) {
			case 1:
			s = "JUNGLE";
				break;
			case 2:
			s = " DESERT";
				break;
			case 3:
				s = " CITY";
				break;
			case 4:
				s = " SEA VIEW";
				break;
		}
		return s;
	}
	void ReturnPressed(){

		Debug.Log ("$#$#$R#$#$");
		Application.LoadLevel (1);

	}

	void ChasePressed(){
		if(PlayerPrefs.GetInt ("sound")==0){
			
			audio.PlayOneShot(clickClip);
		}
		//PlayerPrefs.SetString("CONTROL","CAMERA");
	//	PlayerPrefs.SetInt ("track", (currentIndex%2)+1);
		Application.LoadLevel ("Tracks");
	}
	void GarragePressed(){
		if(PlayerPrefs.GetInt ("sound")==0){
			
			audio.PlayOneShot(clickClip);
		}
		Application.LoadLevel (1);
	}

	int getCurrentIndexTrackPoints(){
		int p = 0;
		switch (currentIndex) {
		case 1:
			p=1000;
			break;
		case 2:
			p = 100000;
			break;
		case 3:
			p = 150000;
			break;
		case 4:
			p = 250000;
			break;
		case 5:
			p = 500000;
			break;
		case 6:
			p = 1000000;
			break;
		}
		return p;
	}

	void statsPressed(){
		GameObject StatsUI = Instantiate (Resources.Load ("StatsUI")) as GameObject;
		StatsUI.transform.parent = transform;
		StatsUI.transform.localScale = new Vector3 (1, 1, 1f);
		StatsUI.transform.localPosition = new Vector3 (0, 0, -70);
	}
	void UnlockPressed(){
		int points = PlayerPrefs.GetInt ("totalPoints",0);
		if(points< getCurrentIndexTrackPoints()){
			if(PlayerPrefs.GetInt ("sound")==0){
				audio.PlayOneShot(notEnoughClip);
				
			}
			GameObject label = Instantiate(Resources.Load("NotEnoughPoints")) as GameObject;
			label.transform.parent = transform;
			label.transform.localScale = new Vector3(1,1,1);
			return;
		}
		if(PlayerPrefs.GetInt ("sound")==0){
			audio.PlayOneShot(clickClip);
			
		}
		points -= getCurrentIndexTrackPoints ();
		PlayerPrefs.SetInt ("totalPoints", points);
		totalPoints.text = points+"";
		PlayerPrefs.SetInt ("unlockedTracks" + currentIndex, 1);
		PlayerPrefs.SetInt ("track", currentIndex);
		selectbtn.SetActive(false);
		buyBtn.SetActive(false);
		lockImg.SetActive(false);
	}

	void setBuySelectBtns(){
		if ( PlayerPrefs.GetInt ("unlockedTracks"+currentIndex, 0)==1) {
			if (currentIndex == PlayerPrefs.GetInt ("track", 1)) {
				selectbtn.SetActive(false);
				selectedTrackImage.SetActive (true);
			}
			else {
				selectbtn.SetActive(true);
				selectedTrackImage.SetActive (false);
			}
			trackBuyPoints.transform.parent.gameObject.SetActive(false);
			buyBtn.SetActive(false);
			lockImg.SetActive(false);
			
		}
		else  {
			selectedTrackImage.SetActive (false);
			selectbtn.SetActive(false);
			trackBuyPoints.transform.parent.gameObject.SetActive(true);
			trackBuyPoints.text = getCurrentIndexTrackPoints()+"";
			buyBtn.SetActive(true);
			lockImg.SetActive(true);
		}
	}

	void selectPressed(){
		if (currentIndex == PlayerPrefs.GetInt ("track", 1)) {
			return;	
		}
		if(PlayerPrefs.GetInt ("sound")==0){
			audio.PlayOneShot(clickClip);
			
		}
		PlayerPrefs.SetInt ("track", currentIndex);
		selectbtn.SetActive(false);
		selectedTrackImage.SetActive (true);
		buyBtn.SetActive(false);
		lockImg.SetActive(false);
		
	}

	void leftLapPressed(){

		if (lapsIndex <= 1) {
				return;
		}

		lapsIndex--;
		laps.text = lapsIndex + "";
		PlayerPrefs.SetInt ("totalLaps", lapsIndex);

	}

	void RightLapPressed(){
		
		if (lapsIndex >= 3) {
			return;
		}
		
		lapsIndex++;
		laps.text = lapsIndex + "";
		PlayerPrefs.SetInt ("totalLaps", lapsIndex);
		
	}


}
