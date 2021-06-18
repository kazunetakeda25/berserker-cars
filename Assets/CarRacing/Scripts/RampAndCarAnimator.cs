using UnityEngine;
using System.Collections;

public class RampAndCarAnimator : MonoBehaviour
{
		public bool canRotate = true;
		public Vector3 defaultPos;
		TweenPosition tweener;
		GameObject controller;
		// Use this for initialization
		void Start ()
		{
				controller = GameObject.FindGameObjectWithTag ("CarSelectionPanel");
				defaultPos = transform.localPosition;
				tweener = gameObject.GetComponent<TweenPosition> ();
	
		}
	
		// Update is called once per frame
		void Update ()
		{
				if (canRotate) {
						transform.Rotate (0, 0.2f, 0);
				}
	
		}

		void MoveDown ()
		{
				if (tweener == null) {
						tweener = gameObject.GetComponent<TweenPosition> ();
				}
				tweener.Reset ();
				tweener.enabled = true;
				tweener.from = transform.localPosition;
				tweener.to = new Vector3 (transform.localPosition.x, -0.7f, transform.localPosition.z);
				tweener.duration = 0.3f;
				tweener.eventReceiver = gameObject;
				tweener.callWhenFinished = "MoveUp";
		}

		void MoveUp ()
		{
				if (controller != null) {
						controller.SendMessage ("setCarColor");
				}
		 
				if (tweener == null) {
						tweener = gameObject.GetComponent<TweenPosition> ();
				}
				tweener.Reset ();
				tweener.enabled = true;
				tweener.from = transform.localPosition;
				tweener.to = defaultPos;
				tweener.delay = 1f;
				tweener.duration = 0.3f;
				tweener.eventReceiver = gameObject;
		}




}
