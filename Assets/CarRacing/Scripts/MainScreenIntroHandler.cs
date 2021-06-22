using UnityEngine;
using System.Collections;

public class MainScreenIntroHandler : MonoBehaviour {

	public GameObject [] animations;
	public Animation [] animationsClip;

	// Use this for initialization
	void Start () {
		InvokeRepeating ("MoveCars", 0.5f, 6);

	}

	void MoveCars(){
		StartCoroutine (startCars ());
	}

	public IEnumerator startCars(){
		float delay = Random.Range(0.3f,0.8f);
		for(int i=0;i<animations.Length;i++){
			animations[i].GetComponent<Animation>().Play("MovingIntro");
			yield return new WaitForSeconds (delay);
			delay +=0.1f;
		}
	}
}
