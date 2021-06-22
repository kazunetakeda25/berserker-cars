using UnityEngine;
using System.Collections;

public class CarSelectionUIController : MonoBehaviour {

	public int totalCars = 4;
	public GameObject leftArrow;
	public GameObject rightArrow;
	int currentIndex=1;
	bool waitForNext = false;
	float timePressed;
	public GameObject [] specs;
	public GameObject ramp;
	public GameObject CarPrefab;
	Material bodyMat;
	public GameObject selectbtn;
	public GameObject buyBtn;
	public GameObject lockImg;
	public GameObject selectedCarImage;
	public UILabel totalPoints;
	public UILabel carBuyPoints;
	public AudioClip carChangeClip;
	public AudioClip notEnoughClip;
	public AudioClip clickClip;

	// Use this for initialization
	void Start () {
		if(PlayerPrefs.GetInt ("sound")==0){
			if(PlayerPrefs.GetInt ("music")==0){
				GetComponent<AudioSource>().Play();
			}
		}

		bodyMat = CarPrefab.GetComponent<Renderer>().materials [1];
		checkArrows ();
		setCarColor ();
		if (!PlayerPrefs.HasKey ("unlockedCars")) {
			PlayerPrefs.SetInt ("unlockedCars1", 1);
		}
		if (currentIndex == PlayerPrefs.GetInt ("CurrentCarSelected", 1)) {
			selectbtn.SetActive(false);
			selectedCarImage.SetActive (true);
		}
		else {
			selectbtn.SetActive(true);
			selectedCarImage.SetActive (false);
		}
		totalPoints.text = PlayerPrefs.GetInt ("totalPoints", 0)+"";

		
	}
	void Update(){
		if (waitForNext && (Time.time - timePressed > 0.2f)) {
			waitForNext = false;
			enableColliders();
		}
	}

	void ChasePressed(){
		//PlayerPrefs.SetString("CONTROL","CAMERA");
	//	PlayerPrefs.SetInt ("track", 2);
	//	PlayerPrefs.SetInt ("CurrentCarSelected", currentIndex);
		if(PlayerPrefs.GetInt ("sound")==0){
			GetComponent<AudioSource>().PlayOneShot(clickClip);
			
		}
		Application.LoadLevel ("Tracks");
		Resources.UnloadUnusedAssets ();
		}

	void ReturnPressed(){
		if(PlayerPrefs.GetInt ("sound")==0){
			GetComponent<AudioSource>().PlayOneShot(clickClip);
			
		}
		Application.LoadLevel (0);
	}

	void checkArrows(){
		leftArrow.SetActive (false);
		rightArrow.SetActive (true);

	}
	void leftArrowPressed(){
		if (waitForNext) return;
		if(PlayerPrefs.GetInt ("sound")==0){
				GetComponent<AudioSource>().PlayOneShot(carChangeClip);
	
		}
		waitForNext = true;
		timePressed = Time.time;
		ramp.SendMessage ("MoveDown");
		disableColliders ();
		currentIndex--;

		if (specs.Length >= currentIndex && currentIndex>0) {
			disableAllSpecs();
			specs[currentIndex-1].SetActive(true);
		//	setCarColor();
		}
		if (currentIndex <= 1) {
			leftArrow.SetActive(false);
		}
		rightArrow.SetActive(true);
		setBuySelectBtns ();
	}

	void rightArrowPressed(){
		if (waitForNext) return;
		if(PlayerPrefs.GetInt ("sound")==0){
			GetComponent<AudioSource>().PlayOneShot(carChangeClip);
			
		}
		waitForNext = true;
		timePressed = Time.time;
		disableColliders ();
		ramp.SendMessage ("MoveDown");
		currentIndex++;
		if (specs.Length >= currentIndex && currentIndex>0) {
			disableAllSpecs();
			specs[currentIndex-1].SetActive(true);
			//setCarColor();
		}
		if (currentIndex >=totalCars) {
			rightArrow.SetActive(false);
		}
		leftArrow.SetActive (true);
		setBuySelectBtns ();

	}

	void disableColliders(){

		leftArrow.GetComponent<Collider>().enabled = false;
		rightArrow.GetComponent<Collider>().enabled = false;
	}

	void disableAllSpecs(){

		for (int i=0; i<specs.Length; i++) {
			specs[i].SetActive(false);
		}
	}

	void enableColliders(){
		
		leftArrow.GetComponent<Collider>().enabled = true;
		rightArrow.GetComponent<Collider>().enabled = true;
	}

	public void setCarColor(){
		switch (currentIndex) {
		case 1:
			bodyMat.color= Color.red;
			bodyMat.SetColor("_SpecColor", Color.red);

				break;
		case 2:
			bodyMat.color= Color.gray;
			bodyMat.SetColor("_SpecColor", Color.gray);

			break;
		case 3:
			bodyMat.color= Color.black;
			bodyMat.SetColor("_SpecColor", Color.black);

			break;
		case 4:
			bodyMat.color= Color.cyan;
			bodyMat.SetColor("_SpecColor", Color.cyan);

			break;
		case 5:
			bodyMat.color= Color.magenta;
			bodyMat.SetColor("_SpecColor", Color.magenta);


			break;
		case 6:
			bodyMat.color= Color.yellow;
			bodyMat.SetColor("_SpecColor", Color.yellow);

			break;
		}
	}

	void setBuySelectBtns(){
		if ( PlayerPrefs.GetInt ("unlockedCars"+currentIndex, 0)==1) {
			if (currentIndex == PlayerPrefs.GetInt ("CurrentCarSelected", 1)) {
				selectbtn.SetActive(false);
				selectedCarImage.SetActive (true);
			}
			else {
				selectbtn.SetActive(true);
				selectedCarImage.SetActive (false);
			}
			carBuyPoints.transform.parent.gameObject.SetActive(false);
			buyBtn.SetActive(false);
			lockImg.SetActive(false);

		}
		else  {
			selectedCarImage.SetActive (false);
			selectbtn.SetActive(false);
			carBuyPoints.transform.parent.gameObject.SetActive(true);
			carBuyPoints.text = getCurrentIndexCarPoints()+"";
			buyBtn.SetActive(true);
			lockImg.SetActive(true);
		}
	}

	void selectPressed(){
		if (currentIndex == PlayerPrefs.GetInt ("CurrentCarSelected", 1)) {
			return;	
		}
		if(PlayerPrefs.GetInt ("sound")==0){
			GetComponent<AudioSource>().PlayOneShot(clickClip);
			
		}
		PlayerPrefs.SetInt ("CurrentCarSelected", currentIndex);
		selectbtn.SetActive(false);
		selectedCarImage.SetActive (true);
		buyBtn.SetActive(false);
		lockImg.SetActive(false);

	}

	void buyPressed(){
		int points = PlayerPrefs.GetInt ("totalPoints",0);
		if(points< getCurrentIndexCarPoints()){
			if(PlayerPrefs.GetInt ("sound")==0){
				GetComponent<AudioSource>().PlayOneShot(notEnoughClip);
				
			}
			GameObject label = Instantiate(Resources.Load("NotEnoughPoints")) as GameObject;
			label.transform.parent = transform;
			label.transform.localScale = new Vector3(1,1,1);
			return;
		}
		if(PlayerPrefs.GetInt ("sound")==0){
			GetComponent<AudioSource>().PlayOneShot(clickClip);
			
		}
		points -= getCurrentIndexCarPoints ();
		PlayerPrefs.SetInt ("totalPoints", points);
		totalPoints.text = points+"";
		PlayerPrefs.SetInt ("unlockedCars" + currentIndex, 1);
		PlayerPrefs.SetInt ("CurrentCarSelected", currentIndex);
		selectbtn.SetActive(false);
		buyBtn.SetActive(false);
		lockImg.SetActive(false);
	}

	int getCurrentIndexCarPoints(){
		int p = 0;
		switch (currentIndex) {
		case 1:
			p=1000;
			break;
		case 2:
			p = 10000;
			break;
		case 3:
			p = 25000;
			break;
		case 4:
			p = 50000;
			break;
		case 5:
			p = 750000;
			break;
		case 6:
			p = 100000;
			break;
		}
		return p;
	}

	void GoPressed(){
		if(PlayerPrefs.GetInt ("sound")==0){
			GetComponent<AudioSource>().PlayOneShot(clickClip);
			
		}
		Application.LoadLevel ("TrackSelectionScene");
		Resources.UnloadUnusedAssets ();
	}
	void TracksPressed(){
		if(PlayerPrefs.GetInt ("sound")==0){
			GetComponent<AudioSource>().PlayOneShot(clickClip);
			
		}
		Application.LoadLevel ("TrackSelectionScene");
		Resources.UnloadUnusedAssets ();
	}

	void statsPressed(){
		GameObject StatsUI = Instantiate (Resources.Load ("StatsUI")) as GameObject;
		StatsUI.transform.parent = transform;
		StatsUI.transform.localScale = new Vector3 (1, 1, 1f);
		StatsUI.transform.localPosition = new Vector3 (0, 0, -70);
	}

}
