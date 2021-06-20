/*  This file is part of the "Simple Waypoint System" project by Rebound Games.
 *  You are only allowed to use these resources if you've bought them directly or indirectly
 *  from Rebound Games. You shall not license, sublicense, sell, resell, transfer, assign,
 *  distribute or otherwise make available to any third party the Service or the Content. 
 */

using UnityEngine;
using System.Collections;
using Holoville.HOTween;
using Holoville.HOTween.Plugins;


//simple helper script for rotating an object
public class RotationHelper : MonoBehaviour
{
    public float multiplier = 1;

    //could also do this with HOTween
    /*
    void Start()
    {
        HOTween.To(transform, 1,
            new TweenParms()
            .Prop("rotation", new Vector3(180,0,0))
            .Ease(EaseType.Linear)
            .Loops(-1, LoopType.Incremental);   
    }
     * */

    void Update()
    {
        // Slowly rotate the object around its X axis at x degree/second.
        transform.Rotate(Vector3.right * (multiplier * 10) * Time.deltaTime);
    }
}
