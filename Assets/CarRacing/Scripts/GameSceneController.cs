using UnityEngine;
using System.Collections;
using System;

public class GameSceneController : MonoBehaviour
{
		float startTime = 0;
		public float time;
		int trackNo = 1;
		int playerCarNO = 1;
		int playerCarPos = 5;
		int totalOpponentCars = 4;
		public GameObject[] Tracks;
		public GameObject playerCar;
		CarWayChecks playerWayCheck;
		public GameObject[]  OpponentCars;
		BetterList <OpponentCarWayCheck>  OpponentCarsWayCheck;
		public UILabel posLbl;
		public UILabel StartCountDown;
		bool gameStarted = false;
		bool gameEnded = false;
		bool mapCamShown = false;
		public GameObject mapCam;
		bool carBackCamShown = true;
		public MeshRenderer carMesh;
		Material carMat;
		WayPointsHolder waypointsHolder;
		public GameObject[]wayPoints;
		public GameObject[] trackCheckPoints;
		public UILabel timeLbl;
		public AudioClip goSoundClip;
		public GameObject mainCamObj;
		bool camIntro = false;
		public GameObject initialCollider;
		int opponentMaxSpeed = 30;

		void Awake ()
		{
				trackNo = PlayerPrefs.GetInt ("track", 1);
				int knockoutRound = PlayerPrefs.GetInt ("knockOutRound", 1);
				playerCar = GameObject.FindGameObjectWithTag ("Player");
				switch (knockoutRound) {
				case 1:
					opponentMaxSpeed = 30;
					break;
				case 2:
					playerCar.transform.localPosition = new Vector3 (-822.115f,0.04195225f,-541.5483f);
					opponentMaxSpeed = 32;
					break;
				case 3:
					playerCar.transform.localPosition = new Vector3 (-820.0332f,0.04195225f,-543.5732f);
					opponentMaxSpeed = 40;
					break;
				case 4:
					playerCar.transform.localPosition = new Vector3 (-819.781f,0.04195225f,-543.4849f);
					opponentMaxSpeed = 55;
					break;
				}
				
				totalOpponentCars = 5 - knockoutRound;
				trackCheckPoints [trackNo - 1].SetActive (true);
				
		}
		// Use this for initialization
		void Start ()
		{
				LoadWayPoints ();
				LoadOpponents ();
				carMat = carMesh.materials [1];
				LoadEnvironment ();
				LoadCars ();
				posLbl.text = playerCarPos + "";
				Invoke ("IntroEnd", 10);
				showRoundLabel ();
		}

		void IntroEnd ()
		{
				initialCollider.SetActive (false);
				mainCamObj.camera.enabled = true;
				GameObject.FindGameObjectWithTag ("CameraSwitch").SendMessage ("DoFade");
				mainCamObj.SendMessage ("introFinished");
				Invoke ("SecondIntroEnd",0);
//				mainCamObj.AddComponent <TweenPosition>();
//				mainCamObj.GetComponent<TweenPosition> ().to = new Vector3 (-819.4949f, 2.051953f, -534.7136f);
//				mainCamObj.GetComponent<TweenPosition> ().from= new Vector3 (-819.4949f, 2.95f, -534.7136f);
//				mainCamObj.GetComponent<TweenPosition> ().duration = 2;
		}

	void SecondIntroEnd(){
		mainCamObj.SendMessage ("secondIntroFinished");
		camIntro = true;
		StartCountDown.enabled = true;
		startTime = Time.time;
		if (checkIsSoundOn ()) {
			audio.PlayOneShot (goSoundClip);
		}
	}

		void showRoundLabel(){
			GameObject root = GameObject.FindGameObjectWithTag ("PlayScene2DPanel");
			GameObject RoundLbl = Instantiate (Resources.Load ("RoundLabel")) as GameObject;
			RoundLbl.transform.parent = root.transform;
			RoundLbl.transform.localScale = new Vector3 (130f, 100f, 1f);
			RoundLbl.GetComponent<UILabel> ().text = "Round " + PlayerPrefs.GetInt ("knockOutRound", 1);
		}

		void waitToDiableGo ()
		{
				StartCountDown.gameObject.SetActive (false);
				if (checkIsSoundOn ()) {
						audio.Play ();
				}

		}

		bool checkIsSoundOn ()
		{
				if (PlayerPrefs.GetInt ("sound", 1) == 0) {
						return true;
				} else {
						return false;
				}
		}

		void LoadWayPoints ()
		{

				wayPoints [trackNo - 1].SetActive (true);
				waypointsHolder = GameObject.Find ("WayPoints" + trackNo).GetComponent<WayPointsHolder> ();
		}

		void LoadOpponents ()
		{
				
				playerWayCheck = playerCar.GetComponent<CarWayChecks> ();
				//	OpponentCars = GameObject.FindGameObjectsWithTag ("Opponent");
				OpponentCarsWayCheck = new BetterList<OpponentCarWayCheck> ();
				for (int i=0; i<totalOpponentCars; i++) {
						OpponentCars [i].GetComponent<hoMove> ().SetPath (waypointsHolder.wayPoints [i]);
						OpponentCarsWayCheck.Add (OpponentCars [i].GetComponent<OpponentCarWayCheck> ());
				}

				if (totalOpponentCars < OpponentCars.Length) {
						for (int i= totalOpponentCars; i<OpponentCars.Length; i++) {
								OpponentCars [i].SetActive (false);
						}
				}
		}

		void StartGame ()
		{
				Invoke ("waitToDiableGo", 1);
				StartCountDown.collider.enabled = false;

				for (int i=0; i<totalOpponentCars; i++) {
						OpponentCars [i].GetComponent<hoMove> ().enabled = true;
						OpponentCars [i].GetComponent<OpponentcarTyreRotation> ().rotate = true;
				}
				InvokeRepeating ("MoveCarsWithRandomSpeed", 0, 1f);
				playerCar.rigidbody.isKinematic = false;

		}

		float sp = 7;

		void MoveCarsWithRandomSpeed ()
		{
				int j = totalOpponentCars - 1;
				if (sp > opponentMaxSpeed) {
						CancelInvoke ("MoveCarsWithRandomSpeed");
						for (int i=0; i<totalOpponentCars; i++) {
								OpponentCars [i].GetComponent<hoMove> ().ChangeSpeed (sp + j * 6);
								j--;
						}
						return;
				}

				for (int i=0; i<totalOpponentCars; i++) {
					OpponentCars [i].GetComponent<hoMove> ().ChangeSpeed (sp +  j * 2);
					j--;
				}
				sp += 3;
		}

		void LoadEnvironment ()
		{

				Tracks [trackNo - 1].SetActive (true);
				GameObject terrain = Instantiate (Resources.Load ("Track" + trackNo + "Terrain")) as GameObject;
		}

		void LoadCars ()
		{
				playerCarNO = PlayerPrefs.GetInt ("CurrentCarSelected", 1);
				setCarColor ();
		}

		public int GetCarPosition ()
		{
				float distance = playerWayCheck.GetDistance ();
				//Debug.Log (" distance " + distance);
				int position = 1;
				foreach (OpponentCarWayCheck car in OpponentCarsWayCheck) {
						if (car.GetDistance () > distance)
								position++;
				}
				return position;
		}

		public int GetCarCompletion ()
		{
				int completedCars = 0;
				foreach (OpponentCarWayCheck car in OpponentCarsWayCheck) {
						if (car.isFinished)
								completedCars++;
				}
				return completedCars;
		}

		void LateUpdate ()
		{
				if (!camIntro)
						return;
				if (gameEnded) {
						return;
				}
				if (!gameStarted) {
						time = Time.time - startTime;
						int remTime = 3 - Mathf.FloorToInt (Time.time - startTime);
						if (remTime > 0) {
								StartCountDown.text = (remTime) + "";
						} else {
								StartCountDown.text = " GO!";
						}

				}
				if (Time.time - startTime > 3 && !gameStarted) {
						gameStarted = true;
						StartGame ();
				}
				if (gameStarted && !gameEnded) {	
						time = Time.time - startTime - 3;
						//	timeLbl.text = Mathf.FloorToInt(time) + " Secs";
						timeLbl.text = getTimeString (time);
						playerCarPos = GetCarPosition ();
						posLbl.text = playerCarPos + "";
						int comp = GetCarCompletion ();
						if (comp >= totalOpponentCars) {
								gameEnded = true;
								//	StartCountDown.enabled = true;
								//	StartCountDown.text =" Finished!";
								GameOver ();
						}

						if (playerWayCheck.isFinished) {
								gameEnded = true;
								TrackComplete ();
						}
				}

		}

		public string getTimeString (float timeVal)
		{
				timeVal = Mathf.FloorToInt (timeVal);
				int h = 0;
				int min = 0;
				int sec = 0;
				string s = "";

				if (timeVal < 60) {
						if (timeVal < 10) {
								s = "00:00:0" + timeVal;
						} else {
								s = "00:00:" + timeVal;
						}

				} else if (timeVal <= 3600) {
						min = Mathf.FloorToInt (timeVal / 60);
						sec = Mathf.FloorToInt (timeVal % 60);
						string mStr = "";
						string sStr = "";
						if (min < 10) {
								mStr = "0" + min;
						} else {
								mStr = "" + min;
						}
						if (sec < 10) {
								sStr = "0" + sec;
						} else {
								sStr = "" + sec;
						}
						s = "00:" + mStr + ":" + sStr;
				}

				return s;

		}

		void GameOver ()
		{
				PlayerPrefs.SetInt ("knockOutRound", 1);
				GameObject.Find ("MAIN").SendMessage ("setFValue", 0f);
				//playerCar.SendMessage ("setSteerInput",0f);
				GameObject root = GameObject.FindGameObjectWithTag ("PlayScene2DPanel");
				GameObject GameOverUI = Instantiate (Resources.Load ("GameOver")) as GameObject;
				GameOverUI.transform.parent = root.transform;
				GameOverUI.transform.localPosition = new Vector3 (0, 0, -60);
				GameOverUI.transform.localScale = new Vector3 (1.45f, 1.45f, 1.45f);

		}

		void TrackComplete ()
		{
				gameEnded = true;
				GameObject.Find ("MAIN").SendMessage ("setFValue", 0f);
				playerCar.SendMessage ("setSteerInput", 0f);
				GameObject root = GameObject.FindGameObjectWithTag ("PlayScene2DPanel");
				GameObject levelComplete = Instantiate (Resources.Load ("LevelComplete")) as GameObject;
				levelComplete.transform.parent = root.transform;
				levelComplete.transform.localPosition = new Vector3 (0, 0, -60);
				levelComplete.transform.localScale = new Vector3 (1.45f, 1.45f, 1.45f);
				levelComplete.GetComponent<LevelCompleteUI> ().SetParameters (time, GetCarPosition ());
	
		}

		void GamePaused ()
		{
				Time.timeScale = 0;
				GameObject root = GameObject.FindGameObjectWithTag ("PlayScene2DPanel");
				GameObject GamePausedUI = Instantiate (Resources.Load ("GamePaused")) as GameObject;
				GamePausedUI.transform.parent = root.transform;
				GamePausedUI.transform.localPosition = new Vector3 (0, 0, -60);
				GamePausedUI.transform.localScale = new Vector3 (1f, 1f, 1f);
		
		}

		public void ToggleCam ()
		{
				if (!mapCamShown) {
						mapCamShown = true;
						mapCam.SetActive (true);
				} else {
						mapCamShown = false;
						mapCam.SetActive (false);

				}
		}

		public void ToggleCarCam ()
		{
				if (carBackCamShown) {
						carBackCamShown = false;
						GameObject.FindGameObjectWithTag ("MainCamera").GetComponent<Camera> ().enabled = false;
						//	Camera.main.enabled = false;
						playerCar.GetComponentInChildren<Camera> ().enabled = true;
				} else {
						carBackCamShown = true;
						//Camera.main.enabled = true;
						GameObject.FindGameObjectWithTag ("MainCamera").GetComponent<Camera> ().enabled = true;
						playerCar.GetComponentInChildren<Camera> ().enabled = false;

			
				}
		}

		public void setCarColor ()
		{
				//carMat = playerCar.renderer.materials [1];
				switch (playerCarNO) {
				case 1:
						carMat.color = Color.red;
			
						break;
				case 2:
						carMat.color = Color.gray;
						break;
				case 3:
						carMat.color = Color.black;
						break;
				case 4:
						carMat.color = Color.cyan;
						break;
				case 5:
						carMat.color = Color.magenta;
						break;
				case 6:
						carMat.color = Color.yellow;
						break;
				}
		}

		void  OnGUI ()
		{
	
		
				//	var SpeedMS = Vector2(Vector3.Dot(Car.rigidbody.velocity, Car.transform.forward), Vector3.Dot(Car.rigidbody.velocity, Car.transform.right)).magnitude;
				//	if(gameStarted)
				//	GUI.Label(new Rect(10, 10, Screen.width*0.3f, Screen.height*0.3f),time+"");
		}
}
