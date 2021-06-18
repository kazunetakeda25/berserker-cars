using UnityEngine;
using System.Collections;

public class CarSpecsAnim : MonoBehaviour {

	Vector3 defaultPos = new Vector3(0,300,0);
	TweenPosition tweener;
	// Use this for initialization
	void Start () {
		tweener = gameObject.GetComponent<TweenPosition> ();
	}
	
	// Update is called once per frame
	void Update () {
	
	}

	void OnEnable(){
		if (tweener == null) {
			tweener = gameObject.GetComponent<TweenPosition> ();
		}
		tweener.Reset ();
		tweener.enabled = true;
		tweener.from = defaultPos;
		tweener.to = new Vector3 (0, 0, 0);
		tweener.duration = 0.3f;

	}
}
