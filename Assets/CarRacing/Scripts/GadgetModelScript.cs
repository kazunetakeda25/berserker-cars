using UnityEngine;
using System.Collections;

public class GadgetModelScript : MonoBehaviour {

	public UILabel count; 
	public UILabel currency;
	public int currencyperCount =1000;
	int currentIndex =1;
	// Use this for initialization
	void Start () {
	
	}
	
	// Update is called once per frame
	void Update () {
	
	}

	public void rightPressed(){
		currentIndex++;
		count.text = currentIndex +"";
		currency.text = currentIndex * currencyperCount+"";

	}

	public void leftPressed(){
		if (currentIndex <= 1)
						return;
		currentIndex--;
		count.text = currentIndex+"" ;
		currency.text = currentIndex * currencyperCount+"";
		
	}
}
